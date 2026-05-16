import { createAdminClient } from "@/lib/supabase/admin";

type ChatPayload = {
  conversationId?: string;
  message?: string;
  topic?: string;
  handoff?: boolean;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  sourcePage?: string;
};

function inferTopic(message: string, explicitTopic?: string, handoff?: boolean) {
  if (handoff) return "handoff";
  if (explicitTopic && explicitTopic !== "general") return explicitTopic;
  const text = message.toLowerCase();
  if (text.includes("admin") || text.includes("manusia") || text.includes("cs")) return "handoff";
  if (text.includes("bayar") || text.includes("order") || text.includes("aktif")) return "payment";
  if (text.includes("paket") || text.includes("harga") || text.includes("produk")) return "package";
  if (text.includes("ujian") || text.includes("ptn") || text.includes("mandiri")) return "ptn_info";
  return "general";
}

function botReply(topic: string) {
  if (topic === "handoff") {
    return "Siap, kak. Aku sudah lempar percakapan ini ke inbox CRM admin. Sambil menunggu, kakak juga bisa lanjut lewat tombol WA Grup di bawah.";
  }
  if (topic === "payment") {
    return "Siap, kak. Untuk cek pembayaran, admin butuh email akun, Order ID, dan screenshot bukti bayar. Pesan ini sudah masuk inbox CRM admin.";
  }
  if (topic === "package") {
    return "Siap, kak. Paket Belajar untuk tryout dan pembahasan, Paket Pro untuk fitur lebih lengkap. Admin bisa bantu pilihkan sesuai target kampus.";
  }
  if (topic === "ptn_info") {
    return "Siap, kak. Sebutkan kampus target seperti UI, ITB, UGM, atau UNPAD. Admin akan bantu arahkan info Ujian Mandiri yang relevan.";
  }
  return "Terima kasih, kak. Pesan sudah masuk inbox CRM admin dan akan dibalas secepatnya.";
}

export async function GET(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return Response.json({ ok: false, message: "CRM belum aktif." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId")?.trim();
  if (!conversationId) {
    return Response.json({ ok: false, message: "Conversation ID wajib diisi." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("crm_messages")
    .select("id,sender_type,body,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(80);

  if (error) return Response.json({ ok: false, message: error.message }, { status: 500 });

  return Response.json({
    ok: true,
    messages: (data ?? []).map((message) => ({
      id: message.id,
      sender: message.sender_type,
      body: message.body,
      createdAt: message.created_at,
    })),
  });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return Response.json({ ok: false, message: "CRM belum aktif." }, { status: 503 });
  }

  const payload = (await request.json().catch(() => ({}))) as ChatPayload;
  const message = String(payload.message ?? "").trim();
  if (!message) {
    return Response.json({ ok: false, message: "Pesan wajib diisi." }, { status: 400 });
  }

  const topic = inferTopic(message, payload.topic, payload.handoff);
  let conversationId = payload.conversationId;

  if (!conversationId) {
    const { data, error } = await supabase
      .from("crm_conversations")
      .insert({
        visitor_name: payload.visitorName?.trim() || "Pengunjung website",
        visitor_email: payload.visitorEmail?.trim() || null,
        visitor_phone: payload.visitorPhone?.trim() || null,
        source_page: payload.sourcePage?.trim() || null,
        topic,
        status: "waiting_admin",
      })
      .select("id")
      .single();

    if (error) return Response.json({ ok: false, message: error.message }, { status: 500 });
    conversationId = data.id;
  }

  const now = new Date().toISOString();
  const { error: messageError } = await supabase.from("crm_messages").insert([
    {
      conversation_id: conversationId,
      sender_type: "visitor",
      body: message,
      metadata: { source: "support_chat_bubble", handoff: payload.handoff ?? false },
    },
    {
      conversation_id: conversationId,
      sender_type: "bot",
      body: botReply(topic),
      metadata: { source: "bot_auto_reply", topic },
    },
  ]);

  if (messageError) return Response.json({ ok: false, message: messageError.message }, { status: 500 });

  await supabase
    .from("crm_conversations")
    .update({ topic, status: "waiting_admin", last_message_at: now, updated_at: now })
    .eq("id", conversationId);

  return Response.json({ ok: true, conversationId, reply: botReply(topic) });
}
