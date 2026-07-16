"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import {
  deleteNewsPostAction,
  moveNewsPostAction,
  updateNewsPostAction,
  type DeleteNewsPostState,
  type NewsPostFormState,
} from "./actions";

type NewsPostActionsProps = {
  content: string;
  excerpt: string;
  id: string;
  isFirst: boolean;
  isLast: boolean;
  publishedAt: string;
  title: string;
};

const formInitialState: NewsPostFormState = {};
const deleteInitialState: DeleteNewsPostState = {};

function getLocalDateTimeInputValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function NewsPostActions({ content, excerpt, id, isFirst, isLast, publishedAt, title }: NewsPostActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <form action={moveNewsPostAction}>
        <input name="id" type="hidden" value={id} />
        <input name="direction" type="hidden" value="up" />
        <button
          className="inline-flex min-h-8 items-center justify-center border border-line bg-surface-strong px-3 py-1.5 text-xs font-extrabold text-muted transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
          type="submit"
          disabled={isFirst}
        >
          Fel
        </button>
      </form>
      <form action={moveNewsPostAction}>
        <input name="id" type="hidden" value={id} />
        <input name="direction" type="hidden" value="down" />
        <button
          className="inline-flex min-h-8 items-center justify-center border border-line bg-surface-strong px-3 py-1.5 text-xs font-extrabold text-muted transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
          type="submit"
          disabled={isLast}
        >
          Le
        </button>
      </form>
      <button
        className="inline-flex min-h-8 items-center justify-center border border-[rgb(205_151_35_/_70%)] bg-[rgb(205_151_35_/_12%)] px-3 py-1.5 text-xs font-extrabold text-[rgb(122_83_18)] transition hover:bg-[rgb(205_151_35_/_20%)] hover:text-charcoal"
        type="button"
        onClick={() => setIsEditOpen(true)}
      >
        Módosítás
      </button>
      <button
        className="inline-flex min-h-8 items-center justify-center border border-[rgb(179_38_32_/_55%)] bg-[rgb(179_38_32_/_10%)] px-3 py-1.5 text-xs font-extrabold text-thread-red transition hover:bg-[rgb(179_38_32_/_18%)] hover:text-charcoal"
        type="button"
        onClick={() => setIsDeleteOpen(true)}
      >
        Törlés
      </button>
      <EditNewsPostModal
        content={content}
        excerpt={excerpt}
        id={id}
        isOpen={isEditOpen}
        publishedAt={publishedAt}
        title={title}
        onClose={() => setIsEditOpen(false)}
      />
      <DeleteNewsPostModal id={id} isOpen={isDeleteOpen} title={title} onClose={() => setIsDeleteOpen(false)} />
    </div>
  );
}

