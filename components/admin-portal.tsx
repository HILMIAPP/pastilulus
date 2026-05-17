"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { billingPlans } from "@/lib/billing";
import { signOutAction } from "@/lib/auth-actions";
import {
  createAffiliatePartnerAction,
  createBlogPostAction,
  createPromoCodeAction,
  createWhatsAppLeadAction,
  replyCrmConversationAction,
  saveLandingHeroAction,
  seedSeoBlogPostsAction,
  syncPaymentTransactionAction,
  updateCrmConversationStatusAction,
  updateQuestionStatusAction,
} from "@/lib/admin-actions";
import type { AdminPortalData } from "@/lib/admin-portal-data";
import { site, whiteLabel } from "@/lib/site-config";
import {
  BadgePercent,
  Bell,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe2,
  GraduationCap,
  Handshake,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Menu,
  Newspaper,
  PhoneCall,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";

type AdminTab = "dashboard" | "users" | "soal" | "content" | "blog" | "crm" | "ptn" | "billing" | "promo" | "broadcast" | "settings";
type PaymentStatus = "paid" | "pending" | "expired" | "failed";
type SoalStatus = "review" | "active" | "rejected";

const adminUsers = [
  {
    id: "usr-1",
    name: "Budi Santoso",
    email: "budi@siswa.com",
    tier: "pro",
    joined: "12 Mei 2026",
    status: "active",
    target: "SIMAK UI",
    tryouts: 8,
    avgScore: 742,
    lastSeen: "2 menit lalu",
  },
  {
    id: "usr-2",
    name: "Siti Aminah",
    email: "siti.a@siswa.com",
    tier: "belajar",
    joined: "10 Mei 2026",
    status: "active",
    target: "SM-ITB",
    tryouts: 4,
    avgScore: 681,
    lastSeen: "15 menit lalu",
  },
  {
    id: "usr-3",
    name: "Andi Saputra",
    email: "andisap@gmail.com",
    tier: "free",
    joined: "09 Mei 2026",
    status: "active",
    target: "UM UGM",
    tryouts: 1,
    avgScore: 512,
    lastSeen: "1 jam lalu",
  },
  {
    id: "usr-4",
    name: "Rina Wijaya",
    email: "rinawjy@yahoo.com",
    tier: "pro",
    joined: "05 Mei 2026",
    status: "active",
    target: "SMUP UNPAD",
    tryouts: 11,
    avgScore: 778,
    lastSeen: "Kemarin",
  },
];

const initialTransactions = [
  {
    id: "trx-1",
    orderId: "PL-pro-1778567400001",
    userId: "usr-1",
    user: "Budi Santoso",
    email: "budi@siswa.com",
    plan: "Pro",
    amount: billingPlans[1].priceLabel,
    method: "QRIS",
    status: "paid" as PaymentStatus,
    promoCode: "HEMATUM",
    affiliateCode: "PARTNER01",
    paidAt: "12 Mei 2026 14:30",
    createdAt: "12 Mei 2026 14:22",
  },
  {
    id: "trx-2",
    orderId: "PL-belajar-1778552100002",
    userId: "usr-2",
    user: "Siti Aminah",
    email: "siti.a@siswa.com",
    plan: "Belajar",
    amount: billingPlans[0].priceLabel,
    method: "VA BCA",
    status: "pending" as PaymentStatus,
    promoCode: "-",
    affiliateCode: "KAKRINA",
    paidAt: "-",
    createdAt: "12 Mei 2026 10:15",
  },
  {
    id: "trx-3",
    orderId: "PL-pro-1777933200003",
    userId: "usr-4",
    user: "Rina Wijaya",
    email: "rinawjy@yahoo.com",
    plan: "Pro",
    amount: billingPlans[1].priceLabel,
    method: "GoPay",
    status: "paid" as PaymentStatus,
    promoCode: "TRYOUT25",
    affiliateCode: "-",
    paidAt: "05 Mei 2026 09:03",
    createdAt: "05 Mei 2026 09:00",
  },
  {
    id: "trx-4",
    orderId: "PL-belajar-1775964300004",
    userId: "usr-3",
    user: "Andi Saputra",
    email: "andisap@gmail.com",
    plan: "Belajar",
    amount: billingPlans[0].priceLabel,
    method: "VA Mandiri",
    status: "expired" as PaymentStatus,
    promoCode: "-",
    affiliateCode: "-",
    paidAt: "-",
    createdAt: "10 Apr 2026 16:45",
  },
];

const initialSoal = [
  {
    id: "soal-1",
    ptn: "SIMAK UI",
    mapel: "Matematika Dasar",
    tingkat: "Sulit",
    creator: "AI Generator",
    status: "review" as SoalStatus,
    date: "12 Mei 2026",
    prompt: "Persamaan kuadrat dengan akar rasional",
    question: "Jika x^2 - 5x + 6 = 0, maka jumlah akar-akarnya adalah ...",
    answer: "5",
    reviewNote: "",
  },
  {
    id: "soal-2",
    ptn: "SM-ITB",
    mapel: "Penalaran Logis",
    tingkat: "Sedang",
    creator: "AI Generator",
    status: "review" as SoalStatus,
    date: "12 Mei 2026",
    prompt: "Silogisme himpunan",
    question: "Semua peserta tryout belajar. Sebagian yang belajar lulus. Kesimpulan paling aman adalah ...",
    answer: "Sebagian yang belajar lulus",
    reviewNote: "",
  },
  {
    id: "soal-3",
    ptn: "UM UGM",
    mapel: "Bahasa Inggris",
    tingkat: "Mudah",
    creator: "Admin Rina",
    status: "active" as SoalStatus,
    date: "10 Mei 2026",
    prompt: "Main idea paragraph",
    question: "What is the main idea of the passage?",
    answer: "The passage discusses the impact of study planning.",
    reviewNote: "Sudah lolos QA.",
  },
];

const initialPromos = [
  { id: "promo-1", code: "HEMATUM", type: "Diskon nominal", value: "Rp 10.000", limit: 500, used: 84, expires: "30 Jun 2026", status: "active" },
  { id: "promo-2", code: "TRYOUT25", type: "Diskon persen", value: "25%", limit: 300, used: 122, expires: "20 Mei 2026", status: "active" },
];

const initialAffiliates = [
  { id: "aff-1", code: "PARTNER01", name: "Kak Rina Edu", commission: "15%", clicks: 1240, conversions: 38, revenue: "Rp 1.420.000", status: "active" },
  { id: "aff-2", code: "KAKRINA", name: "Rina Wijaya", commission: "10%", clicks: 580, conversions: 12, revenue: "Rp 348.000", status: "active" },
];

const adminPtn = [
  { id: "ptn-1", nama: "Institut Teknologi Bandung", kota: "Bandung", activeDeadline: "10 Jun 2026" },
  { id: "ptn-2", nama: "Universitas Indonesia", kota: "Depok", activeDeadline: "20 Jun 2026" },
  { id: "ptn-3", nama: "Universitas Gadjah Mada", kota: "Yogyakarta", activeDeadline: "15 Jun 2026" },
  { id: "ptn-4", nama: "Universitas Padjadjaran", kota: "Sumedang", activeDeadline: "25 Mei 2026" },
];

const adminBroadcasts = [
  { id: "bc-1", title: "Pendaftaran SIMAK UI Dibuka", target: "Semua User", date: "01 Jun 2026" },
  { id: "bc-2", title: "Promo Flash Sale 50%", target: "User Free", date: "10 Mei 2026" },
];

const landingSections = [
  { id: "hero", name: "Hero landing", status: "published", updatedAt: "15 Mei 2026", owner: "Marketing" },
  { id: "features", name: "Section fitur", status: "published", updatedAt: "14 Mei 2026", owner: "Product" },
  { id: "pricing", name: "CTA harga", status: "published", updatedAt: "14 Mei 2026", owner: "Growth" },
];

const blogPosts = [
  { id: "blog-1", title: "Strategi 14 hari mengejar Ujian Mandiri", category: "Strategi belajar", status: "published", updatedAt: "13 Mei 2026" },
  { id: "blog-2", title: "Kenapa soal mandiri terasa beda dari SNBT?", category: "Analisis soal", status: "published", updatedAt: "12 Mei 2026" },
  { id: "blog-3", title: "Checklist sebelum daftar jalur mandiri PTN", category: "Info PTN", status: "draft", updatedAt: "10 Mei 2026" },
];

const ADMIN_NAV: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "billing", label: "Transaksi & Billing", icon: CreditCard },
  { id: "promo", label: "Promo & Affiliate", icon: BadgePercent },
  { id: "users", label: "Data Pengguna", icon: Users },
  { id: "soal", label: "Review Soal", icon: Database },
  { id: "crm", label: "CRM Omni", icon: MessageSquare },
  { id: "content", label: "Konten Website", icon: Newspaper },
  { id: "blog", label: "Blog & SEO", icon: FileText },
  { id: "ptn", label: "Manajemen PTN", icon: GraduationCap },
  { id: "broadcast", label: "Broadcast Notif", icon: Megaphone },
  { id: "settings", label: "Admin Settings", icon: Settings },
];

