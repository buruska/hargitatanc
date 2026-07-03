"use client";

import { useMemo, useState } from "react";
import { HomeCalendar } from "./home-calendar";
import { HomeRevealGroup } from "./home-reveal-group";

export type HomePerformanceEvent = {
  coverImageUrl: string;
  dateKey: string;
  id: string;
  location: string;
  startsAt: string;
  summary: string;
  ticketUrl: string;
  title: string;
};

type ActivePerformance = {
  coverImageUrl: string;
  dateKey: string;
  ticketUrl: string;
  title: string;
};

type HomePerformanceCalendarSectionProps = {
  events: HomePerformanceEvent[];
  initialDate: string;
};

export function HomePerformanceCalendarSection({ events, initialDate }: HomePerformanceCalendarSectionProps) {
  const [activePerformance, setActivePerformance] = useState<ActivePerformance | null>(null);
  const visibleEvents = useMemo(() => {
    if (!activePerformance) {
      return events;
    }

    return events.filter((event) => event.dateKey === activePerformance.dateKey);
  }, [activePerformance, events]);

  return (
    <HomeRevealGroup
      className="home-reveal-group grid gap-8 transition-all duration-300 ease-out min-[920px]:h-[540px] min-[920px]:grid-cols-[1.38fr_0.7fr] min-[920px]:items-stretch"
      onMouseLeave={() => setActivePerformance(null)}
    >
      <div className="home-reveal-calendar relative h-full min-h-[420px] transition-all duration-300 ease-out min-[920px]:min-h-0">
        <div
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            activePerformance ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <HomeCalendar events={events} initialDate={initialDate} onPerformanceHover={setActivePerformance} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            activePerformance ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="relative grid h-full place-items-center overflow-hidden border border-line bg-cover bg-center opacity-100 shadow-[0_18px_35px_rgb(33_31_27_/_10%)] transition-all duration-300 ease-out"
            style={activePerformance ? { backgroundImage: `url(${activePerformance.coverImageUrl})` } : undefined}
          >
            <span className="absolute inset-0 bg-charcoal/32" />
            {activePerformance?.ticketUrl ? (
              <a
                className="relative z-[1] bg-thread-red px-6 py-3 text-[14px] font-extrabold uppercase tracking-[0.12em] text-surface-strong shadow-[0_12px_24px_rgb(33_31_27_/_20%)] transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95"
                href={activePerformance.ticketUrl}
                rel="noreferrer"
                target="_blank"
              >
                Jegyek
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-full min-h-0 transition-all duration-300 ease-out">
        {visibleEvents.length > 0 ? (
          <div
            key={activePerformance?.dateKey ?? "all-events"}
            className={`event-list-scrollbar home-list-transition grid h-full snap-y snap-mandatory gap-3 overflow-y-auto overscroll-contain pr-2 transition-all duration-300 ease-out ${
              activePerformance ? "auto-rows-max content-start" : "auto-rows-[calc((100%_-_60px)/6)]"
            }`}
          >
            {visibleEvents.map((event, index) => (
              <PerformanceListItem event={event} index={index} isFiltered={Boolean(activePerformance)} key={event.id} />
            ))}
          </div>
        ) : (
          <div className="border border-line-strong bg-surface-strong p-6 text-[17px] font-extrabold text-muted shadow-[0_10px_24px_rgb(33_31_27_/_7%)]">
            Jelenleg nincs meghirdetett közelgő fellépés.
          </div>
        )}
      </div>
    </HomeRevealGroup>
  );
}

function PerformanceListItem({
  event,
  index,
  isFiltered,
}: {
  event: HomePerformanceEvent;
  index: number;
  isFiltered: boolean;
}) {
  const startsAt = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat("hu-RO", { day: "2-digit" }).format(startsAt);
  const month = new Intl.DateTimeFormat("hu-RO", { month: "short" }).format(startsAt);
  const date = new Intl.DateTimeFormat("hu-RO", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(startsAt);
  const weekdayAndTime = new Intl.DateTimeFormat("hu-RO", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);
  const eventContent = (
    <>
      {isFiltered ? null : (
        <time className="grid min-h-[72px] min-w-[86px] place-items-center border-r border-thread-red/25 bg-thread-red px-4 text-center text-surface-strong">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-surface-strong/78">
            {month}
          </span>
          <span className="font-serif text-[34px] font-bold leading-none">{day}</span>
        </time>
      )}
      <span className={`grid min-w-0 flex-1 px-4 py-3 ${isFiltered ? "gap-2 pb-5" : "gap-1"}`}>
        {isFiltered ? (
          <span className="grid gap-1 text-[13px] font-extrabold">
            <span className="truncate text-thread-red">{date}</span>
            <span className="truncate text-muted">{event.location}</span>
          </span>
        ) : (
          <span className="flex min-w-0 items-center justify-between gap-3 text-[13px] font-extrabold">
            <span className="truncate text-thread-red">{weekdayAndTime}</span>
            <span className="ml-auto truncate text-right text-muted">{event.location}</span>
          </span>
        )}
        <span className="truncate font-serif text-[clamp(15px,1.6vw,18px)] font-bold leading-tight text-charcoal">
          {event.title}
        </span>
        {isFiltered ? (
          <span className="line-clamp-3 text-[13px] font-bold leading-snug text-muted">
            {event.summary}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <div
      className="home-reveal-event snap-start"
      style={{ transitionDelay: `${index * 85}ms` }}
    >
      {event.ticketUrl ? (
        <a
          className="flex h-full overflow-hidden border border-line-strong bg-surface-strong shadow-[0_10px_24px_rgb(33_31_27_/_7%)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-thread-red hover:shadow-[0_14px_28px_rgb(33_31_27_/_11%)]"
          href={event.ticketUrl}
        >
          {eventContent}
        </a>
      ) : (
        <article className="flex h-full overflow-hidden border border-line-strong bg-surface-strong shadow-[0_10px_24px_rgb(33_31_27_/_7%)] transition-all duration-300 ease-out">
          {eventContent}
        </article>
      )}
    </div>
  );
}
