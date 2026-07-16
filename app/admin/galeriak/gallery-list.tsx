"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { panel } from "@/lib/styles";
import { movePerformanceGalleryAction, toggleGalleryPublicationAction } from "./actions";
import { DeleteGalleryModal } from "./delete-gallery-modal";
import { EditGalleryModal } from "./edit-gallery-modal";
import { NewGalleryModal } from "./new-gallery-modal";

type Gallery = {
  id: string;
  title: string;
  coverImageUrl: string;
  galleryIsPublished: boolean;
  galleryImages: { id: string; imageUrl: string }[];
};

export function GalleryList({ galleries }: { galleries: Gallery[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("hu");
    return normalized ? galleries.filter((gallery) => gallery.title.toLocaleLowerCase("hu").includes(normalized)) : galleries;
  }, [galleries, query]);

  return <>
    <div className="mt-6 flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
      <label className="relative block w-full max-w-[520px]">
        <span className="sr-only">Keresés a galériák között</span>
        <input className="min-h-[46px] w-full border-2 border-line-strong bg-surface-strong px-4 py-2.5 font-bold text-charcoal outline-none transition placeholder:text-muted/70 focus:border-thread-red" onChange={(event) => setQuery(event.target.value)} placeholder="Keresés a galériák között..." suppressHydrationWarning type="search" value={query} />
      </label>
      <NewGalleryModal />
    </div>

    <div className="mt-6 grid gap-4">
      {filtered.map((gallery) => {
        const group = galleries.filter((item) => item.galleryIsPublished === gallery.galleryIsPublished);
        const groupIndex = group.findIndex((item) => item.id === gallery.id);

        return <article className={`${panel} grid gap-4 p-4 transition min-[720px]:grid-cols-[112px_1fr] min-[720px]:items-center`} key={gallery.id}>
        <Image alt="" className={`aspect-[4/3] w-full border-2 border-charcoal object-cover transition ${gallery.galleryIsPublished ? "" : "grayscale opacity-60"}`} height={84} src={gallery.coverImageUrl} width={112} />
        <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between">
          <div className={gallery.galleryIsPublished ? "" : "grayscale opacity-60"}><h2 className="font-serif text-2xl font-bold leading-tight">{gallery.title}</h2><p className="mt-1 text-sm font-extrabold text-muted">{gallery.galleryImages.length} kép · {gallery.galleryIsPublished ? "Publikálva" : "Elrejtve"}</p></div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <form action={movePerformanceGalleryAction}><input name="id" type="hidden" value={gallery.id} /><input name="direction" type="hidden" value="up" /><button className="inline-flex min-h-8 items-center justify-center border border-line bg-surface-strong px-3 py-1.5 text-xs font-extrabold text-muted transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-35" disabled={groupIndex === 0} type="submit">Fel</button></form>
            <form action={movePerformanceGalleryAction}><input name="id" type="hidden" value={gallery.id} /><input name="direction" type="hidden" value="down" /><button className="inline-flex min-h-8 items-center justify-center border border-line bg-surface-strong px-3 py-1.5 text-xs font-extrabold text-muted transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-35" disabled={groupIndex === group.length - 1} type="submit">Le</button></form>
            <form action={toggleGalleryPublicationAction}><input name="id" type="hidden" value={gallery.id} /><input name="galleryIsPublished" type="hidden" value={String(!gallery.galleryIsPublished)} /><button className={`inline-flex min-h-8 items-center justify-center border px-3 py-1.5 text-xs font-extrabold transition ${gallery.galleryIsPublished ? "border-line bg-surface-strong text-muted hover:border-charcoal hover:bg-surface" : "border-[rgb(49_90_59_/_55%)] bg-[rgb(49_90_59_/_12%)] text-pine hover:bg-[rgb(49_90_59_/_20%)]"}`} type="submit">{gallery.galleryIsPublished ? "Elrejtés" : "Publikálás"}</button></form>
            <EditGalleryModal coverImageUrl={gallery.coverImageUrl} id={gallery.id} images={gallery.galleryImages} title={gallery.title} />
            <DeleteGalleryModal id={gallery.id} title={gallery.title} />
          </div>
        </div>
      </article>})}
      {filtered.length === 0 ? <article className={`${panel} p-5`}><p className="font-extrabold text-muted">{query ? "Nincs a keresésnek megfelelő galéria." : "Nincs galéria feltöltve."}</p></article> : null}
    </div>
  </>;
}
