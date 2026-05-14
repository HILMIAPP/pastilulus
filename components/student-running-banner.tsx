import { Megaphone } from "lucide-react";

export function StudentRunningBanner() {
  return (
    <div className="rounded-xl bg-[#0D1B2A] px-4 py-3 text-xs text-white shadow-sm">
      <div className="flex items-center overflow-hidden">
        <Megaphone size={16} className="mr-3 shrink-0 text-amber-300" />
        <div className="relative flex-1 overflow-hidden whitespace-nowrap">
          <span className="dashboard-marquee inline-block min-w-full font-semibold tracking-wide">
            INFO PENTING: Pendaftaran SM-ITB ditutup dalam 7 hari. Promo terbatas: gunakan kode LOLOSPTN26.
            Tryout Akbar Nasional serentak tanggal 25 Mei 2026.
          </span>
        </div>
      </div>
    </div>
  );
}

