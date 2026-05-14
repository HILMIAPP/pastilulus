"use client";

import { StudentMobileNav } from "@/components/student-mobile-nav";
import { StudentSidebar } from "@/components/student-sidebar";
import type { AppSession } from "@/lib/session-codec";
import { usePathname } from "next/navigation";

export function StudentShell({
  session,
  children,
}: {
  session: AppSession | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isExamRoom = /^\/siswa\/tryout\/[^/]+/.test(pathname);

  if (isExamRoom) {
    return <div className="min-h-screen bg-slate-100 font-sans text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 md:flex">
      <StudentSidebar session={session} />
      <div className="min-w-0 flex-1 pb-24 md:pb-0">{children}</div>
      <StudentMobileNav />
    </div>
  );
}
