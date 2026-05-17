"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { site } from "@/lib/site-config";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  body: string;
  pending?: boolean;
};

type GroqHistory = { role: "user" | "assistant"; content: string };

const quickReplies = [
  "Perbedaan paket Belajar dan Pro?",
  "Gimana cara tryout UM di sini?",
  "PTN mana yang ada Ujian Mandiri?",
];

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  body: `Halo kak! Aku AI asisten ${site.name}. Ada yang bisa aku bantu seputar persiapan Ujian Mandiri PTN, paket belajar, atau fitur platform?`,
};

export function SupportChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const counterRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  function buildHistory(current: ChatMessage[]): GroqHistory[] {
    return current
      .filter((m) => !m.pending && m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.body }));
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || isSending) return;

    counterRef.current += 1;
    const n = counterRef.current;

    const userMsg: ChatMessage = { id: `u-${n}`, role: "user", body: clean };
    const pendingMsg: ChatMessage = { id: `a-${n}`, role: "assistant", body: "", pending: true };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput("");
    setIsSending(true);

    const history = buildHistory([...messages, userMsg]);

    const res = await fetch("/api/crm/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: clean, history }),
    }).catch(() => null);

    const data = res?.ok
      ? ((await res.json().catch(() => ({}))) as { reply?: string })
      : null;

    const reply =
      data?.reply ??
      "Maaf kak, koneksi ke AI terputus. Coba lagi sebentar atau hubungi kami via WA 085155072188.";

    setMessages((prev) =>
      prev.map((m) => (m.id === pendingMsg.id ? { ...m, body: reply, pending: false } : m)),
    );
    setIsSending(false);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0A66FF]">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-black leading-tight">AI Asisten {site.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-xs font-semibold text-slate-300">Online — siap membantu</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Tutup chat"
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4" style={{ maxHeight: "55vh" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A66FF]">
                    <Sparkles size={13} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-md bg-[#0A66FF] text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {msg.pending ? (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Sedang berpikir...</span>
                    </span>
                  ) : (
                    msg.body
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="space-y-3 border-t border-slate-100 bg-white p-4">
            {/* Quick replies — only show before user sends first message */}
            {messages.length === 1 && (
              <div className="grid gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    disabled={isSending}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-left text-xs font-bold text-slate-600 transition hover:border-[#0A66FF] hover:text-[#0A66FF] disabled:opacity-50"
                  >
                    {reply}
                    <Send size={13} className="shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <label className="sr-only" htmlFor="ai-chat-input">
                Ketik pertanyaan
              </label>
              <textarea
                id="ai-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder="Ketik pertanyaan kamu..."
                rows={1}
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Kirim pesan"
                disabled={isSending || !input.trim()}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-[#0A66FF] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>

            <p className="text-center text-[10px] font-semibold text-slate-400">
              AI bisa salah — untuk keputusan penting, konfirmasi ke admin.
            </p>
          </div>
        </section>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex h-14 items-center gap-2.5 rounded-full bg-[#0A66FF] px-5 font-black text-white shadow-2xl shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="hidden text-sm sm:inline">Tanya AI</span>
      </button>
    </div>
  );
}
