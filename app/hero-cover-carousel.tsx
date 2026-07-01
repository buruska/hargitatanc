"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroCover = {
  id: string;
  title: string;
  coverImageUrl: string;
};

type HeroCoverCarouselProps = {
  covers: HeroCover[];
  className?: string;
  showTitleList?: boolean;
};

export function HeroCoverCarousel({
  covers,
  className = "relative h-screen w-full overflow-hidden",
  showTitleList = false,
}: HeroCoverCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (covers.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % covers.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [covers.length]);

  if (covers.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {covers.map((cover, index) => (
        <Image
          alt={cover.title}
          className={`object-cover object-top transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          fill
          key={cover.id}
          priority={index === 0}
          sizes="100vw"
          src={cover.coverImageUrl}
        />
      ))}
      {showTitleList ? (
        <aside className="absolute right-[clamp(18px,4vw,56px)] top-[128px] z-[1] w-[min(360px,calc(100vw-36px))] bg-charcoal/80 p-5 text-surface-strong shadow-[8px_8px_0_rgb(33_31_27_/_24%)] backdrop-blur-sm">
          <h2 className="mb-6 font-serif text-[24px] leading-none tracking-[0.035em]">Futó előadások:</h2>
          <div className="grid gap-2">
            {covers.map((cover, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  className={`border-l-2 px-3 py-2 text-left font-serif text-[18px] leading-tight tracking-[0.025em] transition duration-200 ${
                    isActive
                      ? "border-thread-red bg-white/12 text-surface-strong"
                      : "border-white/25 text-surface-strong/72 hover:border-thread-red hover:text-surface-strong"
                  }`}
                  key={cover.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                >
                  {cover.title}
                </button>
              );
            })}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
