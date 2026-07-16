"use client";

import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";

const COMPRESSIBLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function compressFile(file: File) {
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) return file;

  const compressed = await imageCompression(file, {
    initialQuality: 0.9,
    maxSizeMB: 2,
    maxWidthOrHeight: 2560,
    preserveExif: false,
    useWebWorker: true,
  });

  if (compressed.size >= file.size) return file;

  return new File([compressed], file.name, {
    lastModified: file.lastModified,
    type: compressed.type || file.type,
  });
}

export function ImageCompressionManager() {
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    async function handleFileSelection(event: Event) {
      const input = event.target;

      if (!(input instanceof HTMLInputElement) || input.type !== "file" || input.dataset.compressionReady === "true") {
        if (input instanceof HTMLInputElement) delete input.dataset.compressionReady;
        return;
      }

      const files = Array.from(input.files ?? []);
      if (files.length === 0 || !files.some((file) => file.type.startsWith("image/"))) return;

      event.stopImmediatePropagation();
      setProcessingCount((count) => count + 1);

      try {
        const processedFiles = await Promise.all(
          files.map((file) => file.type.startsWith("image/") ? compressFile(file) : Promise.resolve(file)),
        );
        const transfer = new DataTransfer();
        processedFiles.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
      } catch (error) {
        console.error("A képek tömörítése nem sikerült, az eredeti fájlok kerülnek feltöltésre.", error);
      } finally {
        input.dataset.compressionReady = "true";
        input.dispatchEvent(new Event("change", { bubbles: true }));
        setProcessingCount((count) => Math.max(0, count - 1));
      }
    }

    document.addEventListener("change", handleFileSelection, true);
    return () => document.removeEventListener("change", handleFileSelection, true);
  }, []);

  if (processingCount === 0) return null;

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-charcoal/65 px-5" role="status" aria-live="polite">
      <div className="border-2 border-charcoal bg-surface-strong px-6 py-5 text-center shadow-[8px_8px_0_rgb(179_38_32_/_45%)]">
        <p className="font-serif text-2xl font-bold">Képek optimalizálása...</p>
        <p className="mt-2 text-sm font-extrabold text-muted">A feltöltés a tömörítés után folytatható.</p>
      </div>
    </div>
  );
}
