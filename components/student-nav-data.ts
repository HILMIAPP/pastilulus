import {
  BarChart3,
  CalendarDays,
  CalendarClock,
  FileText,
  Home,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

export const studentNavItems = [
  { href: "/siswa", label: "Dashboard", icon: Home },
  { href: "/siswa/target", label: "Target Saya", icon: Target },
  { href: "/siswa/belajar", label: "Belajar", icon: PlayCircle },
  { href: "/siswa/tryout", label: "Simulasi Ujian", icon: FileText },
  { href: "/siswa/rasionalisasi", label: "Rasionalisasi", icon: BarChart3 },
  { href: "/siswa/info-ptn", label: "Info PTN", icon: CalendarDays },
  { href: "/siswa/jadwal", label: "Jadwal", icon: CalendarClock },
  { href: "/harga", label: "Upgrade Pro", icon: Sparkles },
] as const;

export function isStudentNavActive(pathname: string, href: string) {
  if (href === "/siswa") return pathname === "/siswa";
  if (href === "/siswa/target") return pathname.startsWith("/siswa/target");
  if (href === "/siswa/belajar") return pathname.startsWith("/siswa/belajar");
  if (href === "/siswa/tryout") return pathname.startsWith("/siswa/tryout");
  if (href === "/siswa/rasionalisasi") return pathname.startsWith("/siswa/rasionalisasi");
  if (href === "/siswa/info-ptn") return pathname.startsWith("/siswa/info-ptn");
  if (href === "/siswa/jadwal") return pathname.startsWith("/siswa/jadwal");
  if (href === "/harga") return pathname === "/harga";
  return false;
}
