"use client";

import { useState } from "react";
import { panel } from "@/lib/styles";
import { IntroTextEditModal } from "./intro-text-edit-modal";

type Locale = "hu" | "ro" | "en";

type IntroTextPreviewTabsProps = {
  introText: string;
  introTextEn: string;
  introTextRo: string;
};

const tabs: Array<{ label: string; locale: Locale }> = [
  { label: "Magyar", locale: "hu" },
  { label: "Román", locale: "ro" },
  { label: "Angol", locale: "en" },
];

export function IntroTextPreviewTabs({
  introText,
  introTextEn,
  introTextRo,
}: IntroTextPreviewTabsProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>("hu");
  const content = {
    hu: introText,
    ro: introTextRo,
    en: introTextEn,
  }[activeLocale];
  const activeTab = tabs.find((tab) => tab.locale === activeLocale) ?? tabs[0];

  return (
    <section className={`${panel} mt-6 overflow-hidden`}>
      <div className="flex items-end gap-1 border-b-2 border-charcoal bg-surface px-3 pt-3" role="tablist" aria-label="Bemutató szövegek nyelve">
        {tabs.map((tab) => {
          const isActive = activeLocale === tab.locale;

          return (
            <button
              aria-selected={isActive}
              className={`relative -mb-0.5 min-h-[42px] border-2 px-5 py-2 text-sm font-extrabold transition ${
                isActive
                  ? "z-[1] border-charcoal border-b-surface-strong bg-surface-strong text-thread-red"
                  : "border-line bg-surface text-muted hover:border-charcoal hover:bg-surface-strong hover:text-thread-red"
              }`}
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
      <div className="flex min-h-[180px] flex-col bg-surface-strong p-5" role="tabpanel">
        <div className="flex-1">
          {content ? (
            <div
              className="rich-text-editor text-[15px] font-bold leading-relaxed text-muted"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-sm font-extrabold text-muted">Ehhez a nyelvhez még nincs bemutató szöveg megadva.</p>
          )}
        </div>
        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <IntroTextEditModal
            buttonLabel={`${activeTab.label} szöveg módosítása`}
            introText={content}
            locale={activeLocale}
          />
        </div>
      </div>
    </section>
  );
}
