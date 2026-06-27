"use client";

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  tool?: string | null;
}

interface LeadForm {
  name: string;
  email: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1";
const LEAD_TRIGGER = 5;

const GREETING_CONTENT =
  "Hello! I'm DaamBot 🤖 — your Indian food bill expert.\n\nAsk me anything about:\n• GST rules (is 18% legal?)\n• IRCTC train food price caps\n• Service charge (it's banned!)\n• How to file a consumer complaint";

const INITIAL_MESSAGES: Message[] = [
  { role: "assistant", content: GREETING_CONTENT, tool: null },
];

const STARTER_CHIPS: string[] = [
  "Is service charge legal?",
  "IRCTC Veg Thali max price?",
  "Restaurant charging 18% GST — legal?",
  "How do I file a complaint?",
];

const TOOL_META: Record<string, { label: string; icon: string; desc: string }> =
  {
    "gst-checker": {
      label: "GST Checker",
      icon: "🧾",
      desc: "Check if GST is correct",
    },
    "irctc-prices": {
      label: "IRCTC Prices",
      icon: "🚆",
      desc: "Official train food max prices",
    },
    "scan-bill": {
      label: "Scan Bill",
      icon: "📷",
      desc: "Check any food bill for violations",
    },
  };

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start mb-4">
      <div className="bg-line-2 text-ink rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full inline-block bg-ink-4"
          style={{
            animation: "daambot-bounce 1.2s infinite",
            animationDelay: "0ms",
          }}
        />
        <span
          className="w-2 h-2 rounded-full inline-block bg-ink-4"
          style={{
            animation: "daambot-bounce 1.2s infinite",
            animationDelay: "200ms",
          }}
        />
        <span
          className="w-2 h-2 rounded-full inline-block bg-ink-4"
          style={{
            animation: "daambot-bounce 1.2s infinite",
            animationDelay: "400ms",
          }}
        />
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: string }) {
  const meta = TOOL_META[tool];
  if (!meta) return null;

  return (
    <Link
      href={`/${tool}`}
      className="flex items-center justify-between gap-3 bg-green-pale border border-green-mid rounded-xl px-4 py-3 mt-2 group hover:bg-green/5 transition-colors no-underline"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl leading-none">{meta.icon}</span>
        <div>
          <p className="font-semibold text-sm leading-tight text-green">
            {meta.label}
          </p>
          <p className="text-xs mt-0.5 text-ink-2">{meta.desc}</p>
        </div>
      </div>
      <svg
        className="w-4 h-4 flex-shrink-0 text-green group-hover:translate-x-0.5 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

interface LeadCardProps {
  onSubmit: (form: LeadForm) => Promise<void>;
  submitted: boolean;
}

function LeadCard({ onSubmit, submitted }: LeadCardProps) {
  const [form, setForm] = useState<LeadForm>({ name: "", email: "" });
  const [loading, setLoading] = useState<boolean>(false);

  if (submitted) {
    return (
      <div className="rounded-2xl px-5 py-4 text-sm font-medium bg-green-pale text-green border border-green-mid mt-2">
        Got it! We&apos;ll alert you on new rule changes. 🎉
      </div>
    );
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl p-5 border border-amber bg-amber-pale mt-2">
      <p className="text-sm font-semibold mb-1 text-ink">
        📬 Get DaamBot alerts in your inbox
      </p>
      <p className="text-xs mb-4 text-ink-2">
        New GST or IRCTC rule changes — we&apos;ll email you first.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, name: e.target.value }))
          }
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green/30 text-ink bg-white"
        />
        <input
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, email: e.target.value }))
          }
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green/30 text-ink bg-white"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading || !form.name.trim() || !form.email.trim()}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-green disabled:opacity-50 transition-opacity whitespace-nowrap"
        >
          {loading ? "Saving..." : "Get Alerts"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userMessageCount, setUserMessageCount] = useState<number>(0);
  const [showChips, setShowChips] = useState<boolean>(true);
  const [showLeadCard, setShowLeadCard] = useState<boolean>(false);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);

  const lastQueryRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message or loading change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showLeadCard]);

  // Auto-resize textarea
  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed, tool: null };
    // Exclude the greeting from API messages (not counted as conversation history)
    const historyMessages = messages.filter(
      (m) => m.content !== GREETING_CONTENT || m.role !== "assistant"
    );
    const newMessages: Message[] = [...historyMessages, userMsg];

    setMessages((prev) => [...prev, userMsg]);
    lastQueryRef.current = trimmed;
    setInput("");
    setShowChips(false);

    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);
    if (newCount === LEAD_TRIGGER) setShowLeadCard(true);

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const data = (await res.json()) as { text: string; tool?: string | null };
      const assistantMsg: Message = {
        role: "assistant",
        content: data.text,
        tool: data.tool ?? null,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I ran into an issue. Please try again in a moment.",
          tool: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  function handleNewChat() {
    setMessages(INITIAL_MESSAGES);
    setInput("");
    setUserMessageCount(0);
    setShowChips(true);
    setShowLeadCard(false);
    setLeadSubmitted(false);
    lastQueryRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  async function handleLeadSubmit(form: LeadForm) {
    try {
      await fetch(`${BACKEND_URL}/chat/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          query: lastQueryRef.current,
        }),
      });
    } catch {
      // Silently fail — show success anyway
    }
    setLeadSubmitted(true);
  }

  return (
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes daambot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-white">

        {/* ── Top bar ── */}
        <header className="fixed top-0 left-0 right-0 z-10 h-14 border-b border-line bg-white flex items-center px-4 gap-3">
          {/* Back arrow */}
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-2 hover:bg-line-2 transition-colors flex-shrink-0"
            aria-label="Back to home"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          {/* Title + badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-semibold text-ink text-[15px]">DaamBot</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-green flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
              Online
            </span>
          </div>

          {/* New chat button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="flex-shrink-0 text-[13px] font-medium text-ink-2 border border-line rounded-lg px-3 py-1.5 hover:border-green hover:text-green transition-colors"
          >
            New Chat
          </button>
        </header>

        {/* ── Messages area ── */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-20 pb-36 px-4"
        >
          <div className="max-w-2xl mx-auto w-full">
            {messages.map((msg, i) => (
              <div key={i} className="mb-1">
                {msg.role === "user" ? (
                  // User bubble — right-aligned
                  <div className="flex justify-end mb-4">
                    <div className="bg-green text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] leading-relaxed text-[15px]">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  // Assistant bubble — left-aligned
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-line-2 text-ink rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] leading-relaxed text-[15px]">
                      {msg.content.split("\n").map((line, li, arr) => (
                        <span key={li}>
                          {line}
                          {li < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {msg.tool && TOOL_META[msg.tool] && (
                      <div className="max-w-[85%] w-full">
                        <ToolCard tool={msg.tool} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Starter chips — shown after greeting, disappear after first user message */}
            {showChips && (
              <div className="flex flex-wrap gap-2 justify-center mt-4 mb-2">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => void sendMessage(chip)}
                    className="bg-line-2 border border-line hover:border-green hover:bg-green-pale text-ink-2 hover:text-green text-[13px] rounded-full px-4 py-2 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Lead capture card — inline after 5 user messages */}
            {showLeadCard && (
              <LeadCard
                onSubmit={handleLeadSubmit}
                submitted={leadSubmitted}
              />
            )}

            {/* Typing indicator */}
            {loading && <TypingIndicator />}
          </div>
        </main>

        {/* ── Input bar ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 bg-line-3 border border-line rounded-2xl px-4 py-3 focus-within:border-green/40 focus-within:ring-2 focus-within:ring-green/10 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setInput(e.target.value);
                  resizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask about your bill — GST, IRCTC prices, service charge..."
                className="flex-1 resize-none bg-transparent text-ink placeholder:text-ink-4 text-[15px] outline-none leading-relaxed disabled:opacity-60"
                style={{
                  maxHeight: "128px",
                  overflowY: "auto",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-green disabled:opacity-40 transition-opacity"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <p className="text-center text-[11px] text-ink-4 mt-2">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
