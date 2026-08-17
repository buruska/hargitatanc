"use client";

import { useActionState } from "react";
import { buttonPrimary, input, panel } from "@/lib/styles";
import { updateSiteTextsAction, type SiteTextFormState } from "./actions";

type TextItem = { key: string; label: string; hu: string; ro: string; en: string };
const initialState: SiteTextFormState = {};
const groupDefinitions = [
  { prefix: "nav.", title: "Menü" },
  { prefix: "home.", title: "Főoldal" },
  { prefix: "about.", title: "Rólunk" },
  { prefix: "news.", title: "Hírek" },
  { prefix: "events.", title: "Események" },
  { prefix: "gallery.", title: "Galéria" },
  { prefix: "contact.", title: "Kapcsolat" },
  { prefix: "documents.", title: "Dokumentumok" },
];

export function SiteTextForm({ items }: { items: TextItem[] }) {
  const [state, formAction, isPending] = useActionState(updateSiteTextsAction, initialState);
  return (
    <form action={formAction} className="grid gap-5">
      {groupDefinitions.map((group) => {
        const groupItems = items.filter((item) => item.key.startsWith(group.prefix));
        if (groupItems.length === 0) return null;

        return (
          <section className={panel} key={group.prefix}>
            <h2 className="border-b-2 border-charcoal px-5 py-4 font-serif text-2xl font-bold">{group.title}</h2>
            <div className="divide-y divide-line">
              {groupItems.map((item) => (
                <fieldset className="grid gap-4 p-5" key={item.key}>
                  <legend className="px-0 font-serif text-lg font-bold">{item.label.replace(/^[^–]+–\s*/, "")}</legend>
                  <div className="grid items-end gap-4 min-[760px]:grid-cols-3">
                    {(["hu", "ro", "en"] as const).map((locale) => (
                      <label className="grid gap-1.5 text-sm font-extrabold text-muted" key={locale}>
                        {locale === "hu" ? "Magyar" : locale === "ro" ? "Román" : "Angol"}
                        <input className={input} defaultValue={item[locale]} maxLength={300} name={`${item.key}.${locale}`} required type="text" />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        );
      })}
      {state.error ? <p className="border-2 border-thread-red/40 bg-thread-red/10 px-4 py-3 font-bold text-thread-red" role="alert">{state.error}</p> : null}
      {state.success ? <p className="border-2 border-pine/40 bg-pine/10 px-4 py-3 font-bold text-pine" role="status">{state.success}</p> : null}
      <button className={`${buttonPrimary} sticky bottom-5 z-10 justify-self-end shadow-[6px_6px_0_rgb(33_31_27_/_22%)]`} disabled={isPending} type="submit">
        {isPending ? "Mentés…" : "Minden oldalelem mentése"}
      </button>
    </form>
  );
}
