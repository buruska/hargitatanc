"use client";

import type { Editor } from "@tiptap/react";
import { uploadRichTextFileAction } from "./rich-text-file-actions";

export async function insertUploadedFile(editor: Editor | null, file: File) {
  if (!editor) return;

  const formData = new FormData();
  formData.set("file", file);
  const result = await uploadRichTextFileAction(formData);

  if ("error" in result) throw new Error(result.error);

  editor.chain().focus().insertContent({
    type: "paragraph",
    content: [{
      type: "text",
      text: result.name,
      marks: [{ type: "link", attrs: { href: result.url, target: "_blank", rel: "noopener noreferrer" } }],
    }],
  }).run();
}
