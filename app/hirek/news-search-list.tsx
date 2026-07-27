"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { eyebrow, h1 } from "@/lib/styles";
import { normalizeSearchValue } from "@/lib/normalize-search";

type Locale = "hu" | "ro" | "en";

function localizeHref(href: string, locale: Locale) {
  return locale === "hu" ? href : `/${locale}${href}`;
}

type NewsPostCard = {
  excerpt: string | null;
  id: string;
  imageSrc: string | null;
  publishedAt: string;
  slug: string;
  title: string;
};

type NewsSearchListProps = {
  heading: {
    eyebrow: string;
    title: string;
  };
  locale: Locale;
  posts: NewsPostCard[];
};

const copy = {
  hu: {
    empty: "Nincs találat erre a keresésre.",
    fallback: "Hír",
    locale: "hu-RO",
    placeholder: "Keresés a hírek között",
    read: "Olvasás",
    searchLabel: "Hírek keresése",
  },
  ro: {
    empty: "Nu există rezultate pentru această căutare.",
    fallback: "Știre",
    locale: "ro-RO",
    placeholder: "Caută printre știri",
    read: "Citește",
    searchLabel: "Căutare în știri",
  },
  en: {
    empty: "No results found for this search.",
    fallback: "News",
    locale: "en-GB",
    placeholder: "Search the news",
    read: "Read",
    searchLabel: "Search news",
  },
} as const;

export function NewsSearchList({ heading, locale, posts }: NewsSearchListProps) {
  const [query, setQuery] = useState("");
  const labels = copy[locale];
  const trimmedQuery = normalizeSearchValue(query.trim());
  const filteredPosts = useMemo(() => {
    if (!trimmedQuery) {
      return posts;
    }

    return posts.filter((post) => {
      const dateText = new Intl.DateTimeFormat(labels.locale, { dateStyle: "long" }).format(new Date(post.publishedAt));
      const searchableText = normalizeSearchValue(`${post.title} ${post.excerpt ?? ""} ${dateText}`);

      return searchableText.includes(trimmedQuery);
    });
  }, [labels.locale, posts, trimmedQuery]);

  return (
    <>
      <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={eyebrow}>{heading.eyebrow}</p>
          <h1 className={h1}>{heading.title}</h1>
        </div>
        <label className="block w-full max-w-[280px] md:shrink-0">
          <span className="sr-only">{labels.searchLabel}</span>
          <input
            className="min-h-[48px] w-full border-2 border-line-strong bg-surface-strong px-4 py-3 text-[16px] font-bold text-charcoal shadow-[6px_6px_0_rgb(33_31_27_/_10%)] outline-none transition placeholder:text-muted/70 focus:border-thread-red focus:shadow-[8px_8px_0_rgb(179_38_32_/_16%)]"
            placeholder={labels.placeholder}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {filteredPosts.length > 0 ? (
        <section className="grid auto-rows-fr gap-5 min-[720px]:grid-cols-2 min-[1120px]:grid-cols-4">
          {filteredPosts.map((post) => (
            <Link className="home-news-card home-news-card-static block h-full min-h-[300px]" href={localizeHref(`/hirek/${post.slug}`, locale)} id={post.id} key={post.id}>
              <div className="home-news-card-flip relative h-full min-h-[300px] shadow-[10px_10px_0_rgb(33_31_27_/_18%)]">
                <div className="home-news-card-face home-news-card-front flex h-full min-h-[300px] flex-col bg-surface-strong px-5 py-6 text-center">
                  <time className="block font-serif text-[16px] leading-tight text-charcoal">
                    {new Intl.DateTimeFormat(labels.locale, { dateStyle: "long" }).format(new Date(post.publishedAt))}
                  </time>
                  <h2 className="mb-9 mt-9 line-clamp-4 h-[5em] overflow-hidden font-serif text-[clamp(18px,2vw,22px)] font-bold italic leading-tight text-thread-red">
                    {post.title}
                  </h2>
                  <div className="-mx-5 -mb-6 mt-auto pt-4">
                    {post.imageSrc ? (
                      <Image
                        alt=""
                        className="aspect-[4/3] w-full object-cover"
                        height={240}
                        src={post.imageSrc}
                        unoptimized={post.imageSrc.startsWith("data:")}
                        width={320}
                      />
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center bg-surface text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted">
                        {labels.fallback}
                      </div>
                    )}
                  </div>
                </div>
                <div className="home-news-card-face home-news-card-back absolute inset-0 grid h-full min-h-[300px] place-items-center px-6 py-8 text-center text-surface-strong">
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
                      {labels.read}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <p className="border-2 border-line bg-surface-strong px-5 py-4 text-[15px] font-extrabold text-muted">
          {labels.empty}
        </p>
      )}
    </>
  );
}
