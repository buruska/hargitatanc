"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type HomeRevealGroupProps = {
  children: ReactNode;
  className?: string;
};

export function HomeRevealGroup({ children, className = "" }: HomeRevealGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={className} data-revealed={isRevealed} ref={containerRef}>
      {children}
    </div>
  );
}
