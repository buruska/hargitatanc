"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return (
      <footer className="fixed inset-x-0 bottom-0 z-50 border-t-[5px] border-t-thread-red bg-charcoal px-[clamp(18px,4vw,56px)] py-[22px] text-surface">
        <strong>Hargita Székely Néptáncszínház</strong>
      </footer>
    );
  }

  return (
    <footer className="relative z-40 overflow-hidden border-t-[5px] border-t-thread-red bg-charcoal text-surface-strong">
      <div className="relative mx-auto grid max-w-[1180px] gap-10 px-[clamp(18px,4vw,40px)] py-[clamp(32px,4vw,48px)] min-[980px]:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.4fr)] min-[980px]:gap-12">
        <section aria-labelledby="footer-maintainer-title">
          <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-bold" id="footer-maintainer-title">Fenntartó:</h2>
          <a
            aria-label="Csíkszereda Városháza weboldala"
            className="mt-5 block w-full max-w-[430px] transition hover:opacity-80"
            href="https://szereda.ro/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Csíkszereda Városháza"
              className="h-auto w-full object-contain object-left"
              height={795}
              src="/csikszereda-varoshaza.png"
              width={1979}
            />
          </a>
        </section>

        <section aria-labelledby="footer-contact-title">
          <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-bold" id="footer-contact-title">Kapcsolat:</h2>
          <address className="mt-5 grid gap-6 text-[16px] font-bold not-italic leading-relaxed min-[680px]:grid-cols-[1fr_1.05fr_1.25fr] min-[680px]:items-start">
            <p>
              Csíkszereda<br />
              Hargita megye – 530102<br />
              Temesvári sugárút 6. szám
            </p>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-thread-red">Telefon</p>
              <div className="mt-2 grid justify-items-start gap-1.5">
                <a className="transition hover:text-thread-red" href="tel:+40724309524">0040 724 309 524</a>
                <a className="transition hover:text-thread-red" href="tel:+40744619227">0040 744 619 227</a>
                <a className="transition hover:text-thread-red" href="tel:+40758087042">0040 758 087 042</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-thread-red">E-mail</p>
              <a className="mt-2 inline-block break-all transition hover:text-thread-red" href="mailto:hargitaneptanc@gmail.com">
                hargitaneptanc@gmail.com
              </a>
            </div>
          </address>
        </section>
      </div>

      <div className="relative border-t border-white/15 px-[clamp(18px,4vw,40px)] py-4">
        <p className="mx-auto max-w-[1180px] text-sm font-bold text-surface/80">
          Hargita Székely Néptáncszínház
        </p>
      </div>
    </footer>
  );
}
