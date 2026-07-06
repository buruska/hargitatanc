"use client";

import { useRef, useState } from "react";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { buttonSecondary } from "@/lib/styles";

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
        <EditorContent editor={editor} className="rich-text-editor min-h-[220px] px-4 py-3 text-base font-bold leading-relaxed text-charcoal" />
      </div>
    </div>
  );
}
