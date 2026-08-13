"use client";

import { useMemo, useState } from "react";
import { panel } from "@/lib/styles";
import { normalizeSearchValue } from "@/lib/normalize-search";
import { NewNewsPostModal } from "./new-news-post-modal";
import { NewsPostActions } from "./news-post-actions";

type NewsPost = {
  content: string;
  excerpt: string;
  id: string;
  featuredOrder: number | null;
  featuredUntil: string | null;
  locale: string;
  publishedAt: string;
  title: string;
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const dateFormatter = new Intl.DateTimeFormat("hu-RO", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
});

export function NewsPostList({ posts }: { posts: NewsPost[] }) {
  const [activeLocale, setActiveLocale] = useState<"hu" | "ro" | "en">("hu");
  const [query, setQuery] = useState("");
  const localePosts = useMemo(() => posts.filter((post) => post.locale === activeLocale), [activeLocale, posts]);
  const featuredPosts = useMemo(() => localePosts.filter((post) => post.featuredUntil && new Date(post.featuredUntil) >= new Date()), [localePosts]);
  const filteredPosts = useMemo(() => {
    const normalized = normalizeSearchValue(query.trim());
    if (!normalized) return localePosts;

    return localePosts.filter((post) =>
      normalizeSearchValue(`${post.title} ${post.excerpt} ${stripHtml(post.content)}`).includes(normalized),
    );
  }, [localePosts, query]);
  const languageNames = { hu: "Magyar", ro: "Román", en: "Angol" } as const;

  return <>
    <div className="mt-6 flex items-end gap-1 border-b-2 border-charcoal bg-surface px-3 pt-3" role="tablist" aria-label="Hírfolyam nyelve">
      {(Object.keys(languageNames) as Array<keyof typeof languageNames>).map((locale) => {
        const isActive = activeLocale === locale;
        return (
          <button
            aria-selected={isActive}
            className={`relative -mb-0.5 min-h-[42px] border-2 px-5 py-2 text-sm font-extrabold transition ${isActive ? "z-[1] border-charcoal border-b-warm-canvas bg-warm-canvas text-thread-red" : "border-line bg-surface text-muted hover:border-charcoal hover:bg-surface-strong hover:text-thread-red"}`}
            key={locale}
            role="tab"
            type="button"
            onClick={() => {
              setActiveLocale(locale);
              setQuery("");
            }}
          >
            {languageNames[locale]}
          </button>
        );
      })}
    </div>
    <div className="mt-6 flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
      <label className="block w-full max-w-[520px]">
        <span className="sr-only">Keresés a hírek között</span>
        <input
          className="min-h-[46px] w-full border-2 border-line-strong bg-surface-strong px-4 py-2.5 font-bold text-charcoal outline-none transition placeholder:text-muted/70 focus:border-thread-red"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Keresés a ${languageNames[activeLocale].toLocaleLowerCase("hu-HU")} hírek között...`}
          suppressHydrationWarning
          type="search"
          value={query}
        />
      </label>
      {activeLocale === "hu" ? <NewNewsPostModal /> : null}
    </div>

    <div className="mt-6 grid gap-4">
      {filteredPosts.map((post) => {
        const preview = stripHtml(post.content);
        const originalIndex = localePosts.findIndex((item) => item.id === post.id);
        const featuredIndex = featuredPosts.findIndex((item) => item.id === post.id);
        const isFeatured = featuredIndex !== -1;

        return (
          <article className={`${panel} min-w-0 overflow-hidden p-5`} key={post.id}>
            <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
              <div>
                {isFeatured ? (
                  <p className="mb-2 inline-flex border border-[rgb(205_151_35_/_70%)] bg-[rgb(205_151_35_/_14%)] px-2 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[rgb(122_83_18)]">
                    Kiemelt hír · {new Intl.DateTimeFormat("hu-RO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(post.featuredUntil!))}-ig
                  </p>
                ) : null}
                <p className="text-sm font-extrabold text-thread-red">{dateFormatter.format(new Date(post.publishedAt))}</p>
                <h2 className="mt-2 font-serif text-2xl font-bold leading-tight">{post.title}</h2>
              </div>
              <NewsPostActions
                content={post.content}
                excerpt={post.excerpt}
                id={post.id}
                featuredUntil={post.featuredUntil}
                isFeatured={isFeatured}
                isFirst={isFeatured ? featuredIndex === 0 : originalIndex === featuredPosts.length}
                isLast={isFeatured ? featuredIndex === featuredPosts.length - 1 : originalIndex === localePosts.length - 1}
                publishedAt={post.publishedAt}
                title={post.title}
              />
            </div>
            {post.excerpt ? <p className="mt-1 text-sm font-extrabold text-petrol">{post.excerpt}</p> : null}
            {preview ? <p className="mt-3 line-clamp-3 break-words text-muted [overflow-wrap:anywhere]">{preview}</p> : null}
          </article>
        );
      })}

      {filteredPosts.length === 0 ? (
        <article className={`${panel} p-5`}>
          <p className="font-extrabold text-muted">{query ? "Nincs a keresésnek megfelelő hír." : "Még nincs feltöltött hír vagy beszámoló."}</p>
        </article>
      ) : null}
    </div>
  </>;
}
