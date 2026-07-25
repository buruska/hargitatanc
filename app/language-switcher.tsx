"use client";

import { usePathname } from "next/navigation";

const languages = [
  { code: "HU", locale: "hu" },
  { code: "RO", locale: "ro" },
  { code: "EN", locale: "en" },
] as const;

export function LanguageSwitcher() {
  const pathname = usePathname();
  const basePath = pathname.replace(/^\/(ro|en)(?=\/|$)/, "") || "/";

  return (
    <nav className="flex flex-col items-center gap-0.5" aria-label="Language selector">
      {languages.map(({ code, locale }) => (
        <a
          className="text-[12px] font-extrabold leading-none tracking-[0.08em] text-surface-strong transition duration-200 hover:text-thread-red active:scale-95"
          href={locale === "hu" ? basePath : `/${locale}${basePath === "/" ? "" : basePath}`}
          key={locale}
        >
          {code}
        </a>
      ))}
    </nav>
  );
}
