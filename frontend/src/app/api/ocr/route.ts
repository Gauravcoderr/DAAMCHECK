import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OCRItem {
  name: string;
  price: number;
  qty: number;
  confidence?: number;
}

interface OCRSuccess {
  items: { name: string; price: number; qty?: number }[];
  gstPercent: number;
  serviceChargePct: number;
  restaurantName: string | null;
  totalAmount: number;
  isIRCTC: boolean;
  _via?: string;
}

interface OCRError {
  error: string;
}

type OCRResult = OCRSuccess | OCRError;

interface NvidiaResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

// ─── Fix 3: IRCTC Layout Classifier ──────────────────────────────────────────
// Detects which of 4 column formats the bill uses from Pass 1 raw text.
// Eliminates the model guessing which format to apply — it's told explicitly.

type BillLayout = "A" | "B" | "C" | "D";

function detectLayout(rawText: string): BillLayout {
  const t = rawText.toUpperCase();
  if (/\bSP\b/.test(t) && /\bAMT\b/.test(t)) return "A"; // SnapBizz: Item|Qty|SP|Amt
  if (/\bMRP\b/.test(t)) return "C";                       // MRP on its own line
  // Require IRCTC context for B: restaurant bills also print QTY but unit price is correct as-is.
  // Without this guard a restaurant bill with a QTY column gets mis-classified and prices are divided by qty.
  if (/\bQTY\b/.test(t) && !/\bSP\b/.test(t) && /\b(IRCTC|PNR|SNAPBIZZ|REVERSE CHARGE|TRAIN NO)\b/.test(t)) return "B";
  return "D";                                               // Restaurant / unknown
}

const LAYOUT_HINTS: Record<BillLayout, string> = {
  A: `DETECTED FORMAT A — SnapBizz "Item | Qty | SP | Amt":
unit price = SP column. NEVER use Amt as price. Example: "Food | 23 | 130.00 | 2990.00" → price=130, qty=23`,
  B: `DETECTED FORMAT B — "Item | Qty | Price" where Price is TOTAL per row:
unit price = Price÷Qty. Example: "Veg Meal | 8 | 640.00" → price=80, qty=8`,
  C: `DETECTED FORMAT C — MRP label appears on separate line below item:
unit price = MRP value. Example: "Veg Pulav\\nMRP: 80.00 | Qty 1" → price=80, qty=1`,
  D: `DETECTED FORMAT D — Restaurant single-column: price shown = unit price.`,
};

// ─── Fix 3: Single-pass prompt (vision → JSON in one call) ───────────────────
// Happy path: skip the transcription round-trip entirely.

const SINGLE_PASS_PROMPT = `You are a bill scanner for Indian food and IRCTC train catering bills. Return ONLY valid JSON — no text, no explanation.

COLUMN FORMATS (apply the one that matches):
A) "Item | Qty | SP | Amt" (SnapBizz): unit price = SP. Example: "Food|23|130.00|2990.00" → price=130, qty=23
B) "Item | Qty | Price" (Price is TOTAL): unit price = Price÷Qty. Example: "Veg Meal|8|640.00" → price=80, qty=8
C) "MRP: ₹XX" on its own line below item: unit price = MRP value.
D) Restaurant — price shown is unit price.

RULES:
- isIRCTC=true if bill shows: IRCTC, train number, PNR, SnapBizz, "reverse charge", or rail catering
- gstPercent=0 if "reverse charge" or "inclusive of taxes" or no GST line shown
- serviceChargePct=0 if not shown
- confidence per item 0.0–1.0

Return ONLY:
{"items":[{"name":"item","price":80,"qty":1,"confidence":0.9}],"gstPercent":0,"serviceChargePct":0,"restaurantName":null,"totalAmount":640,"isIRCTC":true}
If too unclear: {"error":"Cannot read bill clearly"}`;

// ─── Two-pass Pass 1 prompt ───────────────────────────────────────────────────

const TRANSCRIPTION_PROMPT = `You are a bill scanner. Transcribe this Indian food or IRCTC train catering bill exactly as you see it.

Preserve column structure using pipe | separators for each table row.
Include: vendor/caterer name, train number if visible, date, all line items with every number per row (qty, SP, Amt, Price, MRP — whatever columns exist), subtotals, total, any notes (reverse charge, inclusive of taxes, service charge).

Return ONLY the raw transcribed text. No commentary. No JSON. No explanation.`;

// ─── Two-pass Pass 2 layout-specific parse prompt ─────────────────────────────

