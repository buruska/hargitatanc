"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import {
  deleteGalleryImageAction,
  updatePerformanceGalleryAction,
  type DeleteGalleryImageState,
  type EditGalleryState,
} from "./actions";

type GalleryImage = { id: string; imageUrl: string };
type Props = { id: string; title: string; coverImageUrl: string; images: GalleryImage[] };
const initialEditState: EditGalleryState = {};
const initialDeleteState: DeleteGalleryImageState = {};

export function EditGalleryModal({ id, title, coverImageUrl, images }: Props) {
  const [editState, editAction, isSaving] = useActionState(updatePerformanceGalleryAction, initialEditState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteGalleryImageAction, initialDeleteState);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (editState.success) { setIsOpen(false); router.refresh(); }
  }, [editState.success, router]);
  useEffect(() => {
    if (deleteState.success) router.refresh();
  }, [deleteState.success, router]);
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isOpen]);

  return <>
    <button className="inline-flex min-h-8 items-center justify-center border border-[rgb(205_151_35_/_70%)] bg-[rgb(205_151_35_/_12%)] px-3 py-1.5 text-xs font-extrabold text-[rgb(122_83_18)] transition hover:bg-[rgb(205_151_35_/_20%)] hover:text-charcoal" type="button" onClick={() => setIsOpen(true)}>
      Módosítás
    </button>
    {isOpen ? <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 px-4 py-8" role="presentation">
      <section aria-labelledby={titleId} aria-modal="true" className={`${panel} mx-auto w-full max-w-[900px] p-6`} role="dialog">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>Galéria módosítása</h2>
          <button aria-label="Modal bezárása" className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold" type="button" onClick={() => setIsOpen(false)}>×</button>
        </div>

        {(editState.error || deleteState.error) ? <p className="mb-5 border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">{editState.error || deleteState.error}</p> : null}

        <form action={editAction} className="grid gap-6" encType="multipart/form-data">
          <input name="id" type="hidden" value={id} />
          <label className={label}>Galéria címe<input className={input} defaultValue={title} name="title" required /></label>
          <fieldset>
            <legend className="mb-3 font-extrabold">Borítókép kiválasztása</legend>
            <div className="grid grid-cols-2 gap-3 min-[620px]:grid-cols-3 min-[820px]:grid-cols-4">
              {images.map((image) => <label className="group relative cursor-pointer" key={image.id}>
                <input className="peer sr-only" defaultChecked={image.imageUrl === coverImageUrl} name="coverImageId" type="radio" value={image.id} />
                <Image alt="" className="aspect-[4/3] w-full border-4 border-transparent object-cover peer-checked:border-thread-red" height={180} src={image.imageUrl} width={240} />
                <span className="absolute bottom-2 left-2 hidden bg-thread-red px-2 py-1 text-xs font-extrabold text-white peer-checked:block">Borító</span>
              </label>)}
            </div>
          </fieldset>
          <label className={label}>Új képek feltöltése<input accept="image/*" className="min-h-[46px] border-2 border-line-strong bg-surface-strong px-3 py-2.5 file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-white" multiple name="galleryImages" type="file" /></label>
          <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
            <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>Mégsem</button>
            <button className={buttonPrimary} disabled={isSaving} type="submit">{isSaving ? "Mentés..." : "Módosítások mentése"}</button>
          </div>
        </form>

        <div className="mt-8 border-t-2 border-line pt-6">
          <h3 className="mb-3 font-serif text-2xl font-bold">Képek törlése</h3>
          <div className="grid grid-cols-2 gap-3 min-[620px]:grid-cols-3 min-[820px]:grid-cols-4">
            {images.map((image) => <div className="border-2 border-line bg-surface-strong p-2" key={image.id}>
              <Image alt="" className="aspect-[4/3] w-full object-cover" height={180} src={image.imageUrl} width={240} />
              <form action={deleteAction} className="mt-2" onSubmit={(event) => { if (!window.confirm("Biztosan törlöd ezt a képet?")) event.preventDefault(); }}>
                <input name="id" type="hidden" value={image.id} />
                <button className="w-full border border-[#7f1712] bg-thread-red px-3 py-1.5 text-xs font-extrabold text-white disabled:opacity-40" disabled={images.length <= 1 || isDeleting} type="submit">Törlés</button>
              </form>
            </div>)}
          </div>
          {images.length <= 1 ? <p className="mt-3 text-sm font-bold text-muted">A galéria utolsó képe nem törölhető.</p> : null}
        </div>
      </section>
    </div> : null}
  </>;
}
