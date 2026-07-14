"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { getTicketDisplayText, isTicketLink, type TicketMode } from "@/lib/tickets";
import {
  createPerformanceNewsAction,
  deleteRunningPerformanceEventAction,
  updateRunningPerformanceEventAction,
  type DeletePerformanceState,
  type PerformanceEventFormState,
  type PerformanceNewsFormState,
} from "./actions";

type PerformanceEvent = {
  id: string;
  performanceCoverImageUrl: string;
  performanceTitle: string;
  startsAt: string;
  location: string;
  ticketMode: TicketMode;
  ticketText: string;
  ticketUrl: string;
};

type PerformanceEventsToggleProps = {
  events: PerformanceEvent[];
};

type DateTimeParts = {
  day: string;
  hour: string;
  minute: string;
  month: string;
  year: string;
};

const dateFormatter = new Intl.DateTimeFormat("hu-RO", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
});

const months = [
  { value: "1", label: "január" },
  { value: "2", label: "február" },
  { value: "3", label: "március" },
  { value: "4", label: "április" },
  { value: "5", label: "május" },
  { value: "6", label: "június" },
  { value: "7", label: "július" },
  { value: "8", label: "augusztus" },
  { value: "9", label: "szeptember" },
  { value: "10", label: "október" },
  { value: "11", label: "november" },
  { value: "12", label: "december" },
];

const eventFormInitialState: PerformanceEventFormState = {};
const deleteEventInitialState: DeletePerformanceState = {};
const newsFormInitialState: PerformanceNewsFormState = {};

