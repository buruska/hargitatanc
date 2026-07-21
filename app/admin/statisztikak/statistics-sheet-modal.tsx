"use client";

import { useEffect, useId, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { buttonPrimary, buttonSecondary, input, panel } from "@/lib/styles";

type StatisticItem = {
  details?: string[];
  html?: string;
  label: string;
  value: string | number;
};

type StatisticsSheetModalProps = {
  buttonLabel: string;
  isPrimary?: boolean;
  statistics: StatisticItem[];
  title: string;
};

export function StatisticsSheetModal({
  buttonLabel,
  isPrimary = false,
  statistics,
  title,
}: StatisticsSheetModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [orderedStatistics, setOrderedStatistics] = useState(statistics);
  const [includedLabels, setIncludedLabels] = useState(() => new Set(statistics.map((item) => item.label)));
  const titleId = useId();

  function openModal() {
    setOrderedStatistics(statistics);
    setIncludedLabels(new Set(statistics.map((item) => item.label)));
    setPdfError("");
    setIsOpen(true);
  }

  function toggleStatistic(label: string) {
    setIncludedLabels((currentLabels) => {
      const nextLabels = new Set(currentLabels);
      if (nextLabels.has(label)) nextLabels.delete(label);
      else nextLabels.add(label);
      return nextLabels;
    });
  }

  function moveStatistic(index: number, direction: -1 | 1) {
    setOrderedStatistics((currentStatistics) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentStatistics.length) return currentStatistics;

      const nextStatistics = [...currentStatistics];
      [nextStatistics[index], nextStatistics[targetIndex]] = [nextStatistics[targetIndex], nextStatistics[index]];
      return nextStatistics;
    });
  }

  function addCustomStatistic(label: string, html: string, text: string) {
    const existingLabels = new Set(orderedStatistics.map((item) => item.label));
    let uniqueLabel = label;
    let suffix = 2;

    while (existingLabels.has(uniqueLabel)) {
      uniqueLabel = `${label} (${suffix})`;
      suffix += 1;
    }

    const newStatistic = { html, label: uniqueLabel, value: text };
    setOrderedStatistics((currentStatistics) => [...currentStatistics, newStatistic]);
    setIncludedLabels((currentLabels) => new Set([...currentLabels, uniqueLabel]));
  }

  async function generatePdf() {
    setIsGenerating(true);
    setPdfError("");

    try {
      const [{ PDFDocument, rgb }, fontkitModule] = await Promise.all([
        import("pdf-lib"),
        import("@pdf-lib/fontkit"),
      ]);
      const [regularFontResponse, boldFontResponse] = await Promise.all([
        fetch("/fonts/noto-sans-regular.ttf"),
        fetch("/fonts/noto-sans-bold.ttf"),
      ]);

      if (!regularFontResponse.ok || !boldFontResponse.ok) throw new Error("A betűtípus nem tölthető be.");

      const pdfDocument = await PDFDocument.create();
      pdfDocument.registerFontkit(fontkitModule.default);
      const [regularFont, boldFont] = await Promise.all([
        pdfDocument.embedFont(await regularFontResponse.arrayBuffer()),
        pdfDocument.embedFont(await boldFontResponse.arrayBuffer()),
      ]);
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 48;
      const contentWidth = pageWidth - margin * 2;
      const red = rgb(0.702, 0.149, 0.125);
      const charcoal = rgb(0.129, 0.122, 0.106);
      const muted = rgb(0.412, 0.373, 0.314);
      const line = rgb(0.804, 0.741, 0.616);
      const surface = rgb(0.98, 0.96, 0.91);
      let page = pdfDocument.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const addPage = () => {
        page = pdfDocument.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      };
      const ensureSpace = (height: number) => {
        if (y - height < margin) addPage();
      };
      const wrapText = (text: string, maxWidth: number, fontSize: number) => {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let lineText = "";

        words.forEach((word) => {
          const candidate = lineText ? `${lineText} ${word}` : word;
          if (regularFont.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
            lineText = candidate;
          } else {
            if (lineText) lines.push(lineText);
            lineText = word;
          }
        });
        if (lineText) lines.push(lineText);
        return lines;
      };

      page.drawRectangle({ color: red, height: 6, width: contentWidth, x: margin, y: y - 6 });
      y -= 34;
      page.drawText("Hargita Székely Néptáncszínház", { color: red, font: boldFont, size: 11, x: margin, y });
      y -= 31;
      wrapText(title, contentWidth, 22).forEach((lineText) => {
        page.drawText(lineText, { color: charcoal, font: boldFont, size: 22, x: margin, y });
        y -= 28;
      });
      y -= 2;
      page.drawText(
        `Generálva: ${new Intl.DateTimeFormat("hu-RO", { dateStyle: "long", timeStyle: "short" }).format(new Date())}`,
        { color: muted, font: regularFont, size: 9, x: margin, y },
      );
      y -= 26;

      orderedStatistics.filter((statistic) => includedLabels.has(statistic.label)).forEach((statistic) => {
        ensureSpace(68);
        page.drawRectangle({ color: surface, height: 58, width: contentWidth, x: margin, y: y - 48 });
        page.drawText(statistic.label.toLocaleUpperCase("hu"), {
          color: muted,
          font: boldFont,
          size: 8,
          x: margin + 14,
          y: y - 10,
        });
        page.drawText(String(statistic.value), {
          color: charcoal,
          font: boldFont,
          size: 20,
          x: margin + 14,
          y: y - 36,
        });
        y -= 58;

        statistic.details?.forEach((detail) => {
          const lines = wrapText(detail, contentWidth - 38, 9);
          ensureSpace(lines.length * 13 + 10);
          page.drawCircle({ color: red, size: 2.2, x: margin + 17, y: y - 8 });
          lines.forEach((lineText, lineIndex) => {
            page.drawText(lineText, {
              color: muted,
              font: regularFont,
              size: 9,
              x: margin + 28,
              y: y - 11 - lineIndex * 13,
            });
          });
          y -= lines.length * 13 + 5;
        });

        y -= 10;
        page.drawLine({ color: line, start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.6 });
        y -= 12;
      });

      const pages = pdfDocument.getPages();
      pages.forEach((pdfPage, index) => {
        const pageNumber = `${index + 1} / ${pages.length}`;
        pdfPage.drawText(pageNumber, {
          color: muted,
          font: regularFont,
          size: 8,
          x: pageWidth - margin - regularFont.widthOfTextAtSize(pageNumber, 8),
          y: 24,
        });
      });

      const pdfBytes = await pdfDocument.save();
      const downloadUrl = URL.createObjectURL(new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `statisztikai-lap-${title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("hu")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.pdf`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setPdfError("A PDF generálása nem sikerült. Kérlek, próbáld újra.");
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className={`${isPrimary ? buttonPrimary : buttonSecondary} w-full justify-start text-left`}
        type="button"
        onClick={openModal}
      >
        {buttonLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} max-h-[calc(100vh-4rem)] w-full max-w-[620px] overflow-y-auto p-5 min-[640px]:p-7`}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-thread-red">
                  Statisztikai lap
                </p>
                <h2 className="mt-2 font-serif text-[clamp(24px,3vw,34px)] font-bold leading-[1.05]" id={titleId}>
                  {title}
                </h2>
              </div>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 shrink-0 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mt-7 grid gap-px overflow-hidden border border-line bg-line">
              {orderedStatistics.map((statistic, index) => (
                <div className="flex items-stretch bg-surface-strong" key={statistic.label}>
                  <div className="flex w-11 shrink-0 flex-col justify-center gap-1 border-r border-line p-1.5">
                    <button
                      aria-label={`${statistic.label} mozgatása felfelé`}
                      className="flex size-8 items-center justify-center border border-line bg-surface text-base font-bold text-muted hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={index === 0}
                      type="button"
                      onClick={() => moveStatistic(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`${statistic.label} mozgatása lefelé`}
                      className="flex size-8 items-center justify-center border border-line bg-surface text-base font-bold text-muted hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={index === orderedStatistics.length - 1}
                      type="button"
                      onClick={() => moveStatistic(index, 1)}
                    >
                      ↓
                    </button>
                  </div>

                  <label className="flex w-12 shrink-0 cursor-pointer items-start justify-center border-r border-line pt-5">
                    <span className="sr-only">{statistic.label} szerepeljen a PDF-ben</span>
                    <input
                      checked={includedLabels.has(statistic.label)}
                      className="size-5 accent-thread-red"
                      type="checkbox"
                      onChange={() => toggleStatistic(statistic.label)}
                    />
                  </label>

                  {statistic.details ? (
                    <details className="group min-w-0 flex-1">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                        <span>
                          <span className="block text-xs font-extrabold uppercase tracking-wide text-muted">
                            {statistic.label}
                          </span>
                          <span className="mt-2 block font-serif text-3xl font-bold leading-none text-charcoal">
                            {statistic.value}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center border border-line text-xl font-bold text-thread-red transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="border-t border-line bg-surface px-4 py-3">
                        {statistic.details.length > 0 ? (
                          <ul className="grid gap-2">
                            {statistic.details.map((detail, detailIndex) => (
                              <li
                                className="border-l-2 border-thread-red pl-3 text-sm font-bold text-muted"
                                key={`${detail}-${detailIndex}`}
                              >
                                {detail}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm font-bold text-muted">Nincs megjeleníthető adat.</p>
                        )}
                      </div>
                    </details>
                  ) : (
                    <div className="min-w-0 flex-1 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-muted">{statistic.label}</p>
                      {statistic.html ? (
                        <div
                          className="news-article-content mt-3 text-sm leading-relaxed text-charcoal"
                          dangerouslySetInnerHTML={{ __html: statistic.html }}
                        />
                      ) : (
                        <p className="mt-2 font-serif text-3xl font-bold leading-none text-charcoal">{statistic.value}</p>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

            <CustomStatisticEditor onAdd={addCustomStatistic} />

            {pdfError ? <p className="mt-4 text-sm font-bold text-thread-red">{pdfError}</p> : null}
            <div className="mt-6 flex justify-end">
              <button
                className={buttonPrimary}
                disabled={isGenerating || includedLabels.size === 0}
                type="button"
                onClick={generatePdf}
              >
                {isGenerating ? "PDF generálása…" : "PDF generálása"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function CustomStatisticEditor({
  onAdd,
}: {
  onAdd: (label: string, html: string, text: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => setHasContent(!currentEditor.isEmpty),
  });

  function addStatistic() {
    if (!editor || !label.trim() || editor.isEmpty) return;

    onAdd(label.trim(), editor.getHTML(), editor.getText({ blockSeparator: "\n" }));
    setLabel("");
    setHasContent(false);
    editor.commands.clearContent();
  }

  return (
    <section className="mt-6 border-2 border-line-strong bg-surface p-4">
      <h3 className="font-serif text-xl font-bold">Új adat hozzáadása</h3>
      <label className="mt-4 grid gap-1.5 text-sm font-extrabold text-muted">
        Adat megnevezése
        <input
          className={input}
          placeholder="Például: Megjegyzés"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
      </label>

      <div className="mt-4 border-2 border-line-strong bg-surface-strong">
        <div className="flex flex-wrap gap-2 border-b border-line bg-surface p-2">
          <button className="border border-line bg-surface-strong px-2.5 py-1.5 text-xs font-extrabold" type="button" onClick={() => editor?.chain().focus().setParagraph().run()}>
            Bekezdés
          </button>
          <button className="border border-line bg-surface-strong px-2.5 py-1.5 text-xs font-extrabold" type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
            Félkövér
          </button>
          <button className="border border-line bg-surface-strong px-2.5 py-1.5 text-xs font-extrabold italic" type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
            Dőlt
          </button>
          <button className="border border-line bg-surface-strong px-2.5 py-1.5 text-xs font-extrabold" type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            Felsorolás
          </button>
        </div>
        <EditorContent
          className="rich-text-editor min-h-[130px] px-3 py-2 text-sm leading-relaxed text-charcoal"
          editor={editor}
        />
      </div>

      <button
        className={`${buttonSecondary} mt-4`}
        disabled={!label.trim() || !hasContent}
        type="button"
        onClick={addStatistic}
      >
        Adat hozzáadása
      </button>
    </section>
  );
}
