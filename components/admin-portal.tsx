"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAction } from "@/lib/auth-actions";
import {
  createAffiliatePartnerAction,
  createBlogPostAction,
  createPromoCodeAction,
  createWhatsAppLeadAction,
  publishBlogPostAction,
  replyCrmConversationAction,
  saveLandingHeroAction,
  savePaymentGuideAction,
  seedSeoBlogPostsAction,
  sendBroadcastAction,
  syncPaymentTransactionAction,
  unpublishBlogPostAction,
  updateBlogPostAction,
  updateCrmConversationStatusAction,
  updateRegistrationStatusAction,
  updateUserTierAction,
  upsertPtnAction,
  upsertPtnDeadlineAction,
} from "@/lib/admin-actions";
import { bulkUpdatePastiLulusTokensAction, deactivatePastiLulusTokenAction, generatePastiLulusTokensAction } from "@/lib/pasti-lulus-actions";
import { PASTI_LULUS_ITEMS } from "@/lib/pasti-lulus-data";
import type { AdminBroadcast, AdminPortalData, AdminPtn } from "@/lib/admin-portal-data";
import { site, whiteLabel } from "@/lib/site-config";
import {
  BadgePercent,
  Banknote,
  Bell,
  Check,
  CheckCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  FileUp,
  Globe2,
  GraduationCap,
  Handshake,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  MessageSquare,
  Menu,
  Newspaper,
  PackageOpen,
  PhoneCall,
  PlayCircle,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";

type AdminTab = "dashboard" | "users" | "registrasi" | "paket" | "content" | "blog" | "crm" | "ptn" | "billing" | "promo" | "broadcast" | "pasti_lulus" | "settings";
type PaymentStatus = "paid" | "pending" | "expired" | "failed";

type TransactionRow = AdminPortalData["transactions"][number];
type UserRow = AdminPortalData["users"][number];
type PromoRow = AdminPortalData["promos"][number];
type AffiliateRow = AdminPortalData["affiliates"][number];

export type PackageInfo = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  soalCount: number;
  durasiMenit: number;
  akses: "gratis" | "belajar_pro";
  scoringType: "classical" | "irt";
  source: "static" | "uploaded";
};

type ParsedQuestion = {
  id: string;
  nomor: number;
  bagian: string;
  tingkat: "MUDAH" | "SEDANG" | "HOTS";
  pertanyaan: string;
  opsi: Record<"A" | "B" | "C" | "D" | "E", string>;
  kunci: "A" | "B" | "C" | "D" | "E";
  pembahasan: string;
};


const ADMIN_NAV: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "billing", label: "Transaksi & Billing", icon: CreditCard },
  { id: "promo", label: "Promo & Affiliate", icon: BadgePercent },
  { id: "users", label: "Data Pengguna", icon: Users },
  { id: "registrasi", label: "Registrasi Gratis", icon: ClipboardList },
  { id: "paket", label: "Manajemen Paket", icon: Database },
  { id: "crm", label: "CRM Omni", icon: MessageSquare },
  { id: "content", label: "Konten Website", icon: Newspaper },
  { id: "blog", label: "Blog & SEO", icon: FileText },
  { id: "ptn", label: "Manajemen PTN", icon: GraduationCap },
  { id: "broadcast", label: "Broadcast Notif", icon: Megaphone },
  { id: "pasti_lulus", label: "Pasti Lulus Token", icon: Trophy },
  { id: "settings", label: "Admin Settings", icon: Settings },
];

