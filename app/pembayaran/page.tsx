import { Suspense } from "react";
import { PaymentCheckout } from "@/components/payment-checkout";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Pembayaran",
};

export default function PembayaranPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto w-full max-w-6xl flex-1 px-4 py-14">Memuat checkout...</div>}>
        <PaymentCheckout />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
