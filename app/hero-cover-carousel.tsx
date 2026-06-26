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
};

export function HeroCoverCarousel({ covers }: HeroCoverCarouselProps) {
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
    <div className="relative h-screen w-full overflow-hidden">
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
    </div>
  );
}
