"use client";

import React, { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { billingPlans } from "@/lib/billing";
import { site, whiteLabel } from "@/lib/site-config";
import { 
  LayoutDashboard, Users, Database, GraduationCap, 
  Search, Bell, Settings, LogOut, CheckCircle, 
  XCircle, Eye, Edit, Trash2, TrendingUp, AlertCircle,
  Menu, X, Filter, Plus, FileText, Check,
  CreditCard, Megaphone, Send, Clock
} from "lucide-react";

// --- MOCK DATA BERDASARKAN ERD & SQL SCHEMA ---

const adminStats = {
  totalUsers: 15420,
  activeSubs: 1250,
  mrr: "Rp 42.500.000",
  pendingSoal: 34
};

const adminUsers = [
  { id: 'usr-1', name: 'Budi Santoso', email: 'budi@siswa.com', tier: 'pro', joined: '12 Mei 2026', status: 'active' },
  { id: 'usr-2', name: 'Siti Aminah', email: 'siti.a@siswa.com', tier: 'belajar', joined: '10 Mei 2026', status: 'active' },
  { id: 'usr-3', name: 'Andi Saputra', email: 'andisap@gmail.com', tier: 'free', joined: '09 Mei 2026', status: 'active' },
  { id: 'usr-4', name: 'Rina Wijaya', email: 'rinawjy@yahoo.com', tier: 'pro', joined: '05 Mei 2026', status: 'active' },
  { id: 'usr-5', name: 'Gilang Ramadhan', email: 'gilang.r@siswa.com', tier: 'free', joined: '01 Mei 2026', status: 'active' },
];

const adminSoal = [
  { id: 'soal-1', ptn: 'SIMAK UI', mapel: 'Matematika Dasar', tingkat: 'Sulit', creator: 'AI (Claude Haiku)', status: 'review', date: '12 Mei 2026' },
  { id: 'soal-2', ptn: 'SM-ITB', mapel: 'Penalaran Logis', tingkat: 'Sedang', creator: 'AI (Claude Haiku)', status: 'review', date: '12 Mei 2026' },
  { id: 'soal-3', ptn: 'UM UGM', mapel: 'Bahasa Inggris', tingkat: 'Mudah', creator: 'Admin Rina', status: 'active', date: '10 Mei 2026' },
  { id: 'soal-4', ptn: 'SMUP UNPAD', mapel: 'Fisika', tingkat: 'Sulit', creator: 'AI (Claude Haiku)', status: 'active', date: '08 Mei 2026' },
  { id: 'soal-5', ptn: 'SIMAK UI', mapel: 'Biologi', tingkat: 'Sedang', creator: 'AI (Claude Haiku)', status: 'rejected', date: '05 Mei 2026' },
];

const adminPtn = [
  { id: 'ptn-1', nama: 'Institut Teknologi Bandung', kota: 'Bandung', hasMandiri: true, activeDeadline: '10 Jun 2026' },
  { id: 'ptn-2', nama: 'Universitas Indonesia', kota: 'Depok', hasMandiri: true, activeDeadline: '20 Jun 2026' },
  { id: 'ptn-3', nama: 'Universitas Gadjah Mada', kota: 'Yogyakarta', hasMandiri: true, activeDeadline: '15 Jun 2026' },
  { id: 'ptn-4', nama: 'Universitas Padjadjaran', kota: 'Sumedang', hasMandiri: true, activeDeadline: '25 Mei 2026' },
];

const adminBilling = [
  { id: 'sub-1', user: 'Budi Santoso', plan: 'Pro', amount: billingPlans[1].priceLabel, status: 'active', orderId: 'MID-001', date: '12 Mei 2026 14:30' },
  { id: 'sub-2', user: 'Siti Aminah', plan: 'Belajar', amount: billingPlans[0].priceLabel, status: 'pending', orderId: 'MID-002', date: '12 Mei 2026 10:15' },
  { id: 'sub-3', user: 'Rina Wijaya', plan: 'Pro', amount: billingPlans[1].priceLabel, status: 'active', orderId: 'MID-003', date: '05 Mei 2026 09:00' },
  { id: 'sub-4', user: 'Andi Saputra', plan: 'Belajar', amount: billingPlans[0].priceLabel, status: 'expired', orderId: 'MID-004', date: '10 Apr 2026 16:45' },
];

const adminBroadcasts = [
  { id: 'bc-1', title: 'Pendaftaran SIMAK UI Dibuka!', target: 'Semua User', status: 'sent', date: '01 Jun 2026' },
  { id: 'bc-2', title: 'Promo Flash Sale 50%', target: 'User Free', status: 'sent', date: '10 Mei 2026' },
];

type SoalRow = (typeof adminSoal)[number];
type SoalStatus = SoalRow["status"];

const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Data Pengguna", icon: Users },
  { id: "soal", label: "Bank Soal AI", icon: Database },
  { id: "ptn", label: "Manajemen PTN", icon: GraduationCap },
  { id: "billing", label: "Transaksi & Billing", icon: CreditCard },
  { id: "broadcast", label: "Broadcast Notif", icon: Megaphone },
] as const;

