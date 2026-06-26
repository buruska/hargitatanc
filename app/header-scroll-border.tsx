"use client";

import { useEffect, useState } from "react";

export function HeaderScrollBorder() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setProgress(100);
        return;
      }

      const nextProgress = Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100));
      setProgress(nextProgress);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-thread-red" aria-hidden="true">
      <div className="h-full bg-surface-strong" style={{ width: `${progress}%` }} />
    </div>
  );
}
