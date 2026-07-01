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
          title: true,
        },
      },
    },
  });
  const calendarDate = upcomingEvents[0]?.startsAt ?? now;
  const eventDateKeys = upcomingEvents.map((event) => getDateKey(event.startsAt));

  return (
    <main>
      <HeroCoverCarousel covers={performances} showTitleList />

      <section className="bg-surface px-[clamp(18px,4vw,56px)] py-16 text-charcoal">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-normal text-thread-red">
            Naptár
          </p>
          <div className="mb-8 border-b-2 border-line pb-5">
            <h1 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]">
              Közelgő fellépések
            </h1>
          </div>

          <HomeRevealGroup className="home-reveal-group grid gap-8 min-[920px]:grid-cols-[1.15fr_1fr] min-[920px]:items-stretch">
            <div className="home-reveal-calendar h-full">
              <HomeCalendar eventDateKeys={eventDateKeys} initialDate={getDateKey(calendarDate)} />
            </div>

            <div className="h-full min-h-0">
              {upcomingEvents.length > 0 ? (
                <div className="event-list-scrollbar grid h-full snap-y snap-mandatory auto-rows-[calc((100%-60px)/6)] gap-3 overflow-y-scroll overscroll-contain pr-2">
                  {upcomingEvents.map((event, index) => {
                    const day = new Intl.DateTimeFormat("hu-RO", { day: "2-digit" }).format(event.startsAt);
                    const month = new Intl.DateTimeFormat("hu-RO", { month: "short" }).format(event.startsAt);
                    const date = new Intl.DateTimeFormat("hu-RO", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(event.startsAt);

                    const eventContent = (
                      <>
                        <time className="grid min-h-[72px] min-w-[86px] place-items-center border-r-2 border-line bg-surface-strong px-4 text-center">
                          <span className="text-[12px] font-extrabold uppercase text-muted">{month}</span>
                          <span className="font-serif text-[34px] font-bold leading-none text-petrol">{day}</span>
                        </time>
                        <span className="grid min-w-0 flex-1 gap-1 px-4 py-3">
                          <span className="flex min-w-0 items-center justify-between gap-3 text-[13px] font-extrabold">
                            <span className="truncate text-petrol">{date}</span>
                            <span className="ml-auto truncate text-right text-muted">{event.location}</span>
                          </span>
                          <span className="truncate font-serif text-[clamp(22px,3vw,32px)] font-bold leading-tight text-charcoal">
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
                            className="flex h-full overflow-hidden border-2 border-charcoal bg-surface transition hover:-translate-y-0.5 hover:bg-surface-strong hover:shadow-soft"
                            href={event.ticketUrl}
                          >
                            {eventContent}
                          </a>
                        ) : (
                          <article className="flex h-full overflow-hidden border-2 border-charcoal bg-surface">
                            {eventContent}
                          </article>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-2 border-charcoal bg-surface-strong p-6 text-[17px] font-extrabold text-muted">
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
