"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, MessageCircle, Send, ShoppingBag, X } from "lucide-react";
import { site } from "@/lib/site-config";

type ChatMessage = {
  id: string;
  sender: "bot" | "visitor" | "admin";
  body: string;
  pending?: boolean;
};

type RemoteChatMessage = {
  id: string;
  sender: "bot" | "visitor" | "admin";
  body: string;
};

const quickReplies = [
  "Saya mau tanya paket belajar",
  "Pembayaran saya belum aktif",
  "Mau info Ujian Mandiri PTN",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    sender: "bot",
    body: "Halo, aku Admin AI Bot Nukaedu. Tulis pertanyaan kamu di sini, nanti aku jawab dulu. Kalau butuh manusia, aku bisa lempar percakapan ini ke inbox CRM admin.",
  },
];

function waLink(message: string) {
  const baseUrl = site.whatsappGroupUrl;
  if (!baseUrl.startsWith("https://wa.me/")) return baseUrl;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function SupportChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    if (isOpen) messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  const syncConversation = useCallback(async (id: string) => {
    const response = await fetch(`/api/crm/chat?conversationId=${encodeURIComponent(id)}`).catch(() => null);
    if (!response?.ok) return;

    const data = (await response.json()) as { messages?: RemoteChatMessage[] };
    if (!data.messages?.length) return;

    setMessages([
      initialMessages[0],
      ...data.messages.map((chat) => ({
        id: chat.id,
        sender: chat.sender,
        body: chat.body,
      })),
    ]);
  }, []);

  useEffect(() => {
    if (!isOpen || !conversationId) return;
    const interval = window.setInterval(() => {
      void syncConversation(conversationId);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [conversationId, isOpen, syncConversation]);

  const sendMessage = async (body: string, options?: { handoff?: boolean }) => {
    const cleanBody = body.trim();
    if (!cleanBody || isSending) return;
    messageIdRef.current += 1;
    const messageNumber = messageIdRef.current;

    const visitorMessage: ChatMessage = {
      id: `visitor-${messageNumber}`,
      sender: "visitor",
      body: cleanBody,
    };
    const pendingMessage: ChatMessage = {
      id: `bot-pending-${messageNumber}`,
      sender: "bot",
      body: options?.handoff ? "Menghubungkan ke admin manusia..." : "Sebentar, aku cek dulu...",
      pending: true,
    };

    setMessages((current) => [...current, visitorMessage, pendingMessage]);
    setIsSending(true);
    setMessage("");

    const response = await fetch("/api/crm/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversationId || undefined,
        message: cleanBody,
        handoff: options?.handoff ?? false,
        sourcePage: typeof window !== "undefined" ? window.location.pathname : "/",
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setMessages((current) =>
        current.map((item) =>
          item.id === pendingMessage.id
            ? {
                ...item,
                body: "Maaf, chat CRM belum aktif. Kamu tetap bisa lanjut lewat tombol WhatsApp di bawah.",
                pending: false,
              }
            : item,
        ),
      );
      setIsSending(false);
      return;
    }

    const data = (await response.json()) as { conversationId?: string; reply?: string };
    if (data.conversationId) {
      setConversationId(data.conversationId);
      void syncConversation(data.conversationId);
    }
    setMessages((current) =>
      current.map((item) =>
        item.id === pendingMessage.id
          ? {
              ...item,
              body: data.reply ?? "Pesan kamu sudah masuk inbox CRM admin.",
              pending: false,
            }
          : item,
      ),
    );
    setIsSending(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(message);
  };

  const requestHumanAdmin = () => {
    void sendMessage("Saya ingin dibantu admin manusia.", { handoff: true });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[calc(100vw-2.5rem)] max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/70">
          <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A66FF]">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-black">Admin AI Bot {site.name}</p>
                <p className="text-xs font-semibold text-slate-300">Chat dulu, lalu bisa dilempar ke admin</p>
              </div>
            </div>
            <button type="button" aria-label="Tutup chat" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex max-h-[70vh] flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-4">
              {messages.map((chat) => (
                <div key={chat.id} className={`flex ${chat.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed shadow-sm ${
                      chat.sender === "visitor"
                        ? "rounded-br-md bg-[#0A66FF] text-white"
                        : chat.sender === "admin"
                          ? "rounded-bl-md border border-emerald-200 bg-emerald-50 text-emerald-950"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {chat.sender === "admin" && <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-emerald-700">Admin manusia</span>}
                    {chat.pending && <Loader2 size={14} className="mr-2 inline animate-spin align-[-2px]" />}
                    {chat.body}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            <div className="space-y-4 border-t border-slate-200 bg-white p-5">
              <div className="grid gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    disabled={isSending}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:border-[#0A66FF] hover:text-[#0A66FF] disabled:opacity-60"
                  >
                    {reply}
                    <Send size={15} />
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <label className="sr-only" htmlFor="support-chat-message">
                  Tulis pesan chat
                </label>
                <div className="flex items-end gap-2">
                  <textarea
                    id="support-chat-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm font-semibold text-slate-700 outline-none"
                    placeholder="Ketik pertanyaan kamu..."
                  />
                  <button
                    type="submit"
                    aria-label="Kirim pesan"
                    disabled={isSending || !message.trim()}
                    className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-300"
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={requestHumanAdmin}
                disabled={isSending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-[#0A66FF] hover:border-[#0A66FF] hover:bg-white disabled:opacity-60"
              >
                <Bot size={16} />
                Lempar ke admin manusia
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={waLink("Halo admin, saya butuh bantuan.")}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600"
                >
                  <MessageCircle size={16} /> WA Grup
                </Link>
                <Link
                  href="/harga"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A66FF] px-4 py-3 text-sm font-black text-white hover:bg-[#0052D6]"
                >
                  <ShoppingBag size={16} /> Paket
                </Link>
              </div>

              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-600">
                Percakapan ini disimpan ke CRM admin. Balasan manusia muncul di dashboard admin, sementara pengunjung tetap bisa lanjut via WhatsApp.
              </p>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-16 items-center gap-3 rounded-full bg-[#0A66FF] px-5 font-black text-white shadow-2xl shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
        aria-expanded={isOpen}
      >
        <MessageCircle size={24} />
        <span className="hidden sm:inline">Chat admin</span>
      </button>
    </div>
  );
}
