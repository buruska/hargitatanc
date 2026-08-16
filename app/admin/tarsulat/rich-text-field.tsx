"use client";

import { useRef, useState } from "react";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { buttonSecondary } from "@/lib/styles";
import { BoldIcon, BulletListIcon, Heading2Icon, Heading3Icon, ImageIcon, ItalicIcon, LinkIcon, ParagraphIcon, QuoteIcon } from "../rich-text-toolbar-icons";

type RichTextFieldProps = {
  initialValue?: string;
  label: string;
  name: string;
};

export function RichTextField({ initialValue = "<p></p>", label, name }: RichTextFieldProps) {
  const [content, setContent] = useState(initialValue || "<p></p>");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    content: initialValue || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setContent(currentEditor.getHTML());
    },
  });

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
    <div className="grid gap-1.5">
      <input name={name} type="hidden" value={content} />
      <p className="text-sm font-extrabold text-muted">{label}</p>
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
          <button aria-label="Idézet" className={buttonSecondary} title="Idézet" type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <QuoteIcon />
          </button>
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
  );
}
