import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced, meta } from "@/lib/styles";
import { getLocale } from "@/lib/i18n";
import { getSiteTextMap } from "@/lib/site-texts";

export default async function EsemenyeinkPage() {
  const locale = await getLocale();
  const siteTexts = await getSiteTextMap(locale);
  const heading = { eyebrow: siteTexts["events.eyebrow"], title: siteTexts["events.title"] };
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>{heading.eyebrow}</p>
      <h1 className={h1}>{heading.title}</h1>
      <p className={leadSpaced}>
        {siteTexts["events.subtitle"]}
      </p>
      <section className={gridTwo}>
        {events.map((event) => (
          <article className={`${card} overflow-hidden p-0`} key={event.id}>
            {event.coverImageUrl ? (
              <div className="relative aspect-[16/9] w-full border-b-2 border-line-strong bg-charcoal">
                <Image
                  alt={event.title}
                  className="object-cover"
                  fill
                  sizes="(min-width: 900px) 50vw, 100vw"
                  src={event.coverImageUrl}
                />
              </div>
            ) : null}
            <div className="p-[clamp(18px,3vw,28px)]">
              <time className={meta}>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "full", timeStyle: "short" }).format(event.startsAt)}</time>
              <h2 className={h2}>{event.title}</h2>
              <p>{event.summary}</p>
              <p className={meta}>{event.location}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
