"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function PaymentGuideSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % images.length), 3500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (!images.length) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-6 text-center text-sm font-bold text-slate-500">
        Slider foto panduan akan tampil setelah URL gambar diisi dari admin.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      <div className="relative aspect-video">
        {images.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`Panduan pembayaran ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
            sizes="(min-width: 1024px) 48vw, 100vw"
            priority={index === 0}
          />
        ))}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Lihat slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition ${index === active ? "w-7 bg-white" : "w-2 bg-white/55 hover:bg-white"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