function EditNewsPostModal({
  content,
  excerpt,
  id,
  isOpen,
  publishedAt,
  title,
  onClose,
}: Readonly<{
  content: string;
  excerpt: string;
  id: string;
  isOpen: boolean;
  publishedAt: string;
  title: string;
  onClose: () => void;
}>) {
  const [state, formAction, isPending] = useActionState(updateNewsPostAction, formInitialState);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedExcerpt, setEditedExcerpt] = useState(excerpt);
  const [editedPublishedAt, setEditedPublishedAt] = useState(() => getLocalDateTimeInputValue(publishedAt));
  const [editedContent, setEditedContent] = useState(content);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const titleId = useId();
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setEditedContent(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!state.success) {
      return;
    }

    onClose();
    router.refresh();
  }, [onClose, router, state.success]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEditedTitle(title);
    setEditedExcerpt(excerpt);
    setEditedPublishedAt(getLocalDateTimeInputValue(publishedAt));
    setEditedContent(content);
    editor?.commands.setContent(content);
  }, [content, editor, excerpt, isOpen, publishedAt, title]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function insertImages(files: FileList | null) {
    if (!editor || !files) {
      return;
    }

    Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .forEach((file) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => {
          const src = String(reader.result ?? "");

          if (src) {
            editor.chain().focus().setImage({ src, alt: file.name }).run();
          }
        });
        reader.readAsDataURL(file);
      });
  }

  function setLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={`${panel} max-h-[min(820px,calc(100vh-64px))] w-full max-w-[760px] overflow-y-auto p-6`}
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>
            Hír módosítása
          </h2>
          <button
            aria-label="Modal bezárása"
            className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form action={formAction} className="grid gap-4">
          {state.error ? (
            <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
              {state.error}
            </p>
          ) : null}
          <input name="id" type="hidden" value={id} />
          <input name="content" type="hidden" value={editedContent} />
          <label className={label}>
            Hír címe
            <input
              className={input}
              name="title"
              type="text"
              value={editedTitle}
              required
              onChange={(changeEvent) => setEditedTitle(changeEvent.target.value)}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 min-[620px]:grid-cols-2">
            <label className={label}>
              Dátum
              <input
                className={input}
                name="publishedAt"
                type="datetime-local"
                value={editedPublishedAt}
                required
                onChange={(changeEvent) => setEditedPublishedAt(changeEvent.target.value)}
              />
            </label>
            <label className={label}>
              Helyszín / összefoglaló
              <input
                className={input}
                name="excerpt"
                type="text"
                value={editedExcerpt}
                onChange={(changeEvent) => setEditedExcerpt(changeEvent.target.value)}
              />
            </label>
          </div>
          <label className={label}>
            Hír szövege
            <div className="overflow-hidden border-2 border-line-strong bg-surface-strong">
              <div className="flex flex-wrap gap-1 border-b border-line bg-surface px-2 py-2">
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold ${editor?.isActive("paragraph") ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().setParagraph().run()}
                >
                  Bekezdés
                </button>
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold ${editor?.isActive("heading", { level: 2 }) ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  Alcím 2
                </button>
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold ${editor?.isActive("heading", { level: 3 }) ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  Alcím 3
                </button>
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold ${editor?.isActive("bold") ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  B
                </button>
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold italic ${editor?.isActive("italic") ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  I
                </button>
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold ${editor?.isActive("bulletList") ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                  Lista
                </button>
                <button
                  className={`min-h-8 border border-line px-2 text-xs font-extrabold ${editor?.isActive("blockquote") ? "bg-thread-red text-surface-strong" : "bg-surface-strong text-muted"}`}
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                >
                  Idézet
                </button>
                <button
                  className="min-h-8 border border-line bg-surface-strong px-2 text-xs font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                  type="button"
                  onClick={setLink}
                >
                  Link
                </button>
                <button
                  className="min-h-8 border border-line bg-surface-strong px-2 text-xs font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Képek
                </button>
                <button
                  className="min-h-8 border border-line bg-surface-strong px-2 text-xs font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                >
                  Vissza
                </button>
                <button
                  className="min-h-8 border border-line bg-surface-strong px-2 text-xs font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                >
                  Újra
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  multiple
                  ref={fileInputRef}
                  type="file"
                  onChange={(changeEvent) => {
                    insertImages(changeEvent.target.files);
                    changeEvent.target.value = "";
                  }}
                />
              </div>
              <EditorContent editor={editor} className="rich-text-editor min-h-[260px] px-4 py-3 text-base font-bold leading-relaxed text-charcoal" />
            </div>
          </label>
          <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
            <button className={buttonSecondary} type="button" onClick={onClose}>
              Mégsem
            </button>
            <button className={buttonPrimary} type="submit" disabled={isPending}>
              {isPending ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteNewsPostModal({
  id,
  isOpen,
  title,
  onClose,
}: Readonly<{
  id: string;
  isOpen: boolean;
  title: string;
  onClose: () => void;
}>) {
  const [state, formAction, isPending] = useActionState(deleteNewsPostAction, deleteInitialState);
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!state.success) {
      return;
    }

    onClose();
    router.refresh();
  }, [onClose, router, state.success]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
      <section aria-labelledby={titleId} aria-modal="true" className={`${panel} w-full max-w-[480px] p-6`} role="dialog">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-[1.05]" id={titleId}>
            Hír törlése
          </h2>
          <button
            aria-label="Modal bezárása"
            className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="text-muted">Biztosan törölni akarod ezt a hírt?</p>
        <p className="mt-3 font-serif text-2xl font-bold leading-tight">{title}</p>
        {state.error ? (
          <p className="mt-5 border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
            {state.error}
          </p>
        ) : null}
        <form action={formAction} className="mt-6 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
          <input name="id" type="hidden" value={id} />
          <button className={buttonSecondary} type="button" onClick={onClose}>
            Mégsem
          </button>
          <button className={buttonPrimary} type="submit" disabled={isPending}>
            {isPending ? "Törlés..." : "Igen, törlés"}
          </button>
        </form>
      </section>
    </div>
  );
}
