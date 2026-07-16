"use client";

import { useMemo, useState } from "react";
import { panel } from "@/lib/styles";
import { NewNewsPostModal } from "./new-news-post-modal";
import { NewsPostActions } from "./news-post-actions";

type NewsPost = {
  content: string;
  excerpt: string;
  id: string;
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
  const [query, setQuery] = useState("");
  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("hu");
    if (!normalized) return posts;

    return posts.filter((post) =>
      `${post.title} ${post.excerpt} ${stripHtml(post.content)}`.toLocaleLowerCase("hu").includes(normalized),
    );
  }, [posts, query]);

  return <>
    <div className="mt-6 flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
      <label className="block w-full max-w-[520px]">
        <span className="sr-only">Keresés a hírek között</span>
        <input
          className="min-h-[46px] w-full border-2 border-line-strong bg-surface-strong px-4 py-2.5 font-bold text-charcoal outline-none transition placeholder:text-muted/70 focus:border-thread-red"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Keresés a hírek között..."
          suppressHydrationWarning
          type="search"
          value={query}
        />
      </label>
      <NewNewsPostModal />
    </div>

    <div className="mt-6 grid gap-4">
      {filteredPosts.map((post) => {
        const preview = stripHtml(post.content);
        const originalIndex = posts.findIndex((item) => item.id === post.id);

        return (
          <article className={`${panel} p-5`} key={post.id}>
            <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
              <div>
                <p className="text-sm font-extrabold text-thread-red">{dateFormatter.format(new Date(post.publishedAt))}</p>
                <h2 className="mt-2 font-serif text-2xl font-bold leading-tight">{post.title}</h2>
              </div>
              <NewsPostActions
                content={post.content}
                excerpt={post.excerpt}
                id={post.id}
                isFirst={originalIndex === 0}
                isLast={originalIndex === posts.length - 1}
                publishedAt={post.publishedAt}
                title={post.title}
              />
            </div>
            {post.excerpt ? <p className="mt-1 text-sm font-extrabold text-petrol">{post.excerpt}</p> : null}
            {preview ? <p className="mt-3 line-clamp-3 text-muted">{preview}</p> : null}
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
