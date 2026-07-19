import Image from "next/image";
import Link from "next/link";
import { HeroCoverCarousel } from "./hero-cover-carousel";
import { HomePerformanceCalendarSection } from "./home-performance-calendar-section";
import { HomeRevealGroup } from "./home-reveal-group";
import { prisma } from "@/lib/prisma";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKeysBetween(startDate: Date, endDate: Date) {
  const firstDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const lastDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const dateKeys: string[] = [];

  for (const currentDate = new Date(firstDate); currentDate <= lastDate; currentDate.setDate(currentDate.getDate() + 1)) {
    dateKeys.push(getDateKey(currentDate));
  }

  return dateKeys;
}

function getFirstImageSrc(value: string) {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

export default async function HomePage() {
  const now = new Date();
  const performances = await prisma.runningPerformance.findMany({
    where: {
      isGalleryOnly: false,
    },
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
          ticketMode: true,
          ticketText: true,
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
      ticketMode: event.ticketMode,
      ticketText: event.ticketText,
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
      endsAt: true,
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
  const defaultCoverImages = heroCovers.length === 0 && eventHeroCovers.length === 0
    ? await prisma.defaultCoverImage.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      })
    : [];
  const defaultHeroCovers = defaultCoverImages.map((coverImage, index) => ({
    coverImageUrl: coverImage.imageUrl,
    id: coverImage.id,
    summary: "",
    title: `Alap borítókép ${index + 1}`,
  }));
  const carouselCovers = [...heroCovers, ...eventHeroCovers, ...defaultHeroCovers];
  const titleListCovers = defaultHeroCovers.length > 0 ? [] : heroCovers;
  const titleListEvents = defaultHeroCovers.length > 0 ? [] : heroEvents;
  const performanceEvents = await prisma.runningPerformanceEvent.findMany({
    orderBy: {
      startsAt: "asc",
    },
    select: {
      id: true,
      startsAt: true,
      location: true,
      ticketMode: true,
      ticketText: true,
      ticketUrl: true,
      runningPerformance: {
        select: {
          coverImageUrl: true,
          galleryImages: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            select: {
              id: true,
              imageUrl: true,
            },
          },
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
    galleryImages: event.runningPerformance.galleryImages,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    summary: event.runningPerformance.summary,
    ticketMode: event.ticketMode,
    ticketText: event.ticketText,
    ticketUrl: event.ticketUrl,
    title: event.runningPerformance.title,
  }));
  const calendarStandaloneEvents = calendarEventsData.flatMap((event) => {
    if (!event.coverImageUrl) {
      return [];
    }

    return [{
      calendarDateKeys: getDateKeysBetween(event.startsAt, event.endsAt ?? event.startsAt),
      coverImageUrl: event.coverImageUrl,
      dateKey: getDateKey(event.startsAt),
      id: event.id,
      isPast: (event.endsAt ?? event.startsAt) < now,
      kind: "event" as const,
      galleryImages: [],
      location: "",
      startsAt: event.startsAt.toISOString(),
      summary: event.summary,
      ticketMode: "LINK" as const,
      ticketText: "",
      ticketUrl: "",
      title: event.title,
    }];
  });
  const calendarEvents = [...calendarPerformanceEvents, ...calendarStandaloneEvents].sort(
    (firstEvent, secondEvent) => new Date(firstEvent.startsAt).getTime() - new Date(secondEvent.startsAt).getTime(),
  );
  const nextCalendarEvent = calendarEvents.find((event) => !event.isPast);
  const calendarDate = nextCalendarEvent ? new Date(nextCalendarEvent.startsAt) : now;
  const hasCarouselCovers = carouselCovers.length > 0;
  const newsPosts = await prisma.newsPost.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    take: 9,
    select: {
      content: true,
      excerpt: true,
      id: true,
      publishedAt: true,
      slug: true,
      title: true,
    },
  });
  const newsPreviewPosts = newsPosts.slice(0, 8);
  const hasMoreNewsPosts = newsPosts.length > newsPreviewPosts.length;

  return (
    <main className="relative">
      {hasCarouselCovers ? (
        <div className="relative h-screen">
          <HeroCoverCarousel
            carouselCovers={carouselCovers}
            className="fixed inset-0 z-0 h-screen w-full overflow-hidden"
            covers={titleListCovers}
            events={titleListEvents}
            showTitleList
          />
        </div>
      ) : null}

      <section className="relative z-[2] border-t border-line bg-[linear-gradient(180deg,#fff8ea_0%,#f8f1e3_48%,#efe5d2_100%)] px-[clamp(18px,4vw,56px)] py-16 text-charcoal shadow-[0_-32px_60px_rgb(33_31_27_/_18%)]">
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

      <section className="relative z-[2] px-[clamp(18px,4vw,56px)] py-20 text-charcoal">
        <HomeRevealGroup className="home-reveal-group mx-auto max-w-[1180px]">
          <div className="home-reveal-title-from-right bg-surface-strong px-[clamp(22px,4vw,42px)] py-12 text-left shadow-[12px_12px_0_rgb(33_31_27_/_20%)]">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-thread-red">
              Hírek és beszámolók
            </p>
            <h2 className="pt-6 font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]">
              Aktuális
            </h2>
          </div>
          {newsPreviewPosts.length > 0 ? (
            <>
              <div className="mt-10 grid auto-rows-fr gap-5 min-[720px]:grid-cols-2 min-[1120px]:grid-cols-4">
                {newsPreviewPosts.map((post, index) => {
                  const imageSrc = getFirstImageSrc(post.content);

                  return (
                    <Link
                      className="home-news-card block h-full min-h-[430px]"
                      href={`/hirek/${post.slug}`}
                      key={post.id}
                      style={{ transitionDelay: `${index * 110 + 180}ms` }}
                    >
                      <div className="home-news-card-flip relative h-full min-h-[430px] shadow-[10px_10px_0_rgb(33_31_27_/_18%)]">
                        <div className="home-news-card-face home-news-card-front flex h-full min-h-[430px] flex-col bg-surface-strong px-5 py-6 text-center">
                          <time className="block font-serif text-[16px] leading-tight text-charcoal">
                            {new Intl.DateTimeFormat("hu-RO", { dateStyle: "long" }).format(post.publishedAt)}
                          </time>
                          <h3 className="mb-9 mt-9 font-serif text-[clamp(18px,2vw,22px)] font-bold italic leading-tight text-thread-red">
                            {post.title}
                          </h3>
                          {post.excerpt ? (
                            <p className="text-[15px] font-extrabold leading-snug text-charcoal">
                              {post.excerpt}
                            </p>
                          ) : null}
                          <div className="-mx-5 -mb-6 mt-auto">
                            {imageSrc ? (
                              <Image
                                alt=""
                                className="aspect-[4/3] w-full object-cover"
                                height={240}
                                src={imageSrc}
                                unoptimized={imageSrc.startsWith("data:")}
                                width={320}
                              />
                            ) : (
                              <div className="grid aspect-[4/3] place-items-center bg-surface text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted">
                                Hír
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="home-news-card-face home-news-card-back absolute inset-0 grid min-h-[430px] place-items-center px-6 py-8 text-center text-surface-strong">
                          <div className="grid justify-items-center gap-8">
                            <Image
                              alt="Hargita Nemzeti Szekler Nepi Egyuttes"
                              className="h-auto w-[132px] rounded-full border-2 border-surface-strong bg-surface-strong object-contain p-2"
                              height={132}
                              src="/logo.png"
                              width={132}
                            />
                            <span
                              className="inline-flex min-h-[44px] items-center justify-center border-2 border-surface-strong px-7 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-surface-strong transition hover:bg-surface-strong hover:text-thread-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface-strong"
                            >
                              Olvasás
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {hasMoreNewsPosts ? (
                <div className="mt-10 flex justify-center">
                  <Link
                    className="inline-flex min-h-[46px] items-center justify-center bg-surface-strong px-8 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-thread-red shadow-[6px_6px_0_rgb(33_31_27_/_14%)] transition duration-200 hover:scale-105 hover:bg-thread-red hover:text-surface-strong active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread-red"
                    href="/hirek"
                  >
                    Összes hír
                  </Link>
                </div>
              ) : null}
            </>
          ) : null}
        </HomeRevealGroup>
      </section>
    </main>
  );
}