function AdminSidebar({
  activeTab,
  isMobileOpen,
  onCloseMobile,
  onSelectTab,
}: {
  activeTab: string;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectTab: (id: string) => void;
}) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform bg-slate-900 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="sr-only">Admin Portal</span>
        </div>
        <button type="button" className="text-slate-400 hover:text-white md:hidden" onClick={onCloseMobile}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="mb-2 mt-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Menu Utama</div>
        {ADMIN_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === item.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? "text-white" : "text-slate-400"} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">AD</div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">Super Admin</p>
            <p className="truncate text-xs text-slate-400">{whiteLabel.auth.adminEmail}</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-slate-800"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}

function AdminHeader({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button type="button" className="text-slate-500 hover:text-slate-800 md:hidden" onClick={onOpenMobile}>
          <Menu size={24} />
        </button>
        <div className="relative hidden w-64 md:flex">
          <input
            type="search"
            placeholder="Cari user, soal, ptn..."
            className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="relative text-slate-500 transition-colors hover:text-slate-800">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
        </button>
        <button type="button" className="text-slate-500 transition-colors hover:text-slate-800">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [soalData, setSoalData] = useState<SoalRow[]>(adminSoal);

  const handleApproveSoal = (id: string) => {
    setSoalData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active" as SoalStatus } : s))
    );
  };

  const handleRejectSoal = (id: string) => {
    setSoalData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as SoalStatus } : s))
    );
  };

  // --- KONTEN TABS ---

  const renderDashboard = () => (
    <div className="space-y-6 fade-section">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Ringkasan performa {site.fullName} hari ini.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
          <FileText size={16} /> Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={20}/></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Total Pengguna</p>
          <h3 className="text-2xl font-black text-slate-800">{adminStats.totalUsers.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><TrendingUp size={20}/></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Active Subscriptions</p>
          <h3 className="text-2xl font-black text-slate-800">{adminStats.activeSubs.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Database size={20}/></div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Butuh Aksi</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Soal AI Pending Review</p>
          <h3 className="text-2xl font-black text-slate-800">{adminStats.pendingSoal}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center"><FileText size={20}/></div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Est. MRR Bulan Ini</p>
          <h3 className="text-2xl font-black">{adminStats.mrr}</h3>
        </div>
      </div>

      {/* Dua Kolom Bawah */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Soal Perlu Review */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Kurasi Soal AI Terbaru</h3>
            <button onClick={() => setActiveTab('soal')} className="text-sm font-medium text-blue-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-100">
            {soalData.filter(s => s.status === 'review').slice(0,3).map(soal => (
              <div key={soal.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0"><AlertCircle size={18}/></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{soal.ptn} - {soal.mapel}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{soal.tingkat}</span>
                    </div>
                    <p className="text-xs text-slate-500">Generated by {soal.creator} • {soal.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveSoal(soal.id)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100" title="Setujui"><Check size={16}/></button>
                  <button onClick={() => handleRejectSoal(soal.id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100" title="Tolak"><X size={16}/></button>
                </div>
              </div>
            ))}
            {soalData.filter(s => s.status === 'review').length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">Tidak ada soal yang perlu di-review.</div>
            )}
          </div>
        </div>

        {/* Notifikasi / Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Aktivitas Terkini</h3>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
              <div><p className="text-sm font-medium text-slate-800 leading-tight">Budi Santoso upgrade ke Paket Pro</p><p className="text-xs text-slate-500 mt-0.5">2 menit lalu</p></div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
              <div><p className="text-sm font-medium text-slate-800 leading-tight">System mengenerate 50 soal SIMAK UI</p><p className="text-xs text-slate-500 mt-0.5">15 menit lalu</p></div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0"></div>
              <div><p className="text-sm font-medium text-slate-800 leading-tight">Admin Rina menambahkan PTN baru</p><p className="text-xs text-slate-500 mt-0.5">1 jam lalu</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSoal = () => (
    <div className="space-y-6 fade-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bank Soal AI</h2>
          <p className="text-slate-500 text-sm mt-1">Review dan kelola soal hasil generate LLM sebelum di-publish ke user.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
            <Plus size={16} /> Generate Soal Baru
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-bold">PTN & Mapel</th>
                <th className="p-4 font-bold">Tingkat</th>
                <th className="p-4 font-bold">Sumber</th>
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {soalData.map((soal) => (
                <tr key={soal.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{soal.ptn}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{soal.mapel}</p>
                  </td>
                  <td className="p-4 text-slate-600">{soal.tingkat}</td>
                  <td className="p-4 text-slate-600">{soal.creator}</td>
                  <td className="p-4 text-slate-600">{soal.date}</td>
                  <td className="p-4">
                    {soal.status === 'active' && <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase">Active</span>}
                    {soal.status === 'review' && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase">Need Review</span>}
                    {soal.status === 'rejected' && <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase">Rejected</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded shadow-sm border border-slate-200" title="Preview"><Eye size={14}/></button>
                      {soal.status === 'review' && (
                        <>
                          <button onClick={() => handleApproveSoal(soal.id)} className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-100" title="Approve"><Check size={14}/></button>
                          <button onClick={() => handleRejectSoal(soal.id)} className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-100" title="Reject"><X size={14}/></button>
                        </>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded shadow-sm border border-slate-200" title="Delete"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 fade-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-slate-500 text-sm mt-1">Daftar semua siswa terdaftar beserta status tier langganannya.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input type="text" placeholder="Cari email / nama..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-bold">Nama & Email</th>
                <th className="p-4 font-bold">Paket Langganan</th>
                <th className="p-4 font-bold">Tgl Bergabung</th>
                <th className="p-4 font-bold text-center">Status Akun</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                  </td>
                  <td className="p-4">
                    {u.tier === 'pro' && <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border border-amber-200">Pro</span>}
                    {u.tier === 'belajar' && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border border-blue-200">Belajar</span>}
                    {u.tier === 'free' && <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border border-slate-200">Free</span>}
                  </td>
                  <td className="p-4 text-slate-600">{u.joined}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Edit size={16}/></button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Banned"><XCircle size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPtn = () => (
    <div className="space-y-6 fade-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen PTN & Deadline</h2>
          <p className="text-slate-500 text-sm mt-1">Atur data universitas dan jadwal pendaftaran Ujian Mandiri.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
          <Plus size={16} /> Tambah PTN
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminPtn.map(ptn => (
          <div key={ptn.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <GraduationCap size={24}/>
               </div>
               <div className="flex gap-1">
                 <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded"><Edit size={14}/></button>
               </div>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{ptn.nama}</h3>
            <p className="text-slate-500 text-sm mb-4">{ptn.kota}</p>
            
            <div className="mt-auto p-3 bg-blue-50 rounded-xl border border-blue-100">
               <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Deadline Aktif Terdekat</p>
               <p className="font-bold text-blue-800 text-sm">{ptn.activeDeadline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6 fade-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transaksi & Billing</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau status pembayaran langganan Midtrans dari seluruh user.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filter Status
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <FileText size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-bold">Order ID & Waktu</th>
                <th className="p-4 font-bold">Pengguna</th>
                <th className="p-4 font-bold">Paket</th>
                <th className="p-4 font-bold">Nominal</th>
                <th className="p-4 font-bold">Status Pembayaran</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminBilling.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{trx.orderId}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{trx.date}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{trx.user}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{trx.plan}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{trx.amount}</td>
                  <td className="p-4">
                    {trx.status === 'active' && <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border border-emerald-100"><CheckCircle size={12}/> Success</span>}
                    {trx.status === 'pending' && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border border-amber-100"><Clock size={12}/> Pending</span>}
                    {trx.status === 'expired' && <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border border-slate-200"><XCircle size={12}/> Expired</span>}
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Cek Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className="space-y-6 fade-section">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Broadcast Notifikasi</h2>
        <p className="text-slate-500 text-sm mt-1">Kirim pengumuman, pengingat deadline PTN, atau promo ke pengguna.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Kirim Broadcast */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Megaphone className="text-blue-600" size={20} /> Buat Pesan Baru
          </h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Penerima</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Semua Pengguna</option>
                <option>Pengguna Free (Belum Berlangganan)</option>
                <option>Pengguna Belajar & Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Notifikasi</label>
              <input type="text" placeholder="Contoh: Pendaftaran UI Dibuka!" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Isi Pesan</label>
              <textarea rows={4} placeholder="Tulis pesan lengkap di sini..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 transition-colors">
              <Send size={16} /> Kirim Broadcast Sekarang
            </button>
          </form>
        </div>

        {/* Riwayat Broadcast */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Riwayat Pengiriman</h3>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {adminBroadcasts.map(bc => (
              <div key={bc.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{bc.title}</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Sent</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> Target: {bc.target}</span>
                  <span>{bc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar
        activeTab={activeTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectTab={setActiveTab}
      />
      {/* Overlay mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader onOpenMobile={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'soal' && renderSoal()}
          {activeTab === 'ptn' && renderPtn()}
          {activeTab === 'billing' && renderBilling()}
          {activeTab === 'broadcast' && renderBroadcast()}
        </main>
      </div>
    </div>
  );
}