function buildParsePrompt(rawText: string, layout: BillLayout): string {
  return `Parse this Indian food bill text into structured JSON.

${LAYOUT_HINTS[layout]}

BILL TEXT:
${rawText}

FIELD RULES:
- isIRCTC: true if text mentions IRCTC, train number (e.g. 12566), PNR, SnapBizz, "reverse charge"
- gstPercent: numeric % if shown; 0 if "reverse charge" or "prices inclusive of taxes" or no GST line
- serviceChargePct: numeric % if shown; 0 otherwise
- totalAmount: final Net Amount / Total from the bill
- confidence per item: 0.0 to 1.0

Return ONLY this JSON, nothing else:
{"items":[{"name":"item name","price":80,"qty":8,"confidence":0.9}],"gstPercent":0,"serviceChargePct":0,"restaurantName":"vendor or null","totalAmount":640,"isIRCTC":true}
If too unclear: {"error":"Cannot read bill clearly"}`;
}

// ─── Math validation ──────────────────────────────────────────────────────────

function validateAndFixPrices(items: OCRItem[], totalAmount: number): OCRItem[] {
  if (!items.length || totalAmount <= 0) return items;
  const sumUnit = items.reduce((s, it) => s + it.price * Math.max(it.qty, 1), 0);
  const sumTotal = items.reduce((s, it) => s + it.price, 0);
  const close = (a: number, b: number) => b > 0 && Math.abs(a - b) / b < 0.15;
  if (close(sumUnit, totalAmount)) return items;
  if (close(sumTotal, totalAmount)) {
    return items.map((it) => ({
      ...it,
      price: Math.round((it.price / Math.max(it.qty, 1)) * 100) / 100,
    }));
  }
  return items;
}

// ─── JSON extractor ───────────────────────────────────────────────────────────

function extractJSON(text: string): OCRResult | null {
  // Walk backwards through `}` positions so trailing LLM garbage (extra objects,
  // explanatory text after the JSON) doesn't corrupt the parse.
  const start = text.indexOf("{");
  if (start === -1) return null;
  let end = text.lastIndexOf("}");
  while (end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) as OCRResult; }
    catch { end = text.lastIndexOf("}", end - 1); }
  }
  return null;
}

// ─── NVIDIA helpers ───────────────────────────────────────────────────────────

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1/chat/completions";

// Fix 2: NVIDIA models ordered by priority — nemotron-nano confirmed working
const NVIDIA_VISION_MODELS = [
  "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
  "microsoft/phi-3-vision-128k-instruct",
  "nvidia/llama-3.2-11b-vision-instruct",
];

async function nvidiaVision(
  imageBase64: string,
  apiKey: string,
  model: string,
  prompt: string,
  maxTokens: number,
): Promise<string> {
  const res = await fetch(NVIDIA_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageBase64 } },
        ],
      }],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`NVIDIA ${model} ${res.status}: ${err.slice(0, 100)}`);
  }
  const data = (await res.json()) as NvidiaResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

