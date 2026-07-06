"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { updateEventAction, type EventFormState } from "./actions";

type EditEventModalProps = {
  endsAt: string | null;
  id: string;
  startsAt: string;
  summary: string;
  title: string;
};

type DateTimeValues = {
  day: string;
  hour: string;
  minute: string;
  month: string;
  year: string;
};

const initialState: EventFormState = {};

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

function getDateTimeValues(value: string) {
  const date = new Date(value);

  return {
    day: String(date.getDate()),
    hour: String(date.getHours()),
    minute: String(date.getMinutes()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

function getDateValue(values: DateTimeValues) {
  return `${values.year}-${values.month.padStart(2, "0")}-${values.day.padStart(2, "0")}`;
}

function getTimeValue(values: DateTimeValues) {
  return `${values.hour.padStart(2, "0")}:${values.minute.padStart(2, "0")}`;
}

export function EditEventModal({ endsAt, id, startsAt, summary, title }: EditEventModalProps) {
  const [state, formAction, isPending] = useActionState(updateEventAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [startDateTimeValues, setStartDateTimeValues] = useState(() => getDateTimeValues(startsAt));
  const [endDateTimeValues, setEndDateTimeValues] = useState(() => getDateTimeValues(endsAt ?? startsAt));
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const titleId = useId();

  function openModal() {
    setStartDateTimeValues(getDateTimeValues(startsAt));
    setEndDateTimeValues(getDateTimeValues(endsAt ?? startsAt));
    setIsOpen(true);
  }

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
      <button
        className="inline-flex min-h-8 items-center justify-center border border-[rgb(205_151_35_/_70%)] bg-[rgb(205_151_35_/_12%)] px-3 py-1.5 text-xs font-extrabold text-[rgb(122_83_18)] transition hover:bg-[rgb(205_151_35_/_20%)] hover:text-charcoal"
        type="button"
        onClick={openModal}
      >
        Módosítás
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
                Rendezvény módosítása
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

            <form action={formAction} className="grid gap-4" encType="multipart/form-data" lang="hu" ref={formRef}>
              {state.error ? (
                <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
                  {state.error}
                </p>
              ) : null}
              <input name="id" type="hidden" value={id} />
              <label className={label}>
                Cím
                <input className={input} name="title" type="text" defaultValue={title} required />
              </label>
              <DateTimeFields
                dateInputName="startDate"
                dateValue={getDateValue(startDateTimeValues)}
                legend="Kezdési időpont"
                timeInputName="startTime"
                timeValue={getTimeValue(startDateTimeValues)}
                values={startDateTimeValues}
                onChange={setStartDateTimeValues}
              />
              <DateTimeFields
                dateInputName="endDate"
                dateValue={getDateValue(endDateTimeValues)}
                legend="Vége időpont"
                timeInputName="endTime"
                timeValue={getTimeValue(endDateTimeValues)}
                values={endDateTimeValues}
                onChange={setEndDateTimeValues}
              />
              <label className={label}>
                Új borítókép
                <input
                  className="min-h-[46px] border-2 border-line-strong bg-surface-strong px-3 py-2.5 font-sans text-charcoal file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong"
                  name="coverImage"
                  type="file"
                  accept="image/*"
                />
              </label>
              <label className={label}>
                Leírás
                <textarea className={`${input} min-h-32 resize-y`} name="summary" defaultValue={summary} required />
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
            min="1900"
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
