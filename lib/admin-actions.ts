"use server";

import { revalidatePath } from "next/cache";
import { syncMayarPaymentByOrderId } from "@/lib/mayar-payment-sync";
import { seoBlogSeedPosts } from "@/lib/seo-blog-seed";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/lib/session";

async function assertAdmin() {
  const session = await getCurrentSession();
  if (session?.role !== "admin" && session?.role !== "super_admin") {
    throw new Error("Unauthorized admin action.");
  }
}

function isBaileysCrmEnabled() {
  return process.env.ENABLE_BAILEYS_CRM === "true" || process.env.ENABLE_BAILEYS_CRM === "1";
}

export async function syncPaymentTransactionAction(orderId: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const status = await syncMayarPaymentByOrderId(orderId);
  if (!status) return { ok: false, message: "Transaksi tidak ditemukan atau Mayar belum bisa dihubungi." };

  revalidatePath("/admin");
  return {
    ok: true,
    status,
    message: status === "paid" ? "Status pembayaran sudah paid dan paket disinkronkan." : `Status Mayar masih ${status}.`,
  };
}

export async function createPromoCodeAction(input: {
  code: string;
  discountType: "nominal" | "percent";
  discountValue: number;
  usageLimit: number;
  expiresAt: string;
  status: "draft" | "published";
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase.from("promo_codes").insert({
    code: input.code.trim().toUpperCase(),
    discount_type: input.discountType,
    discount_value: Math.max(0, Math.round(input.discountValue)),
    usage_limit: Math.max(0, Math.round(input.usageLimit)),
    expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
    status: input.status,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function createAffiliatePartnerAction(input: {
  code: string;
  name: string;
  commissionRate: number;
  status: "draft" | "published";
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase.from("affiliate_partners").insert({
    code: input.code.trim().toUpperCase(),
    name: input.name.trim() || "Partner Baru",
    commission_rate: Math.min(100, Math.max(0, Math.round(input.commissionRate))),
    status: input.status,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateQuestionStatusAction(questionId: string, status: "published" | "rejected") {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("questions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveLandingHeroAction(input: {
  badge: string;
  headline: string;
  subheadline: string;
  cta: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase.from("site_content").upsert(
    {
      section_key: "hero",
      title: "Hero landing",
      owner: "Marketing",
      status: "published",
      content: {
        badge: input.badge.trim(),
        headline: input.headline.trim(),
        subheadline: input.subheadline.trim(),
        cta: input.cta.trim(),
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "section_key" },
  );

  if (error) return { ok: false, message: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function savePaymentGuideAction(input: {
  title: string;
  body: string;
  youtubeUrl: string;
  imageUrls: string;
  qrisSteps: string;
  virtualAccountSteps: string;
  ewalletSteps: string;
  cardSteps: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase.from("site_content").upsert(
    {
      section_key: "payment_guide",
      title: "Tata cara pembayaran",
      owner: "Billing",
      status: "published",
      content: {
        title: input.title.trim(),
        body: input.body.trim(),
        youtubeUrl: input.youtubeUrl.trim(),
        imageUrls: input.imageUrls.trim(),
        qrisSteps: input.qrisSteps.trim(),
        virtualAccountSteps: input.virtualAccountSteps.trim(),
        ewalletSteps: input.ewalletSteps.trim(),
        cardSteps: input.cardSteps.trim(),
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "section_key" },
  );

  if (error) return { ok: false, message: error.message };
  revalidatePath("/pembayaran");
  revalidatePath("/admin");
  return { ok: true };
}

export async function createBlogPostAction(input: {
  title: string;
  category: string;
  excerpt: string;
  body: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const slug = input.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  const { error } = await supabase.from("blog_posts").insert({
    slug: slug || `artikel-${Date.now()}`,
    title: input.title.trim(),
    category: input.category.trim() || "Tips belajar",
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    status: "draft",
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin");
  return { ok: true };
}

export async function seedSeoBlogPostsAction() {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const now = new Date().toISOString();
  const rows = seoBlogSeedPosts.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    status: "published",
    published_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now,
  }));

  const { error } = await supabase.from("blog_posts").upsert(rows, { onConflict: "slug" });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin");
  return { ok: true, count: rows.length };
}

export async function replyCrmConversationAction(input: {
  conversationId: string;
  body: string;
}) {
  const session = await getCurrentSession();
  if (session?.role !== "admin" && session?.role !== "super_admin") {
    throw new Error("Unauthorized admin action.");
  }

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const body = input.body.trim();
  if (!body) return { ok: false, message: "Balasan wajib diisi." };

  const { data: conversation } = await supabase
    .from("crm_conversations")
    .select("source_page,visitor_phone")
    .eq("id", input.conversationId)
    .single();
  const isWhatsAppConversation = String(conversation?.source_page ?? "").toLowerCase().includes("whatsapp") && Boolean(conversation?.visitor_phone);
  const shouldQueueBaileys = isWhatsAppConversation && isBaileysCrmEnabled();
  const now = new Date().toISOString();
  const { error: messageError } = await supabase.from("crm_messages").insert({
    conversation_id: input.conversationId,
    sender_type: "admin",
    sender_id: session.userId,
    body,
    metadata: {
      admin_email: session.email,
      dispatch_channel: shouldQueueBaileys ? "baileys" : isWhatsAppConversation ? "whatsapp_manual" : "website",
      dispatch_status: shouldQueueBaileys ? "queued" : isWhatsAppConversation ? "manual_follow_up" : "delivered_in_app",
    },
  });

  if (messageError) return { ok: false, message: messageError.message };

  const { error: updateError } = await supabase
    .from("crm_conversations")
    .update({
      status: "assigned",
      assigned_admin_id: session.userId,
      last_message_at: now,
      updated_at: now,
    })
    .eq("id", input.conversationId);

  if (updateError) return { ok: false, message: updateError.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function createWhatsAppLeadAction(input: {
  name: string;
  phone: string;
  message: string;
  topic: string;
}) {
  const session = await getCurrentSession();
  if (session?.role !== "admin" && session?.role !== "super_admin") {
    throw new Error("Unauthorized admin action.");
  }

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const phone = input.phone.trim();
  if (!phone) return { ok: false, message: "Nomor WhatsApp wajib diisi." };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("crm_conversations")
    .insert({
      visitor_name: input.name.trim() || "Lead WhatsApp",
      visitor_phone: phone,
      visitor_email: null,
      source_page: isBaileysCrmEnabled() ? "whatsapp:baileys-manual" : "whatsapp:manual-admin",
      topic: input.topic.trim() || "whatsapp",
      status: "waiting_admin",
      assigned_admin_id: session.userId,
      last_message_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  const body = input.message.trim() || "Lead WhatsApp dibuat manual dari admin omni CRM.";
  const { error: messageError } = await supabase.from("crm_messages").insert({
    conversation_id: data.id,
    sender_type: "visitor",
    body,
    metadata: { source: isBaileysCrmEnabled() ? "whatsapp_baileys_manual" : "whatsapp_manual_admin", admin_email: session.email },
  });

  if (messageError) return { ok: false, message: messageError.message };
  revalidatePath("/admin");
  return { ok: true, conversationId: data.id };
}

export async function updateCrmConversationStatusAction(input: {
  conversationId: string;
  status: "waiting_admin" | "assigned" | "closed";
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("crm_conversations")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.conversationId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function upsertPtnAction(input: {
  id?: string;
  name: string;
  city: string;
  officialUrl: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const now = new Date().toISOString();
  const payload = {
    name: input.name.trim(),
    city: input.city.trim(),
    official_url: input.officialUrl.trim() || null,
    has_mandiri: true,
    updated_at: now,
  };

  const { error } = input.id
    ? await supabase.from("ptns").update(payload).eq("id", input.id)
    : await supabase.from("ptns").insert({ ...payload, created_at: now });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function upsertPtnDeadlineAction(input: {
  id?: string;
  ptnId: string;
  title: string;
  openAt: string;
  closeAt: string;
  sourceUrl: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const now = new Date().toISOString();
  const payload = {
    ptn_id: input.ptnId,
    title: input.title.trim(),
    open_at: input.openAt ? new Date(input.openAt).toISOString() : null,
    close_at: input.closeAt ? new Date(input.closeAt).toISOString() : null,
    source_url: input.sourceUrl.trim() || null,
    verified_at: now,
  };

  const { error } = input.id
    ? await supabase.from("ptn_deadlines").update(payload).eq("id", input.id)
    : await supabase.from("ptn_deadlines").insert({ ...payload, created_at: now });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  revalidatePath("/siswa/info-ptn");
  return { ok: true };
}

export async function sendBroadcastAction(input: {
  target: string;
  title: string;
  body: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  if (!input.title.trim() || !input.body.trim()) {
    return { ok: false, message: "Judul dan isi pesan wajib diisi." };
  }

  const { error } = await supabase.from("broadcast_messages").insert({
    target: input.target,
    title: input.title.trim(),
    body: input.body.trim(),
    status: "sent",
    sent_at: new Date().toISOString(),
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function publishBlogPostAction(id: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "published", published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin");
  return { ok: true };
}

export async function unpublishBlogPostAction(id: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateBlogPostAction(input: {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: input.title.trim(),
      category: input.category.trim(),
      excerpt: input.excerpt.trim(),
      body: input.body.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserTierAction(userId: string, tier: "free" | "belajar" | "pro") {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("profiles")
    .update({ tier, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateRegistrationStatusAction(id: string, status: "verified" | "rejected") {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("tryout_registrations")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}
