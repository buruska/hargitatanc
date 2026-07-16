"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type GalleryImage = {
  id: string;
  imageUrl: string;
};

type GalleryPerformance = {
  id: string;
  title: string;
  coverImageUrl: string;
  galleryImages: GalleryImage[];
};

type GalleryPerformanceCardsProps = {
  performances: GalleryPerformance[];
};

const GALLERY_BATCH_SIZE = 12;

export function GalleryPerformanceCards({ performances }: GalleryPerformanceCardsProps) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(GALLERY_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const filteredPerformances = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("hu");

    return normalizedQuery
      ? performances.filter((performance) => performance.title.toLocaleLowerCase("hu").includes(normalizedQuery))
      : performances;
  }, [performances, query]);
  const visiblePerformances = filteredPerformances.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPerformances.length;

  useEffect(() => {
    setVisibleCount(GALLERY_BATCH_SIZE);
  }, [query]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + GALLERY_BATCH_SIZE, filteredPerformances.length));
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredPerformances.length, hasMore]);

  if (performances.length === 0) {
    return null;
  }

  return (
    <>
      <label className="mt-16 block w-full max-w-[560px]">
        <span className="sr-only">Keresés a galériák között</span>
        <input
          className="min-h-[48px] w-full border-2 border-line-strong bg-surface-strong px-4 py-3 text-[16px] font-bold text-charcoal shadow-[6px_6px_0_rgb(33_31_27_/_10%)] outline-none transition placeholder:text-muted/70 focus:border-thread-red focus:shadow-[8px_8px_0_rgb(179_38_32_/_16%)]"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Keresés a galériák között..."
          suppressHydrationWarning
          type="search"
          value={query}
        />
      </label>

      {filteredPerformances.length > 0 ? (
        <>
          <section className="mt-9 grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[980px]:grid-cols-3 min-[1280px]:grid-cols-6">
            {visiblePerformances.map((performance, index) => (
              <div
                className="gallery-card-reveal"
                key={performance.id}
                style={{ animationDelay: `${(index % GALLERY_BATCH_SIZE) * 55}ms` }}
              >
                <GalleryPerformanceCard performance={performance} />
              </div>
            ))}
          </section>
          {hasMore ? (
            <div className="h-16" ref={loadMoreRef} role="status" aria-label="További galériák betöltése" />
          ) : null}
        </>
      ) : (
        <p className="mt-9 border-2 border-line-strong bg-surface-strong px-5 py-6 font-extrabold text-muted">
          Nincs a keresésnek megfelelő galéria.
        </p>
      )}
    </>
  );
}

function GalleryPerformanceCard({ performance }: { performance: GalleryPerformance }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const previewImages = performance.galleryImages.slice(0, 4);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <article className="group relative border-2 border-line-strong bg-surface-strong p-3 shadow-[8px_8px_0_rgb(33_31_27_/_8%)]">
      <h2 className="mb-3 font-serif text-[clamp(20px,1.7vw,28px)] font-bold leading-tight text-charcoal">
        {performance.title}
      </h2>
      <button
        aria-label={`${performance.title} galéria megnyitása`}
        className="relative block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-red"
        type="button"
        onClick={() => setIsViewerOpen(true)}
      >
        <span className="block transition duration-300 group-hover:blur-[2px]">
          <Image
            alt={performance.title}
            className="aspect-[16/9] w-full border-2 border-line-strong object-cover"
            height={760}
            src={performance.coverImageUrl}
            width={1280}
          />
          <span className="mt-2 grid grid-cols-2 gap-2">
            {previewImages.map((image) => (
              <Image
                alt={performance.title}
                className="aspect-[4/3] w-full border border-line-strong object-cover"
                height={180}
                key={image.id}
                src={image.imageUrl}
                width={240}
              />
            ))}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-charcoal/0 opacity-0 transition duration-300 group-hover:bg-charcoal/24 group-hover:opacity-100">
          <span className="border-2 border-thread-red bg-surface-strong px-5 py-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-thread-red shadow-[6px_6px_0_rgb(33_31_27_/_18%)]">
            Megnézem
          </span>
        </span>
      </button>
      {isViewerOpen && isMounted
        ? createPortal(
            <GalleryImageViewer performance={performance} onClose={() => setIsViewerOpen(false)} />,
            document.body,
          )
        : null}
    </article>
  );
}

function GalleryImageViewer({
  performance,
  onClose,
}: {
  performance: GalleryPerformance;
  onClose: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slide, setSlide] = useState<{ direction: -1 | 1; phase: "idle" | "in" | "out" }>({
    direction: 1,
    phase: "idle",
  });
  const animationTimeoutRef = useRef<number | null>(null);
  const activeImage = performance.galleryImages[activeImageIndex];
  const hasMultipleImages = performance.galleryImages.length > 1;
  const slideClass =
    slide.phase === "out"
      ? slide.direction === 1
        ? "-translate-x-8"
        : "translate-x-8"
      : slide.phase === "in"
        ? slide.direction === 1
          ? "translate-x-8"
          : "-translate-x-8"
        : "translate-x-0";

  function shiftImage(direction: -1 | 1) {
    if (!hasMultipleImages) {
      return;
    }

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    setSlide({ direction, phase: "out" });

    animationTimeoutRef.current = window.setTimeout(() => {
      setActiveImageIndex((currentIndex) => {
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0) {
          return performance.galleryImages.length - 1;
        }

        if (nextIndex >= performance.galleryImages.length) {
          return 0;
        }

        return nextIndex;
      });
      setSlide({ direction, phase: "in" });
      window.requestAnimationFrame(() => {
        setSlide({ direction, phase: "idle" });
      });
    }, 120);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        shiftImage(-1);
      }

      if (event.key === "ArrowRight") {
        shiftImage(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  if (!activeImage) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[220] grid place-items-center bg-charcoal/78 p-3 backdrop-blur-sm"
      role="dialog"
      onMouseDown={onClose}
    >
      <section
        className="relative grid h-[calc(100vh-24px)] w-[calc(100vw-24px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border border-line-strong bg-surface-strong text-charcoal shadow-[12px_12px_0_rgb(33_31_27_/_22%)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
          <h2 className="font-serif text-[clamp(20px,2.5vw,32px)] font-bold leading-tight">
            {performance.title}
          </h2>
          <button
            aria-label="Modal bezárása"
            className="grid size-9 shrink-0 place-items-center border border-line bg-surface text-[20px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="relative min-h-0 overflow-hidden bg-charcoal">
          <div className={`absolute inset-0 grid place-items-center transition duration-150 ease-out ${slideClass}`}>
            <Image
              alt={performance.title}
              className="object-contain"
              fill
              sizes="100vw"
              src={activeImage.imageUrl}
            />
          </div>
          {hasMultipleImages ? (
            <>
              <button
                aria-label="Előző kép"
                className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-line bg-surface-strong text-[30px] font-extrabold leading-none text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                type="button"
                onClick={() => shiftImage(-1)}
              >
                ‹
              </button>
              <button
                aria-label="Következő kép"
                className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-line bg-surface-strong text-[30px] font-extrabold leading-none text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                type="button"
                onClick={() => shiftImage(1)}
              >
                ›
              </button>
            </>
          ) : null}
        </div>
        <div className="flex items-center justify-center border-t border-line px-5 py-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted">
          {activeImageIndex + 1} / {performance.galleryImages.length}
        </div>
      </section>
    </div>
  );
}
