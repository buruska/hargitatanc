"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const locale = pathname.startsWith("/ro") ? "ro" : pathname.startsWith("/en") ? "en" : "hu";
  const text = {
    hu: { maintainer: "Fenntartó:", contact: "Kapcsolat:", city: "Csíkszereda", county: "Hargita megye – 530102", address: "Temesvári sugárút 6. szám", phone: "Telefon", documents: "Hivatalos dokumentumok" },
    ro: { maintainer: "Susținător:", contact: "Contact:", city: "Miercurea Ciuc", county: "Județul Harghita – 530102", address: "Bulevardul Timișoarei nr. 6", phone: "Telefon", documents: "Documente oficiale" },
    en: { maintainer: "Maintained by:", contact: "Contact:", city: "Miercurea Ciuc", county: "Harghita County – 530102", address: "6 Timișoarei Boulevard", phone: "Phone", documents: "Official documents" },
  }[locale];

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
        <section className="block text-center min-[680px]:flex min-[680px]:items-center min-[680px]:justify-center min-[680px]:gap-4 min-[980px]:block" aria-labelledby="footer-maintainer-title">
          <h2 className="shrink-0 font-serif text-[clamp(20px,3vw,32px)] font-bold" id="footer-maintainer-title">{text.maintainer}</h2>
          <a
            aria-label="Csíkszereda Városháza weboldala"
            className="mx-auto mt-4 block w-full max-w-[240px] transition hover:opacity-80 min-[680px]:mx-0 min-[680px]:mt-0 min-[680px]:w-[140px] min-[680px]:shrink-0 min-[980px]:mx-auto min-[980px]:mt-5 min-[980px]:w-full min-[980px]:max-w-[430px]"
            href="https://szereda.ro/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Csíkszereda Városháza"
              className="h-auto w-full object-contain object-center"
              height={795}
              src="/csikszereda-varoshaza.png"
              width={1979}
            />
          </a>
        </section>

        <section className="text-center" aria-labelledby="footer-contact-title">
          <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-bold" id="footer-contact-title">{text.contact}</h2>
          <address className="mt-5 grid justify-items-center gap-6 text-center text-[16px] font-bold not-italic leading-relaxed min-[680px]:grid-cols-[1fr_1.05fr_1.25fr] min-[680px]:items-start">
            <p>
              {text.city}<br />
              {text.county}<br />
              {text.address}
            </p>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-thread-red">{text.phone}</p>
              <div className="mt-2 grid justify-items-center gap-1.5">
                <a className="transition hover:text-thread-red" href="tel:+40724309524">0040 724 309 524</a>
                <a className="transition hover:text-thread-red" href="tel:+40744619227">0040 744 619 227</a>
                <a className="transition hover:text-thread-red" href="tel:+40758087042">0040 758 087 042</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-thread-red">E-mail</p>
              <a className="mx-auto mt-2 block w-fit break-all transition hover:text-thread-red" href="mailto:hargitaneptanc@gmail.com">
                hargitaneptanc@gmail.com
              </a>
              <Link
                className="mx-auto mt-4 flex min-h-10 w-fit items-center border border-surface/45 px-3 py-2 text-center text-xs font-extrabold uppercase tracking-[0.06em] text-surface-strong transition hover:border-thread-red hover:bg-thread-red"
                href={`${locale === "hu" ? "" : `/${locale}`}/dokumentumok`}
              >
                {text.documents}
              </Link>
            </div>
          </address>
        </section>
      </div>

      <section
        aria-label="Támogatónk"
        className="relative border-t border-line-strong bg-warm-canvas px-[clamp(18px,4vw,40px)] py-3 text-charcoal min-[680px]:py-4"
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-center gap-5 min-[680px]:gap-8">
          <Image
            alt="Nemzeti Kulturális Alap"
            className="h-auto w-[clamp(110px,16vw,180px)] shrink-0 object-contain"
            height={996}
            src="/nka_2023.png"
            width={2048}
          />
          <p className="max-w-[620px] text-center font-serif text-[clamp(14px,1.6vw,18px)] font-bold leading-snug">
            A honlap felújítását a Nemzeti Kulturális Alap támogatta.
          </p>
        </div>
      </section>

      <div className="relative border-t border-white/15 px-[clamp(18px,4vw,40px)] py-4">
        <p className="mx-auto max-w-[1180px] text-center text-sm font-bold text-surface/80">
          Hargita Székely Néptáncszínház
        </p>
      </div>
    </footer>
  );
}