export default function AdminPortal({ initialData = {}, staticPakets = [] }: { initialData?: Partial<AdminPortalData>; staticPakets?: PackageInfo[] }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [users, setUsers] = useState(initialData.users ?? []);
  const landingContent = initialData.landingSections ?? [];
  const blogContent = initialData.blogPosts ?? [];
  const initialCrmConversations = initialData.crmConversations ?? [];
  const [transactions, setTransactions] = useState(initialData.transactions ?? []);
  const [registrations, setRegistrations] = useState(initialData.registrations ?? []);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const uploadedPakets: PackageInfo[] = (initialData.uploadedPakets ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    soalCount: p.soalCount,
    durasiMenit: p.durasiMenit,
    akses: p.akses,
    scoringType: p.scoringType,
    source: "uploaded" as const,
  }));
  const [crmConversations, setCrmConversations] = useState(initialCrmConversations);
  const [selectedCrmId, setSelectedCrmId] = useState(initialCrmConversations[0]?.id ?? "");
  const [selectedTransactionId, setSelectedTransactionId] = useState(initialData.transactions?.[0]?.id ?? "");
  const [selectedUserId, setSelectedUserId] = useState(initialData.users?.[0]?.id ?? "");
  const [promos, setPromos] = useState(initialData.promos ?? []);
  const [affiliates, setAffiliates] = useState(initialData.affiliates ?? []);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscountType, setNewPromoDiscountType] = useState<"nominal" | "percent">("nominal");
  const [newPromoDiscountValue, setNewPromoDiscountValue] = useState("5000");
  const [newPromoUsageLimit, setNewPromoUsageLimit] = useState("100");
  const [newPromoExpiresAt, setNewPromoExpiresAt] = useState("2026-07-31");
  const [newPromoStatus, setNewPromoStatus] = useState<"draft" | "published">("published");
  const [newAffiliateCode, setNewAffiliateCode] = useState("");
  const [newAffiliateName, setNewAffiliateName] = useState("");
  const [newAffiliateCommission, setNewAffiliateCommission] = useState("10");
  const [newAffiliateStatus, setNewAffiliateStatus] = useState<"draft" | "published">("published");

  // PTN state
  const [ptns, setPtns] = useState<AdminPtn[]>(initialData.ptns ?? []);
  const [ptnMsg, setPtnMsg] = useState("");

  // Broadcast state
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>(initialData.broadcasts ?? []);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  // Pasti Lulus token + materials state
  const [pastiLulusTokens, setPastiLulusTokens] = useState<AdminPortalData["pastiLulusTokens"]>(initialData.pastiLulusTokens ?? []);
  const [pastiLulusMaterials, setPastiLulusMaterials] = useState<AdminPortalData["pastiLulusMaterials"]>(initialData.pastiLulusMaterials ?? []);
  const [plGenCount, setPlGenCount] = useState("10");
  const [plGenNote, setPlGenNote] = useState("");
  const [plGenExpiry, setPlGenExpiry] = useState("");
  const [plGenerating, setPlGenerating] = useState(false);
  const [plGeneratedTokens, setPlGeneratedTokens] = useState<string[]>([]);
  const [plMsg, setPlMsg] = useState("");

  // Blog local state for publish/unpublish
  const [blogData, setBlogData] = useState(blogContent);

  const selectedTransaction = transactions.find((trx) => trx.id === selectedTransactionId) ?? transactions[0];
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const paidCount = transactions.filter((trx) => trx.status === "paid").length;
  const pendingCount = transactions.filter((trx) => trx.status === "pending").length;
  const totalRevenue = transactions.filter((t) => t.status === "paid").reduce((s, t) => s + t.amountRaw, 0);
  const totalUsers = users.length;
  const activeSubscriptions = users.filter((u) => u.tier !== "free").length;
  const selectedCrmConversation = crmConversations.find((conversation) => conversation.id === selectedCrmId) ?? crmConversations[0];
  const pendingRegs = registrations.filter((r) => r.status === "pending").length;

  const filteredUserTransactions = useMemo(
    () => transactions.filter((trx) => trx.userId === selectedUser?.id),
    [selectedUser, transactions],
  );

  const refreshRealtimeData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/portal-data", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) return;

      const data = (await response.json()) as Partial<AdminPortalData>;
      if (data.users) {
        setUsers(data.users);
        setSelectedUserId((current) => (current && data.users?.some((user) => user.id === current) ? current : data.users?.[0]?.id ?? ""));
      }
      if (data.transactions) {
        setTransactions(data.transactions);
        setSelectedTransactionId((current) =>
          current && data.transactions?.some((transaction) => transaction.id === current) ? current : data.transactions?.[0]?.id ?? "",
        );
      }
      if (data.registrations) setRegistrations(data.registrations);
      if (data.promos) setPromos(data.promos);
      if (data.affiliates) setAffiliates(data.affiliates);
      setLastSyncedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialRefreshId = window.setTimeout(() => {
      void refreshRealtimeData();
    }, 0);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshRealtimeData();
    }, 7000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshRealtimeData();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshRealtimeData]);

  const updateRegStatus = async (id: string, status: "verified" | "rejected") => {
    setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    await updateRegistrationStatusAction(id, status);
  };

  const updateUserTier = async (userId: string, tier: "free" | "belajar" | "pro") => {
    await updateUserTierAction(userId, tier);
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, tier } : user)));
    void refreshRealtimeData();
  };

  const syncTransaction = async (id: string) => {
    const orderId = transactions.find((trx) => trx.id === id)?.orderId;
    const result = orderId
      ? await syncPaymentTransactionAction(orderId)
      : { ok: false, message: "Order ID transaksi tidak ditemukan." };
    await refreshRealtimeData();
    return result;
  };

  const createPromo = async () => {
    const code = newPromoCode.trim().toUpperCase();
    if (!code) return;
    const discountValue = Number(newPromoDiscountValue) || 0;
    const usageLimit = Number(newPromoUsageLimit) || 0;
    const displayValue =
      newPromoDiscountType === "percent"
        ? `${discountValue}%`
        : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
            .format(discountValue)
            .replace(/\s/g, " ");
    const expiresLabel = newPromoExpiresAt
      ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(newPromoExpiresAt))
      : "-";
    setPromos((prev) => [
      {
        id: `promo-${Date.now()}`,
        code,
        type: newPromoDiscountType === "percent" ? "Diskon persen" : "Diskon nominal",
        value: displayValue,
        limit: usageLimit,
        used: 0,
        expires: expiresLabel,
        status: newPromoStatus,
      },
      ...prev,
    ]);
    setNewPromoCode("");
    await createPromoCodeAction({
      code,
      discountType: newPromoDiscountType,
      discountValue,
      usageLimit,
      expiresAt: newPromoExpiresAt,
      status: newPromoStatus,
    });
  };

  const createAffiliate = async () => {
    const code = newAffiliateCode.trim().toUpperCase();
    if (!code) return;
    const commissionRate = Number(newAffiliateCommission) || 0;
    const partnerName = newAffiliateName.trim() || "Partner Baru";
    setAffiliates((prev) => [
      { id: `aff-${Date.now()}`, code, name: partnerName, commission: `${commissionRate}%`, clicks: 0, conversions: 0, revenue: "Rp 0", status: newAffiliateStatus },
      ...prev,
    ]);
    setNewAffiliateCode("");
    setNewAffiliateName("");
    await createAffiliatePartnerAction({
      code,
      name: partnerName,
      commissionRate,
      status: newAffiliateStatus,
    });
  };

  const replyCrm = async (conversationId: string, body: string) => {
    const now = "Baru saja";
    setCrmConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              status: "assigned",
              lastMessageAt: now,
              messages: [
                ...conversation.messages,
                { id: `local-${Date.now()}`, senderType: "admin", body, createdAt: now },
              ],
            }
          : conversation,
      ),
    );
    await replyCrmConversationAction({ conversationId, body });
  };

  const createWhatsAppLead = async (input: { name: string; phone: string; message: string; topic: string }) => {
    const result = await createWhatsAppLeadAction(input);
    if (!result.ok || !result.conversationId) return result;

    const now = "Baru saja";
    const conversation = {
      id: result.conversationId,
      channel: "whatsapp" as const,
      visitorName: input.name.trim() || "Lead WhatsApp",
      visitorEmail: "-",
      visitorPhone: input.phone.trim(),
      sourcePage: site.enableBaileysCrm ? "whatsapp:baileys-manual" : "whatsapp:manual-admin",
      topic: input.topic.trim() || "whatsapp",
      status: "waiting_admin",
      lastMessageAt: now,
      messages: [
        {
          id: `local-wa-${result.conversationId}`,
          senderType: "visitor" as const,
          body: input.message.trim() || "Lead WhatsApp dibuat manual dari admin omni CRM.",
          createdAt: now,
        },
      ],
    };

    setCrmConversations((prev) => [conversation, ...prev]);
    setSelectedCrmId(result.conversationId);
    return result;
  };

  const updateCrmStatus = async (conversationId: string, status: "waiting_admin" | "assigned" | "closed") => {
    setCrmConversations((prev) => prev.map((conversation) => (conversation.id === conversationId ? { ...conversation, status } : conversation)));
    await updateCrmConversationStatusAction({ conversationId, status });
  };

  const savePtn = async (input: { id?: string; name: string; city: string; officialUrl: string }) => {
    setPtnMsg("");
    const result = await upsertPtnAction(input);
    if (result.ok) {
      if (input.id) {
        setPtns((prev) => prev.map((p) => p.id === input.id ? { ...p, ...input } : p));
      } else {
        setPtns((prev) => [{ id: `ptn-${Date.now()}`, name: input.name, city: input.city, officialUrl: input.officialUrl, deadlines: [] }, ...prev]);
      }
      setPtnMsg("PTN berhasil disimpan.");
    } else {
      setPtnMsg(result.message ?? "Gagal menyimpan PTN.");
    }
  };

  const savePtnDeadline = async (input: { id?: string; ptnId: string; title: string; openAt: string; closeAt: string; sourceUrl: string }) => {
    const result = await upsertPtnDeadlineAction(input);
    if (result.ok) {
      setPtns((prev) => prev.map((p) => p.id === input.ptnId ? {
        ...p,
        deadlines: input.id
          ? p.deadlines.map((d) => d.id === input.id ? { ...d, ...input } : d)
          : [...p.deadlines, { id: `dl-${Date.now()}`, title: input.title, openAt: input.openAt, closeAt: input.closeAt, sourceUrl: input.sourceUrl }],
      } : p));
    }
    return result;
  };

  const sendBroadcast = async (input: { target: string; title: string; body: string }) => {
    setBroadcastMsg("");
    const result = await sendBroadcastAction(input);
    if (result.ok) {
      setBroadcasts((prev) => [{
        id: `bc-${Date.now()}`,
        target: input.target,
        title: input.title,
        body: input.body,
        status: "sent",
        sentAt: "Baru saja",
      }, ...prev]);
      setBroadcastMsg("Broadcast berhasil dikirim.");
    } else {
      setBroadcastMsg(result.message ?? "Gagal mengirim broadcast.");
    }
  };

  const publishBlog = async (id: string) => {
    const result = await publishBlogPostAction(id);
    if (result.ok) setBlogData((prev) => prev.map((p) => p.id === id ? { ...p, status: "published" } : p));
  };

  const unpublishBlog = async (id: string) => {
    const result = await unpublishBlogPostAction(id);
    if (result.ok) setBlogData((prev) => prev.map((p) => p.id === id ? { ...p, status: "draft" } : p));
  };

  const saveBlogPost = async (input: { id: string; title: string; category: string; excerpt: string; body: string }) => {
    const result = await updateBlogPostAction(input);
    if (result.ok) setBlogData((prev) => prev.map((p) => p.id === input.id ? { ...p, title: input.title, category: input.category } : p));
    return result;
  };

  const generatePastiLulusTokens = async () => {
    const count = Math.max(1, Math.min(500, Number(plGenCount) || 10));
    setPlGenerating(true);
    setPlMsg("");
    setPlGeneratedTokens([]);
    const result = await generatePastiLulusTokensAction({ count, note: plGenNote, expiresAt: plGenExpiry });
    setPlGenerating(false);
    if (result.ok && result.tokens) {
      setPlGeneratedTokens(result.tokens);
      setPastiLulusTokens((prev) => [
        ...result.tokens!.map((t) => ({ id: `pl-${Date.now()}-${t}`, token: t, note: plGenNote || null, redeemedBy: null, redeemedAt: null, isActive: true, createdAt: "Baru saja" })),
        ...prev,
      ]);
      setPlMsg(`${result.tokens.length} token berhasil dibuat.`);
    } else {
      setPlMsg(result.message ?? "Gagal membuat token.");
    }
  };

  const deactivatePlToken = async (id: string) => {
    setPastiLulusTokens((prev) => prev.map((t) => t.id === id ? { ...t, isActive: false } : t));
    await deactivatePastiLulusTokenAction(id);
  };

  const bulkUpdatePlTokens = async (ids: string[], action: "deactivate" | "activate" | "delete") => {
    if (action === "delete") {
      setPastiLulusTokens((prev) => prev.filter((t) => !(ids.includes(t.id) && !t.redeemedBy)));
    } else {
      setPastiLulusTokens((prev) =>
        prev.map((t) => ids.includes(t.id) ? { ...t, isActive: action === "activate" } : t),
      );
    }
    await bulkUpdatePastiLulusTokensAction(ids, action);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <AdminSidebar
        activeTab={activeTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu admin"
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          isRefreshing={isRefreshing}
          lastSyncedAt={lastSyncedAt}
          onManualRefresh={refreshRealtimeData}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
          onOpenSettings={() => setActiveTab("settings")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "dashboard" && (
            <DashboardView
              paidCount={paidCount}
              pendingCount={pendingCount}
              totalPakets={staticPakets.length + uploadedPakets.length}
              totalRevenue={totalRevenue}
              pendingRegs={pendingRegs}
              totalUsers={totalUsers}
              activeSubscriptions={activeSubscriptions}
              recentTransactions={transactions.slice(0, 5)}
              onOpenBilling={() => setActiveTab("billing")}
              onOpenPaket={() => setActiveTab("paket")}
              onOpenRegistrasi={() => setActiveTab("registrasi")}
            />
          )}
          {activeTab === "billing" && (
            <BillingView
              transactions={transactions}
              selectedTransaction={selectedTransaction}
              onSelectTransaction={setSelectedTransactionId}
              onSyncTransaction={syncTransaction}
            />
          )}
          {activeTab === "promo" && (
            <PromoAffiliateView
              promos={promos}
              affiliates={affiliates}
              newPromoCode={newPromoCode}
              newPromoDiscountType={newPromoDiscountType}
              newPromoDiscountValue={newPromoDiscountValue}
              newPromoUsageLimit={newPromoUsageLimit}
              newPromoExpiresAt={newPromoExpiresAt}
              newPromoStatus={newPromoStatus}
              newAffiliateCode={newAffiliateCode}
              newAffiliateName={newAffiliateName}
              newAffiliateCommission={newAffiliateCommission}
              newAffiliateStatus={newAffiliateStatus}
              onNewPromoCode={setNewPromoCode}
              onNewPromoDiscountType={setNewPromoDiscountType}
              onNewPromoDiscountValue={setNewPromoDiscountValue}
              onNewPromoUsageLimit={setNewPromoUsageLimit}
              onNewPromoExpiresAt={setNewPromoExpiresAt}
              onNewPromoStatus={setNewPromoStatus}
              onNewAffiliateCode={setNewAffiliateCode}
              onNewAffiliateName={setNewAffiliateName}
              onNewAffiliateCommission={setNewAffiliateCommission}
              onNewAffiliateStatus={setNewAffiliateStatus}
              onCreatePromo={createPromo}
              onCreateAffiliate={createAffiliate}
            />
          )}
          {activeTab === "users" && (
            <UsersView
              users={users}
              selectedUser={selectedUser}
              userTransactions={filteredUserTransactions}
              onSelectUser={setSelectedUserId}
              onOpenBilling={() => setActiveTab("billing")}
              onUpdateTier={updateUserTier}
            />
          )}
          {activeTab === "registrasi" && (
            <RegistrasiView
              registrations={registrations}
              onUpdateStatus={updateRegStatus}
            />
          )}
          {activeTab === "paket" && (
            <PaketManagementView staticPakets={staticPakets} uploadedPakets={uploadedPakets} />
          )}
          {activeTab === "crm" && (
            <CrmChatView
              conversations={crmConversations}
              selectedConversation={selectedCrmConversation}
              onSelectConversation={setSelectedCrmId}
              onReply={replyCrm}
              onCreateWhatsAppLead={createWhatsAppLead}
              onUpdateStatus={updateCrmStatus}
            />
          )}
          {activeTab === "content" && <ContentWebsiteView landingSections={landingContent} />}
          {activeTab === "blog" && <BlogSeoView blogPosts={blogData} onPublish={publishBlog} onUnpublish={unpublishBlog} onSave={saveBlogPost} />}
          {activeTab === "ptn" && <PtnView ptns={ptns} msg={ptnMsg} onSavePtn={savePtn} onSaveDeadline={savePtnDeadline} />}
          {activeTab === "broadcast" && <BroadcastView broadcasts={broadcasts} msg={broadcastMsg} onSend={sendBroadcast} />}
          {activeTab === "pasti_lulus" && (
            <PastiLulusTokenView
              tokens={pastiLulusTokens}
              materials={pastiLulusMaterials}
              genCount={plGenCount}
              genNote={plGenNote}
              genExpiry={plGenExpiry}
              generating={plGenerating}
              generatedTokens={plGeneratedTokens}
              msg={plMsg}
              onGenCountChange={setPlGenCount}
              onGenNoteChange={setPlGenNote}
              onGenExpiryChange={setPlGenExpiry}
              onGenerate={generatePastiLulusTokens}
              onDeactivate={deactivatePlToken}
              onBulkUpdate={bulkUpdatePlTokens}
              onMaterialUploaded={(nomor, type, storagePath, universitas, jurusan) => {
                setPastiLulusMaterials((prev) => {
                  const exists = prev.find((m) => m.nomor === nomor);
                  if (exists) {
                    return prev.map((m) =>
                      m.nomor === nomor
                        ? { ...m, [type === "soal" ? "soalStoragePath" : "pembahasanStoragePath"]: storagePath }
                        : m,
                    );
                  }
                  return [
                    ...prev,
                    { nomor, universitas, jurusan, soalStoragePath: type === "soal" ? storagePath : null, pembahasanStoragePath: type === "pembahasan" ? storagePath : null, updatedAt: "Baru saja" },
                  ];
                });
              }}
            />
          )}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({
  activeTab,
  isMobileOpen,
  onCloseMobile,
  onSelectTab,
}: {
  activeTab: AdminTab;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectTab: (id: AdminTab) => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform md:relative md:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <BrandLogo size="sm" />
        <button type="button" className="text-slate-400 hover:text-white md:hidden" onClick={onCloseMobile}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-2 mt-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Menu utama</p>
        {ADMIN_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
              activeTab === item.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? "text-white" : "text-slate-400"} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-black">AD</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Super Admin</p>
            <p className="truncate text-xs text-slate-400">{whiteLabel.auth.adminEmail}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-red-300 hover:bg-slate-800"
          >
            <LogOut size={16} /> Logout
          </button>
        </form>
      </div>
    </aside>
  );
}

function AdminHeader({
  isRefreshing,
  lastSyncedAt,
  onManualRefresh,
  onOpenMobile,
  onOpenSettings,
}: {
  isRefreshing: boolean;
  lastSyncedAt: Date | null;
  onManualRefresh: () => void;
  onOpenMobile: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button type="button" className="text-slate-500 hover:text-slate-800 md:hidden" onClick={onOpenMobile}>
          <Menu size={24} />
        </button>
        <div className="relative hidden w-72 md:flex">
          <input
            type="search"
            placeholder="Cari user, transaksi, soal..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60 sm:inline-flex"
        >
          <Loader2 size={14} className={isRefreshing ? "animate-spin" : ""} />
          {lastSyncedAt
            ? `Update ${lastSyncedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : "Update realtime"}
        </button>
        <button type="button" className="relative text-slate-500 hover:text-slate-800">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        </button>
        <button type="button" className="text-slate-500 hover:text-slate-800" onClick={onOpenSettings}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

function DashboardView({
  paidCount,
  pendingCount,
  totalPakets,
  totalRevenue,
  pendingRegs,
  totalUsers,
  activeSubscriptions,
  recentTransactions,
  onOpenBilling,
  onOpenPaket,
  onOpenRegistrasi,
}: {
  paidCount: number;
  pendingCount: number;
  totalPakets: number;
  totalRevenue: number;
  pendingRegs: number;
  totalUsers: number;
  activeSubscriptions: number;
  recentTransactions: Array<{ id: string; user: string; email: string; plan: string; amount: string; status: string; createdAt: string }>;
  onOpenBilling: () => void;
  onOpenPaket: () => void;
  onOpenRegistrasi: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard Overview"
        description={`Ringkasan operasional ${site.fullName} hari ini.`}
        action={<button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50">Export Report</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Users} label="Total pengguna" value={totalUsers.toLocaleString("id-ID")} tone="blue" helper="Dari database" />
        <MetricCard icon={TrendingUp} label="Langganan aktif" value={activeSubscriptions.toLocaleString("id-ID")} tone="emerald" helper={`${totalUsers ? Math.round((activeSubscriptions / totalUsers) * 100) : 0}% dari total`} />
        <MetricCard icon={Banknote} label="Total revenue" value={new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(totalRevenue).replace(/\s/g," ")} tone="emerald" helper={`${paidCount} transaksi paid`} />
        <MetricCard icon={ReceiptText} label="Paid / Pending" value={`${paidCount} / ${pendingCount}`} tone="amber" helper="Status transaksi" />
        <MetricCard icon={Database} label="Total paket" value={String(totalPakets)} tone="blue" helper="Static + uploaded" />
        <MetricCard icon={ClipboardList} label="Registrasi tryout gratis" value={String(pendingRegs)} tone="rose" helper="Menunggu verifikasi" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black text-slate-800">Prioritas Hari Ini</h2>
            <button onClick={onOpenPaket} className="text-sm font-black text-blue-600 hover:underline">
              Kelola paket
            </button>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <ActionPanel icon={CreditCard} title="Sinkron pembayaran pending" body="Cek order yang belum final dan aktifkan paket setelah status paid." onClick={onOpenBilling} />
            <ActionPanel icon={BadgePercent} title="Pantau promo dan affiliate" body="Validasi kode promo aktif dan konversi partner berjalan." onClick={onOpenBilling} />
            <ActionPanel icon={ClipboardList} title="Verifikasi registrasi tryout" body={`${pendingRegs} pendaftar menunggu verifikasi screenshot follow & komentar.`} onClick={onOpenRegistrasi} />
            <ActionPanel icon={Database} title="Upload paket soal baru" body="Download template CSV, isi soal & pembahasan, lalu upload paket baru." onClick={onOpenPaket} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black text-slate-800">Transaksi terbaru</h2>
            <button onClick={onOpenBilling} className="text-sm font-black text-blue-600 hover:underline">Semua →</button>
          </div>
          <div className="divide-y divide-slate-50 p-2">
            {recentTransactions.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">Belum ada transaksi.</p>
            ) : (
              recentTransactions.map((trx) => (
                <div key={trx.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                  <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    trx.status === "paid" ? "bg-emerald-500" :
                    trx.status === "pending" ? "bg-amber-500" : "bg-red-400"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{trx.user}</p>
                    <p className="text-xs text-slate-400">{trx.plan} · {trx.amount}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${
                      trx.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                      trx.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{trx.status}</span>
                    <p className="mt-0.5 text-[10px] text-slate-400">{trx.createdAt}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function BillingView({
  transactions,
  selectedTransaction,
  onSelectTransaction,
  onSyncTransaction,
}: {
  transactions: TransactionRow[];
  selectedTransaction: TransactionRow | undefined;
  onSelectTransaction: (id: string) => void;
  onSyncTransaction: (id: string) => Promise<{ ok: boolean; message?: string; status?: string }>;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "expired" | "failed">("all");
  const [syncingId, setSyncingId] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  const filtered = statusFilter === "all" ? transactions : transactions.filter((t) => t.status === statusFilter);

  async function handleSync(id: string) {
    setSyncingId(id);
    setSyncMessage("");
    try {
      const result = await onSyncTransaction(id);
      setSyncMessage(result.message ?? (result.ok ? "Transaksi berhasil disinkronkan." : "Gagal menyinkronkan transaksi."));
    } finally {
      setSyncingId("");
    }
  }

  function exportCsv() {
    const headers = ["Order ID", "User", "Email", "Paket", "Jumlah", "Metode", "Status", "Promo", "Affiliate", "Dibayar", "Dibuat"];
    const rows = transactions.map((t) => [t.orderId, t.user, t.email, t.plan, t.amount, t.method, t.status, t.promoCode, t.affiliateCode, t.paidAt, t.createdAt]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Transaksi & Billing"
        description="Pantau order ID, status pembayaran, promo, affiliate, dan aktivasi paket."
        action={
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <FileText size={16} /> Export CSV
            </button>
          </div>
        }
      />

      {syncMessage && (
        <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {syncMessage}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <TableCard>
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <Th>Order & waktu</Th>
              <Th>User</Th>
              <Th>Paket</Th>
              <Th>Promo/Affiliate</Th>
              <Th>Status</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((trx) => (
              <tr key={trx.id} className="hover:bg-slate-50">
                <Td>
                  <button onClick={() => onSelectTransaction(trx.id)} className="text-left font-black text-slate-800 hover:text-blue-700">
                    {trx.orderId}
                  </button>
                  <p className="mt-1 text-xs text-slate-500">{trx.createdAt}</p>
                </Td>
                <Td>
                  <p className="font-bold text-slate-700">{trx.user}</p>
                  <p className="text-xs text-slate-500">{trx.email}</p>
                </Td>
                <Td>{trx.plan}</Td>
                <Td>
                  <p className="text-xs font-bold text-slate-600">Promo: {trx.promoCode}</p>
                  <p className="text-xs font-bold text-slate-600">Aff: {trx.affiliateCode}</p>
                </Td>
                <Td>
                  <StatusBadge status={trx.status} />
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => onSelectTransaction(trx.id)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600">
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => void handleSync(trx.id)}
                      disabled={syncingId === trx.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {syncingId === trx.id && <Loader2 size={12} className="animate-spin" />}
                      {syncingId === trx.id ? "Cek..." : "Sinkron"}
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {selectedTransaction ? (
            <>
              <p className="text-sm font-black uppercase tracking-wide text-blue-600">Detail transaksi</p>
              <h2 className="mt-2 break-words text-xl font-black text-slate-950">{selectedTransaction.orderId}</h2>
              <div className="mt-5 space-y-3 text-sm">
                <DetailRow label="Pengguna" value={selectedTransaction.user} />
                <DetailRow label="Email" value={selectedTransaction.email} />
                <DetailRow label="Paket" value={selectedTransaction.plan} />
                <DetailRow label="Nominal" value={selectedTransaction.amount} />
                <DetailRow label="Metode" value={selectedTransaction.method} />
                <DetailRow label="Kode promo" value={selectedTransaction.promoCode} />
                <DetailRow label="Kode affiliate" value={selectedTransaction.affiliateCode} />
                <DetailRow label="Dibayar" value={selectedTransaction.paidAt} />
              </div>
              <button
                onClick={() => void handleSync(selectedTransaction.id)}
                disabled={syncingId === selectedTransaction.id}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {syncingId === selectedTransaction.id && <Loader2 size={14} className="animate-spin" />}
                {syncingId === selectedTransaction.id ? "Mengecek Mayar..." : "Sinkron status pembayaran"}
              </button>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-400">Pilih transaksi untuk melihat detail.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function PromoAffiliateView({
  promos,
  affiliates,
  newPromoCode,
  newPromoDiscountType,
  newPromoDiscountValue,
  newPromoUsageLimit,
  newPromoExpiresAt,
  newPromoStatus,
  newAffiliateCode,
  newAffiliateName,
  newAffiliateCommission,
  newAffiliateStatus,
  onNewPromoCode,
  onNewPromoDiscountType,
  onNewPromoDiscountValue,
  onNewPromoUsageLimit,
  onNewPromoExpiresAt,
  onNewPromoStatus,
  onNewAffiliateCode,
  onNewAffiliateName,
  onNewAffiliateCommission,
  onNewAffiliateStatus,
  onCreatePromo,
  onCreateAffiliate,
}: {
  promos: PromoRow[];
  affiliates: AffiliateRow[];
  newPromoCode: string;
  newPromoDiscountType: "nominal" | "percent";
  newPromoDiscountValue: string;
  newPromoUsageLimit: string;
  newPromoExpiresAt: string;
  newPromoStatus: "draft" | "published";
  newAffiliateCode: string;
  newAffiliateName: string;
  newAffiliateCommission: string;
  newAffiliateStatus: "draft" | "published";
  onNewPromoCode: (value: string) => void;
  onNewPromoDiscountType: (value: "nominal" | "percent") => void;
  onNewPromoDiscountValue: (value: string) => void;
  onNewPromoUsageLimit: (value: string) => void;
  onNewPromoExpiresAt: (value: string) => void;
  onNewPromoStatus: (value: "draft" | "published") => void;
  onNewAffiliateCode: (value: string) => void;
  onNewAffiliateName: (value: string) => void;
  onNewAffiliateCommission: (value: string) => void;
  onNewAffiliateStatus: (value: "draft" | "published") => void;
  onCreatePromo: () => void;
  onCreateAffiliate: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle title="Promo & Affiliate" description="Buat kode promo, pantau limit pemakaian, dan lihat performa partner affiliate." />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
            <BadgePercent size={20} className="text-blue-600" /> Kode promo
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Kode promo">
              <input value={newPromoCode} onChange={(event) => onNewPromoCode(event.target.value.toUpperCase())} placeholder="HEMAT25" className="field" />
            </Field>
            <Field label="Status">
              <select className="field" value={newPromoStatus} onChange={(event) => onNewPromoStatus(event.target.value as "draft" | "published")}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
            <Field label="Jenis diskon">
              <select className="field" value={newPromoDiscountType} onChange={(event) => onNewPromoDiscountType(event.target.value as "nominal" | "percent")}>
                <option value="nominal">Nominal rupiah</option>
                <option value="percent">Persen</option>
              </select>
            </Field>
            <Field label={newPromoDiscountType === "percent" ? "Besar diskon (%)" : "Besar diskon (Rp)"}>
              <input
                type="number"
                min={0}
                max={newPromoDiscountType === "percent" ? 100 : undefined}
                value={newPromoDiscountValue}
                onChange={(event) => onNewPromoDiscountValue(event.target.value)}
                placeholder={newPromoDiscountType === "percent" ? "25" : "10000"}
                className="field"
              />
            </Field>
            <Field label="Kuota pemakai">
              <input type="number" min={0} value={newPromoUsageLimit} onChange={(event) => onNewPromoUsageLimit(event.target.value)} placeholder="100" className="field" />
            </Field>
            <Field label="Berlaku sampai">
              <input type="date" value={newPromoExpiresAt} onChange={(event) => onNewPromoExpiresAt(event.target.value)} className="field" />
            </Field>
            <button onClick={onCreatePromo} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 md:col-span-2">Tambah kode promo</button>
          </div>
          <div className="mt-5 space-y-3">
            {promos.map((promo) => (
              <div key={promo.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{promo.code}</p>
                    <p className="text-sm font-semibold text-slate-500">{promo.type} - {promo.value}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black uppercase text-emerald-700">{promo.status}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, (promo.used / promo.limit) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">{promo.used}/{promo.limit} terpakai - expired {promo.expires}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
            <Handshake size={20} className="text-blue-600" /> Affiliate partner
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Kode partner">
              <input value={newAffiliateCode} onChange={(event) => onNewAffiliateCode(event.target.value.toUpperCase())} placeholder="KAKRINA" className="field" />
            </Field>
            <Field label="Nama partner">
              <input value={newAffiliateName} onChange={(event) => onNewAffiliateName(event.target.value)} placeholder="Kak Rina Edu" className="field" />
            </Field>
            <Field label="Komisi (%)">
              <input type="number" min={0} max={100} value={newAffiliateCommission} onChange={(event) => onNewAffiliateCommission(event.target.value)} placeholder="10" className="field" />
            </Field>
            <Field label="Status">
              <select className="field" value={newAffiliateStatus} onChange={(event) => onNewAffiliateStatus(event.target.value as "draft" | "published")}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
            <button onClick={onCreateAffiliate} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 md:col-span-2">Tambah partner</button>
          </div>
          <div className="mt-5 space-y-3">
            {affiliates.map((affiliate) => (
              <div key={affiliate.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{affiliate.code}</p>
                    <p className="text-sm font-semibold text-slate-500">{affiliate.name} - komisi {affiliate.commission}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black uppercase text-blue-700">{affiliate.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold text-slate-600">
                  <p>Click: {affiliate.clicks}</p>
                  <p>CVR: {affiliate.conversions}</p>
                  <p>{affiliate.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function UsersView({
  users,
  selectedUser,
  userTransactions,
  onSelectUser,
  onOpenBilling,
  onUpdateTier,
}: {
  users: UserRow[];
  selectedUser: UserRow | undefined;
  userTransactions: TransactionRow[];
  onSelectUser: (id: string) => void;
  onOpenBilling: () => void;
  onUpdateTier: (userId: string, tier: "free" | "belajar" | "pro") => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <PageTitle title="Data Pengguna" description="Lihat profil siswa, paket aktif, progres tryout, dan riwayat transaksi." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <TableCard>
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <Th>Nama & email</Th>
              <Th>Paket</Th>
              <Th>Target</Th>
              <Th>Tryout</Th>
              <Th>Status</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <Td>
                  <button onClick={() => onSelectUser(user.id)} className="text-left font-black text-slate-800 hover:text-blue-700">{user.name}</button>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </Td>
                <Td><TierBadge tier={user.tier} /></Td>
                <Td>{user.target}</Td>
                <Td>{user.tryouts} sesi</Td>
                <Td><span className="text-xs font-black uppercase text-emerald-600">{user.status}</span></Td>
                <Td>
                  <button onClick={() => onSelectUser(user.id)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600">
                    <Eye size={15} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selectedUser ? (
            <p className="text-sm font-semibold text-slate-400">Pilih pengguna untuk melihat detail.</p>
          ) : (<>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">User detail</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{selectedUser.name}</h2>
          <p className="text-sm font-semibold text-slate-500">{selectedUser.email}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Paket" value={selectedUser.tier.toUpperCase()} />
            <MiniStat label="Skor rata-rata" value={String(selectedUser.avgScore)} />
            <MiniStat label="Tryout" value={`${selectedUser.tryouts}x`} />
            <MiniStat label="Terakhir aktif" value={selectedUser.lastSeen} />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-black text-slate-800">Ubah Tier</p>
            <div className="mt-2 flex gap-2">
              {(["free", "belajar", "pro"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateTier(selectedUser.id, t)}
                  className={`flex-1 rounded-lg py-2 text-xs font-black uppercase transition ${selectedUser.tier === t ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-800">Transaksi user</p>
            <div className="mt-3 space-y-2">
              {userTransactions.length ? userTransactions.map((trx) => (
                <div key={trx.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-slate-600">{trx.plan}</span>
                  <StatusBadge status={trx.status} />
                </div>
              )) : <p className="text-sm font-semibold text-slate-500">Belum ada transaksi.</p>}
            </div>
          </div>
          <button onClick={onOpenBilling} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">
            Buka billing user
          </button>
          </>)}
        </aside>
      </div>
    </div>
  );
}

type RegRow = NonNullable<AdminPortalData["registrations"]>[number];

function RegistrasiView({
  registrations,
  onUpdateStatus,
}: {
  registrations: RegRow[];
  onUpdateStatus: (id: string, status: "verified" | "rejected") => Promise<void>;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(registrations[0]?.id ?? null);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = filter === "all" ? registrations : registrations.filter((r) => r.status === filter);
  const selected = registrations.find((r) => r.id === selectedId);
  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const verifiedCount = registrations.filter((r) => r.status === "verified").length;

  const act = async (id: string, status: "verified" | "rejected") => {
    setLoading(id + status);
    await onUpdateStatus(id, status);
    setLoading(null);
  };

  const statusCls = (s: string) =>
    s === "verified" ? "bg-emerald-100 text-emerald-700" : s === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="space-y-6">
      <PageTitle
        title="Registrasi Tryout Gratis"
        description="Verifikasi screenshot follow & komentar @pastilulus dari pendaftar tryout gratis."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-600">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{pendingCount} pending</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{verifiedCount} verified</span>
          </div>
        }
      />

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["pending", "all", "verified", "rejected"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition ${filter === f ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {f === "all" ? "Semua" : f} {f === "pending" ? `(${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <ClipboardList size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-black text-slate-500">Belum ada pendaftar tryout gratis.</p>
          <p className="mt-1 text-sm text-slate-400">Data akan muncul saat siswa mengisi form pendaftaran.</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          {/* Table */}
          <TableCard>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <Th>Nama & kontak</Th>
                <Th>Sekolah</Th>
                <Th>Kelas</Th>
                <Th>Screenshot</Th>
                <Th>Waktu</Th>
                <Th>Status</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className={`hover:bg-slate-50 ${selectedId === r.id ? "bg-blue-50/60" : ""}`}>
                  <Td>
                    <button onClick={() => setSelectedId(r.id)} className="text-left font-black text-slate-800 hover:text-blue-700">{r.nama}</button>
                    <p className="text-xs text-slate-400">{r.whatsapp}</p>
                  </Td>
                  <Td><p className="max-w-[160px] truncate text-sm">{r.sekolah}</p></Td>
                  <Td><p className="text-xs">{r.kelas} · {r.jurusan}</p></Td>
                  <Td>
                    {r.kartuUrl ? (
                      <a href={r.kartuUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline">
                        <ExternalLink size={12} /> Lihat
                      </a>
                    ) : <span className="text-xs text-slate-400">Tidak ada</span>}
                  </Td>
                  <Td><p className="text-xs text-slate-400">{r.registeredAt}</p></Td>
                  <Td><span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${statusCls(r.status)}`}>{r.status}</span></Td>
                  <Td>
                    {r.status === "pending" && (
                      <div className="flex gap-1.5">
                        <button onClick={() => act(r.id, "verified")} disabled={loading === r.id + "verified"}
                          className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40">
                          <CheckCircle2 size={14} />
                        </button>
                        <button onClick={() => act(r.id, "rejected")} disabled={loading === r.id + "rejected"}
                          className="rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 disabled:opacity-40">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableCard>

          {/* Detail panel */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selected ? (
              <p className="text-sm text-slate-400">Klik baris untuk melihat detail.</p>
            ) : (
              <>
                <p className="text-xs font-black uppercase tracking-wide text-blue-600">Detail Pendaftar</p>
                <h2 className="mt-2 text-lg font-black text-slate-950">{selected.nama}</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <DetailRow label="WhatsApp" value={selected.whatsapp} />
                  <DetailRow label="Sekolah" value={selected.sekolah} />
                  <DetailRow label="Kelas" value={selected.kelas} />
                  <DetailRow label="Jurusan" value={selected.jurusan} />
                  <DetailRow label="Email" value={selected.email ?? "-"} />
                  <DetailRow label="Daftar" value={selected.registeredAt} />
                  <DetailRow label="Status" value={selected.status} />
                </div>
                {selected.kartuUrl && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-black uppercase text-slate-500">Screenshot</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.kartuUrl} alt="screenshot bukti" className="w-full rounded-xl border border-slate-200 object-contain" />
                    <a href={selected.kartuUrl} target="_blank" rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline">
                      <ExternalLink size={12} /> Buka full size
                    </a>
                  </div>
                )}
                {selected.status === "pending" && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={() => act(selected.id, "verified")} disabled={!!loading}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-40">
                      <CheckCircle2 size={15} /> Verifikasi
                    </button>
                    <button onClick={() => act(selected.id, "rejected")} disabled={!!loading}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-40">
                      <X size={15} /> Tolak
                    </button>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function PaketManagementView({ staticPakets, uploadedPakets = [] }: { staticPakets: PackageInfo[]; uploadedPakets?: PackageInfo[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedQuestion[]>([]);
  const [parseError, setParseError] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [meta, setMeta] = useState({
    slug: "", title: "", subtitle: "",
    durasiMenit: "120", akses: "belajar_pro" as "gratis" | "belajar_pro",
    scoringType: "classical" as "classical" | "irt",
  });

  const allPakets = [...staticPakets, ...uploadedPakets];
  const freePakets = allPakets.filter((p) => p.akses === "gratis");
  const proPakets = allPakets.filter((p) => p.akses === "belajar_pro");

  function downloadTemplate(type: "classical" | "irt") {
    const bagian = type === "classical" ? "Penalaran Umum" : "Penalaran Akademik";
    const bagian2 = type === "classical" ? "Matematika Dasar" : "Penalaran Matematika";
    const lines = [
      "nomor,bagian,tingkat,pertanyaan,opsi_a,opsi_b,opsi_c,opsi_d,opsi_e,kunci,pembahasan",
      `1,${bagian},HOTS,"Bacaan berikut menampilkan fenomena sosial...","Jawaban A","Jawaban B","Jawaban C","Jawaban D","Jawaban E",A,"Jawaban benar A karena..."`,
      `2,${bagian2},SEDANG,"Jika x + 2 = 6 maka x adalah...","1","2","4","6","8",C,"x = 6 - 2 = 4 sehingga jawaban C."`,
      `3,${bagian},MUDAH,"Sinonim dari kata 'cepat' adalah...","Lambat","Kilat","Diam","Lemah","Lelah",B,"Kilat berarti sangat cepat."`,
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `template-soal-${type}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file); setParseError(""); setParsedRows([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = (ev.target?.result as string).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const lines = text.split("\n").filter(Boolean);
        if (lines.length < 2) throw new Error("File terlalu pendek — pastikan ada header dan minimal 1 soal.");
        const rows: ParsedQuestion[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 11) continue;
          const [nomor, bagian, tingkat, pertanyaan, opsiA, opsiB, opsiC, opsiD, opsiE, kunci, pembahasan] = cols;
          const nomorNum = parseInt(nomor);
          if (isNaN(nomorNum)) continue;
          const t = tingkat.trim().toUpperCase() as ParsedQuestion["tingkat"];
          const k = kunci.trim().toUpperCase() as ParsedQuestion["kunci"];
          if (!["MUDAH","SEDANG","HOTS"].includes(t) || !["A","B","C","D","E"].includes(k)) continue;
          rows.push({ id: `q${nomorNum}`, nomor: nomorNum, bagian: bagian.trim(), tingkat: t, pertanyaan: pertanyaan.trim(),
            opsi: { A: opsiA.trim(), B: opsiB.trim(), C: opsiC.trim(), D: opsiD.trim(), E: opsiE.trim() }, kunci: k, pembahasan: pembahasan.trim() });
        }
        if (rows.length === 0) throw new Error("Tidak ada soal valid yang terbaca. Periksa format kolom.");
        setParsedRows(rows);
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Gagal membaca file.");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleSave() {
    if (!meta.slug.trim() || !meta.title.trim() || parsedRows.length === 0) return;
    setIsSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/admin/paket/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, durasiMenit: Number(meta.durasiMenit), questions: parsedRows }),
      });
      const json = await res.json();
      setSaveMsg(json.ok ? `✓ Paket "${meta.title}" (${parsedRows.length} soal) berhasil disimpan.` : (json.error ?? "Gagal menyimpan."));
      if (json.ok) { setParsedRows([]); setCsvFile(null); setMeta({ slug:"",title:"",subtitle:"",durasiMenit:"120",akses:"belajar_pro",scoringType:"classical" }); }
    } catch { setSaveMsg("Terjadi kesalahan jaringan."); }
    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Manajemen Paket Tryout"
        description="Lihat daftar paket aktif, download template soal, dan upload paket baru tanpa deploy ulang."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={PackageOpen} label="Total paket" value={String(allPakets.length)} tone="blue" helper="Static + uploaded" />
        <MetricCard icon={Database} label="Paket gratis" value={String(freePakets.length)} tone="emerald" helper="Akses semua user" />
        <MetricCard icon={TrendingUp} label="Paket Pro" value={String(proPakets.length)} tone="amber" helper="Butuh langganan" />
        <MetricCard icon={FileUp} label="Diupload via admin" value={String(uploadedPakets.length)} tone="rose" helper="Dari database" />
      </div>

      {/* Paket list */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-black text-slate-800">Daftar Paket Aktif ({allPakets.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr><Th>Judul</Th><Th>Soal</Th><Th>Durasi</Th><Th>Scoring</Th><Th>Akses</Th><Th>Sumber</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPakets.map((p) => (
                <tr key={p.id} className={`hover:bg-slate-50 ${p.source === "uploaded" ? "bg-blue-50/30" : ""}`}>
                  <Td><p className="font-black text-slate-800">{p.title}</p><p className="text-xs text-slate-400">{p.slug}</p></Td>
                  <Td>{p.soalCount}</Td>
                  <Td>{p.durasiMenit} mnt</Td>
                  <Td><span className="rounded px-2 py-0.5 text-[10px] font-black uppercase bg-slate-100 text-slate-600">{p.scoringType}</span></Td>
                  <Td>{p.akses === "gratis" ? <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">Gratis</span> : <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase bg-amber-100 text-amber-700">Pro</span>}</Td>
                  <Td><span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${p.source === "uploaded" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{p.source}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Template download */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black text-slate-800"><Download size={18} className="text-blue-600" /> Download Template CSV</h2>
        <p className="mt-1 text-sm text-slate-500">Buka di Excel, isi soal & pembahasan, simpan sebagai CSV, lalu upload di bawah.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => downloadTemplate("classical")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">
            <Download size={15} /> Template UM Mandiri PTN (Classical)
          </button>
          <button onClick={() => downloadTemplate("irt")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">
            <Download size={15} /> Template UM PTKIN (IRT)
          </button>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-1">
          <p><span className="font-black">Kolom wajib:</span> nomor · bagian · tingkat (MUDAH/SEDANG/HOTS) · pertanyaan · opsi_a–e · kunci (A–E) · pembahasan</p>
          <p><span className="font-black">Enkoding:</span> UTF-8 dengan BOM, separator koma, teks panjang dibungkus tanda kutip.</p>
        </div>
      </section>

      {/* Upload paket baru */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black text-slate-800"><FileUp size={18} className="text-blue-600" /> Upload Paket Baru</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Slug paket (unik)"><input className="field" value={meta.slug} onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") }))} placeholder="paket-3" /></Field>
          <Field label="Judul paket"><input className="field" value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} placeholder="Paket UM Mandiri PTN - Set 3" /></Field>
          <Field label="Subtitle"><input className="field" value={meta.subtitle} onChange={(e) => setMeta((m) => ({ ...m, subtitle: e.target.value }))} placeholder="120 soal HOTS pola 2026" /></Field>
          <Field label="Durasi (menit)"><input type="number" className="field" value={meta.durasiMenit} onChange={(e) => setMeta((m) => ({ ...m, durasiMenit: e.target.value }))} /></Field>
          <Field label="Akses">
            <select className="field" value={meta.akses} onChange={(e) => setMeta((m) => ({ ...m, akses: e.target.value as "gratis" | "belajar_pro" }))}>
              <option value="belajar_pro">Pro (berbayar)</option>
              <option value="gratis">Gratis</option>
            </select>
          </Field>
          <Field label="Tipe scoring">
            <select className="field" value={meta.scoringType} onChange={(e) => setMeta((m) => ({ ...m, scoringType: e.target.value as "classical" | "irt" }))}>
              <option value="classical">Classical (UM Mandiri PTN)</option>
              <option value="irt">IRT (UM PTKIN)</option>
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-black text-slate-700">File CSV soal</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className={`flex items-center gap-2 rounded-xl border-2 border-dashed px-5 py-3 text-sm font-semibold transition ${csvFile ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"}`}>
            <FileUp size={16} />
            {csvFile ? csvFile.name : "Pilih file CSV…"}
          </button>
          {parseError && <p className="mt-2 text-sm font-bold text-rose-600">{parseError}</p>}
          {parsedRows.length > 0 && (
            <p className="mt-2 text-sm font-bold text-emerald-600">✓ {parsedRows.length} soal berhasil dibaca dari CSV</p>
          )}
        </div>

        {parsedRows.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr><th className="p-2 font-black text-left">No</th><th className="p-2 font-black text-left">Bagian</th><th className="p-2 font-black text-left">Tingkat</th><th className="p-2 font-black text-left w-64">Pertanyaan (preview)</th><th className="p-2 font-black text-left">Kunci</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.slice(0, 5).map((q) => (
                  <tr key={q.id}><td className="p-2">{q.nomor}</td><td className="p-2">{q.bagian}</td><td className="p-2"><span className={`rounded px-1.5 py-0.5 font-black uppercase text-[10px] ${q.tingkat==="HOTS"?"bg-rose-100 text-rose-700":q.tingkat==="SEDANG"?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-600"}`}>{q.tingkat}</span></td><td className="p-2 max-w-xs truncate text-slate-600">{q.pertanyaan.slice(0,80)}{q.pertanyaan.length>80?"…":""}</td><td className="p-2 font-black text-blue-700">{q.kunci}</td></tr>
                ))}
                {parsedRows.length > 5 && <tr><td colSpan={5} className="p-2 text-center text-slate-400">… dan {parsedRows.length - 5} soal lainnya</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {saveMsg && <p className={`mt-3 text-sm font-bold ${saveMsg.startsWith("✓") ? "text-emerald-600" : "text-rose-600"}`}>{saveMsg}</p>}

        <button
          type="button"
          disabled={isSaving || !meta.slug.trim() || !meta.title.trim() || parsedRows.length === 0}
          onClick={handleSave}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan…</> : <><Check size={15} /> Simpan paket ke database</>}
        </button>
      </section>
    </div>
  );
}

function normalizeWaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

function whatsappCustomerLink(phone: string, message: string) {
  const normalized = normalizeWaPhone(phone);
  if (!normalized) return "";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function CrmChannelBadge({ channel }: { channel: "website" | "whatsapp" }) {
  const Icon = channel === "whatsapp" ? PhoneCall : Globe2;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${
        channel === "whatsapp" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
      }`}
    >
      <Icon size={12} />
      {channel === "whatsapp" ? "WhatsApp" : "Website"}
    </span>
  );
}

function CrmChatView({
  conversations,
  selectedConversation,
  onSelectConversation,
  onReply,
  onCreateWhatsAppLead,
  onUpdateStatus,
}: {
  conversations: NonNullable<AdminPortalData["crmConversations"]>;
  selectedConversation?: NonNullable<AdminPortalData["crmConversations"]>[number];
  onSelectConversation: (id: string) => void;
  onReply: (conversationId: string, body: string) => void;
  onCreateWhatsAppLead: (input: { name: string; phone: string; message: string; topic: string }) => Promise<{ ok: boolean; message?: string; conversationId?: string }>;
  onUpdateStatus: (conversationId: string, status: "waiting_admin" | "assigned" | "closed") => void;
}) {
  const [replyBody, setReplyBody] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "website" | "whatsapp">("all");
  const [waName, setWaName] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [waStatus, setWaStatus] = useState("");
  const openCount = conversations.filter((conversation) => conversation.status !== "closed").length;
  const websiteCount = conversations.filter((conversation) => conversation.channel === "website").length;
  const whatsappCount = conversations.filter((conversation) => conversation.channel === "whatsapp").length;
  const filteredConversations = conversations.filter((conversation) => channelFilter === "all" || conversation.channel === channelFilter);
  const activeConversation =
    selectedConversation && (channelFilter === "all" || selectedConversation.channel === channelFilter)
      ? selectedConversation
      : filteredConversations[0];
  const selectedWaLink = activeConversation
    ? whatsappCustomerLink(activeConversation.visitorPhone, `Halo kak ${activeConversation.visitorName}, admin ${site.name} bantu lanjut dari percakapan CRM ya.`)
    : "";

  const submitReply = async () => {
    if (!activeConversation || !replyBody.trim()) return;
    const body = replyBody.trim();
    setReplyBody("");
    await onReply(activeConversation.id, body);
  };

  const createWaLead = async () => {
    setWaStatus("");
    const result = await onCreateWhatsAppLead({
      name: waName,
      phone: waPhone,
      message: waMessage,
      topic: "whatsapp",
    });
    if (!result.ok) {
      setWaStatus(result.message ?? "Gagal membuat lead WhatsApp.");
      return;
    }
    setWaName("");
    setWaPhone("");
    setWaMessage("");
    setChannelFilter("whatsapp");
    setWaStatus("Lead WhatsApp masuk ke inbox omni.");
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="CRM Omni"
        description="Satu inbox untuk chat website dan follow-up WhatsApp. Admin bisa baca, balas, assign, close, dan buka WA customer."
        action={<span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">{openCount} open chat</span>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0A66FF]">
            <Inbox size={20} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-500">Total conversation</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{conversations.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Globe2 size={20} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-500">Website chat</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{websiteCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <PhoneCall size={20} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-500">WhatsApp lead</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{whatsappCount}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {site.enableBaileysCrm && (
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black text-emerald-950">Baileys WhatsApp bridge</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-800">
                  Jalankan worker <code className="rounded bg-white px-1.5 py-0.5">npm run wa:crm</code>, scan QR di terminal, lalu pesan WA masuk dan balasan admin tersinkron ke inbox ini.
                </p>
              </div>
              <span className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700">Baileys ready</span>
            </div>
          </div>
        )}
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1.4fr_auto]">
          <Field label="Nama lead WA">
            <input className="field" value={waName} onChange={(event) => setWaName(event.target.value)} placeholder="Contoh: Kak Rina" />
          </Field>
          <Field label="Nomor WhatsApp">
            <input className="field" value={waPhone} onChange={(event) => setWaPhone(event.target.value)} placeholder="085155072188" />
          </Field>
          <Field label="Catatan / pesan awal">
            <input className="field" value={waMessage} onChange={(event) => setWaMessage(event.target.value)} placeholder="Tanya paket, pembayaran, atau info PTN..." />
          </Field>
          <button
            type="button"
            onClick={createWaLead}
            disabled={!waPhone.trim()}
            className="self-end rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-300"
          >
            + Lead WA
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Semua channel" },
            { id: "website", label: "Website" },
            { id: "whatsapp", label: "WhatsApp" },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setChannelFilter(filter.id as "all" | "website" | "whatsapp")}
              className={`rounded-xl px-3 py-2 text-xs font-black ${
                channelFilter === filter.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
          {waStatus && <span className="text-xs font-bold text-slate-500">{waStatus}</span>}
        </div>
      </section>

      {filteredConversations.length ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-black text-slate-950">Omni inbox</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Urut dari pesan terakhir, lintas channel.</p>
            </div>
            <div className="max-h-[640px] divide-y divide-slate-100 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`block w-full p-5 text-left transition hover:bg-slate-50 ${
                    activeConversation?.id === conversation.id ? "bg-blue-50/70" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{conversation.visitorName}</p>
                      <p className="text-xs font-semibold text-slate-500">{conversation.channel === "whatsapp" ? conversation.visitorPhone : conversation.visitorEmail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <CrmChannelBadge channel={conversation.channel} />
                      <CrmStatusBadge status={conversation.status} />
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-600">
                    {conversation.messages.at(-1)?.body ?? "Belum ada pesan."}
                  </p>
                  <p className="mt-3 text-xs font-bold text-slate-400">
                    {conversation.topic} - {conversation.lastMessageAt}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {activeConversation ? (
              <>
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">{activeConversation.visitorName}</h2>
                      <CrmChannelBadge channel={activeConversation.channel} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {activeConversation.visitorEmail} - {activeConversation.visitorPhone}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-400">Source: {activeConversation.sourcePage}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedWaLink && (
                      <a
                        href={selectedWaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700"
                      >
                        <PhoneCall size={14} /> Buka WA <ExternalLink size={13} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(activeConversation.id, "assigned")}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(activeConversation.id, "closed")}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="max-h-[460px] space-y-3 overflow-y-auto bg-slate-50 p-5">
                  {activeConversation.messages.map((message) => {
                    const isAdmin = message.senderType === "admin";
                    const isBot = message.senderType === "bot";
                    return (
                      <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed ${
                            isAdmin
                              ? "bg-[#0A66FF] text-white"
                              : isBot
                                ? "bg-blue-50 text-blue-950"
                                : "bg-white text-slate-700 shadow-sm"
                          }`}
                        >
                          <p>{message.body}</p>
                          <p className={`mt-2 text-[11px] font-bold ${isAdmin ? "text-blue-100" : "text-slate-400"}`}>
                            {message.senderType} - {message.createdAt}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 p-5">
                  <Field label="Balasan admin">
                    <textarea
                      className="field min-h-28 resize-none"
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      placeholder="Tulis balasan untuk user..."
                    />
                  </Field>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "Halo kak, bisa dibantu kirim email akun dan Order ID?",
                      "Paket Belajar cocok untuk mulai tryout dan pembahasan.",
                      "Untuk info deadline, kampus targetnya apa ya kak?",
                      "Aku lanjutkan via WhatsApp ya kak, supaya lebih cepat.",
                    ].map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => setReplyBody(template)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={submitReply}
                    disabled={!replyBody.trim()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0A66FF] px-5 py-3 text-sm font-black text-white hover:bg-[#0052D6] disabled:bg-slate-300"
                  >
                    <Send size={16} /> Kirim balasan
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8">
                <h2 className="text-xl font-black text-slate-950">Pilih percakapan</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Klik salah satu inbox untuk melihat detail chat.</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <MessageSquare className="text-[#0A66FF]" size={36} />
          <h2 className="mt-4 text-xl font-black text-slate-950">Belum ada conversation di channel ini.</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Chat website akan muncul otomatis dari bubble. Untuk WhatsApp, buat lead manual dari form di atas dan lanjutkan lewat tombol Buka WA.
          </p>
        </section>
      )}
    </div>
  );
}

function ContentWebsiteView({
  landingSections,
}: {
  landingSections: AdminPortalData["landingSections"];
}) {
  const paymentGuideContent = landingSections.find((section) => section.key === "payment_guide")?.content ?? {};
  const contentString = (key: string, fallback: string) => {
    const value = paymentGuideContent[key];
    return typeof value === "string" && value.trim() ? value : fallback;
  };
  const [badge, setBadge] = useState("Khusus pejuang Ujian Mandiri PTN 2026");
  const [headline, setHeadline] = useState(`${site.promise.split(",")[0]}, masa depan pasti cerah.`);
  const [subheadline, setSubheadline] = useState(
    `${site.name} bantu kamu latihan dengan pola soal mandiri PTN, paham pembahasan lebih cepat, dan tidak ketinggalan deadline kampus impian.`,
  );
  const [cta, setCta] = useState("Mulai gratis sekarang");
  const [paymentGuideTitle, setPaymentGuideTitle] = useState(contentString("title", "Tata cara pembayaran"));
  const [paymentGuideBody, setPaymentGuideBody] = useState(
    contentString(
      "body",
      "Pilih paket, cek ringkasan pesanan, lalu lanjutkan ke halaman pembayaran resmi. Gunakan metode yang tersedia di Mayar dan tunggu konfirmasi otomatis setelah pembayaran berhasil.",
    ),
  );
  const [paymentGuideYoutubeUrl, setPaymentGuideYoutubeUrl] = useState(contentString("youtubeUrl", ""));
  const [paymentGuideImageUrls, setPaymentGuideImageUrls] = useState(
    contentString(
      "imageUrls",
      "/tutorial/payment-gif-frames/frame-01.png\n/tutorial/payment-gif-frames/frame-02.png\n/tutorial/payment-gif-frames/frame-03.png\n/tutorial/payment-gif-frames/frame-04.png\n/tutorial/payment-gif-frames/frame-05.png",
    ),
  );
  const [paymentGuideQris, setPaymentGuideQris] = useState(
    contentString("qrisSteps", "Pilih QRIS di halaman pembayaran.\nBuka aplikasi mobile banking atau e-wallet.\nScan kode QR yang tampil.\nPastikan nominal dan nama merchant sudah benar.\nKonfirmasi pembayaran dan tunggu status berhasil."),
  );
  const [paymentGuideVa, setPaymentGuideVa] = useState(
    contentString("virtualAccountSteps", "Pilih Virtual Account dan pilih bank yang tersedia.\nSalin nomor virtual account.\nBuka mobile banking, internet banking, atau ATM.\nPilih menu Transfer atau Pembayaran Virtual Account.\nMasukkan nomor virtual account, cek nominal, lalu bayar."),
  );
  const [paymentGuideEwallet, setPaymentGuideEwallet] = useState(
    contentString("ewalletSteps", "Pilih e-wallet yang tersedia.\nMasukkan nomor HP jika diminta.\nBuka aplikasi e-wallet dan cek notifikasi pembayaran.\nKonfirmasi pembayaran di aplikasi.\nKembali ke halaman status untuk melihat aktivasi paket."),
  );
  const [paymentGuideCard, setPaymentGuideCard] = useState(
    contentString("cardSteps", "Pilih Kartu Debit atau Kredit jika tersedia.\nMasukkan data kartu pada halaman pembayaran aman.\nIkuti verifikasi OTP atau 3DS dari bank.\nPastikan transaksi berhasil.\nSimpan bukti pembayaran jika diperlukan."),
  );
  const [contentMessage, setContentMessage] = useState("");
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingPaymentGuide, setIsSavingPaymentGuide] = useState(false);

  const saveLandingHero = async () => {
    setIsSavingContent(true);
    const result = await saveLandingHeroAction({ badge, headline, subheadline, cta });
    setContentMessage(result.ok ? "Landing page tersimpan dan siap tampil publik." : (result.message ?? "Gagal menyimpan landing."));
    setIsSavingContent(false);
  };

  const savePaymentGuide = async () => {
    setIsSavingPaymentGuide(true);
    const result = await savePaymentGuideAction({
      title: paymentGuideTitle,
      body: paymentGuideBody,
      youtubeUrl: paymentGuideYoutubeUrl,
      imageUrls: paymentGuideImageUrls,
      qrisSteps: paymentGuideQris,
      virtualAccountSteps: paymentGuideVa,
      ewalletSteps: paymentGuideEwallet,
      cardSteps: paymentGuideCard,
    });
    setContentMessage(result.ok ? "Tata cara pembayaran tersimpan." : (result.message ?? "Gagal menyimpan tata cara pembayaran."));
    setIsSavingPaymentGuide(false);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Konten Website"
        description="Atur copy landing page dan section website yang tampil ke publik."
        action={
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            <Eye size={16} /> Preview landing
          </a>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
              <Edit3 size={20} className="text-blue-600" /> Editor landing
            </h2>
            <div className="mt-5 space-y-4">
              <Field label="Badge hero">
                <input className="field" value={badge} onChange={(event) => setBadge(event.target.value)} />
              </Field>
              <Field label="Headline utama">
                <textarea className="field min-h-24 resize-none" value={headline} onChange={(event) => setHeadline(event.target.value)} />
              </Field>
              <Field label="Subheadline">
                <textarea
                  className="field min-h-28 resize-none"
                  value={subheadline}
                  onChange={(event) => setSubheadline(event.target.value)}
                />
              </Field>
              <Field label="CTA utama">
                <input className="field" value={cta} onChange={(event) => setCta(event.target.value)} />
              </Field>
              <button
                type="button"
                disabled={isSavingContent}
                onClick={saveLandingHero}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                {isSavingContent ? "Menyimpan..." : "Simpan landing publik"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
              <PlayCircle size={20} className="text-blue-600" /> Tata cara pembayaran
            </h2>
            <div className="mt-5 space-y-4">
              <Field label="Judul section">
                <input className="field" value={paymentGuideTitle} onChange={(event) => setPaymentGuideTitle(event.target.value)} />
              </Field>
              <Field label="Teks instruksi">
                <textarea
                  className="field min-h-32 resize-none"
                  value={paymentGuideBody}
                  onChange={(event) => setPaymentGuideBody(event.target.value)}
                  placeholder="Tulis tata cara pembayaran..."
                />
              </Field>
              <Field label="URL YouTube lama">
                <input
                  className="field"
                  value={paymentGuideYoutubeUrl}
                  onChange={(event) => setPaymentGuideYoutubeUrl(event.target.value)}
                  placeholder="Opsional, tidak dipakai jika slider foto aktif"
                />
              </Field>
              <Field label="URL gambar slider">
                <textarea
                  className="field min-h-28 resize-none"
                  value={paymentGuideImageUrls}
                  onChange={(event) => setPaymentGuideImageUrls(event.target.value)}
                  placeholder="/tutorial/payment-gif-frames/frame-01.png"
                />
              </Field>
              <Field label="Langkah QRIS">
                <textarea className="field min-h-28 resize-none" value={paymentGuideQris} onChange={(event) => setPaymentGuideQris(event.target.value)} />
              </Field>
              <Field label="Langkah Virtual Account">
                <textarea className="field min-h-28 resize-none" value={paymentGuideVa} onChange={(event) => setPaymentGuideVa(event.target.value)} />
              </Field>
              <Field label="Langkah E-wallet">
                <textarea className="field min-h-28 resize-none" value={paymentGuideEwallet} onChange={(event) => setPaymentGuideEwallet(event.target.value)} />
              </Field>
              <Field label="Langkah Kartu Debit/Kredit">
                <textarea className="field min-h-28 resize-none" value={paymentGuideCard} onChange={(event) => setPaymentGuideCard(event.target.value)} />
              </Field>
              <button
                type="button"
                disabled={isSavingPaymentGuide}
                onClick={savePaymentGuide}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:bg-slate-300"
              >
                {isSavingPaymentGuide ? "Menyimpan..." : "Simpan tata cara pembayaran"}
              </button>
              {contentMessage && <p className="text-sm font-bold text-slate-600">{contentMessage}</p>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="font-black text-slate-900">Section landing page</h2>
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">
                <Plus size={14} /> Tambah section
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {landingSections.map((section) => (
                <div key={section.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-900">{section.name}</p>
                    <p className="text-sm font-semibold text-slate-500">
                      Owner {section.owner} - update {section.updatedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ContentStatusBadge status={section.status} />
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600">
                      <Edit3 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BlogSeoView({ blogPosts, onPublish, onUnpublish, onSave }: {
  blogPosts: AdminPortalData["blogPosts"];
  onPublish: (id: string) => Promise<void>;
  onUnpublish: (id: string) => Promise<void>;
  onSave: (input: { id: string; title: string; category: string; excerpt: string; body: string }) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Tips belajar");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [blogMessage, setBlogMessage] = useState("");
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editBody, setEditBody] = useState("");

  const createBlogDraft = async () => {
    if (!newPostTitle.trim()) return;
    setIsSavingBlog(true);
    const result = await createBlogPostAction({
      title: newPostTitle,
      category: newPostCategory,
      excerpt: newPostExcerpt,
      body: newPostBody,
    });
    setBlogMessage(result.ok ? "Draft artikel dibuat." : (result.message ?? "Gagal membuat draft artikel."));
    if (result.ok) {
      setNewPostTitle("");
      setNewPostExcerpt("");
      setNewPostBody("");
    }
    setIsSavingBlog(false);
  };

  const seedSeoPosts = async () => {
    setIsSavingBlog(true);
    const result = await seedSeoBlogPostsAction();
    setBlogMessage(result.ok ? `${result.count ?? 50} artikel SEO berhasil dipublish.` : (result.message ?? "Gagal generate artikel SEO."));
    setIsSavingBlog(false);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Blog & SEO"
        description="Kelola artikel blog, draft editorial, dan seed konten Ujian Mandiri untuk halaman publik."
        action={
          <a
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            <Newspaper size={16} /> Preview blog
          </a>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-black text-slate-900">Artikel blog</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Generate konten awal, lalu edit manual agar makin tajam sesuai data kampus dan produk.
            </p>
          </div>
          <button
            type="button"
            disabled={isSavingBlog}
            onClick={seedSeoPosts}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            <Sparkles size={16} /> Generate 50 artikel SEO
          </button>
        </div>

        <div className="grid gap-3 border-b border-slate-100 p-5 md:grid-cols-2">
          <Field label="Judul artikel">
            <input className="field" value={newPostTitle} onChange={(event) => setNewPostTitle(event.target.value)} placeholder="Judul artikel baru" />
          </Field>
          <Field label="Kategori">
            <input className="field" value={newPostCategory} onChange={(event) => setNewPostCategory(event.target.value)} />
          </Field>
          <Field label="Excerpt">
            <textarea className="field min-h-20 resize-none" value={newPostExcerpt} onChange={(event) => setNewPostExcerpt(event.target.value)} />
          </Field>
          <Field label="Isi artikel">
            <textarea className="field min-h-20 resize-none" value={newPostBody} onChange={(event) => setNewPostBody(event.target.value)} />
          </Field>
          <button
            type="button"
            disabled={isSavingBlog || !newPostTitle.trim()}
            onClick={createBlogDraft}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:bg-slate-300 md:col-span-2"
          >
            <Plus size={16} /> Buat draft artikel
          </button>
          {blogMessage && <p className="text-sm font-bold text-slate-600 md:col-span-2">{blogMessage}</p>}
        </div>

        <div className="divide-y divide-slate-100">
          {blogPosts.map((post) => (
            <div key={post.id}>
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-slate-900">{post.title}</p>
                  <p className="text-sm font-semibold text-slate-500">{post.category} · update {post.updatedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ContentStatusBadge status={post.status} />
                  <button
                    onClick={() => {
                      if (editingPostId === post.id) { setEditingPostId(null); return; }
                      setEditingPostId(post.id);
                      setEditTitle(post.title);
                      setEditCategory(post.category);
                      setEditExcerpt("");
                      setEditBody("");
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600"
                  >
                    <Edit3 size={15} />
                  </button>
                  {post.status === "published" ? (
                    <button onClick={() => onUnpublish(post.id)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-black text-slate-500 hover:text-rose-600">
                      Unpublish
                    </button>
                  ) : (
                    <button onClick={() => onPublish(post.id)} className="rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-black text-white hover:bg-emerald-700">
                      Publish
                    </button>
                  )}
                </div>
              </div>
              {editingPostId === post.id && (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Judul"><input className="field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></Field>
                    <Field label="Kategori"><input className="field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} /></Field>
                  </div>
                  <Field label="Excerpt"><textarea className="field min-h-16 resize-none" value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} /></Field>
                  <Field label="Isi artikel"><textarea className="field min-h-24 resize-none" value={editBody} onChange={(e) => setEditBody(e.target.value)} /></Field>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setIsSavingBlog(true);
                        const result = await onSave({ id: post.id, title: editTitle, category: editCategory, excerpt: editExcerpt, body: editBody });
                        setBlogMessage(result.ok ? "Artikel diperbarui." : (result.message ?? "Gagal."));
                        if (result.ok) setEditingPostId(null);
                        setIsSavingBlog(false);
                      }}
                      disabled={isSavingBlog}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSavingBlog ? "Menyimpan..." : "Simpan perubahan"}
                    </button>
                    <button onClick={() => setEditingPostId(null)} className="rounded-xl border px-4 py-2 text-sm font-black text-slate-500">Batal</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PtnView({
  ptns,
  msg,
  onSavePtn,
  onSaveDeadline,
}: {
  ptns: AdminPtn[];
  msg: string;
  onSavePtn: (input: { id?: string; name: string; city: string; officialUrl: string }) => Promise<void>;
  onSaveDeadline: (input: { id?: string; ptnId: string; title: string; openAt: string; closeAt: string; sourceUrl: string }) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editPtn, setEditPtn] = useState<AdminPtn | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Deadline form
  const [showDlForm, setShowDlForm] = useState<string | null>(null);
  const [dlTitle, setDlTitle] = useState("");
  const [dlOpen, setDlOpen] = useState("");
  const [dlClose, setDlClose] = useState("");
  const [dlSource, setDlSource] = useState("");
  const [dlMsg, setDlMsg] = useState("");

  function openAdd() { setEditPtn(null); setName(""); setCity(""); setOfficialUrl(""); setShowForm(true); }
  function openEdit(ptn: AdminPtn) { setEditPtn(ptn); setName(ptn.name); setCity(ptn.city); setOfficialUrl(ptn.officialUrl); setShowForm(true); }

  async function handleSavePtn() {
    if (!name.trim()) return;
    setSaving(true);
    await onSavePtn({ id: editPtn?.id, name, city, officialUrl });
    setSaving(false);
    setShowForm(false);
  }

  async function handleSaveDeadline(ptnId: string) {
    setDlMsg("");
    const result = await onSaveDeadline({ ptnId, title: dlTitle, openAt: dlOpen, closeAt: dlClose, sourceUrl: dlSource });
    if (result.ok) { setShowDlForm(null); setDlTitle(""); setDlOpen(""); setDlClose(""); setDlSource(""); }
    else setDlMsg(result.message ?? "Gagal.");
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Manajemen PTN & Deadline"
        description="Atur data universitas dan jadwal pendaftaran Ujian Mandiri."
        action={
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">
            <Plus size={16} /> Tambah PTN
          </button>
        }
      />

      {msg && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{msg}</p>}

      {showForm && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <h2 className="mb-4 font-black text-slate-800">{editPtn ? "Edit PTN" : "Tambah PTN Baru"}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Nama PTN"><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Universitas Indonesia" /></Field>
            <Field label="Kota"><input className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Depok" /></Field>
            <Field label="URL resmi"><input className="field" value={officialUrl} onChange={(e) => setOfficialUrl(e.target.value)} placeholder="https://penerimaan.ui.ac.id" /></Field>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleSavePtn} disabled={saving || !name.trim()} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan PTN"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50">Batal</button>
          </div>
        </section>
      )}

      {ptns.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400">
          <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Belum ada data PTN. Klik &ldquo;Tambah PTN&rdquo; untuk mulai.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ptns.map((ptn) => (
            <article key={ptn.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400">
                  <GraduationCap size={22} />
                </div>
                <button onClick={() => openEdit(ptn)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-blue-600">
                  <Edit3 size={14} />
                </button>
              </div>
              <h2 className="mt-3 text-base font-black text-slate-800">{ptn.name}</h2>
              <p className="text-sm text-slate-500">{ptn.city}</p>
              {ptn.officialUrl && (
                <a href={ptn.officialUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                  <ExternalLink size={11} /> Website resmi
                </a>
              )}

              {/* Deadlines */}
              <div className="mt-4 space-y-2">
                {ptn.deadlines.map((d) => (
                  <div key={d.id} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                    <p className="text-xs font-black text-blue-700">{d.title}</p>
                    <p className="mt-0.5 text-[11px] text-blue-500">Tutup: {d.closeAt}</p>
                  </div>
                ))}
              </div>

              {showDlForm === ptn.id ? (
                <div className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
                  <Field label="Nama jalur"><input className="field text-xs" value={dlTitle} onChange={(e) => setDlTitle(e.target.value)} placeholder="Jalur Mandiri 2026" /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Buka"><input type="date" className="field text-xs" value={dlOpen} onChange={(e) => setDlOpen(e.target.value)} /></Field>
                    <Field label="Tutup"><input type="date" className="field text-xs" value={dlClose} onChange={(e) => setDlClose(e.target.value)} /></Field>
                  </div>
                  <Field label="Sumber URL"><input className="field text-xs" value={dlSource} onChange={(e) => setDlSource(e.target.value)} placeholder="https://..." /></Field>
                  {dlMsg && <p className="text-xs font-bold text-rose-600">{dlMsg}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveDeadline(ptn.id)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white">Simpan</button>
                    <button onClick={() => setShowDlForm(null)} className="rounded-lg border px-3 py-1.5 text-xs font-black text-slate-500">Batal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowDlForm(ptn.id); setDlTitle(""); setDlOpen(""); setDlClose(""); setDlSource(""); setDlMsg(""); }}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline">
                  <Plus size={12} /> Tambah deadline
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastView({
  broadcasts,
  msg,
  onSend,
}: {
  broadcasts: AdminBroadcast[];
  msg: string;
  onSend: (input: { target: string; title: string; body: string }) => Promise<void>;
}) {
  const [target, setTarget] = useState("Semua Pengguna");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    await onSend({ target, title, body });
    setSending(false);
    setTitle("");
    setBody("");
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Broadcast Notifikasi" description="Kirim pengumuman, pengingat deadline PTN, atau promo ke pengguna." />
      {msg && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{msg}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-black text-slate-800"><Megaphone className="text-blue-600" size={20} /> Buat pesan baru</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <Field label="Target penerima">
              <select className="field" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option>Semua Pengguna</option>
                <option>Pengguna Free</option>
                <option>Pengguna Belajar &amp; Pro</option>
              </select>
            </Field>
            <Field label="Judul notifikasi">
              <input className="field" placeholder="Pendaftaran UI Dibuka" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Field>
            <Field label="Isi pesan">
              <textarea className="field min-h-28 resize-none" placeholder="Tulis pesan lengkap..." value={body} onChange={(e) => setBody(e.target.value)} required />
            </Field>
            <button type="submit" disabled={sending || !title.trim() || !body.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? "Mengirim..." : "Kirim broadcast"}
            </button>
          </form>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-5"><h2 className="font-black text-slate-800">Riwayat pengiriman ({broadcasts.length})</h2></div>
          <div className="divide-y divide-slate-100">
            {broadcasts.length === 0 && <p className="p-5 text-sm text-slate-400">Belum ada broadcast yang dikirim.</p>}
            {broadcasts.map((bc) => (
              <div key={bc.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-slate-800">{bc.title}</h3>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">{bc.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{bc.body}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Target: {bc.target} · {bc.sentAt}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

type PastiLulusTokenRow = {
  id: string;
  token: string;
  note: string | null;
  redeemedBy: string | null;
  redeemedAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type PastiLulusMaterialRow = {
  nomor: string;
  universitas: string;
  jurusan: string;
  soalStoragePath: string | null;
  pembahasanStoragePath: string | null;
  updatedAt: string;
};

function PastiLulusTokenView({
  tokens,
  materials,
  genCount,
  genNote,
  genExpiry,
  generating,
  generatedTokens,
  msg,
  onGenCountChange,
  onGenNoteChange,
  onGenExpiryChange,
  onGenerate,
  onDeactivate,
  onBulkUpdate,
  onMaterialUploaded,
}: {
  tokens: PastiLulusTokenRow[];
  materials: PastiLulusMaterialRow[];
  genCount: string;
  genNote: string;
  genExpiry: string;
  generating: boolean;
  generatedTokens: string[];
  msg: string;
  onGenCountChange: (v: string) => void;
  onGenNoteChange: (v: string) => void;
  onGenExpiryChange: (v: string) => void;
  onGenerate: () => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onBulkUpdate: (ids: string[], action: "deactivate" | "activate" | "delete") => Promise<void>;
  onMaterialUploaded: (nomor: string, type: "soal" | "pembahasan", storagePath: string, universitas: string, jurusan: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [tokenFilter, setTokenFilter] = useState<"all" | "active" | "redeemed" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const copyAll = () => {
    void navigator.clipboard.writeText(generatedTokens.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const active = tokens.filter((t) => t.isActive && !t.redeemedBy).length;
  const redeemed = tokens.filter((t) => t.redeemedBy).length;
  const inactive = tokens.filter((t) => !t.isActive).length;

  return (
    <div className="space-y-6">
      <PageTitle title="PASTI LULUS 1 — Token Akses" description="Buat dan kelola kode token gratis untuk peserta PASTI LULUS 1 (27 paket tryout PDF)." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{active}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Token Aktif</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-blue-600">{redeemed}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Sudah Dipakai</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-slate-400">{inactive}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Dinonaktifkan</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generate panel */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-black text-slate-800 mb-4">
            <Trophy className="text-yellow-500" size={20} /> Buat Token Baru
          </h2>
          <div className="space-y-4">
            <Field label="Jumlah token (maks 500)">
              <input
                type="number"
                className="field"
                min={1}
                max={500}
                value={genCount}
                onChange={(e) => onGenCountChange(e.target.value)}
              />
            </Field>
            <Field label="Catatan (opsional, misal: Batch WA Grup 1)">
              <input
                type="text"
                className="field"
                placeholder="Batch Juni 2026"
                value={genNote}
                onChange={(e) => onGenNoteChange(e.target.value)}
              />
            </Field>
            <Field label="Kadaluarsa (opsional)">
              <input
                type="date"
                className="field"
                value={genExpiry}
                onChange={(e) => onGenExpiryChange(e.target.value)}
              />
            </Field>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 text-sm font-black text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {generating ? "Membuat..." : `Buat ${genCount || "10"} Token`}
            </button>
          </div>

          {msg && (
            <p className={`mt-3 text-xs font-semibold ${msg.startsWith("Gagal") ? "text-red-600" : "text-emerald-700"}`}>{msg}</p>
          )}

          {generatedTokens.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-700">Token yang baru dibuat:</p>
                <button
                  type="button"
                  onClick={copyAll}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Download size={12} />}
                  {copied ? "Tersalin!" : "Salin semua"}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-50 border border-slate-100 p-3">
                {generatedTokens.map((t) => (
                  <p key={t} className="font-mono text-xs font-semibold text-slate-800 py-0.5 select-all">{t}</p>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Token list with bulk select */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          {/* Header + filter + search */}
          <div className="border-b border-slate-100 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-black text-slate-800">Daftar Token ({tokens.length})</h2>
              {/* Filter tabs */}
              <div className="flex gap-1">
                {(["all", "active", "redeemed", "inactive"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setTokenFilter(f); setSelectedIds(new Set()); }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${tokenFilter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {f === "all" ? "Semua" : f === "active" ? "Aktif" : f === "redeemed" ? "Terpakai" : "Nonaktif"}
                  </button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari token atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Bulk action bar — appears when items selected */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 border-b border-yellow-200 bg-yellow-50 px-4 py-2.5 flex-wrap">
              <span className="text-xs font-black text-yellow-800">{selectedIds.size} token dipilih</span>
              <div className="flex gap-2 ml-auto flex-wrap">
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={async () => {
                    setBulkLoading(true); setBulkMsg("");
                    const ids = Array.from(selectedIds);
                    await onBulkUpdate(ids, "activate");
                    setSelectedIds(new Set());
                    setBulkMsg(`${ids.length} token diaktifkan.`);
                    setBulkLoading(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                  Aktifkan
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={async () => {
                    setBulkLoading(true); setBulkMsg("");
                    const ids = Array.from(selectedIds);
                    await onBulkUpdate(ids, "deactivate");
                    setSelectedIds(new Set());
                    setBulkMsg(`${ids.length} token dinonaktifkan.`);
                    setBulkLoading(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                  Nonaktifkan
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={async () => {
                    if (!confirm(`Hapus ${selectedIds.size} token yang belum terpakai? Tindakan ini permanen.`)) return;
                    setBulkLoading(true); setBulkMsg("");
                    const ids = Array.from(selectedIds);
                    await onBulkUpdate(ids, "delete");
                    setSelectedIds(new Set());
                    setBulkMsg(`Token yang belum terpakai dihapus.`);
                    setBulkLoading(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                  Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 px-2"
                >
                  Batal pilih
                </button>
              </div>
            </div>
          )}

          {bulkMsg && (
            <p className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border-b border-emerald-100">{bulkMsg}</p>
          )}

          {/* List */}
          {(() => {
            const filtered = tokens.filter((t) => {
              if (tokenFilter === "active" && (t.redeemedBy || !t.isActive)) return false;
              if (tokenFilter === "redeemed" && !t.redeemedBy) return false;
              if (tokenFilter === "inactive" && (t.redeemedBy || t.isActive)) return false;
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return t.token.toLowerCase().includes(q) || (t.note ?? "").toLowerCase().includes(q);
              }
              return true;
            });
            const allFilteredIds = filtered.map((t) => t.id);
            const allSelected = filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

            return (
              <div className="flex flex-col min-h-0">
                {/* Select-all header */}
                {filtered.length > 0 && (
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => {
                        if (allSelected) {
                          setSelectedIds((prev) => { const s = new Set(prev); allFilteredIds.forEach((id) => s.delete(id)); return s; });
                        } else {
                          setSelectedIds((prev) => { const s = new Set(prev); allFilteredIds.forEach((id) => s.add(id)); return s; });
                        }
                      }}
                      className="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-500">
                      {allSelected ? "Batal pilih semua" : `Pilih semua (${filtered.length})`}
                    </span>
                  </div>
                )}

                <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
                  {filtered.length === 0 && (
                    <p className="p-5 text-sm text-slate-400">
                      {tokens.length === 0 ? "Belum ada token." : "Tidak ada token yang cocok."}
                    </p>
                  )}
                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3 px-4 py-3 transition ${selectedIds.has(t.id) ? "bg-blue-50" : "hover:bg-slate-50"}`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => {
                          setSelectedIds((prev) => {
                            const s = new Set(prev);
                            s.has(t.id) ? s.delete(t.id) : s.add(t.id);
                            return s;
                          });
                        }}
                        className="h-3.5 w-3.5 shrink-0 rounded accent-blue-600 cursor-pointer"
                      />

                      {/* Token info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-black text-slate-900 select-all">{t.token}</p>
                        {t.note && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{t.note}</p>}
                        {t.redeemedBy ? (
                          <p className="text-[11px] text-blue-600 font-bold mt-0.5">Dipakai · {t.redeemedAt}</p>
                        ) : t.isActive ? (
                          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Aktif · {t.createdAt}</p>
                        ) : (
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">Nonaktif</p>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0">
                        {t.redeemedBy ? (
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">TERPAKAI</span>
                        ) : t.isActive ? (
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">AKTIF</span>
                        ) : (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">NONAKTIF</span>
                        )}
                      </div>

                      {/* Single deactivate */}
                      {t.isActive && !t.redeemedBy && (
                        <button
                          type="button"
                          onClick={() => onDeactivate(t.id)}
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          Nonaktifkan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      </div>

      {/* Upload Soal & Pembahasan */}
      <PastiLulusMaterialsUpload materials={materials} onUploaded={onMaterialUploaded} />
    </div>
  );
}

type BulkQueueItem = {
  id: string;
  file: File;
  nomor: string;
  type: "soal" | "pembahasan";
  universitas: string;
  jurusan: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

function parsePdfFilename(filename: string): { nomor: string | null; type: "soal" | "pembahasan" | null } {
  // Matches: {2-digit-number}_{soal|pembahasan}[anything].pdf
  const match = filename.match(/^(\d{2})_(soal|pembahasan)/i);
  if (match) return { nomor: match[1], type: match[2].toLowerCase() as "soal" | "pembahasan" };
  return { nomor: null, type: null };
}

function PastiLulusMaterialsUpload({
  materials,
  onUploaded,
}: {
  materials: PastiLulusMaterialRow[];
  onUploaded: (nomor: string, type: "soal" | "pembahasan", storagePath: string, universitas: string, jurusan: string) => void;
}) {
  const [uploadingKey, setUploadingKey] = useState<string>("");
  const [uploadMsg, setUploadMsg] = useState<Record<string, string>>({});

  // Bulk upload state
  const [queue, setQueue] = useState<BulkQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const matByNomor = Object.fromEntries(materials.map((m) => [m.nomor, m]));
  const itemByNomor = Object.fromEntries(PASTI_LULUS_ITEMS.map((i) => [i.nomor, i]));

  const addFilesToQueue = (files: FileList | File[]) => {
    const newItems: BulkQueueItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") continue;
      const { nomor, type } = parsePdfFilename(file.name);
      const item = nomor ? itemByNomor[nomor] : null;
      newItems.push({
        id: `${Date.now()}-${file.name}`,
        file,
        nomor: nomor ?? "",
        type: type ?? "soal",
        universitas: item?.universitas ?? "",
        jurusan: item?.jurusan ?? "",
        status: "pending",
      });
    }
    setQueue((prev) => [...prev, ...newItems]);
  };

  const removeFromQueue = (id: string) => setQueue((prev) => prev.filter((q) => q.id !== id));

  const updateQueueItem = (id: string, patch: Partial<BulkQueueItem>) =>
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const uploadOne = async (item: BulkQueueItem): Promise<void> => {
    const nomor = item.nomor;
    const infoItem = itemByNomor[nomor];
    const universitas = infoItem?.universitas ?? item.universitas;
    const jurusan = infoItem?.jurusan ?? item.jurusan;

    updateQueueItem(item.id, { status: "uploading" });

    const fd = new FormData();
    fd.append("nomor", nomor);
    fd.append("universitas", universitas);
    fd.append("jurusan", jurusan);
    fd.append("type", item.type);
    fd.append("file", item.file);

    try {
      const res = await fetch("/api/admin/pasti-lulus-upload", { method: "POST", body: fd });
      const json = await res.json() as { ok?: boolean; storagePath?: string; error?: string };
      if (json.ok && json.storagePath) {
        onUploaded(nomor, item.type, json.storagePath, universitas, jurusan);
        updateQueueItem(item.id, { status: "done" });
      } else {
        updateQueueItem(item.id, { status: "error", error: json.error ?? "Gagal" });
      }
    } catch {
      updateQueueItem(item.id, { status: "error", error: "Error koneksi" });
    }
  };

  const uploadAll = async () => {
    const pending = queue.filter((q) => q.status === "pending" && q.nomor);
    if (!pending.length) return;
    setBulkUploading(true);
    // Upload 3 concurrent
    for (let i = 0; i < pending.length; i += 3) {
      await Promise.all(pending.slice(i, i + 3).map(uploadOne));
    }
    setBulkUploading(false);
  };

  const clearDone = () => setQueue((prev) => prev.filter((q) => q.status !== "done"));

  // Single-item upload (existing per-row)
  const handleUpload = async (
    nomor: string,
    universitas: string,
    jurusan: string,
    type: "soal" | "pembahasan",
    file: File,
  ) => {
    const key = `${nomor}-${type}`;
    setUploadingKey(key);
    setUploadMsg((prev) => ({ ...prev, [key]: "" }));

    const fd = new FormData();
    fd.append("nomor", nomor);
    fd.append("universitas", universitas);
    fd.append("jurusan", jurusan);
    fd.append("type", type);
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/pasti-lulus-upload", { method: "POST", body: fd });
      const json = await res.json() as { ok?: boolean; storagePath?: string; error?: string };
      if (json.ok && json.storagePath) {
        onUploaded(nomor, type, json.storagePath, universitas, jurusan);
        setUploadMsg((prev) => ({ ...prev, [key]: "✓ Berhasil diupload" }));
      } else {
        setUploadMsg((prev) => ({ ...prev, [key]: json.error ?? "Gagal upload" }));
      }
    } catch {
      setUploadMsg((prev) => ({ ...prev, [key]: "Error koneksi" }));
    } finally {
      setUploadingKey("");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Section header */}
      <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-start gap-2 flex-wrap">
        <FileUp size={18} className="text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h2 className="font-black text-slate-800">Upload Soal &amp; Pembahasan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk upload banyak PDF sekaligus — beri nama file <code className="bg-slate-100 px-1 rounded text-[10px]">01_soal.pdf</code> atau <code className="bg-slate-100 px-1 rounded text-[10px]">01_pembahasan.pdf</code> agar auto-terdeteksi.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/templates/template-soal-pasti-lulus.html" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
            <Download size={12} /> Template Soal
          </a>
          <a href="/templates/template-pembahasan-pasti-lulus.html" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
            <Download size={12} /> Template Pembahasan
          </a>
        </div>
      </div>

      {/* ── BULK UPLOAD ZONE ── */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        {/* Drop zone */}
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFilesToQueue(e.dataTransfer.files);
          }}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 transition cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"}`}
        >
          <input
            type="file"
            multiple
            accept="application/pdf"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) => { if (e.target.files) addFilesToQueue(e.target.files); e.target.value = ""; }}
          />
          <FileUp size={28} className={isDragging ? "text-blue-500" : "text-slate-400"} />
          <p className="text-sm font-black text-slate-700">Drop banyak PDF di sini, atau klik untuk pilih</p>
          <p className="text-xs text-slate-400">Format nama: <span className="font-mono font-bold">01_soal.pdf</span> · <span className="font-mono font-bold">01_pembahasan.pdf</span></p>
        </div>

        {/* Queue table */}
        {queue.length > 0 && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            {/* Queue header */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 border-b border-slate-100">
              <p className="text-xs font-black text-slate-700">{queue.length} file dalam antrian</p>
              <div className="flex gap-2">
                {queue.some((q) => q.status === "done") && (
                  <button type="button" onClick={clearDone}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600">
                    Hapus yang selesai
                  </button>
                )}
                <button type="button" onClick={() => setQueue([])}
                  className="text-[11px] font-bold text-red-400 hover:text-red-600">
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Queue rows */}
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {queue.map((q) => {
                const itemInfo = itemByNomor[q.nomor];
                const isValid = Boolean(q.nomor && q.type);
                return (
                  <div key={q.id} className="flex items-center gap-3 px-4 py-2.5">
                    {/* Status icon */}
                    <div className="shrink-0 w-5">
                      {q.status === "done" && <Check size={14} className="text-emerald-600" />}
                      {q.status === "uploading" && <Loader2 size={14} className="animate-spin text-blue-500" />}
                      {q.status === "error" && <XCircle size={14} className="text-red-500" />}
                      {q.status === "pending" && (
                        <div className={`h-2 w-2 rounded-full ${isValid ? "bg-slate-300" : "bg-amber-400"}`} />
                      )}
                    </div>

                    {/* Filename */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-semibold text-slate-800 truncate">{q.file.name}</p>
                      {itemInfo && (
                        <p className="text-[10px] text-slate-400 truncate">{itemInfo.universitas} — {itemInfo.jurusan}</p>
                      )}
                      {q.status === "error" && (
                        <p className="text-[10px] text-red-500 font-bold">{q.error}</p>
                      )}
                    </div>

                    {/* Nomor selector */}
                    <select
                      value={q.nomor}
                      disabled={q.status !== "pending"}
                      onChange={(e) => {
                        const nom = e.target.value;
                        const info = itemByNomor[nom];
                        updateQueueItem(q.id, { nomor: nom, universitas: info?.universitas ?? "", jurusan: info?.jurusan ?? "" });
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-blue-300 disabled:opacity-60 min-w-[60px]"
                    >
                      <option value="">No.</option>
                      {PASTI_LULUS_ITEMS.map((i) => (
                        <option key={i.nomor} value={i.nomor}>{i.nomor}</option>
                      ))}
                    </select>

                    {/* Type selector */}
                    <select
                      value={q.type}
                      disabled={q.status !== "pending"}
                      onChange={(e) => updateQueueItem(q.id, { type: e.target.value as "soal" | "pembahasan" })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-blue-300 disabled:opacity-60"
                    >
                      <option value="soal">Soal</option>
                      <option value="pembahasan">Pembahasan</option>
                    </select>

                    {/* Status badge */}
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black ${
                      q.status === "done" ? "bg-emerald-100 text-emerald-700"
                      : q.status === "error" ? "bg-red-100 text-red-600"
                      : q.status === "uploading" ? "bg-blue-100 text-blue-700"
                      : isValid ? "bg-slate-100 text-slate-600"
                      : "bg-amber-100 text-amber-700"
                    }`}>
                      {q.status === "done" ? "Selesai"
                        : q.status === "error" ? "Error"
                        : q.status === "uploading" ? "Uploading"
                        : isValid ? "Siap"
                        : "Isi nomor"}
                    </span>

                    {/* Remove button */}
                    {q.status === "pending" && (
                      <button type="button" onClick={() => removeFromQueue(q.id)}
                        className="shrink-0 rounded-full p-0.5 text-slate-300 hover:text-red-400">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload all button */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[11px] text-slate-500">
                {queue.filter((q) => q.status === "done").length} selesai ·{" "}
                {queue.filter((q) => q.status === "error").length} error ·{" "}
                {queue.filter((q) => q.status === "pending").length} menunggu
              </p>
              <button
                type="button"
                disabled={bulkUploading || !queue.some((q) => q.status === "pending" && q.nomor)}
                onClick={uploadAll}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkUploading ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />}
                {bulkUploading ? "Mengupload..." : `Upload Semua (${queue.filter((q) => q.status === "pending" && q.nomor).length} file)`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── PER-ITEM LIST (one by one) ── */}
      <div className="divide-y divide-slate-100">
        {PASTI_LULUS_ITEMS.map((item) => {
          const mat = matByNomor[item.nomor];
          const soalKey = `${item.nomor}-soal`;
          const pembahasanKey = `${item.nomor}-pembahasan`;
          const hasSoalUpload = Boolean(mat?.soalStoragePath);
          const hasPembahasan = Boolean(mat?.pembahasanStoragePath);

          return (
            <div key={item.nomor} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-3">
              {/* Nomor */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                {item.nomor}
              </span>

              {/* Info */}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500 truncate">{item.universitas}</p>
                <p className="text-sm font-black text-slate-900 truncate">{item.jurusan}</p>
              </div>

              {/* Upload Soal */}
              <div className="flex flex-col items-center gap-1">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingKey === soalKey}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(item.nomor, item.universitas, item.jurusan, "soal", f);
                      e.target.value = "";
                    }}
                  />
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${hasSoalUpload ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {uploadingKey === soalKey ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <FileUp size={11} />
                    )}
                    {hasSoalUpload ? "Soal ✓" : "Upload Soal"}
                  </span>
                </label>
                {uploadMsg[soalKey] && (
                  <span className={`text-[10px] font-semibold ${uploadMsg[soalKey].startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>
                    {uploadMsg[soalKey]}
                  </span>
                )}
              </div>

              {/* Upload Pembahasan */}
              <div className="flex flex-col items-center gap-1">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingKey === pembahasanKey}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(item.nomor, item.universitas, item.jurusan, "pembahasan", f);
                      e.target.value = "";
                    }}
                  />
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${hasPembahasan ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {uploadingKey === pembahasanKey ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <FileUp size={11} />
                    )}
                    {hasPembahasan ? "Pembahasan ✓" : "Upload Pembahasan"}
                  </span>
                </label>
                {uploadMsg[pembahasanKey] && (
                  <span className={`text-[10px] font-semibold ${uploadMsg[pembahasanKey].startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>
                    {uploadMsg[pembahasanKey]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SettingsView() {
  const [settingsMsg, setSettingsMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSettingsMsg("Perubahan profil disimpan. (Catatan: email/nama admin dikelola melalui Supabase Auth)");
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Admin Settings" description="Kelola profil admin, hak akses, dan konfigurasi dasar operasional." />
      {settingsMsg && <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">{settingsMsg}</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><UserCog size={20} className="text-blue-600" /> Profil admin</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <Field label="Nama admin"><input className="field" defaultValue="Super Admin" /></Field>
            <Field label="Email admin"><input className="field" defaultValue={whiteLabel.auth.adminEmail} /></Field>
            <Field label="Role"><input className="field" defaultValue="Super Admin" readOnly /></Field>
            <Field label="Session"><input className="field" defaultValue="7 hari" readOnly /></Field>
            <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2">
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </form>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><ShieldCheck size={20} className="text-blue-600" /> Keamanan</h2>
          <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
            <p>Admin route dilindungi role admin/super_admin.</p>
            <p>Login dev admin hanya aktif di non-production.</p>
            <p>Production harus memakai Supabase Auth dan email terverifikasi.</p>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">Logout admin</button>
          </form>
        </section>
      </div>
    </div>
  );
}

function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: typeof Users; label: string; value: string; helper: string; tone: "blue" | "emerald" | "amber" | "rose" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}><Icon size={20} /></div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{helper}</span>
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function ActionPanel({ icon: Icon, title, body, onClick }: { icon: typeof CreditCard; title: string; body: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-200 hover:bg-blue-50/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={20} /></div>
      <h3 className="mt-3 font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{body}</p>
    </button>
  );
}


function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="p-4 font-black">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="p-4 align-top text-slate-600">{children}</td>;
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    paid: ["Success", "bg-emerald-50 text-emerald-700 border-emerald-100", CheckCircle],
    pending: ["Pending", "bg-amber-50 text-amber-700 border-amber-100", Clock],
    expired: ["Expired", "bg-slate-100 text-slate-600 border-slate-200", XCircle],
    failed: ["Failed", "bg-rose-50 text-rose-700 border-rose-100", XCircle],
  } as const;
  const [label, className, Icon] = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-black uppercase ${className}`}>
      <Icon size={12} /> {label}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const className = tier === "pro" ? "bg-amber-100 text-amber-800" : tier === "belajar" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-md px-2.5 py-1 text-[11px] font-black uppercase ${className}`}>{tier}</span>;
}

function ContentStatusBadge({ status }: { status: string }) {
  const className = status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return <span className={`rounded-md px-2.5 py-1 text-[11px] font-black uppercase ${className}`}>{status}</span>;
}

function CrmStatusBadge({ status }: { status: string }) {
  const className =
    status === "closed"
      ? "bg-slate-100 text-slate-600"
      : status === "assigned"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-700";
  return <span className={`rounded-md px-2.5 py-1 text-[11px] font-black uppercase ${className}`}>{status}</span>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-800">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}
