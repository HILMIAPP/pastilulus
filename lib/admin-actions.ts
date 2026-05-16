"use server";

import { revalidatePath } from "next/cache";
import { seoBlogSeedPosts } from "@/lib/seo-blog-seed";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/lib/session";

async function assertAdmin() {
  const session = await getCurrentSession();
  if (session?.role !== "admin" && session?.role !== "super_admin") {
    throw new Error("Unauthorized admin action.");
  }
}

export async function syncPaymentTransactionAction(orderId: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("payment_transactions")
    .update({ status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
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

  const now = new Date().toISOString();
  const { error: messageError } = await supabase.from("crm_messages").insert({
    conversation_id: input.conversationId,
    sender_type: "admin",
    sender_id: session.userId,
    body,
    metadata: { admin_email: session.email },
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
