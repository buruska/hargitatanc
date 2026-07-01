"use client";

import { useMemo, useState } from "react";

const weekdayLabels = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

type HomeCalendarProps = {
  events: {
    dateKey: string;
    title: string;
  }[];
  initialDate: string;
};

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDays(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayBasedWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const firstCalendarDay = new Date(firstDayOfMonth);
  firstCalendarDay.setDate(firstDayOfMonth.getDate() - mondayBasedWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const calendarDay = new Date(firstCalendarDay);
    calendarDay.setDate(firstCalendarDay.getDate() + index);
    return calendarDay;
  });
}

export function HomeCalendar({ events, initialDate }: HomeCalendarProps) {
  const [visibleDate, setVisibleDate] = useState(() => {
    const [year, month, day] = initialDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  });
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, string[]>>((groupedEvents, event) => {
      groupedEvents[event.dateKey] = [...(groupedEvents[event.dateKey] ?? []), event.title];
      return groupedEvents;
    }, {});
  }, [events]);
  const calendarDays = getCalendarDays(visibleDate);
  const currentMonth = visibleDate.getMonth();
  const calendarTitle = new Intl.DateTimeFormat("hu-RO", {
    month: "long",
    year: "numeric",
  }).format(visibleDate);

  function changeMonth(direction: -1 | 1) {
    setVisibleDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  }

  return (
    <aside className="flex h-full flex-col bg-transparent">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-5">
        <button
          aria-label="Előző hónap"
          className="grid size-8 place-items-center border border-line bg-surface text-lg font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
          type="button"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>
        <h2 className="font-serif text-[26px] font-bold capitalize leading-none text-charcoal">
          {calendarTitle}
        </h2>
        <button
          aria-label="Következő hónap"
          className="grid size-8 place-items-center border border-line bg-surface text-lg font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
          type="button"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] overflow-hidden border-l border-t border-line text-center shadow-[inset_0_1px_0_rgb(255_248_234_/_65%)]">
        {weekdayLabels.map((weekday) => (
          <div
            className="border-b border-r border-line bg-surface px-1 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted"
            key={weekday}
          >
            {weekday}
          </div>
        ))}
        {calendarDays.map((calendarDay) => {
          const dateKey = getDateKey(calendarDay);
          const dayEvents = eventsByDate[dateKey] ?? [];
          const hasEvent = dayEvents.length > 0;
          const isCurrentMonth = calendarDay.getMonth() === currentMonth;

          return (
            <div
              className={`relative flex min-h-[72px] items-start justify-end overflow-hidden border-b border-r border-line p-2 text-[13px] font-extrabold transition ${
                isCurrentMonth ? "bg-surface-strong text-charcoal" : "bg-surface text-muted/35"
              } ${hasEvent ? "bg-thread-red text-surface-strong shadow-[inset_0_0_0_2px_rgb(255_248_234_/_48%)]" : ""}`}
              key={dateKey}
            >
              <span>{calendarDay.getDate()}</span>
              {hasEvent ? (
                <div className="absolute bottom-2 left-2 right-2 grid gap-0.5 text-left">
                  {dayEvents.slice(0, 2).map((title) => (
                    <span className="truncate text-[10px] font-extrabold leading-tight text-surface-strong" key={title}>
                      {title}
                    </span>
                  ))}
                  {dayEvents.length > 2 ? (
                    <span className="text-[10px] font-extrabold leading-tight text-surface-strong/80">
                      +{dayEvents.length - 2} további
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
