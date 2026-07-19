import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eyebrow, h1 } from "@/lib/styles";
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
      <p className={eyebrow}>Hír</p>
      <time className="mt-6 block font-serif text-[16px] font-bold text-muted">
        {new Intl.DateTimeFormat("hu-RO", { dateStyle: "long", timeZone: "Europe/Bucharest" }).format(post.publishedAt)}
      </time>
      <h1 className={`${h1} mt-3 text-thread-red`}>{post.title}</h1>
      <article
        className="news-article-content mt-10 border-2 border-line-strong bg-surface-strong px-[clamp(20px,5vw,56px)] py-[clamp(28px,5vw,56px)] text-[clamp(16px,1.8vw,20px)] font-bold leading-relaxed text-charcoal shadow-[12px_12px_0_rgb(33_31_27_/_12%)]"
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
      />
      <Link className="mt-10 inline-flex min-h-[44px] items-center border-2 border-charcoal bg-thread-red px-6 py-2 text-sm font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]" href="/hirek">
        Vissza a hírekhez
      </Link>
    </main>
  );
}
