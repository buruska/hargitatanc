"use client";

import Image from "next/image";
import { useState } from "react";
import { panel } from "@/lib/styles";
import { DirectorEditModal } from "./director-edit-modal";

type Locale = "hu" | "ro" | "en";

type DirectorPreviewTabsProps = {
  directorBio: string;
  directorBioEn: string;
  directorBioRo: string;
  directorImageUrl: string | null;
  directorName: string;
  directorNameEn: string;
  directorNameRo: string;
};

const tabs: Array<{ label: string; locale: Locale }> = [
  { label: "Magyar", locale: "hu" },
  { label: "Román", locale: "ro" },
  { label: "Angol", locale: "en" },
];

export function DirectorPreviewTabs(props: DirectorPreviewTabsProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>("hu");
  const activeTab = tabs.find((tab) => tab.locale === activeLocale) ?? tabs[0];
  const directorBio = { hu: props.directorBio, ro: props.directorBioRo, en: props.directorBioEn }[activeLocale];
  const directorName = { hu: props.directorName, ro: props.directorNameRo, en: props.directorNameEn }[activeLocale];

  return (
    <section className={`${panel} mt-6 overflow-hidden`}>
      <div className="flex items-end gap-1 border-b-2 border-charcoal bg-surface px-3 pt-3" role="tablist" aria-label="Igazgatói adatok nyelve">
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
      <div className="bg-surface-strong p-5" role="tabpanel">
        <div className="grid min-h-[180px] gap-4 min-[680px]:grid-cols-[180px_1fr]">
          {props.directorImageUrl ? (
            <Image alt={directorName ? `${directorName} igazgató` : "Igazgatói kép"} className="aspect-[4/3] w-full max-w-[220px] border-2 border-line-strong object-cover" height={135} src={props.directorImageUrl} width={180} />
          ) : null}
          <div className="text-[15px] font-bold leading-relaxed text-muted">
            {directorName ? <h2 className="mb-2 font-serif text-2xl font-bold text-charcoal">{directorName}</h2> : null}
            {directorBio ? <div className="rich-text-editor" dangerouslySetInnerHTML={{ __html: directorBio }} /> : <p>Ehhez a nyelvhez még nincsenek igazgatói adatok megadva.</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <DirectorEditModal
            buttonLabel={`${activeTab.label} adatok módosítása`}
            directorBio={directorBio}
            directorImageUrl={props.directorImageUrl}
            directorName={directorName}
            locale={activeLocale}
          />
        </div>
      </div>
    </section>
  );
}
