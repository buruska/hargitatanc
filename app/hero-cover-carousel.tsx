"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroCover = {
  id: string;
  title: string;
  coverImageUrl: string;
  summary?: string;
  events?: {
    id: string;
    location: string;
    startsAt: string;
    ticketUrl: string;
  }[];
};

type HeroEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
};

type HeroCoverCarouselProps = {
  carouselCovers?: HeroCover[];
  covers: HeroCover[];
  className?: string;
  events?: HeroEvent[];
  showTitleList?: boolean;
};

export function HeroCoverCarousel({
  carouselCovers,
  covers,
  className = "relative h-screen w-full overflow-hidden",
  events = [],
  showTitleList = false,
}: HeroCoverCarouselProps) {
  const displayedCovers = carouselCovers ?? covers;
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCover, setSelectedCover] = useState<HeroCover | null>(null);
  const activeCover = displayedCovers[activeIndex];
  const activeEventId = activeCover?.id.startsWith("event-") ? activeCover.id.replace(/^event-/, "") : null;

  useEffect(() => {
    if (!selectedCover) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedCover(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCover]);

  useEffect(() => {
    if (displayedCovers.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % displayedCovers.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [displayedCovers.length]);

  if (displayedCovers.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {displayedCovers.map((cover, index) => (
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
        <div className="absolute right-[clamp(18px,4vw,56px)] top-[128px] z-[1] grid w-[min(360px,calc(100vw-36px))] gap-4">
          <aside className="bg-charcoal/80 p-5 text-surface-strong shadow-[8px_8px_0_rgb(33_31_27_/_24%)] backdrop-blur-sm">
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
                    onClick={() => {
                      setActiveIndex(index);
                      setSelectedCover(cover);
                    }}
                  >
                    {cover.title}
                  </button>
                );
              })}
            </div>
          </aside>
          <aside className="bg-charcoal/80 p-5 text-surface-strong shadow-[8px_8px_0_rgb(33_31_27_/_24%)] backdrop-blur-sm">
            <h2 className="mb-5 font-serif text-[24px] leading-none tracking-[0.035em]">Rendezvények:</h2>
            {events.length > 0 ? (
              <div className="grid max-h-[220px] gap-2 overflow-y-auto pr-1">
                {events.map((event) => {
                  const eventCoverIndex = displayedCovers.findIndex((cover) => cover.id === `event-${event.id}`);
                  const isActive = event.id === activeEventId;

                  return (
                    <button
                      className={`border-l-2 px-3 py-2 text-left transition duration-200 ${
                        isActive ? "border-pine bg-white/12" : "border-white/25 hover:border-pine"
                      }`}
                      key={event.id}
                      type="button"
                      onClick={() => {
                        if (eventCoverIndex >= 0) {
                          setActiveIndex(eventCoverIndex);
                        }
                      }}
                    >
                      <h3 className="font-serif text-[18px] leading-tight tracking-[0.025em] text-surface-strong">
                        {event.title}
                      </h3>
                      <time className="mt-1 block text-[12px] font-extrabold uppercase tracking-[0.08em] text-surface-strong/68">
                        {new Intl.DateTimeFormat("hu-RO", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(event.startsAt))}
                      </time>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="border-l-2 border-white/25 px-3 py-2 text-[14px] font-bold text-surface-strong/68">
                Jelenleg nincs meghirdetett rendezvény.
              </p>
            )}
          </aside>
        </div>
      ) : null}
      {selectedCover ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-charcoal/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          onMouseDown={() => setSelectedCover(null)}
        >
          <div
            className="max-h-[min(720px,calc(100vh-64px))] w-[min(720px,100%)] overflow-y-auto border border-line-strong bg-surface-strong p-6 text-charcoal shadow-[12px_12px_0_rgb(33_31_27_/_20%)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-5 border-b border-line pb-5">
              <h2 className="font-serif text-[clamp(28px,4vw,44px)] font-bold leading-tight">
                {selectedCover.title}
              </h2>
              <button
                aria-label="Modal bezárása"
                className="grid size-9 shrink-0 place-items-center border border-line bg-surface text-[20px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                type="button"
                onClick={() => setSelectedCover(null)}
              >
                ×
              </button>
            </div>

            <div className="grid gap-3">
              {(selectedCover.events?.length ?? 0) > 0 ? (
                selectedCover.events?.map((event) => (
                  <div
                    className="grid gap-3 border border-line bg-surface px-4 py-3 min-[620px]:grid-cols-[1fr_auto] min-[620px]:items-center"
                    key={event.id}
                  >
                    <div className="grid gap-1">
                      <time className="text-[14px] font-extrabold text-thread-red">
                        {new Intl.DateTimeFormat("hu-RO", {
                          dateStyle: "full",
                          timeStyle: "short",
                        }).format(new Date(event.startsAt))}
                      </time>
                      <span className="text-[13px] font-bold text-muted">{event.location}</span>
                    </div>
                    {event.ticketUrl ? (
                      <a
                        className="inline-flex items-center justify-center bg-thread-red px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-surface-strong transition hover:bg-charcoal"
                        href={event.ticketUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Jegyvásárlás
                      </a>
                    ) : (
                      <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted">
                        Nincs jegy link
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="border border-line bg-surface px-4 py-3 text-[14px] font-bold text-muted">
                  Jelenleg nincs meghirdetett közelgő fellépés.
                </p>
              )}
            </div>

            <p className="mt-6 border-t border-line pt-5 text-[15px] font-bold leading-relaxed text-muted">
              {selectedCover.summary}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
