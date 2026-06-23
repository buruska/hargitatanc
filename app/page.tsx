import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Élő hagyomány kortárs színpadon</p>
          <h1>Hargita Székely Néptáncszínház</h1>
          <p className="lead">
            Előadások, közösségi események, hírek és képek egy tiszta, mobilbarát felületen.
          </p>
          <div className="cta-row">
            <Link href="/esemenyeink" className="button primary">
              Helyfoglalás
            </Link>
            <Link href="/tarsulat" className="button secondary">
              A társulatról
            </Link>
          </div>
        </div>
        <aside className="hero-panel">
          <div className="hero-image">Aktuális előadásfotók helye</div>
          <h2>Következő előadások</h2>
          {events.map((event) => (
            <article className="card" key={event.id}>
              <time>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "long", timeStyle: "short" }).format(event.startsAt)}</time>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
            </article>
          ))}
        </aside>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Friss hírek</h2>
          <Link href="/hirek" className="button secondary">
            Összes hír
          </Link>
        </div>
        <div className="grid">
          {posts.map((post) => (
            <article className="card" key={post.id}>
              <span className="meta">{new Intl.DateTimeFormat("hu-RO", { dateStyle: "medium" }).format(post.publishedAt)}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
