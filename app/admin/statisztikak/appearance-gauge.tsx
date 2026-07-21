"use client";

import { useEffect, useState } from "react";

type AppearanceGaugeProps = {
  completedAppearances: number;
  completedPercentage: number;
  totalAppearances: number;
};

const radius = 138;
const circumference = 2 * Math.PI * radius;

export function AppearanceGauge({
  completedAppearances,
  completedPercentage,
  totalAppearances,
}: AppearanceGaugeProps) {
  const [displayedPercentage, setDisplayedPercentage] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || completedPercentage === 0) {
      setDisplayedPercentage(completedPercentage);
      return;
    }

    const duration = 1400;
    const startedAt = performance.now();
    let frameId = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayedPercentage(Math.round(completedPercentage * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [completedPercentage]);

  const displayedArc = (displayedPercentage / 100) * circumference;

  return (
    <div
      aria-label={`${completedPercentage} százalék, ${completedAppearances} fellépés járt le a(z) ${totalAppearances} fellépésből`}
      className="relative mt-8 aspect-square w-full max-w-[380px]"
      role="img"
    >
      <svg aria-hidden="true" className="h-full w-full -rotate-90 overflow-visible" viewBox="0 0 320 320">
        <circle className="fill-none stroke-line" cx="160" cy="160" r={radius} strokeWidth="10" />
        <circle
          className="fill-none stroke-thread-red"
          cx="160"
          cy="160"
          r={radius}
          strokeDasharray={`${displayedArc} ${circumference - displayedArc}`}
          strokeLinecap="round"
          strokeWidth="19"
        />
      </svg>

      <div className="absolute inset-[15%] flex flex-col items-center justify-center px-4">
        <p className="font-serif text-[clamp(56px,10vw,84px)] font-bold leading-none text-charcoal">
          {displayedPercentage}%
        </p>
        <p className="mt-3 text-xs font-bold text-muted min-[420px]:text-sm">
          <span className="text-thread-red">{completedAppearances} lejárt</span>
          <span aria-hidden="true"> · </span>
          {totalAppearances} összesen
        </p>
      </div>
    </div>
  );
}

type PerformanceGaugeProps = AppearanceGaugeProps & {
  title: string;
};

export function PerformanceGauge({
  completedAppearances,
  completedPercentage,
  title,
  totalAppearances,
}: PerformanceGaugeProps) {
  const [displayedPercentage, setDisplayedPercentage] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || completedPercentage === 0) {
      setDisplayedPercentage(completedPercentage);
      return;
    }

    const duration = 1200;
    const startedAt = performance.now();
    let frameId = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayedPercentage(Math.round(completedPercentage * easedProgress));

      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [completedPercentage]);

  const compactRadius = 68;
  const compactCircumference = 2 * Math.PI * compactRadius;
  const displayedArc = (displayedPercentage / 100) * compactCircumference;

  return (
    <article className="flex items-center gap-4 text-left">
      <div
        aria-label={`${title}: ${completedPercentage} százalék, ${completedAppearances} lejárt fellépés a(z) ${totalAppearances} fellépésből`}
        className="relative aspect-square w-[116px] shrink-0"
        role="img"
      >
        <svg aria-hidden="true" className="h-full w-full -rotate-90 overflow-visible" viewBox="0 0 160 160">
          <circle className="fill-none stroke-line" cx="80" cy="80" r={compactRadius} strokeWidth="6" />
          <circle
            className="fill-none stroke-thread-red"
            cx="80"
            cy="80"
            r={compactRadius}
            strokeDasharray={`${displayedArc} ${compactCircumference - displayedArc}`}
            strokeLinecap="round"
            strokeWidth="10"
          />
        </svg>
        <div className="absolute inset-[18%] flex flex-col items-center justify-center">
          <p className="font-serif text-[27px] font-bold leading-none text-charcoal">{displayedPercentage}%</p>
          <p className="mt-1.5 whitespace-nowrap text-[9px] font-bold text-muted">
            <span className="text-thread-red">{completedAppearances} lejárt</span> · {totalAppearances} összesen
          </p>
        </div>
      </div>
      <h3 className="font-serif text-lg font-bold leading-tight">{title}</h3>
    </article>
  );
}
