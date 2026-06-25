import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonPrimary, buttonSecondary, card, eyebrow, gridThree, h1, h2, h3, heroImage, lead, meta, page, panel } from "@/lib/styles";

export default async function HomePage() {
  const [events, posts] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.newsPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <main className={page}>
      <section className="mx-auto grid max-w-[1160px] grid-cols-1 gap-8 min-[861px]:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="grid content-center border-2 border-charcoal bg-[linear-gradient(135deg,rgb(179_38_32_/_10%),transparent_42%),linear-gradient(90deg,rgb(49_90_59_/_13%)_0_12px,transparent_12px_24px),theme(colors.surface)] p-[clamp(28px,5vw,64px)] shadow-[10px_10px_0_theme(colors.charcoal)] min-[861px]:min-h-[430px]">
          <p className={eyebrow}>Élő hagyomány kortárs színpadon</p>
          <h1 className={h1}>Hargita Székely Néptáncszínház</h1>
          <p className={lead}>
            Előadások, közösségi események, hírek és képek egy tiszta, mobilbarát felületen.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/esemenyeink" className={buttonPrimary}>
              Helyfoglalás
            </Link>
            <Link href="/tarsulat" className={buttonSecondary}>
              A társulatról
            </Link>
          </div>
        </div>
        <aside className={`${panel} p-[22px]`}>
          <div className={heroImage}>Aktuális előadásfotók helye</div>
          <h2 className={h2}>Következő előadások</h2>
          {events.map((event) => (
            <article className={card} key={event.id}>
              <time className={meta}>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "long", timeStyle: "short" }).format(event.startsAt)}</time>
              <h3 className={h3}>{event.title}</h3>
              <p>{event.location}</p>
            </article>
          ))}
        </aside>
      </section>

      <section className="mx-auto mt-14 max-w-[1160px]">
        <div className="mb-5 flex flex-col items-start justify-between gap-4 min-[861px]:flex-row min-[861px]:items-end">
          <h2 className={h2}>Friss hírek</h2>
          <Link href="/hirek" className={buttonSecondary}>
            Összes hír
          </Link>
        </div>
        <div className={gridThree}>
          {posts.map((post) => (
            <article className={card} key={post.id}>
              <span className={meta}>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "medium" }).format(post.publishedAt)}</span>
              <h3 className={h3}>{post.title}</h3>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
