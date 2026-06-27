import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from './system-prompt';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Rate limiter: 5 requests per IP per minute
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

const RATE_MSG = { text: 'Too many messages. Please wait a minute and try again.' };
const ERROR_MSG = { text: 'Something went wrong. Please try again in a moment.' };

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(RATE_MSG, { status: 429 });
  }

  let messages: Message[];
  try {
    const body = await req.json() as { messages: Message[] };
    messages = body.messages ?? [];
  } catch {
    return NextResponse.json({ text: 'Invalid request.' }, { status: 400 });
  }

  if (!messages.length) {
    return NextResponse.json({ text: 'No messages provided.' }, { status: 400 });
  }

  let rawText = '';

  // Primary: Gemini 2.0 Flash
  if (process.env.GEMINI_API_KEY) {
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
      rawText = result.text ?? '';
    } catch (err) {
      console.warn('Gemini failed:', err instanceof Error ? err.message : String(err));
    }
  }

  // Fallback: Groq llama-3.3-70b
  if (!rawText && process.env.GROQ_API_KEY) {
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
      rawText = result.choices[0]?.message?.content ?? '';
    } catch (err) {
      console.warn('Groq failed:', err instanceof Error ? err.message : String(err));
    }
  }

  if (!rawText) {
    return NextResponse.json(ERROR_MSG, { status: 500 });
  }

  // Extract [TOOL:slug] tag
  const toolMatch = rawText.match(/\[TOOL:([\w-]+)\]/);
  const tool = toolMatch ? toolMatch[1] : null;
  const displayText = rawText.replace(/\[TOOL:[\w-]+\]/g, '').trim();

  return NextResponse.json({ text: displayText, tool });
}
