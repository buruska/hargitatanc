"use client";

import { type MouseEvent, type ReactNode, useRef } from "react";

export function MobileMenuDetails({ children }: { children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeAfterLinkClick(event: MouseEvent<HTMLDetailsElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest("a")) {
      window.setTimeout(() => {
        detailsRef.current?.removeAttribute("open");
      }, 0);
    }
  }

  return (
    <details className="group relative" ref={detailsRef} onClick={closeAfterLinkClick}>
      {children}
    </details>
  );
}
