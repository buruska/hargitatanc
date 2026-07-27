"use client";

import { useState } from "react";
import { input, label } from "@/lib/styles";
import { RichTextField } from "./rich-text-field";

type Locale = "hu" | "ro" | "en";

type MemberLocalizedFieldsProps = {
  bio?: string | null;
  bioEn?: string | null;
  bioRo?: string | null;
  role?: string;
  roleEn?: string | null;
  roleRo?: string | null;
};

const tabs: Array<{ label: string; locale: Locale }> = [
  { label: "Magyar", locale: "hu" },
  { label: "Román", locale: "ro" },
  { label: "Angol", locale: "en" },
];

export function MemberLocalizedFields({
  bio,
  bioEn,
  bioRo,
  role = "táncos",
  roleEn,
  roleRo,
}: MemberLocalizedFieldsProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>("hu");

  function fillEmptyRole(event: React.FocusEvent<HTMLInputElement>) {
    if (!event.currentTarget.value.trim()) {
      event.currentTarget.value = "-";
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 min-[720px]:grid-cols-3">
        <label className={label}>
          Pozíció magyarul
          <input className={input} defaultValue={role || "-"} name="role" required type="text" onBlur={fillEmptyRole} />
        </label>
        <label className={label}>
          Pozíció románul
          <input className={input} defaultValue={roleRo || "-"} name="roleRo" type="text" onBlur={fillEmptyRole} />
        </label>
        <label className={label}>
          Pozíció angolul
          <input className={input} defaultValue={roleEn || "-"} name="roleEn" type="text" onBlur={fillEmptyRole} />
        </label>
      </div>

      <div className="overflow-hidden border-2 border-charcoal">
        <div className="flex items-end gap-1 border-b-2 border-charcoal bg-surface px-3 pt-3" role="tablist" aria-label="Tag leírásának nyelve">
          {tabs.map((tab) => {
            const isActive = activeLocale === tab.locale;
            return (
              <button
                aria-selected={isActive}
                className={`relative -mb-0.5 min-h-[42px] border-2 px-5 py-2 text-sm font-extrabold transition ${isActive ? "z-[1] border-charcoal border-b-surface-strong bg-surface-strong text-thread-red" : "border-line bg-surface text-muted hover:border-charcoal hover:bg-surface-strong hover:text-thread-red"}`}
                key={tab.locale}
                role="tab"
                type="button"
                onClick={() => setActiveLocale(tab.locale)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="bg-surface-strong p-4" role="tabpanel">
          <div className={activeLocale === "hu" ? "block" : "hidden"}>
            <RichTextField initialValue={bio || "<p>-</p>"} label="Leírás magyarul" name="bio" />
          </div>
          <div className={activeLocale === "ro" ? "block" : "hidden"}>
            <RichTextField initialValue={bioRo || "<p>-</p>"} label="Leírás románul" name="bioRo" />
          </div>
          <div className={activeLocale === "en" ? "block" : "hidden"}>
            <RichTextField initialValue={bioEn || "<p>-</p>"} label="Leírás angolul" name="bioEn" />
          </div>
        </div>
      </div>
    </div>
  );
}
