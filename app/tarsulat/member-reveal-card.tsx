"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type MemberRevealCardProps = {
  children: ReactNode;
  index: number;
};

export function MemberRevealCard({ children, index }: MemberRevealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const staggerIndex = index % 4;

  useEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.18,
      },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="member-card-reveal w-full max-w-[420px] justify-self-center"
      data-revealed={isRevealed}
      ref={cardRef}
      style={{ "--member-reveal-index": staggerIndex } as CSSProperties}
    >
      {children}
    </div>
  );
}
