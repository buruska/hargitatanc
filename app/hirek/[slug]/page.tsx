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
    <main className="mx-auto min-h-[calc(100vh-101px)] max-w-[920px] px-[clamp(18px,4vw,56px)] pb-[80px] pt-[124px] supports-[height:100dvh]:min-h-[calc(100dvh-101px)]">
      <article className="border-2 border-line-strong bg-surface-strong px-[clamp(20px,5vw,56px)] py-[clamp(28px,5vw,56px)] text-charcoal shadow-[12px_12px_0_rgb(33_31_27_/_12%)]">
        <header>
          <h1 className="font-serif text-[clamp(30px,5vw,48px)] font-bold leading-[1.05] text-thread-red">{post.title}</h1>
          <time className="mt-3 block font-serif text-[16px] font-bold text-muted">
            {new Intl.DateTimeFormat("hu-RO", { dateStyle: "long", timeZone: "Europe/Bucharest" }).format(post.publishedAt)}
          </time>
        </header>
        <div
          className="news-article-content mt-10 text-[clamp(16px,1.8vw,20px)] font-bold leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
        />
      </article>
      <Link className="mt-10 inline-flex min-h-[44px] items-center border-2 border-charcoal bg-thread-red px-6 py-2 text-sm font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]" href="/hirek">
        Vissza a hírekhez
      </Link>
    </main>
  );
}
