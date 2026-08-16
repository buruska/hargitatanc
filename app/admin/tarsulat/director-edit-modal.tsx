"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { BoldIcon, BulletListIcon, FileUploadIcon, Heading2Icon, Heading3Icon, ImageIcon, ItalicIcon, LinkIcon, ParagraphIcon } from "../rich-text-toolbar-icons";
import { insertUploadedFile } from "../upload-rich-text-file";
import { updateDirectorAction, type DirectorFormState } from "./actions";

const initialState: DirectorFormState = {
  message: "",
  status: "idle",
};

type DirectorEditModalProps = {
  buttonLabel?: string;
  compact?: boolean;
  directorBio: string;
  directorImageUrl: string | null;
  directorName: string;
  locale?: "hu" | "ro" | "en";
};

const localeNames = { hu: "magyar", ro: "román", en: "angol" } as const;

export function DirectorEditModal({
  buttonLabel,
  compact = false,
  directorBio,
  directorImageUrl,
  directorName,
  locale = "hu",
}: DirectorEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(directorBio || "<p></p>");
  const [state, formAction, isPending] = useActionState(updateDirectorAction, initialState);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const richTextFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const titleId = useId();
  const localeName = localeNames[locale];
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
    content: directorBio || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setContent(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    }

    closeButtonRef.current?.focus();
    const nextContent = directorBio || "<p></p>";
    setContent(nextContent);
    editor?.commands.setContent(nextContent);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [directorBio, editor, isOpen, isPending]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    formRef.current?.reset();
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
      <button className={`${compact ? `${buttonSecondary} !px-2` : buttonPrimary} transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95`} type="button" onClick={() => setIsOpen(true)}>
        {buttonLabel ?? `Igazgató adatai ${localeName}ul`}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} max-h-[min(760px,calc(100vh-64px))] w-full max-w-[560px] overflow-y-auto p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight" id={titleId}>
                Igazgató {localeName} adatainak módosítása
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

            <form action={formAction} className="grid gap-4" ref={formRef}>
              <input name="locale" type="hidden" value={locale} />
              <input name="directorBio" type="hidden" value={content} />
              <label className={label}>
                Név
                <input className={input} defaultValue={directorName} name="directorName" required type="text" />
              </label>

              <label className={label}>
                Kép
                <input
                  accept="image/*"
                  className={`${input} file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong`}
                  name="directorImage"
                  type="file"
                />
              </label>

              {directorImageUrl ? (
                <div className="grid gap-2">
                  <p className="text-sm font-extrabold text-muted">Aktuális kép</p>
                  <Image
                    alt="Aktuális igazgatói kép"
                    className="aspect-[4/3] w-full max-w-[220px] border-2 border-line-strong object-cover"
                    height={165}
                    src={directorImageUrl}
                    width={220}
                  />
                </div>
              ) : null}

              <div className="grid gap-1.5">
                <p className="text-sm font-extrabold text-muted">Leírás</p>
                <div className="border-2 border-line-strong bg-surface-strong">
                  <div className="flex flex-wrap gap-2 border-b border-line bg-surface px-3 py-3">
                    <button aria-label="Bekezdés" className={buttonSecondary} title="Bekezdés" type="button" onClick={() => editor?.chain().focus().setParagraph().run()}>
                      <ParagraphIcon />
                    </button>
                    <button aria-label="Alcím 2" className={buttonSecondary} title="Alcím 2" type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                      <Heading2Icon />
                    </button>
                    <button aria-label="Alcím 3" className={buttonSecondary} title="Alcím 3" type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
                      <Heading3Icon />
                    </button>
                    <button aria-label="Félkövér" className={buttonSecondary} title="Félkövér" type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
                      <BoldIcon />
                    </button>
                    <button aria-label="Dőlt" className={buttonSecondary} title="Dőlt" type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
                      <ItalicIcon />
                    </button>
                    <button aria-label="Felsorolás" className={buttonSecondary} title="Felsorolás" type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                      <BulletListIcon />
                    </button>
                    <button aria-label="Fájl feltöltése" className={buttonSecondary} title="Fájl feltöltése" type="button" onClick={() => richTextFileInputRef.current?.click()}>
                      <FileUploadIcon />
                    </button>
                    <input
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.odt,.ods"
                      className="hidden"
                      ref={richTextFileInputRef}
                      type="file"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (file) await insertUploadedFile(editor, file).catch((error: Error) => window.alert(error.message));
                        event.target.value = "";
                      }}
                    />
                    <button aria-label="Link hozzáadása" className={buttonSecondary} title="Link hozzáadása" type="button" onClick={setLink}>
                      <LinkIcon />
                    </button>
                    <button aria-label="Kép beszúrása" className={buttonSecondary} title="Kép beszúrása" type="button" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon />
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
                  <EditorContent editor={editor} className="rich-text-editor min-h-[220px] px-4 py-3 text-base font-bold leading-relaxed text-charcoal" />
                </div>
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
