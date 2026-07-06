"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type NewsPostCard = {
  excerpt: string | null;
  id: string;
  imageSrc: string | null;
  publishedAt: string;
  title: string;
};

type NewsSearchListProps = {
  posts: NewsPostCard[];
};

export function NewsSearchList({ posts }: NewsSearchListProps) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim().toLocaleLowerCase("hu");
  const filteredPosts = useMemo(() => {
    if (!trimmedQuery) {
      return posts;
    }

    return posts.filter((post) => {
      const dateText = new Intl.DateTimeFormat("hu-RO", { dateStyle: "long" }).format(new Date(post.publishedAt));
      const searchableText = `${post.title} ${post.excerpt ?? ""} ${dateText}`.toLocaleLowerCase("hu");

      return searchableText.includes(trimmedQuery);
    });
  }, [posts, trimmedQuery]);

  return (
    <>
      <label className="mb-16 ml-auto mt-16 block w-full max-w-[280px]">
        <span className="sr-only">Hírek keresése</span>
        <input
          className="min-h-[48px] w-full border-2 border-line-strong bg-surface-strong px-4 py-3 text-[16px] font-bold text-charcoal shadow-[6px_6px_0_rgb(33_31_27_/_10%)] outline-none transition placeholder:text-muted/70 focus:border-thread-red focus:shadow-[8px_8px_0_rgb(179_38_32_/_16%)]"
          placeholder="Keresés a hírek között"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {filteredPosts.length > 0 ? (
        <section className="grid gap-5 min-[720px]:grid-cols-2 min-[1120px]:grid-cols-4">
          {filteredPosts.map((post) => (
            <article className="home-news-card home-news-card-static min-h-[430px]" id={post.id} key={post.id}>
              <div className="home-news-card-flip relative min-h-[430px] shadow-[10px_10px_0_rgb(33_31_27_/_18%)]">
                <div className="home-news-card-face home-news-card-front flex min-h-[430px] flex-col bg-surface-strong px-5 py-6 text-center">
                  <time className="block font-serif text-[16px] leading-tight text-charcoal">
                    {new Intl.DateTimeFormat("hu-RO", { dateStyle: "long" }).format(new Date(post.publishedAt))}
                  </time>
                  <h2 className="mt-3 font-serif text-[clamp(22px,2.2vw,28px)] font-bold italic leading-tight text-thread-red">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 text-[15px] font-extrabold leading-snug text-charcoal">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mx-auto my-5 block h-[16px] w-[112px] rounded-[50%] border-t-[3px] border-pine" />
                  <div className="mt-auto">
                    {post.imageSrc ? (
                      <Image
                        alt=""
                        className="aspect-[4/3] w-full border-2 border-line-strong object-cover"
                        height={240}
                        src={post.imageSrc}
                        unoptimized={post.imageSrc.startsWith("data:")}
                        width={320}
                      />
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center border-2 border-line-strong bg-surface text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted">
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
                    <a
                      className="inline-flex min-h-[44px] items-center justify-center border-2 border-surface-strong px-7 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-surface-strong transition hover:bg-surface-strong hover:text-thread-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface-strong"
                      href={`/hirek#${post.id}`}
                    >
                      Olvasás
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="border-2 border-line bg-surface-strong px-5 py-4 text-[15px] font-extrabold text-muted">
          Nincs találat erre a keresésre.
        </p>
      )}
    </>
  );
}
