import { prisma } from "@/lib/prisma";
import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced, meta } from "@/lib/styles";
import { getLocale } from "@/lib/i18n";

export default async function EsemenyeinkPage() {
  const locale = await getLocale();
  const heading = locale === "ro" ? { eyebrow: "Evenimente", title: "Spectacole și evenimente" } : locale === "en" ? { eyebrow: "Events", title: "Performances and events" } : { eyebrow: "Eseményeink", title: "Előadások és rendezvények" };
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>{heading.eyebrow}</p>
      <h1 className={h1}>{heading.title}</h1>
      <p className={leadSpaced}>
        A közelgő előadások és rendezvények elsőként jelennek meg, az archív beszámolók külön blokkba kerülnek majd.
      </p>
      <section className={gridTwo}>
        {events.map((event) => (
          <article className={card} key={event.id}>
            <time className={meta}>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "full", timeStyle: "short" }).format(event.startsAt)}</time>
            <h2 className={h2}>{event.title}</h2>
            <p>{event.summary}</p>
            <p className={meta}>{event.location}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
