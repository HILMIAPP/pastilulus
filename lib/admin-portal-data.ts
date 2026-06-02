import { createAdminClient } from "@/lib/supabase/admin";
import { backfillRecentMayarInvoicesForAdmin } from "@/lib/mayar-payment-sync";

export type AdminPtn = {
  id: string;
  name: string;
  city: string;
  officialUrl: string;
  deadlines: Array<{
    id: string;
    title: string;
    openAt: string;
    closeAt: string;
    sourceUrl: string;
  }>;
};

export type AdminBroadcast = {
  id: string;
  target: string;
  title: string;
  body: string;
  status: string;
  sentAt: string;
};

export type AdminPortalData = {
  users: Array<{
    id: string;
    name: string;
    email: string;
    tier: string;
    joined: string;
    status: string;
    target: string;
    tryouts: number;
    avgScore: number;
    lastSeen: string;
  }>;
  transactions: Array<{
    id: string;
    orderId: string;
    userId: string;
    user: string;
    email: string;
    plan: string;
    amount: string;
    amountRaw: number;
    method: string;
    status: "paid" | "pending" | "expired" | "failed";
    promoCode: string;
    affiliateCode: string;
    paidAt: string;
    createdAt: string;
  }>;
  registrations: Array<{
    id: string;
    userId: string | null;
    email: string | null;
    nama: string;
    whatsapp: string;
    sekolah: string;
    kelas: string;
    jurusan: string;
    kartuUrl: string | null;
    status: "pending" | "verified" | "rejected";
    registeredAt: string;
  }>;
  uploadedPakets: Array<{
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    soalCount: number;
    durasiMenit: number;
    akses: "gratis" | "belajar_pro";
    scoringType: "classical" | "irt";
    uploadedBy: string | null;
    createdAt: string;
  }>;
  promos: Array<{
    id: string;
    code: string;
    type: string;
    value: string;
    limit: number;
    used: number;
    expires: string;
    status: string;
  }>;
  affiliates: Array<{
    id: string;
    code: string;
    name: string;
    commission: string;
    clicks: number;
    conversions: number;
    revenue: string;
    status: string;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    updatedAt: string;
  }>;
  landingSections: Array<{
    id: string;
    key: string;
    name: string;
    status: string;
    updatedAt: string;
    owner: string;
    content: Record<string, unknown>;
  }>;
  ptns: AdminPtn[];
  broadcasts: AdminBroadcast[];
  pastiLulusTokens: Array<{
    id: string;
    token: string;
    note: string | null;
    redeemedBy: string | null;
    redeemedAt: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  pastiLulusMaterials: Array<{
    nomor: string;
    universitas: string;
    jurusan: string;
    soalStoragePath: string | null;
    pembahasanStoragePath: string | null;
    updatedAt: string;
  }>;
  crmConversations: Array<{
    id: string;
    channel: "website" | "whatsapp";
    visitorName: string;
    visitorEmail: string;
    visitorPhone: string;
    sourcePage: string;
    topic: string;
    status: string;
    lastMessageAt: string;
    messages: Array<{
      id: string;
      senderType: "visitor" | "bot" | "admin";
      body: string;
      createdAt: string;
    }>;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatIdr(value?: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value ?? 0)
    .replace(/\s/g, " ");
}

function deriveCrmChannel(sourcePage?: string | null): "website" | "whatsapp" {
  const source = (sourcePage ?? "").toLowerCase();
  return source.includes("whatsapp") || source.startsWith("wa:") ? "whatsapp" : "website";
}

export async function fetchAdminPortalData(): Promise<Partial<AdminPortalData>> {
  const supabase = createAdminClient();
  if (!supabase) return {};

  await backfillRecentMayarInvoicesForAdmin();

  const [profiles, transactions, promos, affiliates, blogPosts, siteContent, examSessions, crmConversations, crmMessages, ptns, ptnDeadlines, broadcasts] = await Promise.all([
    supabase.from("profiles").select("id,full_name,email,tier,role,target_ptns,created_at,updated_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("payment_transactions").select("id,order_id,user_id,customer_name,customer_email,plan,amount,payment_method,status,promo_code,affiliate_code,paid_at,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("promo_codes").select("id,code,discount_type,discount_value,usage_limit,used_count,expires_at,status").order("created_at", { ascending: false }).limit(100),
    supabase.from("affiliate_partners").select("id,code,name,commission_rate,click_count,conversion_count,revenue_amount,status").order("created_at", { ascending: false }).limit(100),
    supabase.from("blog_posts").select("id,title,category,status,updated_at").order("updated_at", { ascending: false }).limit(100),
    supabase.from("site_content").select("id,section_key,title,status,owner,content,updated_at").order("updated_at", { ascending: false }).limit(100),
    supabase.from("exam_sessions").select("user_id,score").eq("status", "submitted").limit(1000),
    supabase.from("crm_conversations").select("id,visitor_name,visitor_email,visitor_phone,source_page,topic,status,last_message_at").order("last_message_at", { ascending: false }).limit(100),
    supabase.from("crm_messages").select("id,conversation_id,sender_type,body,created_at").order("created_at", { ascending: true }).limit(1000),
    supabase.from("ptns").select("id,name,city,official_url").order("name", { ascending: true }),
    supabase.from("ptn_deadlines").select("id,ptn_id,title,open_at,close_at,source_url").order("close_at", { ascending: true }),
    supabase.from("broadcast_messages").select("id,target,title,body,status,sent_at").order("sent_at", { ascending: false }).limit(50),
  ]);

  const [registrations, uploadedPakets, pastiLulusTokensData, pastiLulusMaterialsData] = await Promise.all([
    supabase.from("tryout_registrations").select("id,user_id,email,nama,whatsapp,sekolah,kelas,jurusan,kartu_url,status,registered_at").order("registered_at", { ascending: false }).limit(200),
    supabase.from("question_bank_uploads").select("id,paket_id,paket_title,paket_subtitle,soal_count,durasi_menit,akses,scoring_type,uploaded_by,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("pasti_lulus_tokens").select("id,token,note,redeemed_by,redeemed_at,is_active,created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("pasti_lulus_materials").select("nomor,universitas,jurusan,soal_storage_path,pembahasan_storage_path,updated_at").order("nomor", { ascending: true }),
  ]);

  const scoreByUser = new Map<string, { count: number; total: number }>();
  for (const session of examSessions.data ?? []) {
    if (!session.user_id) continue;
    const current = scoreByUser.get(session.user_id) ?? { count: 0, total: 0 };
    scoreByUser.set(session.user_id, {
      count: current.count + 1,
      total: current.total + Number(session.score ?? 0),
    });
  }

  const messagesByConversation = new Map<string, AdminPortalData["crmConversations"][number]["messages"]>();
  for (const message of crmMessages.data ?? []) {
    const current = messagesByConversation.get(message.conversation_id) ?? [];
    current.push({
      id: message.id,
      senderType: message.sender_type,
      body: message.body,
      createdAt: formatDate(message.created_at),
    });
    messagesByConversation.set(message.conversation_id, current);
  }

  return {
    users: (profiles.data ?? []).map((profile) => {
      const score = scoreByUser.get(profile.id);
      return {
        id: profile.id,
        name: profile.full_name ?? "User",
        email: profile.email ?? "-",
        tier: profile.tier ?? "free",
        joined: formatDate(profile.created_at),
        status: "active",
        target: Array.isArray(profile.target_ptns) && profile.target_ptns.length ? profile.target_ptns[0] : "-",
        tryouts: score?.count ?? 0,
        avgScore: score?.count ? Math.round(score.total / score.count) : 0,
        lastSeen: formatDate(profile.updated_at),
      };
    }),
    transactions: (transactions.data ?? []).map((trx) => ({
      id: trx.id,
      orderId: trx.order_id,
      userId: trx.user_id ?? "",
      user: trx.customer_name ?? "User",
      email: trx.customer_email ?? "-",
      plan: trx.plan ?? "-",
      amount: formatIdr(trx.amount),
      amountRaw: Number(trx.amount ?? 0),
      method: trx.payment_method ?? "-",
      status: trx.status,
      promoCode: trx.promo_code ?? "-",
      affiliateCode: trx.affiliate_code ?? "-",
      paidAt: formatDate(trx.paid_at),
      createdAt: formatDate(trx.created_at),
    })),
    promos: (promos.data ?? []).map((promo) => ({
      id: promo.id,
      code: promo.code,
      type: promo.discount_type === "percent" ? "Diskon persen" : "Diskon nominal",
      value: promo.discount_type === "percent" ? `${promo.discount_value}%` : formatIdr(promo.discount_value),
      limit: promo.usage_limit ?? 0,
      used: promo.used_count ?? 0,
      expires: formatDate(promo.expires_at),
      status: promo.status ?? "draft",
    })),
    affiliates: (affiliates.data ?? []).map((affiliate) => ({
      id: affiliate.id,
      code: affiliate.code,
      name: affiliate.name,
      commission: `${affiliate.commission_rate ?? 0}%`,
      clicks: affiliate.click_count ?? 0,
      conversions: affiliate.conversion_count ?? 0,
      revenue: formatIdr(affiliate.revenue_amount),
      status: affiliate.status ?? "draft",
    })),
    blogPosts: (blogPosts.data ?? []).map((post) => ({
      id: post.id,
      title: post.title,
      category: post.category ?? "-",
      status: post.status ?? "draft",
      updatedAt: formatDate(post.updated_at),
    })),
    landingSections: (siteContent.data ?? []).map((section) => ({
      id: section.id,
      key: section.section_key,
      name: section.title ?? section.section_key,
      status: section.status ?? "draft",
      updatedAt: formatDate(section.updated_at),
      owner: section.owner ?? "Content",
      content: section.content ?? {},
    })),
    ptns: (ptns.data ?? []).map((ptn) => ({
      id: ptn.id,
      name: ptn.name,
      city: ptn.city ?? "",
      officialUrl: ptn.official_url ?? "",
      deadlines: (ptnDeadlines.data ?? [])
        .filter((d) => d.ptn_id === ptn.id)
        .map((d) => ({
          id: d.id,
          title: d.title ?? "",
          openAt: d.open_at ? new Date(d.open_at).toLocaleDateString("id-ID") : "-",
          closeAt: d.close_at ? new Date(d.close_at).toLocaleDateString("id-ID") : "-",
          sourceUrl: d.source_url ?? "",
        })),
    })),
    broadcasts: (broadcasts.data ?? []).map((bc) => ({
      id: bc.id,
      target: bc.target ?? "Semua",
      title: bc.title ?? "",
      body: bc.body ?? "",
      status: bc.status ?? "sent",
      sentAt: formatDate(bc.sent_at),
    })),
    crmConversations: (crmConversations.data ?? []).map((conversation) => ({
      id: conversation.id,
      channel: deriveCrmChannel(conversation.source_page),
      visitorName: conversation.visitor_name ?? "Pengunjung website",
      visitorEmail: conversation.visitor_email ?? "-",
      visitorPhone: conversation.visitor_phone ?? "-",
      sourcePage: conversation.source_page ?? "-",
      topic: conversation.topic ?? "general",
      status: conversation.status ?? "waiting_admin",
      lastMessageAt: formatDate(conversation.last_message_at),
      messages: messagesByConversation.get(conversation.id) ?? [],
    })),
    registrations: (registrations.data ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id ?? null,
      email: r.email ?? null,
      nama: r.nama ?? "-",
      whatsapp: r.whatsapp ?? "-",
      sekolah: r.sekolah ?? "-",
      kelas: r.kelas ?? "-",
      jurusan: r.jurusan ?? "-",
      kartuUrl: r.kartu_url ?? null,
      status: (r.status ?? "pending") as "pending" | "verified" | "rejected",
      registeredAt: formatDate(r.registered_at),
    })),
    pastiLulusMaterials: (pastiLulusMaterialsData.data ?? []).map((m) => ({
      nomor: m.nomor,
      universitas: m.universitas,
      jurusan: m.jurusan,
      soalStoragePath: m.soal_storage_path ?? null,
      pembahasanStoragePath: m.pembahasan_storage_path ?? null,
      updatedAt: formatDate(m.updated_at),
    })),
    pastiLulusTokens: (pastiLulusTokensData.data ?? []).map((t) => ({
      id: t.id,
      token: t.token,
      note: t.note ?? null,
      redeemedBy: t.redeemed_by ?? null,
      redeemedAt: t.redeemed_at ? formatDate(t.redeemed_at) : null,
      isActive: t.is_active ?? true,
      createdAt: formatDate(t.created_at),
    })),
    uploadedPakets: (uploadedPakets.data ?? []).map((p) => ({
      id: p.id,
      slug: p.paket_id,
      title: p.paket_title ?? "-",
      subtitle: p.paket_subtitle ?? "",
      soalCount: p.soal_count ?? 0,
      durasiMenit: p.durasi_menit ?? 120,
      akses: (p.akses ?? "belajar_pro") as "gratis" | "belajar_pro",
      scoringType: (p.scoring_type ?? "classical") as "classical" | "irt",
      uploadedBy: p.uploaded_by ?? null,
      createdAt: formatDate(p.created_at),
    })),
  };
}
