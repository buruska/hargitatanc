"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const positionClassName = isAdminPage ? "fixed inset-x-0 bottom-0 z-50" : "relative z-40";

  return (
    <footer
      className={`${positionClassName} flex flex-col items-start justify-between border-t-[5px] border-t-thread-red bg-charcoal px-[clamp(18px,4vw,56px)] py-[22px] text-surface min-[861px]:flex-row min-[861px]:items-center`}
    >
      <div>
        <strong>Hargita Székely Néptáncszínház</strong>
        <p className="mt-1">Csíkszereda, Temesvári sugárút 6.</p>
      </div>
    </footer>
  );
}
