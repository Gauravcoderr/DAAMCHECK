"use client";

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
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

const GREETING: Message = {
  role: "assistant",
  content:
    "Hello! I'm DaamBot 🤖 — I know every Indian food bill law.\n\nAsk me: Is 18% GST legal? Can they add service charge? What's the max price for Veg Thali on a train?",
  tool: null,
};

const STARTER_CHIPS: string[] = [
  "Is service charge legal?",
  "IRCTC Veg Thali price?",
  "Restaurant GST is 18% — legal?",
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
      desc: "Check any food bill",
    },
  };

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="bg-line-2 text-ink rounded-[18px_18px_18px_4px] px-4 py-3 flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full inline-block bg-ink-4"
          style={{ animation: "daambot-bounce 1.2s infinite", animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full inline-block bg-ink-4"
          style={{ animation: "daambot-bounce 1.2s infinite", animationDelay: "200ms" }}
        />
        <span
          className="w-2 h-2 rounded-full inline-block bg-ink-4"
          style={{ animation: "daambot-bounce 1.2s infinite", animationDelay: "400ms" }}
        />
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: string }) {
  const meta = TOOL_META[tool];
  if (!meta) return null;

  return (
    <div className="mt-2 mb-1 w-full">
      <Link
        href={`/${tool}`}
        className="flex items-center justify-between gap-3 bg-green-pale border border-green-mid rounded-xl px-4 py-3 group hover:bg-green-100 transition-colors no-underline"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.icon}</span>
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
    </div>
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
      <div className="mx-2 my-2 rounded-xl px-4 py-3 text-sm font-medium bg-green-pale text-green">
        Got it! We&apos;ll be in touch. 🎉
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
    <div className="mx-2 my-2 rounded-xl p-4 border border-amber bg-amber-pale">
      <p className="text-sm font-semibold mb-1 text-ink">
        Want DaamBot tips in your inbox?
      </p>
      <p className="text-xs mb-3 text-ink-2">
        We&apos;ll alert you on new GST or IRCTC rule changes.
      </p>
      <input
        type="text"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-green/30 text-ink bg-white"
      />
      <input
        type="email"
        placeholder="Your email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-green/30 text-ink bg-white"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !form.name.trim() || !form.email.trim()}
        className="w-full rounded-lg py-2 text-sm font-semibold text-white bg-green disabled:opacity-50 transition-opacity"
      >
        {loading ? "Saving..." : "Get Alerts"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userMessageCount, setUserMessageCount] = useState<number>(0);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);
  const [showLeadCard, setShowLeadCard] = useState<boolean>(false);
  const [showChips, setShowChips] = useState<boolean>(true);
  const [nudgeVisible, setNudgeVisible] = useState<boolean>(false);
  const [nudgeDismissed, setNudgeDismissed] = useState<boolean>(false);

  const lastQueryRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Nudge after 90 seconds if chat closed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open && !nudgeDismissed) setNudgeVisible(true);
    }, 90_000);
    return () => clearTimeout(timer);
  }, [open, nudgeDismissed]);

  // Hide nudge when chat opens
  useEffect(() => {
    if (open) setNudgeVisible(false);
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showLeadCard]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  function openChat() {
    setOpen(true);
    setNudgeDismissed(true);
    setNudgeVisible(false);
  }

  function closeChat() {
    setOpen(false);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed, tool: null };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    lastQueryRef.current = trimmed;
    setInput("");
    setShowChips(false);

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
          content: "Sorry, I ran into an issue. Please try again in a moment.",
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
        @keyframes daambot-nudge-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Nudge bubble — sits just above the bottom bar */}
      {nudgeVisible && !open && (
        <button
          type="button"
          onClick={openChat}
          className="fixed bottom-16 right-4 z-50 text-white text-sm font-medium px-4 py-2 rounded-2xl shadow-lg bg-green"
          style={{ animation: "daambot-nudge-in 0.3s ease forwards" }}
        >
          Need help with your bill? 💬
        </button>
      )}

      {/* ── Expanded panel ── slides up from the bottom bar */}
      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-50",
          "md:left-auto md:right-0 md:w-[420px]",
          "h-[70vh] md:h-[520px]",
          "flex flex-col shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-dark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-green text-white">
              D
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">
                DaamBot
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-mid" />
                <span className="text-[11px] font-medium text-green-mid">
                  Online
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={closeChat}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
            aria-label="Close DaamBot"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 pt-4 pb-2 bg-white"
        >
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div className="flex justify-end mb-3">
                  <div
                    className="text-white text-sm px-4 py-2.5 max-w-[80%] leading-relaxed bg-green"
                    style={{ borderRadius: "18px 18px 4px 18px" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start mb-3">
                  <div
                    className="text-sm px-4 py-2.5 max-w-[80%] leading-relaxed bg-line-2 text-ink"
                    style={{ borderRadius: "18px 18px 18px 4px" }}
                  >
                    {msg.content.split("\n").map((line, li, arr) => (
                      <span key={li}>
                        {line}
                        {li < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {msg.tool && TOOL_META[msg.tool] && (
                    <ToolCard tool={msg.tool} />
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Starter chips — shown below greeting, disappear after first send */}
          {showChips && (
            <div className="flex flex-wrap gap-2 mt-1 mb-3">
              {STARTER_CHIPS.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => void sendMessage(chip)}
                  className="bg-green-pale border border-green-mid text-green text-[13px] rounded-full px-3 py-1.5 hover:bg-green hover:text-white transition-colors cursor-pointer flex-shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Lead capture card */}
          {showLeadCard && (
            <LeadCard onSubmit={handleLeadSubmit} submitted={leadSubmitted} />
          )}

          {/* Typing indicator */}
          {loading && <TypingIndicator />}
        </div>

        {/* Panel input bar — dark, same look as the collapsed bar */}
        <div
          className="flex items-center gap-2 px-3 flex-shrink-0 pb-[56px] md:pb-0"
          style={{
            backgroundColor: "#0F172A",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            minHeight: "56px",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask about your bill..."
            className="flex-1 resize-none bg-transparent text-white placeholder:text-white/30 text-[14px] outline-none py-4 leading-relaxed"
            style={{
              maxHeight: "96px",
              overflowY: "auto",
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-green disabled:opacity-40 transition-opacity"
            aria-label="Send message"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19V5m0 0l-7 7m7-7l7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Collapsed bottom bar ── always visible when panel is closed */}
      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-40",
          "transition-opacity duration-200",
          open ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
        style={{
          height: "56px",
          backgroundColor: "#0F172A",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Inner: constrained to md:max-w-2xl centered on desktop, full on mobile */}
        <button
          type="button"
          onClick={openChat}
          className="w-full h-full flex items-center gap-3 px-4 md:max-w-2xl md:mx-auto"
          aria-label="Open DaamBot chat"
        >
          {/* Left: robot + label */}
          <span className="text-xl flex-shrink-0">🤖</span>
          <span className="text-sm font-semibold text-green flex-shrink-0">
            DaamBot
          </span>

          {/* Center: fake placeholder input */}
          <span className="flex-1 text-left text-white/30 text-[14px] truncate">
            Ask about your bill — GST, IRCTC prices, service charge...
          </span>

          {/* Right: up arrow */}
          <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
            <svg
              className="w-4 h-4 text-white/60"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
}
