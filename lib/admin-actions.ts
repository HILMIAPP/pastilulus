"use server";

import { revalidatePath } from "next/cache";
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

export async function createPromoCodeAction(code: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase.from("promo_codes").insert({
    code: code.trim().toUpperCase(),
    discount_type: "nominal",
    discount_value: 5000,
    usage_limit: 100,
    status: "draft",
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function createAffiliatePartnerAction(code: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase.from("affiliate_partners").insert({
    code: code.trim().toUpperCase(),
    name: "Partner Baru",
    commission_rate: 10,
    status: "draft",
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
