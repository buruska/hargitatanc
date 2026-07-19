import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";

type NewsPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { slug },
    select: {
      content: true,
      publishedAt: true,
      title: true,
    },
  });

  if (!post) notFound();

  return (
    <main className="mx-auto min-h-[calc(100vh-101px)] w-[calc(100%-36px)] pb-[80px] pt-[124px] md:w-[80vw] md:max-w-[1440px] supports-[height:100dvh]:min-h-[calc(100dvh-101px)]">
      <article className="border border-line bg-surface-strong px-[clamp(20px,6vw,88px)] py-[clamp(32px,6vw,80px)] text-charcoal shadow-[8px_8px_0_rgb(33_31_27_/_7%)]">
        <header className="mx-auto max-w-[900px] border-b border-line pb-[clamp(24px,3vw,36px)] text-center">
          <span className="mx-auto mb-5 block h-[2px] w-12 bg-thread-red" aria-hidden="true" />
          <h1 className="font-serif text-[clamp(27px,3.2vw,42px)] font-bold leading-[1.12] text-thread-red">{post.title}</h1>
          <time className="mt-4 block text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
            {new Intl.DateTimeFormat("hu-RO", { dateStyle: "long", timeZone: "Europe/Bucharest" }).format(post.publishedAt)}
          </time>
        </header>
        <div
          className="news-article-content mx-auto mt-[clamp(32px,5vw,56px)] max-w-[960px] text-[clamp(15px,1.15vw,17px)] font-normal leading-[1.8]"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
        />
      </article>
      <Link className="mt-8 inline-flex min-h-[44px] items-center gap-2 border-b border-thread-red text-[13px] font-bold uppercase tracking-[0.08em] text-thread-red transition hover:border-charcoal hover:text-charcoal" href="/hirek">
        <span aria-hidden="true">&larr;</span>
        Vissza a hírekhez
      </Link>
    </main>
  );
}
