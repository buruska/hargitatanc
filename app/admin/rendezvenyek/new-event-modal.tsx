"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { createEventAction, type EventFormState } from "./actions";

const initialState: EventFormState = {};

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

type DateTimeValues = ReturnType<typeof getCurrentDateTimeValues>;

export function NewEventModal() {
  const [state, formAction, isPending] = useActionState(createEventAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [startDateTimeValues, setStartDateTimeValues] = useState(getCurrentDateTimeValues);
  const [endDateTimeValues, setEndDateTimeValues] = useState(getCurrentDateTimeValues);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const titleId = useId();

  function openModal() {
    const currentDateTimeValues = getCurrentDateTimeValues();

    setStartDateTimeValues(currentDateTimeValues);
    setEndDateTimeValues({ ...currentDateTimeValues, hour: String((Number(currentDateTimeValues.hour) + 1) % 24) });
    setIsOpen(true);
  }

  const selectedStartDate = `${startDateTimeValues.year}-${startDateTimeValues.month.padStart(2, "0")}-${startDateTimeValues.day.padStart(2, "0")}`;
  const selectedStartTime = `${startDateTimeValues.hour.padStart(2, "0")}:${startDateTimeValues.minute.padStart(2, "0")}`;
  const selectedEndDate = `${endDateTimeValues.year}-${endDateTimeValues.month.padStart(2, "0")}-${endDateTimeValues.day.padStart(2, "0")}`;
  const selectedEndTime = `${endDateTimeValues.hour.padStart(2, "0")}:${endDateTimeValues.minute.padStart(2, "0")}`;

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setIsOpen(false);
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
      <button className={buttonPrimary} type="button" onClick={openModal}>
        Rendezvény hozzáadása
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} max-h-[min(760px,calc(100vh-64px))] w-full max-w-[620px] overflow-y-auto p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>
                Rendezvény hozzáadása
              </h2>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form action={formAction} className="grid gap-4" lang="hu" ref={formRef}>
              {state.error ? (
                <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
                  {state.error}
                </p>
              ) : null}
              <label className={label}>
                Cím
                <input className={input} name="title" type="text" required />
              </label>
              <DateTimeFields
                dateInputName="startDate"
                dateValue={selectedStartDate}
                legend="Kezdési időpont"
                timeInputName="startTime"
                timeValue={selectedStartTime}
                values={startDateTimeValues}
                onChange={setStartDateTimeValues}
              />
              <DateTimeFields
                dateInputName="endDate"
                dateValue={selectedEndDate}
                legend="Vége időpont"
                timeInputName="endTime"
                timeValue={selectedEndTime}
                values={endDateTimeValues}
                onChange={setEndDateTimeValues}
              />
              <label className={label}>
                Borítókép
                <input
                  className="min-h-[46px] border-2 border-line-strong bg-surface-strong px-3 py-2.5 font-sans text-charcoal file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong"
                  name="coverImage"
                  type="file"
                  accept="image/*"
                  required
                />
              </label>
              <label className={label}>
                Leírás
                <textarea className={`${input} min-h-32 resize-y`} name="summary" required />
              </label>
              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
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

function DateTimeFields({
  dateInputName,
  dateValue,
  legend,
  timeInputName,
  timeValue,
  values,
  onChange,
}: {
  dateInputName: string;
  dateValue: string;
  legend: string;
  timeInputName: string;
  timeValue: string;
  values: DateTimeValues;
  onChange: Dispatch<SetStateAction<DateTimeValues>>;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-extrabold text-muted">{legend}</legend>
      <input name={dateInputName} type="hidden" value={dateValue} />
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-[1fr_1.3fr_1fr]">
        <label className={label}>
          Év
          <input
            className={input}
            inputMode="numeric"
            lang="hu"
            min="2026"
            name={`${dateInputName}Year`}
            type="number"
            value={values.year}
            required
            onChange={(event) => onChange((current) => ({ ...current, year: event.target.value }))}
          />
        </label>
        <label className={label}>
          Hónap
          <select
            className={input}
            lang="hu"
            name={`${dateInputName}Month`}
            value={values.month}
            required
            onChange={(event) => onChange((current) => ({ ...current, month: event.target.value }))}
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
            name={`${dateInputName}Day`}
            type="number"
            value={values.day}
            required
            onChange={(event) => onChange((current) => ({ ...current, day: event.target.value }))}
          />
        </label>
      </div>
      <input name={timeInputName} type="hidden" value={timeValue} />
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
        <label className={label}>
          Óra
          <input
            className={input}
            inputMode="numeric"
            lang="hu"
            max="23"
            min="0"
            name={`${timeInputName}Hour`}
            type="number"
            value={values.hour}
            required
            onChange={(event) => onChange((current) => ({ ...current, hour: event.target.value }))}
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
            name={`${timeInputName}Minute`}
            type="number"
            value={values.minute}
            required
            onChange={(event) => onChange((current) => ({ ...current, minute: event.target.value }))}
          />
        </label>
      </div>
    </fieldset>
  );
}
