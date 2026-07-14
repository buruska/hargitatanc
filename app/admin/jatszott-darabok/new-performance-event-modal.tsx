"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import type { TicketMode } from "@/lib/tickets";
import { createRunningPerformanceEventAction, type PerformanceEventFormState } from "./actions";

type NewPerformanceEventModalProps = {
  performanceId: string;
  performanceTitle: string;
};

const initialState: PerformanceEventFormState = {};

function getCurrentDateTimeValues() {
  const now = new Date();

  return {
    day: String(now.getDate()),
    hour: String(now.getHours()),
    minute: String(now.getMinutes()),
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
}

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

export function NewPerformanceEventModal({ performanceId, performanceTitle }: NewPerformanceEventModalProps) {
  const [state, formAction, isPending] = useActionState(createRunningPerformanceEventAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [dateTimeValues, setDateTimeValues] = useState(getCurrentDateTimeValues);
  const [locationError, setLocationError] = useState("");
  const [ticketMode, setTicketMode] = useState<TicketMode>("LINK");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const titleId = useId();

  function openModal() {
    setDateTimeValues(getCurrentDateTimeValues());
    setLocationError("");
    setTicketMode("LINK");
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const location = String(formData.get("location") ?? "").trim();

    if (!location) {
      event.preventDefault();
      setLocationError("Helyszín megadása kötelező.");
      return;
    }

    setLocationError("");
    setIsOpen(false);
  }

  const selectedDate = `${dateTimeValues.year}-${dateTimeValues.month.padStart(2, "0")}-${dateTimeValues.day.padStart(2, "0")}`;
  const selectedTime = `${dateTimeValues.hour.padStart(2, "0")}:${dateTimeValues.minute.padStart(2, "0")}`;

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setIsOpen(false);
    setTicketMode("LINK");
    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="inline-flex min-h-8 items-center justify-center border border-pine bg-[rgb(49_90_59_/_10%)] px-3 py-1.5 text-xs font-extrabold text-pine transition hover:bg-[rgb(49_90_59_/_18%)] hover:text-charcoal"
        type="button"
        onClick={openModal}
      >
        Fellépés hozzáadása
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} w-full max-w-[560px] p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>
                  Fellépés hozzáadása
                </h2>
                <p className="mt-2 text-muted">{performanceTitle}</p>
              </div>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form action={formAction} className="grid gap-4" lang="hu" noValidate ref={formRef} onSubmit={handleSubmit}>
              {state.error ? (
                <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
                  {state.error}
                </p>
              ) : null}
              <input name="runningPerformanceId" type="hidden" value={performanceId} />
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
                      onChange={(event) => setDateTimeValues((current) => ({ ...current, year: event.target.value }))}
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
                      onChange={(event) => setDateTimeValues((current) => ({ ...current, month: event.target.value }))}
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
                      onChange={(event) => setDateTimeValues((current) => ({ ...current, day: event.target.value }))}
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
                      onChange={(event) => setDateTimeValues((current) => ({ ...current, hour: event.target.value }))}
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
                      onChange={(event) => setDateTimeValues((current) => ({ ...current, minute: event.target.value }))}
                    />
                  </label>
                </div>
              </fieldset>
              <label className={label}>
                Helyszín
                <input
                  aria-invalid={locationError ? "true" : undefined}
                  aria-describedby={`${titleId}-location-error`}
                  className={input}
                  name="location"
                  type="text"
                  onChange={() => setLocationError("")}
                />
                <span
                  className={`text-sm font-extrabold text-thread-red ${locationError ? "block" : "hidden"}`}
                  id={`${titleId}-location-error`}
                >
                  {locationError || "Helyszín megadása kötelező."}
                </span>
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
                  <input className={input} name="ticketUrl" type="url" placeholder="https://..." required />
                </label>
              ) : null}
              {ticketMode === "CUSTOM" ? (
                <label className={label}>
                  Egyéb jegyinformáció
                  <input className={input} name="ticketText" type="text" placeholder="pl. Regisztráció szükséges" required />
                </label>
              ) : null}
              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={closeModal}>
                  Mégsem
                </button>
                <button className={buttonPrimary} type="submit" disabled={isPending}>
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
