"use client";

import { useEffect, useState } from "react";
import { promoSlides } from "@/components/student-dashboard-data";

export function StudentPromoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
      {promoSlides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-all duration-700 ${
            index === currentSlide ? "z-10 scale-100 opacity-100" : "z-0 scale-[1.02] opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <h2 className="text-xl font-black md:text-2xl">{slide.title}</h2>
            <p className="mt-2 text-sm font-semibold text-white/90 md:text-base">{slide.desc}</p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {promoSlides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Promo ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