async function nvidiaText(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(NVIDIA_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`NVIDIA text ${res.status}`);
  const data = (await res.json()) as NvidiaResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Gemini helpers ───────────────────────────────────────────────────────────

function parseImageBase64(imageBase64: string): { mimeType: string; data: string } {
  const [header, data] = imageBase64.split(",");
  const mimeMatch = header?.match(/data:([^;]+)/);
  return { mimeType: mimeMatch?.[1] ?? "image/jpeg", data: data ?? "" };
}

// ─── PaddleOCR ────────────────────────────────────────────────────────────────

async function paddleOCRTranscribe(imageBase64: string, serviceUrl: string): Promise<string> {
  // Strip data: URI prefix — Flask server expects raw base64, not a data URL
  const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const res = await fetch(`${serviceUrl}/ocr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({ imageBase64: rawBase64 }),
  });
  if (!res.ok) throw new Error(`PaddleOCR service ${res.status}`);
  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error) throw new Error(`PaddleOCR: ${data.error}`);
  const text = data.text ?? "";
  if (!text.trim()) throw new Error("PaddleOCR returned empty text");
  return text;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<OCRResult>> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const paddleUrl = process.env.PADDLEOCR_URL;

  if (!nvidiaKey && !geminiKey && !paddleUrl) {
    return NextResponse.json(
      { error: "OCR requires NVIDIA_API_KEY, GEMINI_API_KEY, or PADDLEOCR_URL" },
      { status: 503 }
    );
  }

  // ── Fix 1: Accept multipart form OR JSON (backward compat) ───────────────────
  let imageBase64: string;
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const imageFile = form.get("image") as File | null;
      if (!imageFile) return NextResponse.json({ error: "No image file in form data" }, { status: 400 });
      const buf = await imageFile.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      imageBase64 = `data:${imageFile.type || "image/jpeg"};base64,${b64}`;
    } else {
      const body = (await req.json()) as { imageBase64?: string };
      imageBase64 = body.imageBase64 ?? "";
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!imageBase64?.startsWith("data:")) {
    return NextResponse.json(
      { error: "imageBase64 must be a valid data URL (data:image/...;base64,...)" },
      { status: 400 }
    );
  }

  // ── Fix 3: Attempt 1 — single-pass (vision → JSON directly) ─────────────────
  // NVIDIA first (working), Gemini as fallback. No transcription round-trip.

  if (nvidiaKey) {
    for (const model of NVIDIA_VISION_MODELS) {
      try {
        const text = await nvidiaVision(imageBase64, nvidiaKey, model, SINGLE_PASS_PROMPT, 700);
        const parsed = extractJSON(text);
        if (parsed && !("error" in parsed)) {
          const success = parsed as OCRSuccess;
          const fixed = validateAndFixPrices(
            success.items.map((it) => ({ name: it.name, price: it.price, qty: it.qty ?? 1 })),
            success.totalAmount,
          );
          return NextResponse.json({ ...success, items: fixed, _via: `single(${model})` });
        }
      } catch (e) {
        console.error(`[OCR single NVIDIA ${model}]`, e instanceof Error ? e.message : e);
      }
    }
  }

  if (geminiKey) {
    try {
      const { mimeType, data } = parseImageBase64(imageBase64);
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: SINGLE_PASS_PROMPT }, { inlineData: { mimeType, data } }] }],
      });
      const parsed = extractJSON(result.text ?? "");
      if (parsed && !("error" in parsed)) {
        const success = parsed as OCRSuccess;
        const fixed = validateAndFixPrices(
          success.items.map((it) => ({ name: it.name, price: it.price, qty: it.qty ?? 1 })),
          success.totalAmount,
        );
        return NextResponse.json({ ...success, items: fixed, _via: "single(gemini)" });
      }
    } catch (e) {
      console.error("[OCR single Gemini]", e instanceof Error ? e.message : e);
    }
  }

  // ── Attempt 2: Two-pass (transcribe → layout detect → parse) ─────────────────
  // Fallback when single-pass returns garbled JSON.

  let via = "";
  let rawText = "";
  const pass1Errors: string[] = [];

  // Fix 2: NVIDIA first (Gemini is quota 0 currently)
  if (nvidiaKey) {
    for (const model of NVIDIA_VISION_MODELS) {
      try {
        const text = await nvidiaVision(imageBase64, nvidiaKey, model, TRANSCRIPTION_PROMPT, 800);
        if (text.trim()) { rawText = text; via = `nvidia(${model})`; break; }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        pass1Errors.push(msg);
        console.error(`[OCR Pass1 NVIDIA ${model}]`, msg);
      }
    }
  }

  if (!rawText && geminiKey) {
    try {
      const { mimeType, data } = parseImageBase64(imageBase64);
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: TRANSCRIPTION_PROMPT }, { inlineData: { mimeType, data } }] }],
      });
      const text = result.text ?? "";
      if (text.trim()) { rawText = text; via = "gemini"; }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      pass1Errors.push(`Gemini: ${msg}`);
      console.error("[OCR Pass1 Gemini]", msg);
    }
  }

  if (!rawText && paddleUrl) {
    try {
      rawText = await paddleOCRTranscribe(imageBase64, paddleUrl);
      via = "paddle";
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      pass1Errors.push(`PaddleOCR: ${msg}`);
      console.error("[OCR Pass1 PaddleOCR]", msg);
    }
  }

  if (!rawText) {
    console.error("[OCR] All Pass1 attempts failed:", pass1Errors.join(" | "));
    return NextResponse.json(
      { error: "Could not read the bill photo. Try a clearer, well-lit image or use manual entry." },
      { status: 200 }
    );
  }

  // Fix 3: Detect layout → use layout-specific parse prompt
  const layout = detectLayout(rawText);
  const parsePrompt = buildParsePrompt(rawText, layout);

  let parsed: OCRResult | null = null;

  if (nvidiaKey) {
    try {
      const content = await nvidiaText(parsePrompt, nvidiaKey);
      parsed = extractJSON(content);
    } catch (e) {
      console.error("[OCR Pass2 NVIDIA text]", e instanceof Error ? e.message : e);
    }
  }

  if ((!parsed || "error" in parsed) && geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: parsePrompt }] }],
      });
      parsed = extractJSON(result.text ?? "");
    } catch { /* give up */ }
  }

  if (!parsed || "error" in parsed) {
    return NextResponse.json(
      { error: "Could not extract items from bill. Try manual entry." },
      { status: 200 }
    );
  }

  const success = parsed as OCRSuccess;
  const fixed = validateAndFixPrices(
    success.items.map((it) => ({ name: it.name, price: it.price, qty: it.qty ?? 1 })),
    success.totalAmount,
  );

  return NextResponse.json(
    { ...success, items: fixed, _via: `${via}+text(layout:${layout})` },
    { status: 200 }
  );
}
