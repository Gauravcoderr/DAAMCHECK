import { NextRequest, NextResponse } from "next/server";

// ─── Request / Response Types ─────────────────────────────────────────────────

interface OCRRequest {
  imageBase64: string; // full data URL, e.g. "data:image/jpeg;base64,..."
}

interface NvidiaChoice {
  message?: { content?: string };
}

interface NvidiaResponse {
  choices?: NvidiaChoice[];
}

interface OCRSuccess {
  items: { name: string; price: number }[];
  gstPercent: number;
  serviceChargePct: number;
  restaurantName: string | null;
  totalAmount: number;
}

interface OCRError {
  error: string;
}

type OCRResult = OCRSuccess | OCRError;

// ─── Prompt ───────────────────────────────────────────────────────────────────

const OCR_PROMPT = `You are analyzing an Indian food bill. Extract all food items with their names and prices.
Also extract the GST percentage charged (if shown) and any service charge percentage.
Return ONLY valid JSON in this exact format, no other text:
{
  "items": [{"name": "item name", "price": 100}],
  "gstPercent": 5,
  "serviceChargePct": 0,
  "restaurantName": "name if visible or null",
  "totalAmount": 500
}
If you cannot read the bill clearly, return: {"error": "Cannot read bill clearly"}`;

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<OCRResult>> {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OCR requires API key setup — NVIDIA_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: OCRRequest;
  try {
    body = (await req.json()) as OCRRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { imageBase64 } = body;
  if (!imageBase64 || !imageBase64.startsWith("data:")) {
    return NextResponse.json(
      { error: "imageBase64 must be a valid data URL" },
      { status: 400 }
    );
  }

  // Call NVIDIA NIM vision model
  let nvidiaRes: Response;
  try {
    nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "microsoft/phi-3.5-vision-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: OCR_PROMPT },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: `Failed to reach NVIDIA API: ${message}` },
      { status: 502 }
    );
  }

  if (!nvidiaRes.ok) {
    const text = await nvidiaRes.text().catch(() => "");
    return NextResponse.json(
      { error: `NVIDIA API error ${nvidiaRes.status}: ${text.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const nvidiaData = (await nvidiaRes.json()) as NvidiaResponse;
  const rawContent = nvidiaData.choices?.[0]?.message?.content ?? "";

  // Extract JSON from the model response (strip any markdown fences)
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: "Cannot read bill clearly" },
      { status: 200 }
    );
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as OCRResult;
    return NextResponse.json(parsed, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Cannot read bill clearly" },
      { status: 200 }
    );
  }
}
