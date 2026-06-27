import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from './system-prompt';

// Rate limiter: 5 req/IP/min
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const RATE_MSG = { text: 'Too many messages — wait a minute and try again.' };
const ERROR_MSG = { text: 'Something went wrong. Try again in a moment.' };

const NVIDIA_MODELS = [
  'meta/llama-4-maverick-17b-128e-instruct',  // llama 4 — free tier, best quality
  'meta/llama-4-scout-17b-16e-instruct',       // llama 4 scout — faster
  'nvidia/llama-3.1-nemotron-ultra-253b-v1',   // nemotron ultra — high quality fallback
  'meta/llama-3.3-70b-instruct',               // llama 3.3 — stable fallback
];

async function callNvidia(messages: Message[]): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return '';

  for (const model of NVIDIA_MODELS) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 400,
          temperature: 0.5,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json() as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content ?? '';
      if (text) return text;
    } catch {
      continue;
    }
  }
  return '';
}

async function callGemini(messages: Message[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return '';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMsg = messages[messages.length - 1].content;
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history,
      config: { systemInstruction: SYSTEM_PROMPT, maxOutputTokens: 400 },
    });
    const result = await chat.sendMessage({ message: lastMsg });
    return result.text ?? '';
  } catch {
    return '';
  }
}

async function callGroq(messages: Message[]): Promise<string> {
  if (!process.env.GROQ_API_KEY) return '';
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_tokens: 400,
    });
    return result.choices[0]?.message?.content ?? '';
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) return NextResponse.json(RATE_MSG, { status: 429 });

  let messages: Message[];
  try {
    const body = await req.json() as { messages: Message[] };
    messages = body.messages ?? [];
  } catch {
    return NextResponse.json({ text: 'Invalid request.' }, { status: 400 });
  }

  if (!messages.length) return NextResponse.json({ text: 'No messages.' }, { status: 400 });

  // Try NVIDIA NIM first (free tier), then Gemini, then Groq
  let rawText = await callNvidia(messages);
  if (!rawText) rawText = await callGemini(messages);
  if (!rawText) rawText = await callGroq(messages);
  if (!rawText) return NextResponse.json(ERROR_MSG, { status: 500 });

  // Extract [TOOL:slug] tag
  const toolMatch = rawText.match(/\[TOOL:([\w-]+)\]/);
  const tool = toolMatch ? toolMatch[1] : null;
  const displayText = rawText.replace(/\[TOOL:[\w-]+\]/g, '').trim();

  return NextResponse.json({ text: displayText, tool });
}
