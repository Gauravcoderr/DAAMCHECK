"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
const LEAD_TRIGGER = 5;

const GREETING: Message = {
  role: "assistant",
  content:
    "Hello! I'm DaamBot 🤖 — I know every Indian food bill law.\n\nAsk me: Is 18% GST legal? Can they add service charge? What's the max price for Veg Thali on a train?",
  tool: null,
};

const STARTER_CHIPS = [
  "Is service charge legal?",
  "IRCTC Veg Thali price?",
  "Restaurant GST is 18% — legal?",
];

const TOOL_META: Record<string, { label: string; icon: string; desc: string }> =
  {
    "gst-checker": {
      label: "GST Checker",
      icon: "🧾",
      desc: "Check if GST on your bill is correct",
    },
    "irctc-prices": {
      label: "IRCTC Prices",
      icon: "🚆",
      desc: "See all official train food max prices",
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
    <div className="flex items-start gap-2 mb-3">
      <div
        style={{ backgroundColor: "#F3F4F6", color: "#111827" }}
        className="rounded-[18px_18px_18px_4px] px-4 py-3 flex items-center gap-1.5"
      >
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{
            backgroundColor: "#9CA3AF",
            animation: "daambot-bounce 1.2s infinite",
            animationDelay: "0ms",
          }}
        />
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{
            backgroundColor: "#9CA3AF",
            animation: "daambot-bounce 1.2s infinite",
            animationDelay: "200ms",
          }}
        />
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{
            backgroundColor: "#9CA3AF",
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
    <div className="mt-2 mb-1">
      <Link
        href={`/${tool}`}
        style={{
          backgroundColor: "#ECFDF5",
          borderColor: "#A7F3D0",
        }}
        className="flex items-center justify-between gap-3 border rounded-xl px-4 py-3 group hover:bg-green-100 transition-colors no-underline"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <p
              className="font-semibold text-sm leading-tight"
              style={{ color: "#059669" }}
            >
              {meta.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#374151" }}>
              {meta.desc}
            </p>
          </div>
        </div>
        <svg
          className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
          style={{ color: "#059669" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
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
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <div
        className="mx-2 my-2 rounded-xl px-4 py-3 text-sm font-medium"
        style={{ backgroundColor: "#ECFDF5", color: "#059669" }}
      >
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
    <div
      className="mx-2 my-2 rounded-xl p-4 border"
      style={{
        backgroundColor: "#FEF3C7",
        borderColor: "#D97706",
      }}
    >
      <p
        className="text-sm font-semibold mb-1"
        style={{ color: "#111827" }}
      >
        Want DaamBot tips in your inbox?
      </p>
      <p className="text-xs mb-3" style={{ color: "#374151" }}>
        We&apos;ll alert you on new GST or IRCTC rule changes.
      </p>
      <input
        type="text"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full rounded-lg border px-3 py-2 text-sm mb-2 outline-none focus:ring-2"
        style={{
          borderColor: "#E5E7EB",
          color: "#111827",
        }}
      />
      <input
        type="email"
        placeholder="Your email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="w-full rounded-lg border px-3 py-2 text-sm mb-3 outline-none focus:ring-2"
        style={{ borderColor: "#E5E7EB", color: "#111827" }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !form.name.trim() || !form.email.trim()}
        className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: "#059669" }}
      >
        {loading ? "Saving..." : "Get Alerts"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [showLeadCard, setShowLeadCard] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [showChips, setShowChips] = useState(true);
  // Track the last query for the lead form
  const lastQueryRef = useRef("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Nudge after 90 seconds if chat is closed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open && !nudgeDismissed) {
        setShowNudge(true);
      }
    }, 90_000);
    return () => clearTimeout(timer);
  }, [open, nudgeDismissed]);

  // Hide nudge when chat opens
  useEffect(() => {
    if (open) {
      setShowNudge(false);
    }
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showLeadCard]);

  // Focus textarea on open
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  function openChat() {
    setOpen(true);
    setNudgeDismissed(true);
    setShowNudge(false);
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

    if (newCount === LEAD_TRIGGER) {
      setShowLeadCard(true);
    }

    setLoading(true);

    try {
      // Build the messages array excluding the greeting (which is not a real turn)
      const apiMessages: Message[] = newMessages.filter(
        (m) => m !== GREETING || m.role !== "assistant"
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
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
      sendMessage(input);
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
        @keyframes daambot-fade-scale {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes daambot-nudge-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Nudge bubble */}
      {showNudge && !open && (
        <button
          onClick={openChat}
          className="fixed bottom-[88px] right-6 z-50 text-white text-sm font-medium px-4 py-2 rounded-2xl shadow-lg"
          style={{
            backgroundColor: "#059669",
            animation: "daambot-nudge-in 0.3s ease forwards",
            fontFamily: "var(--font-geist-sans, sans-serif)",
          }}
        >
          Need help with your bill? 💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed z-50 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          style={{
            bottom: "80px",
            right: "24px",
            width: "min(360px, calc(100vw - 24px))",
            maxHeight: "min(520px, 80vh)",
            animation: "daambot-fade-scale 0.22s ease forwards",
            fontFamily: "var(--font-geist-sans, sans-serif)",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E7EB",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ backgroundColor: "#0F172A" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: "#059669", color: "#fff" }}
              >
                D
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">
                  DaamBot
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#A7F3D0" }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "#A7F3D0" }}
                  >
                    Online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="rounded-full p-1.5 transition-colors hover:bg-white/10"
              aria-label="Close chat"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="white"
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

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 pt-4 pb-2"
            style={{ backgroundColor: "#ffffff" }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "user" ? (
                  <div className="flex justify-end mb-3">
                    <div
                      className="text-white text-sm px-4 py-2.5 max-w-[80%] leading-relaxed"
                      style={{
                        backgroundColor: "#059669",
                        borderRadius: "18px 18px 4px 18px",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start mb-3">
                    <div
                      className="text-sm px-4 py-2.5 max-w-[80%] leading-relaxed"
                      style={{
                        backgroundColor: "#F3F4F6",
                        color: "#111827",
                        borderRadius: "18px 18px 18px 4px",
                      }}
                    >
                      {msg.content.split("\n").map((line, li) => (
                        <span key={li}>
                          {line}
                          {li < msg.content.split("\n").length - 1 && <br />}
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

            {/* Lead capture card */}
            {showLeadCard && (
              <LeadCard
                onSubmit={handleLeadSubmit}
                submitted={leadSubmitted}
              />
            )}

            {/* Typing indicator */}
            {loading && <TypingIndicator />}

            {/* Quick reply chips */}
            {showChips && (
              <div className="flex flex-wrap gap-2 mt-1 mb-3">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-[13px] rounded-full px-3.5 py-1.5 transition-colors cursor-pointer border"
                    style={{
                      backgroundColor: "#ECFDF5",
                      borderColor: "#A7F3D0",
                      color: "#059669",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "#059669";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "#ECFDF5";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#059669";
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{
              borderTop: "1px solid #E5E7EB",
              backgroundColor: "#ffffff",
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
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none border transition-colors"
              style={{
                borderColor: "#E5E7EB",
                color: "#111827",
                fontFamily: "inherit",
                lineHeight: "1.5",
                maxHeight: "96px",
                overflowY: "auto",
                backgroundColor: "#F9FAFB",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#059669";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(5,150,105,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#059669" }}
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
      )}

      {/* Floating toggle button */}
      <button
        onClick={open ? closeChat : openChat}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
        style={{
          width: "56px",
          height: "56px",
          backgroundColor: "#059669",
        }}
        aria-label={open ? "Close DaamBot" : "Chat with DaamBot"}
      >
        {/* Tooltip */}
        {!open && (
          <span
            className="absolute right-[68px] top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium text-white px-2.5 py-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "#0F172A" }}
          >
            Chat with DaamBot
          </span>
        )}

        {open ? (
          // X icon
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Speech bubble icon
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
