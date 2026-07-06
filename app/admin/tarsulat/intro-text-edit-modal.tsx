"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { buttonPrimary, buttonSecondary, panel } from "@/lib/styles";
import { updateIntroTextAction, type IntroTextFormState } from "./actions";

const initialState: IntroTextFormState = {
  message: "",
  status: "idle",
};

type IntroTextEditModalProps = {
  introText: string;
};

export function IntroTextEditModal({ introText }: IntroTextEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(introText || "<p></p>");
  const [state, formAction, isPending] = useActionState(updateIntroTextAction, initialState);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
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
    content: introText || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setContent(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextContent = introText || "<p></p>";
    setContent(nextContent);
    editor?.commands.setContent(nextContent);
    closeButtonRef.current?.focus();
  }, [editor, introText, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setIsOpen(false);
    router.refresh();
  }, [router, state.status]);

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
    <>
      <button className={buttonPrimary} type="button" onClick={() => setIsOpen(true)}>
        Bemutató szöveg módosítása
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} max-h-[min(820px,calc(100vh-64px))] w-full max-w-[780px] overflow-y-auto p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight" id={titleId}>
                Bemutató szöveg módosítása
              </h2>
              <button
                aria-label="Modal bezárása"
                className="grid size-9 shrink-0 place-items-center border border-line bg-surface-strong text-[20px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form action={formAction} className="grid gap-4">
              <input name="introText" type="hidden" value={content} />
              <div className="border-2 border-line-strong bg-surface-strong">
                <div className="flex flex-wrap gap-2 border-b border-line bg-surface px-3 py-3">
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().setParagraph().run()}>
                    Bekezdés
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                    Alcím 2
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
                    Alcím 3
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
                    Félkövér
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
                    Dőlt
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                    Lista
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
                    Idézet
                  </button>
                  <button className={buttonSecondary} type="button" onClick={setLink}>
                    Link
                  </button>
                  <button className={buttonSecondary} type="button" onClick={() => fileInputRef.current?.click()}>
                    Kép
                  </button>
                  <input
                    accept="image/*"
                    className="hidden"
                    multiple
                    ref={fileInputRef}
                    type="file"
                    onChange={(event) => {
                      insertImages(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </div>
                <EditorContent editor={editor} className="rich-text-editor min-h-[300px] px-4 py-3 text-base font-bold leading-relaxed text-charcoal" />
              </div>

              {state.status === "error" ? (
                <p className="border border-thread-red bg-surface-strong px-3 py-2 text-sm font-extrabold text-thread-red">
                  {state.message}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
                  Mégse
                </button>
                <button className={buttonPrimary} disabled={isPending} type="submit">
                  {isPending ? "Mentés..." : "Mentés"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
