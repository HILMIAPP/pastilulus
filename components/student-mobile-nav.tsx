"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isStudentNavActive, studentNavItems } from "@/components/student-nav-data";

export function StudentMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-slate-200 bg-white p-2 md:hidden">
      {studentNavItems.slice(0, 4).map((item) => {
        const Icon = item.icon;
        const active = isStudentNavActive(pathname, item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-w-16 flex-col items-center rounded-lg p-2 text-[10px] font-black ${
              active ? "text-[#0A66FF]" : "text-slate-400"
            }`}
          >
            <Icon size={22} />
            <span className="mt-1">{item.label === "Simulasi Ujian" ? "Tryout" : item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

