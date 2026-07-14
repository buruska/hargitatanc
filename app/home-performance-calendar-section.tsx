"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getTicketDisplayText, isTicketLink, type TicketMode } from "@/lib/tickets";
import { HomeCalendar } from "./home-calendar";
import { HomeRevealGroup } from "./home-reveal-group";

export type HomePerformanceEvent = {
  calendarDateKeys?: string[];
  coverImageUrl: string;
  dateKey: string;
  galleryImages: {
    id: string;
    imageUrl: string;
  }[];
  id: string;
  isPast: boolean;
  kind: "performance" | "event";
  location: string;
  startsAt: string;
  summary: string;
  ticketMode: TicketMode;
  ticketText: string;
  ticketUrl: string;
  title: string;
};

type HomePerformanceCalendarSectionProps = {
  events: HomePerformanceEvent[];
  initialDate: string;
};

export function HomePerformanceCalendarSection({ events, initialDate }: HomePerformanceCalendarSectionProps) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [galleryViewer, setGalleryViewer] = useState<{ event: HomePerformanceEvent; imageIndex: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HomePerformanceEvent | null>(null);
  const isCalendarFiltered = activeEventId !== null;
  const visibleEvents = useMemo(() => {
    const upcomingEvents = events.filter((event) => !event.isPast);

    if (!activeEventId) {
      return upcomingEvents;
    }

    return events.filter((event) => event.id === activeEventId);
  }, [activeEventId, events]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <HomeRevealGroup
        className="home-reveal-group grid gap-8 transition-all duration-300 ease-out min-[920px]:h-[540px] min-[920px]:grid-cols-[1.38fr_0.7fr] min-[920px]:items-stretch"
        onMouseLeave={() => setActiveEventId(null)}
      >
        <div className="home-reveal-calendar h-full min-h-[420px] transition-all duration-300 ease-out min-[920px]:min-h-0">
          <HomeCalendar
            events={events}
            initialDate={initialDate}
            onPerformanceHover={(performance) => setActiveEventId(performance.id)}
            onPerformanceOpen={(performanceId) => {
              const event = events.find((currentEvent) => currentEvent.id === performanceId);

              if (event) {
                setSelectedEvent(event);
              }
            }}
          />
        </div>

        <div className="h-full min-h-0 transition-all duration-300 ease-out">
          {visibleEvents.length > 0 ? (
            <div
              key={activeEventId ?? "all-events"}
              className={`event-list-scrollbar home-list-transition grid h-full snap-y snap-mandatory gap-3 overflow-y-auto overscroll-contain pr-2 transition-all duration-300 ease-out ${
                isCalendarFiltered ? "auto-rows-max content-start" : "auto-rows-[calc((100%_-_60px)/6)]"
              }`}
            >
              {visibleEvents.map((event, index) => (
                <PerformanceListItem
                  event={event}
                  index={index}
                  isFiltered={isCalendarFiltered}
                  key={event.id}
                  onOpenDetails={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          ) : (
            <div className="border border-line-strong bg-surface-strong p-6 text-[17px] font-extrabold text-muted shadow-[0_10px_24px_rgb(33_31_27_/_7%)]">
              Jelenleg nincs meghirdetett közelgő fellépés.
            </div>
          )}
        </div>
      </HomeRevealGroup>

      {selectedEvent && isMounted
        ? createPortal(
            <PerformanceDetailsModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onOpenGallery={(imageIndex) => {
                setSelectedEvent(null);
                setGalleryViewer({ event: selectedEvent, imageIndex });
              }}
            />,
            document.body,
          )
        : null}
      {galleryViewer && isMounted
        ? createPortal(
            <GalleryImageModal
              event={galleryViewer.event}
              initialImageIndex={galleryViewer.imageIndex}
              onClose={() => {
                setSelectedEvent(galleryViewer.event);
                setGalleryViewer(null);
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function PerformanceListItem({
  event,
  index,
  isFiltered,
  onOpenDetails,
}: {
  event: HomePerformanceEvent;
  index: number;
  isFiltered: boolean;
  onOpenDetails: () => void;
}) {
  const startsAt = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat("hu-RO", { day: "2-digit" }).format(startsAt);
  const month = new Intl.DateTimeFormat("hu-RO", { month: "short" }).format(startsAt);
  const weekdayAndTime = new Intl.DateTimeFormat("hu-RO", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);
  const fullDate = new Intl.DateTimeFormat("hu-RO", { dateStyle: "long" }).format(startsAt);
  const accentText = event.isPast ? "text-muted" : "text-thread-red";
  const accentBg = event.isPast ? "bg-muted" : "bg-thread-red";
  const accentBorder = event.isPast ? "border-muted" : "border-thread-red";
  const hoverBorder = event.isPast ? "group-hover:border-muted" : "group-hover:border-thread-red";
  const ticketDisplayText = getTicketDisplayText(event);
  const hasTicketLink = isTicketLink(event);
  const filteredCardClass = event.isPast ? "grayscale opacity-70" : "";

  if (isFiltered) {
    return (
      <div
        className="home-reveal-event snap-start"
        style={{ transitionDelay: `${index * 85}ms` }}
      >
        <article className={`grid gap-4 border border-line-strong bg-surface-strong p-4 shadow-[0_10px_24px_rgb(33_31_27_/_7%)] ${filteredCardClass}`}>
          <h3 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight text-charcoal">
            {event.title}
          </h3>
          <div className="grid gap-1 text-[13px] font-extrabold text-thread-red">
            <time dateTime={event.startsAt}>{fullDate}</time>
            <span>{weekdayAndTime}</span>
            {event.location ? <span className="text-muted">{event.location}</span> : null}
          </div>
          {event.isPast ? (
            <span className="inline-flex w-fit items-center justify-center border border-line-strong bg-surface px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted">
              Lejárt
            </span>
          ) : hasTicketLink ? (
            <a
              className="inline-flex w-fit items-center justify-center bg-thread-red px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-surface-strong shadow-[0_12px_24px_rgb(33_31_27_/_16%)] transition duration-200 hover:scale-105 hover:bg-charcoal active:scale-95"
              href={event.ticketUrl}
              rel="noreferrer"
              target="_blank"
            >
              {ticketDisplayText}
            </a>
          ) : ticketDisplayText ? (
            <span className="inline-flex w-fit items-center justify-center border border-line-strong bg-surface px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted">
              {ticketDisplayText}
            </span>
          ) : null}
          <div
            aria-label={event.title}
            className="aspect-[16/10] border-2 border-line-strong bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${event.coverImageUrl})` }}
          />
          <p className="text-[15px] font-bold leading-relaxed text-muted">
            {event.summary}
          </p>
        </article>
      </div>
    );
  }

  const eventContent = (
    <>
      <time className={`grid min-h-[72px] min-w-[86px] place-items-center border-r px-4 text-center text-surface-strong ${accentBg} border-thread-red/25`}>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-surface-strong/78">
          {month}
        </span>
        <span className="font-serif text-[34px] font-bold leading-none">{day}</span>
      </time>
      <span className="grid min-w-0 flex-1 gap-1 px-4 py-3">
        <span className="flex min-w-0 items-center justify-between gap-3 text-[13px] font-extrabold">
          <span className={`truncate ${accentText}`}>{weekdayAndTime}</span>
          {event.location ? <span className="ml-auto truncate text-right text-muted">{event.location}</span> : null}
        </span>
        <span className="truncate font-serif text-[clamp(15px,1.6vw,18px)] font-bold leading-tight text-charcoal">
          {event.title}
        </span>
      </span>
    </>
  );

  return (
    <div
      className="home-reveal-event group snap-start"
      style={{ transitionDelay: `${index * 85}ms` }}
    >
      <article className={`relative flex h-full overflow-hidden border border-line-strong bg-surface-strong shadow-[0_10px_24px_rgb(33_31_27_/_7%)] transition-all duration-300 ease-out group-hover:-translate-y-0.5 ${hoverBorder} group-hover:shadow-[0_14px_28px_rgb(33_31_27_/_11%)] ${
        event.isPast ? "grayscale opacity-65" : ""
      }`}>
        <span className="flex min-w-0 flex-1 transition duration-200 group-hover:opacity-0">
          {eventContent}
        </span>
        <span className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-3 px-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          {hasTicketLink ? (
            <a
              className={`${accentBg} px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-surface-strong shadow-[0_12px_24px_rgb(33_31_27_/_16%)] transition duration-200 hover:scale-105 active:scale-95`}
              href={event.ticketUrl}
              rel="noreferrer"
              target="_blank"
            >
              Jegyek
            </a>
          ) : ticketDisplayText ? (
            <span className="border border-line-strong bg-surface-strong px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted shadow-[0_12px_24px_rgb(33_31_27_/_10%)]">
              {ticketDisplayText}
            </span>
          ) : null}
          <button
            className={`border ${accentBorder} bg-surface-strong px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] ${accentText} shadow-[0_12px_24px_rgb(33_31_27_/_10%)] transition duration-200 hover:scale-105 hover:bg-white active:scale-95`}
            type="button"
            onClick={onOpenDetails}
          >
            Részletek
          </button>
        </span>
      </article>
    </div>
  );
}

function PerformanceDetailsModal({
  event,
  onClose,
  onOpenGallery,
}: {
  event: HomePerformanceEvent;
  onClose: () => void;
  onOpenGallery: (imageIndex: number) => void;
}) {
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [gallerySlide, setGallerySlide] = useState<{ direction: -1 | 1; phase: "idle" | "in" | "out" }>({
    direction: 1,
    phase: "idle",
  });
  const galleryAnimationTimeoutRef = useRef<number | null>(null);
  const startsAt = new Date(event.startsAt);
  const date = new Intl.DateTimeFormat("hu-RO", { dateStyle: "full" }).format(startsAt);
  const time = new Intl.DateTimeFormat("hu-RO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);
  const accentText = "text-thread-red";
  const accentBg = "bg-thread-red";
  const accentBorderHover = "hover:border-thread-red hover:bg-thread-red";
  const ticketDisplayText = getTicketDisplayText(event);
  const hasTicketLink = isTicketLink(event);
  const visibleGalleryItems = Array.from(
    { length: Math.min(6, event.galleryImages.length) },
    (_, offset) => {
      const imageIndex = (galleryStartIndex + offset) % event.galleryImages.length;
      const image = event.galleryImages[imageIndex];

      return image ? { image, imageIndex } : null;
    },
  ).filter((galleryItem): galleryItem is { image: { id: string; imageUrl: string }; imageIndex: number } =>
    Boolean(galleryItem),
  );
  const gallerySlideClass =
    gallerySlide.phase === "out"
      ? gallerySlide.direction === 1
        ? "-translate-x-4"
        : "translate-x-4"
      : gallerySlide.phase === "in"
        ? gallerySlide.direction === 1
          ? "translate-x-4"
          : "-translate-x-4"
        : "translate-x-0";

  function shiftGallery(direction: -1 | 1) {
    if (event.galleryImages.length <= 6) {
      return;
    }

    if (galleryAnimationTimeoutRef.current) {
      window.clearTimeout(galleryAnimationTimeoutRef.current);
    }

    setGallerySlide({ direction, phase: "out" });

    galleryAnimationTimeoutRef.current = window.setTimeout(() => {
      setGalleryStartIndex((currentIndex) => {
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0) {
          return event.galleryImages.length - 1;
        }

        if (nextIndex >= event.galleryImages.length) {
          return 0;
        }

        return nextIndex;
      });
      setGallerySlide({ direction, phase: "in" });
      window.requestAnimationFrame(() => {
        setGallerySlide({ direction, phase: "idle" });
      });
    }, 120);
  }

  useEffect(() => {
    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setGalleryStartIndex(0);
    setGallerySlide({ direction: 1, phase: "idle" });
  }, [event.id]);

  useEffect(() => {
    return () => {
      if (galleryAnimationTimeoutRef.current) {
        window.clearTimeout(galleryAnimationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[200] grid place-items-center bg-charcoal/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      onMouseDown={onClose}
    >
      <section
        className="max-h-[min(760px,calc(100vh-64px))] w-[min(760px,100%)] overflow-y-auto border border-line-strong bg-surface-strong text-charcoal shadow-[12px_12px_0_rgb(33_31_27_/_20%)]"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div
          className="relative min-h-[260px] bg-cover bg-center"
          style={{ backgroundImage: `url(${event.coverImageUrl})` }}
        >
          <span className="absolute inset-0 bg-charcoal/38" />
          <button
            aria-label="Modal bezárása"
            className={`absolute right-4 top-4 z-[1] grid size-9 place-items-center border border-line bg-surface-strong text-[20px] font-extrabold ${accentText} transition ${accentBorderHover} hover:text-surface-strong`}
            type="button"
            onClick={onClose}
          >
            ×
          </button>
          <h2 className="absolute bottom-5 left-5 right-5 z-[1] font-serif text-[clamp(30px,4vw,48px)] font-bold leading-tight text-surface-strong drop-shadow-[0_2px_14px_rgb(33_31_27_/_52%)]">
            {event.title}
          </h2>
        </div>
        <div className="grid gap-5 p-6">
          <div className={`grid gap-1 text-[14px] font-extrabold ${accentText}`}>
            <time dateTime={event.startsAt}>{date}</time>
            <span>{time}</span>
          </div>
          {hasTicketLink ? (
            <a
              className={`inline-flex w-fit ${accentBg} px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-surface-strong shadow-[0_12px_24px_rgb(33_31_27_/_16%)] transition duration-200 hover:scale-105 active:scale-95`}
              href={event.ticketUrl}
              rel="noreferrer"
              target="_blank"
            >
              {ticketDisplayText}
            </a>
          ) : ticketDisplayText ? (
            <span className="inline-flex w-fit border border-line-strong bg-surface px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted">
              {ticketDisplayText}
            </span>
          ) : null}
          <p className="text-[15px] font-bold leading-relaxed text-muted">
            {event.summary}
          </p>
          {event.galleryImages.length > 0 ? (
            <div className="grid gap-2 border-t border-line pt-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">Galéria</p>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                {event.galleryImages.length > 6 ? (
                  <button
                    aria-label="Előző galériaképek"
                    className="grid size-8 place-items-center border border-line bg-surface text-lg font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                    type="button"
                    onClick={() => shiftGallery(-1)}
                  >
                    ‹
                  </button>
                ) : (
                  <span aria-hidden="true" className="hidden size-8 min-[520px]:block" />
                )}
                <div className={`grid grid-cols-3 gap-2 transition duration-150 ease-out min-[520px]:grid-cols-6 ${gallerySlideClass}`}>
                  {visibleGalleryItems.map((galleryItem) => (
                    <button
                      aria-label={event.title}
                      className="aspect-[4/3] cursor-pointer border border-line-strong bg-cover bg-center transition hover:scale-[1.03] hover:border-thread-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-red"
                      key={galleryItem.image.id}
                      type="button"
                      style={{ backgroundImage: `url(${galleryItem.image.imageUrl})` }}
                      onClick={() => onOpenGallery(galleryItem.imageIndex)}
                    />
                  ))}
                </div>
                {event.galleryImages.length > 6 ? (
                  <button
                    aria-label="Következő galériaképek"
                    className="grid size-8 place-items-center border border-line bg-surface text-lg font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                    type="button"
                    onClick={() => shiftGallery(1)}
                  >
                    ›
                  </button>
                ) : (
                  <span aria-hidden="true" className="hidden size-8 min-[520px]:block" />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function GalleryImageModal({
  event,
  initialImageIndex,
  onClose,
}: {
  event: HomePerformanceEvent;
  initialImageIndex: number;
  onClose: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);
  const [imageSlide, setImageSlide] = useState<{ direction: -1 | 1; phase: "idle" | "in" | "out" }>({
    direction: 1,
    phase: "idle",
  });
  const imageAnimationTimeoutRef = useRef<number | null>(null);
  const activeImage = event.galleryImages[activeImageIndex];
  const hasMultipleImages = event.galleryImages.length > 1;
  const imageSlideClass =
    imageSlide.phase === "out"
      ? imageSlide.direction === 1
        ? "-translate-x-5"
        : "translate-x-5"
      : imageSlide.phase === "in"
        ? imageSlide.direction === 1
          ? "translate-x-5"
          : "-translate-x-5"
        : "translate-x-0";

  const shiftImage = useCallback((direction: -1 | 1) => {
    if (imageAnimationTimeoutRef.current) {
      window.clearTimeout(imageAnimationTimeoutRef.current);
    }

    setImageSlide({ direction, phase: "out" });

    imageAnimationTimeoutRef.current = window.setTimeout(() => {
      setActiveImageIndex((currentIndex) => {
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0) {
          return event.galleryImages.length - 1;
        }

        if (nextIndex >= event.galleryImages.length) {
          return 0;
        }

        return nextIndex;
      });
      setImageSlide({ direction, phase: "in" });
      window.requestAnimationFrame(() => {
        setImageSlide({ direction, phase: "idle" });
      });
    }, 120);
  }, [event.galleryImages.length]);

  useEffect(() => {
    setActiveImageIndex(initialImageIndex);
    setImageSlide({ direction: 1, phase: "idle" });
  }, [initialImageIndex]);

  useEffect(() => {
    return () => {
      if (imageAnimationTimeoutRef.current) {
        window.clearTimeout(imageAnimationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }

      if (keyboardEvent.key === "ArrowLeft" && hasMultipleImages) {
        shiftImage(-1);
      }

      if (keyboardEvent.key === "ArrowRight" && hasMultipleImages) {
        shiftImage(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasMultipleImages, onClose, shiftImage]);

  if (!activeImage) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[220] grid place-items-center bg-charcoal/82 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      onMouseDown={onClose}
    >
      <section
        className="relative grid max-h-[min(860px,calc(100vh-48px))] w-[min(1100px,100%)] gap-4 text-surface-strong"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-surface-strong/70">Galéria</p>
            <h2 className="mt-1 font-serif text-[clamp(24px,3vw,38px)] font-bold leading-tight">{event.title}</h2>
          </div>
          <button
            aria-label="Modal bezárása"
            className="grid size-10 shrink-0 place-items-center border border-surface-strong/50 bg-surface-strong text-[22px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {hasMultipleImages ? (
            <button
              aria-label="Előző galériakép"
              className="grid size-10 place-items-center border border-surface-strong/50 bg-surface-strong text-2xl font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
              type="button"
              onClick={() => shiftImage(-1)}
            >
              ‹
            </button>
          ) : (
            <span aria-hidden="true" className="size-10" />
          )}
          <div className="relative h-[min(68vh,620px)] overflow-hidden border border-surface-strong/40 bg-charcoal">
            <div className={`absolute inset-0 transition duration-150 ease-out ${imageSlideClass}`}>
              <Image
                alt={event.title}
                className="object-contain"
                fill
                sizes="min(1100px, 100vw)"
                src={activeImage.imageUrl}
              />
            </div>
          </div>
          {hasMultipleImages ? (
            <button
              aria-label="Következő galériakép"
              className="grid size-10 place-items-center border border-surface-strong/50 bg-surface-strong text-2xl font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
              type="button"
              onClick={() => shiftImage(1)}
            >
              ›
            </button>
          ) : (
            <span aria-hidden="true" className="size-10" />
          )}
        </div>
        <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.12em] text-surface-strong/72">
          {activeImageIndex + 1} / {event.galleryImages.length}
        </p>
      </section>
    </div>
  );
}
