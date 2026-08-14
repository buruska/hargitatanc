"use client";

import { useEffect, useState } from "react";

export function HeaderScrollBorder() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrame = 0;

    function updateProgress() {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const scrollableHeight = scrollingElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setProgress(0);
        return;
      }

      const nextProgress = Math.min(100, Math.max(0, (scrollingElement.scrollTop / scrollableHeight) * 100));
      setProgress(nextProgress);
    }

    function scheduleUpdate() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateProgress);
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.documentElement);

    scheduleUpdate();
    window.addEventListener("load", scheduleUpdate);
    window.addEventListener("pageshow", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("load", scheduleUpdate);
      window.removeEventListener("pageshow", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-2 bg-white"
      aria-hidden="true"
    >
      <div
        className="h-full bg-thread-red"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
