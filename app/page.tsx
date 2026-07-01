import { HeroCoverCarousel } from "./hero-cover-carousel";
import { HomeCalendar } from "./home-calendar";
import { HomeRevealGroup } from "./home-reveal-group";
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
      id: true,
      title: true,
      coverImageUrl: true,
    },
  });
  const upcomingEvents = await prisma.runningPerformanceEvent.findMany({
    where: {
      startsAt: {
        gte: now,
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 50,
    select: {
      id: true,
      startsAt: true,
      location: true,
      ticketUrl: true,
      runningPerformance: {
        select: {
          coverImageUrl: true,
          title: true,
        },
      },
    },
  });
  const calendarDate = upcomingEvents[0]?.startsAt ?? now;
  const calendarEvents = upcomingEvents.map((event) => ({
    coverImageUrl: event.runningPerformance.coverImageUrl,
    dateKey: getDateKey(event.startsAt),
    ticketUrl: event.ticketUrl,
    title: event.runningPerformance.title,
  }));

  return (
    <main>
      <HeroCoverCarousel covers={performances} showTitleList />

      <section className="border-t border-line bg-[linear-gradient(180deg,#fff8ea_0%,#f8f1e3_48%,#efe5d2_100%)] px-[clamp(18px,4vw,56px)] py-16 text-charcoal">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 flex items-end justify-between gap-5 border-b border-line pb-5">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-thread-red">
              Naptár
            </p>
            <h1 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]">
              Közelgő fellépések
            </h1>
          </div>

          <HomeRevealGroup className="home-reveal-group grid gap-8 min-[920px]:grid-cols-[1.38fr_0.7fr] min-[920px]:items-stretch">
            <div className="home-reveal-calendar h-full">
              <HomeCalendar events={calendarEvents} initialDate={getDateKey(calendarDate)} />
            </div>

            <div className="h-full min-h-0">
              {upcomingEvents.length > 0 ? (
                <div className="event-list-scrollbar grid h-full snap-y snap-mandatory auto-rows-[calc((100%_-_60px)/6)] gap-3 overflow-y-scroll overscroll-contain pr-2">
                  {upcomingEvents.map((event, index) => {
                    const day = new Intl.DateTimeFormat("hu-RO", { day: "2-digit" }).format(event.startsAt);
                    const month = new Intl.DateTimeFormat("hu-RO", { month: "short" }).format(event.startsAt);
                    const date = new Intl.DateTimeFormat("hu-RO", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(event.startsAt);

                    const eventContent = (
                      <>
                        <time className="grid min-h-[72px] min-w-[86px] place-items-center border-r border-thread-red/25 bg-thread-red px-4 text-center text-surface-strong">
                          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-surface-strong/78">
                            {month}
                          </span>
                          <span className="font-serif text-[34px] font-bold leading-none">{day}</span>
                        </time>
                        <span className="grid min-w-0 flex-1 gap-1 px-4 py-3">
                          <span className="flex min-w-0 items-center justify-between gap-3 text-[13px] font-extrabold">
                            <span className="truncate text-thread-red">{date}</span>
                            <span className="ml-auto truncate text-right text-muted">{event.location}</span>
                          </span>
                          <span className="truncate font-serif text-[clamp(15px,1.6vw,18px)] font-bold leading-tight text-charcoal">
                            {event.runningPerformance.title}
                          </span>
                        </span>
                      </>
                    );

                    return (
                      <div
                        className="home-reveal-event snap-start"
                        key={event.id}
                        style={{ transitionDelay: `${index * 85}ms` }}
                      >
                        {event.ticketUrl ? (
                          <a
                            className="flex h-full overflow-hidden border border-line-strong bg-surface-strong shadow-[0_10px_24px_rgb(33_31_27_/_7%)] transition hover:-translate-y-0.5 hover:border-thread-red hover:shadow-[0_14px_28px_rgb(33_31_27_/_11%)]"
                            href={event.ticketUrl}
                          >
                            {eventContent}
                          </a>
                        ) : (
                          <article className="flex h-full overflow-hidden border border-line-strong bg-surface-strong shadow-[0_10px_24px_rgb(33_31_27_/_7%)]">
                            {eventContent}
                          </article>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-line-strong bg-surface-strong p-6 text-[17px] font-extrabold text-muted shadow-[0_10px_24px_rgb(33_31_27_/_7%)]">
                  Jelenleg nincs meghirdetett közelgő fellépés.
                </div>
              )}
            </div>
          </HomeRevealGroup>
        </div>
      </section>
    </main>
  );
}