export default function AdminPortal({ initialData = {} }: { initialData?: Partial<AdminPortalData> }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const users = initialData.users?.length ? initialData.users : adminUsers;
  const landingContent = initialData.landingSections?.length ? initialData.landingSections : landingSections;
  const blogContent = initialData.blogPosts?.length ? initialData.blogPosts : blogPosts;
  const initialCrmConversations = initialData.crmConversations ?? [];
  const [transactions, setTransactions] = useState(initialData.transactions?.length ? initialData.transactions : initialTransactions);
  const [crmConversations, setCrmConversations] = useState(initialCrmConversations);
  const [selectedCrmId, setSelectedCrmId] = useState(initialCrmConversations[0]?.id ?? "");
  const [selectedTransactionId, setSelectedTransactionId] = useState((initialData.transactions?.[0] ?? initialTransactions[0])?.id ?? "");
  const [selectedUserId, setSelectedUserId] = useState((initialData.users?.[0] ?? adminUsers[0])?.id ?? "");
  const [soalData, setSoalData] = useState(initialSoal);
  const [selectedSoalId, setSelectedSoalId] = useState(initialSoal[0]?.id ?? "");
  const [promos, setPromos] = useState(initialData.promos?.length ? initialData.promos : initialPromos);
  const [affiliates, setAffiliates] = useState(initialData.affiliates?.length ? initialData.affiliates : initialAffiliates);
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

  const selectedTransaction = transactions.find((trx) => trx.id === selectedTransactionId) ?? transactions[0];
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const selectedSoal = soalData.find((soal) => soal.id === selectedSoalId) ?? soalData[0];
  const paidCount = transactions.filter((trx) => trx.status === "paid").length;
  const pendingCount = transactions.filter((trx) => trx.status === "pending").length;
  const pendingSoal = soalData.filter((soal) => soal.status === "review").length;
  const selectedCrmConversation = crmConversations.find((conversation) => conversation.id === selectedCrmId) ?? crmConversations[0];

  const filteredUserTransactions = useMemo(
    () => transactions.filter((trx) => trx.userId === selectedUser?.id),
    [selectedUser, transactions],
  );

  const approveSoal = async (id: string) => {
    setSoalData((prev) => prev.map((soal) => (soal.id === id ? { ...soal, status: "active", reviewNote: "Approved admin" } : soal)));
    await updateQuestionStatusAction(id, "published");
  };

  const rejectSoal = async (id: string) => {
    setSoalData((prev) => prev.map((soal) => (soal.id === id ? { ...soal, status: "rejected", reviewNote: "Perlu revisi konten" } : soal)));
    await updateQuestionStatusAction(id, "rejected");
  };

  const syncTransaction = async (id: string) => {
    const orderId = transactions.find((trx) => trx.id === id)?.orderId;
    setTransactions((prev) => prev.map((trx) => (trx.id === id && trx.status === "pending" ? { ...trx, status: "paid", paidAt: "Baru saja" } : trx)));
    if (orderId) await syncPaymentTransactionAction(orderId);
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
        <AdminHeader onOpenMobile={() => setIsMobileSidebarOpen(true)} onOpenSettings={() => setActiveTab("settings")} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "dashboard" && (
            <DashboardView
              paidCount={paidCount}
              pendingCount={pendingCount}
              pendingSoal={pendingSoal}
              onOpenBilling={() => setActiveTab("billing")}
              onOpenReview={() => setActiveTab("soal")}
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
            />
          )}
          {activeTab === "soal" && (
            <ReviewSoalView
              soalData={soalData}
              selectedSoal={selectedSoal}
              onSelectSoal={setSelectedSoalId}
              onApprove={approveSoal}
              onReject={rejectSoal}
            />
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
          {activeTab === "blog" && <BlogSeoView blogPosts={blogContent} />}
          {activeTab === "ptn" && <PtnView />}
          {activeTab === "broadcast" && <BroadcastView />}
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

function AdminHeader({ onOpenMobile, onOpenSettings }: { onOpenMobile: () => void; onOpenSettings: () => void }) {
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
  pendingSoal,
  onOpenBilling,
  onOpenReview,
}: {
  paidCount: number;
  pendingCount: number;
  pendingSoal: number;
  onOpenBilling: () => void;
  onOpenReview: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard Overview"
        description={`Ringkasan operasional ${site.fullName} hari ini.`}
        action={<button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50">Export Report</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Total pengguna" value="15.420" tone="blue" helper="+12%" />
        <MetricCard icon={TrendingUp} label="Active subscriptions" value="1.250" tone="emerald" helper="+5%" />
        <MetricCard icon={ReceiptText} label="Transaksi paid / pending" value={`${paidCount} / ${pendingCount}`} tone="amber" helper="Live billing" />
        <MetricCard icon={Database} label="Soal pending review" value={String(pendingSoal)} tone="rose" helper="Butuh aksi" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black text-slate-800">Prioritas Hari Ini</h2>
            <button onClick={onOpenReview} className="text-sm font-black text-blue-600 hover:underline">
              Buka review
            </button>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <ActionPanel icon={CreditCard} title="Sinkron pembayaran pending" body="Cek order yang belum final dan aktifkan paket setelah status paid." onClick={onOpenBilling} />
            <ActionPanel icon={BadgePercent} title="Pantau promo dan affiliate" body="Validasi kode promo aktif dan konversi partner berjalan." onClick={onOpenBilling} />
            <ActionPanel icon={Database} title="Review soal AI" body="Approve soal yang sudah valid atau reject dengan catatan revisi." onClick={onOpenReview} />
            <ActionPanel icon={Users} title="Cek user baru" body="Lihat target belajar, paket, dan aktivitas tryout user terbaru." onClick={onOpenBilling} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-black text-slate-800">Aktivitas terkini</h2>
          </div>
          <div className="space-y-5 p-5">
            <ActivityDot color="bg-blue-500" title="Budi Santoso upgrade ke Paket Pro" time="2 menit lalu" />
            <ActivityDot color="bg-amber-500" title="System generate 50 soal SIMAK UI" time="15 menit lalu" />
            <ActivityDot color="bg-emerald-500" title="Admin Rina menambahkan PTN baru" time="1 jam lalu" />
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
  transactions: typeof initialTransactions;
  selectedTransaction: (typeof initialTransactions)[number];
  onSelectTransaction: (id: string) => void;
  onSyncTransaction: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Transaksi & Billing"
        description="Pantau order ID, status pembayaran, promo, affiliate, dan aktivasi paket."
        action={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Filter size={16} /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <FileText size={16} /> Export CSV
            </button>
          </div>
        }
      />

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
            {transactions.map((trx) => (
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
                    <button onClick={() => onSyncTransaction(trx.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">
                      Sinkron
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
            onClick={() => onSyncTransaction(selectedTransaction.id)}
            className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            Sinkron status pembayaran
          </button>
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
  promos: typeof initialPromos;
  affiliates: typeof initialAffiliates;
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
}: {
  users: typeof adminUsers;
  selectedUser: (typeof adminUsers)[number];
  userTransactions: typeof initialTransactions;
  onSelectUser: (id: string) => void;
  onOpenBilling: () => void;
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
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">User detail</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{selectedUser.name}</h2>
          <p className="text-sm font-semibold text-slate-500">{selectedUser.email}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Paket" value={selectedUser.tier.toUpperCase()} />
            <MiniStat label="Skor rata-rata" value={String(selectedUser.avgScore)} />
            <MiniStat label="Tryout" value={`${selectedUser.tryouts}x`} />
            <MiniStat label="Terakhir aktif" value={selectedUser.lastSeen} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
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
        </aside>
      </div>
    </div>
  );
}

function ReviewSoalView({
  soalData,
  selectedSoal,
  onSelectSoal,
  onApprove,
  onReject,
}: {
  soalData: typeof initialSoal;
  selectedSoal: (typeof initialSoal)[number];
  onSelectSoal: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle title="Review Soal" description="Buka detail soal, baca jawaban, lalu approve atau reject dengan status yang jelas." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <TableCard>
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <Th>PTN & mapel</Th>
              <Th>Tingkat</Th>
              <Th>Sumber</Th>
              <Th>Status</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {soalData.map((soal) => (
              <tr key={soal.id} className="hover:bg-slate-50">
                <Td>
                  <button onClick={() => onSelectSoal(soal.id)} className="text-left font-black text-slate-800 hover:text-blue-700">{soal.ptn}</button>
                  <p className="text-xs text-slate-500">{soal.mapel}</p>
                </Td>
                <Td>{soal.tingkat}</Td>
                <Td>{soal.creator}</Td>
                <Td><SoalStatusBadge status={soal.status} /></Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => onSelectSoal(soal.id)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600"><Eye size={15} /></button>
                    {soal.status === "review" && <button onClick={() => onApprove(soal.id)} className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Check size={15} /></button>}
                    {soal.status === "review" && <button onClick={() => onReject(soal.id)} className="rounded-lg bg-rose-50 p-2 text-rose-600"><X size={15} /></button>}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">Preview soal</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{selectedSoal.ptn} - {selectedSoal.mapel}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{selectedSoal.prompt}</p>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Pertanyaan</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-800">{selectedSoal.question}</p>
          </div>
          <div className="mt-3 rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Jawaban</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-blue-950">{selectedSoal.answer}</p>
          </div>
          <textarea
            defaultValue={selectedSoal.reviewNote}
            rows={3}
            placeholder="Catatan review..."
            className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => onApprove(selectedSoal.id)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">
              Approve
            </button>
            <button onClick={() => onReject(selectedSoal.id)} className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700">
              Reject
            </button>
          </div>
        </aside>
      </div>
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
  const [badge, setBadge] = useState("Khusus pejuang Ujian Mandiri PTN 2026");
  const [headline, setHeadline] = useState(`${site.promise.split(",")[0]}, masa depan pasti cerah.`);
  const [subheadline, setSubheadline] = useState(
    `${site.name} bantu kamu latihan dengan pola soal mandiri PTN, paham pembahasan lebih cepat, dan tidak ketinggalan deadline kampus impian.`,
  );
  const [cta, setCta] = useState("Mulai gratis sekarang");
  const [contentMessage, setContentMessage] = useState("");
  const [isSavingContent, setIsSavingContent] = useState(false);

  const saveLandingHero = async () => {
    setIsSavingContent(true);
    const result = await saveLandingHeroAction({ badge, headline, subheadline, cta });
    setContentMessage(result.ok ? "Landing page tersimpan dan siap tampil publik." : (result.message ?? "Gagal menyimpan landing."));
    setIsSavingContent(false);
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
            {contentMessage && <p className="text-sm font-bold text-slate-600">{contentMessage}</p>}
          </div>
        </section>

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

function BlogSeoView({ blogPosts }: { blogPosts: AdminPortalData["blogPosts"] }) {
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Tips belajar");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [blogMessage, setBlogMessage] = useState("");
  const [isSavingBlog, setIsSavingBlog] = useState(false);

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
            <div key={post.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-900">{post.title}</p>
                <p className="text-sm font-semibold text-slate-500">
                  {post.category} - update {post.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ContentStatusBadge status={post.status} />
                <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600">
                  <Edit3 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PtnView() {
  return (
    <div className="space-y-6">
      <PageTitle title="Manajemen PTN & Deadline" description="Atur data universitas dan jadwal pendaftaran Ujian Mandiri." action={<button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"><Plus size={16} /> Tambah PTN</button>} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {adminPtn.map((ptn) => (
          <article key={ptn.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400">
              <GraduationCap size={24} />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-800">{ptn.nama}</h2>
            <p className="text-sm font-semibold text-slate-500">{ptn.kota}</p>
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-blue-500">Deadline aktif terdekat</p>
              <p className="mt-1 text-sm font-black text-blue-800">{ptn.activeDeadline}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function BroadcastView() {
  return (
    <div className="space-y-6">
      <PageTitle title="Broadcast Notifikasi" description="Kirim pengumuman, pengingat deadline PTN, atau promo ke pengguna." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-black text-slate-800"><Megaphone className="text-blue-600" size={20} /> Buat pesan baru</h2>
          <form className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
            <Field label="Target penerima"><select className="field"><option>Semua Pengguna</option><option>Pengguna Free</option><option>Pengguna Belajar & Pro</option></select></Field>
            <Field label="Judul notifikasi"><input className="field" placeholder="Pendaftaran UI Dibuka" /></Field>
            <Field label="Isi pesan"><textarea className="field min-h-28 resize-none" placeholder="Tulis pesan lengkap..." /></Field>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700"><Send size={16} /> Kirim broadcast</button>
          </form>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-5"><h2 className="font-black text-slate-800">Riwayat pengiriman</h2></div>
          <div className="divide-y divide-slate-100">
            {adminBroadcasts.map((bc) => (
              <div key={bc.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-slate-800">{bc.title}</h3>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Sent</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">Target: {bc.target} - {bc.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <PageTitle title="Admin Settings" description="Kelola profil admin, hak akses, dan konfigurasi dasar operasional." />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><UserCog size={20} className="text-blue-600" /> Profil admin</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Nama admin"><input className="field" defaultValue="Super Admin" /></Field>
            <Field label="Email admin"><input className="field" defaultValue={whiteLabel.auth.adminEmail} /></Field>
            <Field label="Role"><input className="field" defaultValue="Super Admin" readOnly /></Field>
            <Field label="Session"><input className="field" defaultValue="7 hari" readOnly /></Field>
          </div>
          <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Simpan perubahan</button>
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

function ActivityDot({ color, title, time }: { color: string; title: string; time: string }) {
  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} />
      <div>
        <p className="text-sm font-bold leading-tight text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{time}</p>
      </div>
    </div>
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

function SoalStatusBadge({ status }: { status: SoalStatus }) {
  const className = status === "active" ? "bg-emerald-100 text-emerald-700" : status === "review" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  return <span className={`rounded-md px-2.5 py-1 text-[11px] font-black uppercase ${className}`}>{status}</span>;
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
