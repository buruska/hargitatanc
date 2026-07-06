import { HeroCoverCarousel } from "./hero-cover-carousel";
import { HomePerformanceCalendarSection } from "./home-performance-calendar-section";
import { prisma } from "@/lib/prisma";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default async function HomePage() {
  const now = new Date();
  const performances = await prisma.runningPerformance.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      coverImageUrl: true,
      events: {
        where: {
          startsAt: {
            gte: now,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        select: {
          id: true,
          location: true,
          startsAt: true,
          ticketUrl: true,
        },
      },
      id: true,
      summary: true,
      title: true,
    },
  });
  const heroCovers = performances.map((performance) => ({
    coverImageUrl: performance.coverImageUrl,
    events: performance.events.map((event) => ({
      id: event.id,
      location: event.location,
      startsAt: event.startsAt.toISOString(),
      ticketUrl: event.ticketUrl,
    })),
    id: performance.id,
    summary: performance.summary,
    title: performance.title,
  }));
  const events = await prisma.event.findMany({
    where: {
      startsAt: {
        gte: now,
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    select: {
      coverImageUrl: true,
      endsAt: true,
      id: true,
      startsAt: true,
      summary: true,
      title: true,
    },
  });
  const calendarEventsData = await prisma.event.findMany({
    orderBy: {
      startsAt: "asc",
    },
    select: {
      coverImageUrl: true,
      id: true,
      startsAt: true,
      summary: true,
      title: true,
    },
  });
  const heroEvents = events.map((event) => ({
    endsAt: event.endsAt?.toISOString() ?? null,
    id: event.id,
    startsAt: event.startsAt.toISOString(),
    title: event.title,
  }));
  const eventHeroCovers = events.flatMap((event) => {
    if (!event.coverImageUrl) {
      return [];
    }

    return [{
      coverImageUrl: event.coverImageUrl,
      id: `event-${event.id}`,
      summary: event.summary,
      title: event.title,
    }];
  });
  const carouselCovers = [...heroCovers, ...eventHeroCovers];
  const performanceEvents = await prisma.runningPerformanceEvent.findMany({
    orderBy: {
      startsAt: "asc",
    },
    select: {
      id: true,
      startsAt: true,
      location: true,
      ticketUrl: true,
      runningPerformance: {
        select: {
          coverImageUrl: true,
          summary: true,
          title: true,
        },
      },
    },
  });
  const calendarPerformanceEvents = performanceEvents.map((event) => ({
    coverImageUrl: event.runningPerformance.coverImageUrl,
    dateKey: getDateKey(event.startsAt),
    id: event.id,
    isPast: event.startsAt < now,
    kind: "performance" as const,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    summary: event.runningPerformance.summary,
    ticketUrl: event.ticketUrl,
    title: event.runningPerformance.title,
  }));
  const calendarStandaloneEvents = calendarEventsData.flatMap((event) => {
    if (!event.coverImageUrl) {
      return [];
    }

    return [{
      coverImageUrl: event.coverImageUrl,
      dateKey: getDateKey(event.startsAt),
      id: event.id,
      isPast: event.startsAt < now,
      kind: "event" as const,
      location: "",
      startsAt: event.startsAt.toISOString(),
      summary: event.summary,
      ticketUrl: "",
      title: event.title,
    }];
  });
  const calendarEvents = [...calendarPerformanceEvents, ...calendarStandaloneEvents].sort(
    (firstEvent, secondEvent) => new Date(firstEvent.startsAt).getTime() - new Date(secondEvent.startsAt).getTime(),
  );
  const nextCalendarEvent = calendarEvents.find((event) => !event.isPast);
  const calendarDate = nextCalendarEvent ? new Date(nextCalendarEvent.startsAt) : now;

  return (
    <main>
      <HeroCoverCarousel carouselCovers={carouselCovers} covers={heroCovers} events={heroEvents} showTitleList />

      <section className="border-t border-line bg-[linear-gradient(180deg,#fff8ea_0%,#f8f1e3_48%,#efe5d2_100%)] px-[clamp(18px,4vw,56px)] py-16 text-charcoal">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-0 border-b border-line pb-12 pt-12 text-left">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-thread-red">
              Naptár
            </p>
            <h1 className="pt-6 pb-12 font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]">
              Közelgő fellépések és rendezvények
            </h1>
          </div>

          <HomePerformanceCalendarSection events={calendarEvents} initialDate={getDateKey(calendarDate)} />
        </div>
      </section>
    </main>
  );
}