function getDateTimeParts(value: string): DateTimeParts {
  const date = new Date(value);

  return {
    day: String(date.getDate()),
    hour: String(date.getHours()),
    minute: String(date.getMinutes()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

function getLocalDateTimeInputValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function PerformanceEventsToggle({ events }: PerformanceEventsToggleProps) {
  const now = new Date();
  const upcomingEvents = events.filter((event) => new Date(event.startsAt) >= now);
  const expiredEvents = events.filter((event) => new Date(event.startsAt) < now);

  return (
    <div className="mt-4">
      {events.length > 0 ? (
        <div className="grid gap-4 min-[720px]:grid-cols-2">
          <EventColumn events={upcomingEvents} title="Aktuális fellépések" showHoverActions />
          <EventColumn events={expiredEvents} title="Lejárt fellépések" showUploadAction muted />
        </div>
      ) : (
        <p className="text-sm font-extrabold text-muted">Ehhez az előadáshoz még nincs fellépés hozzáadva.</p>
      )}
    </div>
  );
}

function EventColumn({
  events,
  muted = false,
  showHoverActions = false,
  showUploadAction = false,
  title,
}: Readonly<{
  events: PerformanceEvent[];
  muted?: boolean;
  showHoverActions?: boolean;
  showUploadAction?: boolean;
  title: string;
}>) {
  return (
    <div>
      <p className={`mb-2 text-xs font-extrabold uppercase tracking-normal ${muted ? "text-muted" : "text-petrol"}`}>{title}:</p>
      {events.length > 0 ? (
        <div className="grid gap-1.5">
          {events.map((event) => (
            <EventButton
              event={event}
              key={event.id}
              muted={muted}
              showHoverActions={showHoverActions}
              showUploadAction={showUploadAction}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs font-extrabold text-muted">Nincs ilyen fellépés.</p>
      )}
    </div>
  );
}

function EventButton({
  event,
  muted,
  showHoverActions,
  showUploadAction,
}: Readonly<{ event: PerformanceEvent; muted: boolean; showHoverActions: boolean; showUploadAction: boolean }>) {
  const content = `${dateFormatter.format(new Date(event.startsAt))} · ${event.location}`;
  const ticketDisplayText = getTicketDisplayText(event);
  const hasTicketLink = isTicketLink(event);
  const baseClass =
    "flex min-h-[22px] w-full items-center border border-line bg-surface-strong px-2 py-0.5 text-xs font-extrabold transition";
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (showHoverActions) {
    return (
      <>
        <div className={`${baseClass} group justify-between overflow-hidden text-petrol`}>
          {hasTicketLink ? (
            <a className="truncate group-hover:hidden" href={event.ticketUrl} rel="noreferrer" target="_blank">
              {content}
            </a>
          ) : (
            <span className="flex w-full min-w-0 items-center justify-between gap-2 text-petrol group-hover:hidden">
              <span className="truncate">{content}</span>
              {ticketDisplayText ? (
                <span className="shrink-0 text-[10px] font-extrabold text-pine/75">{ticketDisplayText}</span>
              ) : null}
            </span>
          )}
          <div className="hidden w-full grid-cols-3 gap-1 group-hover:grid">
            <button
              className="min-h-4 border-0 bg-[rgb(49_90_59_/_10%)] px-0 py-0 text-[11px] font-extrabold leading-none text-pine hover:bg-[rgb(49_90_59_/_18%)] hover:text-charcoal"
              type="button"
              onClick={() => setIsNewsOpen(true)}
            >
              Hír feltöltése
            </button>
            <button
              className="min-h-4 border-0 bg-[rgb(20_97_106_/_8%)] px-0 py-0 text-[11px] font-extrabold leading-none text-petrol hover:bg-[rgb(20_97_106_/_14%)] hover:text-charcoal"
              type="button"
              onClick={() => setIsEditOpen(true)}
            >
              Módosítás
            </button>
            <button
              className="min-h-4 border-0 bg-[rgb(179_38_32_/_8%)] px-0 py-0 text-[11px] font-extrabold leading-none text-thread-red hover:bg-[rgb(179_38_32_/_14%)] hover:text-charcoal"
              type="button"
              onClick={() => setIsDeleteOpen(true)}
            >
              Törlés
            </button>
          </div>
        </div>
        <UploadNewsModal event={event} isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
        <EditPerformanceEventModal event={event} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        <DeletePerformanceEventModal event={event} isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
      </>
    );
  }

  if (showUploadAction) {
    return (
      <>
        <div className={`${baseClass} group justify-between overflow-hidden text-muted`}>
          <span className="truncate group-hover:hidden">{content}</span>
          <button
            className="hidden min-h-4 w-full border-0 bg-[rgb(20_97_106_/_8%)] px-0 py-0 text-xs font-extrabold leading-none text-petrol hover:bg-[rgb(20_97_106_/_14%)] hover:text-charcoal group-hover:block"
            type="button"
            onClick={() => setIsReportOpen(true)}
          >
            Beszámoló feltöltése
          </button>
        </div>
        <UploadNewsModal event={event} isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      </>
    );
  }

  if (!hasTicketLink) {
    return (
      <span className={`${baseClass} justify-between gap-2 text-muted`}>
        <span className="truncate">{content}</span>
        {ticketDisplayText ? <span className="shrink-0 text-[10px] font-extrabold text-pine/75">{ticketDisplayText}</span> : null}
      </span>
    );
  }

  return (
    <a
      className={`${baseClass} ${
        muted ? "text-muted hover:border-charcoal hover:text-charcoal" : "text-petrol hover:border-charcoal hover:bg-thread-red hover:text-surface-strong"
      }`}
      href={event.ticketUrl}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  );
}

function UploadNewsModal({
  event,
  isOpen,
  onClose,
}: Readonly<{
  event: PerformanceEvent;
  isOpen: boolean;
  onClose: () => void;
}>) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createPerformanceNewsAction, newsFormInitialState);
  const [content, setContent] = useState("");
  const [newsTitle, setNewsTitle] = useState(event.performanceTitle);
  const [newsStartsAt, setNewsStartsAt] = useState(() => getLocalDateTimeInputValue(event.startsAt));
  const [newsLocation, setNewsLocation] = useState(event.location);
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
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setContent(currentEditor.getHTML());
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    editor?.commands.clearContent();
    setNewsTitle(event.performanceTitle);
    setNewsStartsAt(getLocalDateTimeInputValue(event.startsAt));
    setNewsLocation(event.location);
    setContent("");
  }, [editor, event.location, event.performanceTitle, event.startsAt, isOpen]);

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
            Hír feltöltése
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
          <input name="startsAt" type="hidden" value={newsStartsAt} />
          <input name="coverImageUrl" type="hidden" value={event.performanceCoverImageUrl} />
          <input name="content" type="hidden" value={content} />
          <label className={label}>
            Hír címe
            <input
              className={input}
              name="title"
              type="text"
              value={newsTitle}
              required
              onChange={(changeEvent) => setNewsTitle(changeEvent.target.value)}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 min-[620px]:grid-cols-2">
            <label className={label}>
              Fellépés dátuma
              <input
                className={input}
                type="datetime-local"
                value={newsStartsAt}
                required
                onChange={(changeEvent) => setNewsStartsAt(changeEvent.target.value)}
              />
            </label>
            <label className={label}>
              Helyszín
              <input
                className={input}
                name="location"
                type="text"
                value={newsLocation}
                required
                onChange={(changeEvent) => setNewsLocation(changeEvent.target.value)}
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

function EditPerformanceEventModal({
  event,
  isOpen,
  onClose,
}: Readonly<{
  event: PerformanceEvent;
  isOpen: boolean;
  onClose: () => void;
}>) {
  const [state, formAction, isPending] = useActionState(updateRunningPerformanceEventAction, eventFormInitialState);
  const [dateTimeValues, setDateTimeValues] = useState(() => getDateTimeParts(event.startsAt));
  const [ticketMode, setTicketMode] = useState<TicketMode>(event.ticketMode);
  const router = useRouter();
  const titleId = useId();
  const selectedDate = `${dateTimeValues.year}-${dateTimeValues.month.padStart(2, "0")}-${dateTimeValues.day.padStart(2, "0")}`;
  const selectedTime = `${dateTimeValues.hour.padStart(2, "0")}:${dateTimeValues.minute.padStart(2, "0")}`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDateTimeValues(getDateTimeParts(event.startsAt));
    setTicketMode(event.ticketMode);
  }, [event.startsAt, event.ticketMode, isOpen]);

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
      <section aria-labelledby={titleId} aria-modal="true" className={`${panel} w-full max-w-[560px] p-6`} role="dialog">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>
            Fellépés módosítása
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

        <form action={formAction} className="grid gap-4" lang="hu" noValidate>
          {state.error ? (
            <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
              {state.error}
            </p>
          ) : null}
          <input name="id" type="hidden" value={event.id} />
          <input name="date" type="hidden" value={selectedDate} />
          <input name="ticketMode" type="hidden" value={ticketMode} />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-extrabold text-muted">Dátum</legend>
            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-[1fr_1.3fr_1fr]">
              <label className={label}>
                Év
                <input
                  className={input}
                  inputMode="numeric"
                  lang="hu"
                  min="2026"
                  name="year"
                  type="number"
                  value={dateTimeValues.year}
                  required
                  onChange={(changeEvent) => setDateTimeValues((current) => ({ ...current, year: changeEvent.target.value }))}
                />
              </label>
              <label className={label}>
                Hónap
                <select
                  className={input}
                  lang="hu"
                  name="month"
                  value={dateTimeValues.month}
                  required
                  onChange={(changeEvent) => setDateTimeValues((current) => ({ ...current, month: changeEvent.target.value }))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Nap
                <input
                  className={input}
                  inputMode="numeric"
                  lang="hu"
                  max="31"
                  min="1"
                  name="day"
                  type="number"
                  value={dateTimeValues.day}
                  required
                  onChange={(changeEvent) => setDateTimeValues((current) => ({ ...current, day: changeEvent.target.value }))}
                />
              </label>
            </div>
          </fieldset>
          <input name="time" type="hidden" value={selectedTime} />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-extrabold text-muted">Kezdési időpont</legend>
            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
              <label className={label}>
                Óra
                <input
                  className={input}
                  inputMode="numeric"
                  lang="hu"
                  max="23"
                  min="0"
                  name="hour"
                  type="number"
                  value={dateTimeValues.hour}
                  required
                  onChange={(changeEvent) => setDateTimeValues((current) => ({ ...current, hour: changeEvent.target.value }))}
                />
              </label>
              <label className={label}>
                Perc
                <input
                  className={input}
                  inputMode="numeric"
                  lang="hu"
                  max="59"
                  min="0"
                  name="minute"
                  type="number"
                  value={dateTimeValues.minute}
                  required
                  onChange={(changeEvent) => setDateTimeValues((current) => ({ ...current, minute: changeEvent.target.value }))}
                />
              </label>
            </div>
          </fieldset>
          <label className={label}>
            Helyszín
            <input className={input} name="location" type="text" defaultValue={event.location} required />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-extrabold text-muted">Jegyvásárlás</legend>
            <div className="grid gap-2 min-[520px]:grid-cols-2">
              {[
                { label: "Jegyvásárló link", value: "LINK" },
                { label: "Jegyvásárlás a helyszínen", value: "VENUE" },
                { label: "Ingyenes előadás", value: "FREE" },
                { label: "Egyéb", value: "CUSTOM" },
              ].map((option) => (
                <label
                  className={`flex min-h-10 cursor-pointer items-center border px-3 py-2 text-sm font-extrabold transition ${
                    ticketMode === option.value
                      ? "border-thread-red bg-[rgb(179_38_32_/_10%)] text-thread-red"
                      : "border-line bg-surface-strong text-muted hover:border-charcoal hover:text-charcoal"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={ticketMode === option.value}
                    className="mr-2 size-4 shrink-0 accent-thread-red"
                    name="ticketModeChoice"
                    type="checkbox"
                    value={option.value}
                    onChange={() => setTicketMode(option.value as TicketMode)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          {ticketMode === "LINK" ? (
            <label className={label}>
              Jegyvásárló link
              <input className={input} name="ticketUrl" type="url" placeholder="https://..." defaultValue={event.ticketUrl} required />
            </label>
          ) : null}
          {ticketMode === "CUSTOM" ? (
            <label className={label}>
              Egyéb jegyinformáció
              <input className={input} name="ticketText" type="text" placeholder="pl. Regisztráció szükséges" defaultValue={event.ticketText} required />
            </label>
          ) : null}
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

function DeletePerformanceEventModal({
  event,
  isOpen,
  onClose,
}: Readonly<{
  event: PerformanceEvent;
  isOpen: boolean;
  onClose: () => void;
}>) {
  const [state, formAction, isPending] = useActionState(deleteRunningPerformanceEventAction, deleteEventInitialState);
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
            Fellépés törlése
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

        <p className="text-muted">Biztosan törölni akarod ezt a fellépést?</p>
        <p className="mt-3 font-extrabold text-charcoal">{dateFormatter.format(new Date(event.startsAt))}</p>
        <p className="mt-1 text-muted">{event.location}</p>

        {state.error ? (
          <p className="mt-5 border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
            {state.error}
          </p>
        ) : null}

        <form action={formAction} className="mt-6 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
          <input name="id" type="hidden" value={event.id} />
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
