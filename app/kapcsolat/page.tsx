import type { Metadata } from "next";
import { contentPage } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Kapcsolat | Hargita Székely Néptáncszínház",
  description: "A Hargita Székely Néptáncszínház címe, telefonszámai, e-mail-címe és térképes elérhetősége.",
};

function LocationIcon() {
  return (
    <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24">
      <path d="M7.2 3.5 9.4 8 6.8 9.7c1.4 3.3 4.2 6 7.5 7.5l1.7-2.6 4.5 2.2-.7 3.2c-.2.9-1.1 1.5-2 1.4C9.9 20.4 3.6 14.1 2.8 6.2c-.1-.9.5-1.8 1.4-2l3-.7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24">
      <rect height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="20" x="2" y="4" />
      <path d="m3 6 9 7 9-7" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

const phoneNumbers = [
  { href: "tel:+40724309524", label: "0040 724 309 524" },
  { href: "tel:+40744619227", label: "0040 744 619 227" },
  { href: "tel:+40758087042", label: "0040 758 087 042" },
];

export default function KapcsolatPage() {
  return (
    <main className={`${contentPage} max-w-[1180px]`}>
      <section className="grid overflow-hidden bg-surface shadow-[14px_14px_0_rgb(33_31_27_/_8%)] min-[900px]:grid-cols-[minmax(330px,0.8fr)_minmax(0,1.2fr)]" aria-label="Elérhetőségek és térkép">
        <div className="relative overflow-hidden p-[clamp(24px,4vw,46px)]">
          <h2 className="relative font-serif text-[clamp(25px,3vw,34px)] font-bold">Elérhetőségeink</h2>
          <address className="relative mt-8 grid gap-8 not-italic">
            <div className="grid grid-cols-[44px_1fr] gap-3">
              <span className="flex size-11 items-center justify-center bg-thread-red text-surface-strong"><LocationIcon /></span>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-thread-red">Cím</h3>
                <p className="mt-2 font-bold leading-relaxed">Csíkszereda<br />Hargita megye – 530102<br />Temesvári sugárút 6. szám</p>
              </div>
            </div>

            <div className="grid grid-cols-[44px_1fr] gap-3">
              <span className="flex size-11 items-center justify-center bg-pine text-surface-strong"><PhoneIcon /></span>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-pine">Telefon</h3>
                <div className="mt-2 grid justify-items-start gap-1.5 font-bold">
                  {phoneNumbers.map((phone) => (
                    <a className="decoration-thread-red underline-offset-4 transition hover:text-thread-red hover:underline" href={phone.href} key={phone.href}>{phone.label}</a>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[44px_1fr] gap-3">
              <span className="flex size-11 items-center justify-center bg-petrol text-surface-strong"><MailIcon /></span>
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-petrol">E-mail</h3>
                <a className="mt-2 inline-block max-w-full break-all font-bold decoration-thread-red underline-offset-4 transition hover:text-thread-red hover:underline" href="mailto:hargitaneptanc@gmail.com">hargitaneptanc@gmail.com</a>
              </div>
            </div>
          </address>
        </div>

        <div className="relative min-h-[430px] bg-line">
          <iframe
            allowFullScreen
            className="absolute inset-0 size-full border-0 grayscale-[15%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Temesv%C3%A1ri+sug%C3%A1r%C3%BAt+6,+Cs%C3%ADkszereda,+Romania&output=embed"
            title="Hargita Székely Néptáncszínház helye a Google Térképen"
          />
          <a
            className="absolute bottom-5 right-5 inline-flex min-h-11 items-center gap-2 border-2 border-charcoal bg-surface-strong px-4 py-2.5 text-sm font-extrabold shadow-[5px_5px_0_rgb(33_31_27_/_18%)] transition hover:-translate-y-0.5 hover:bg-thread-red hover:text-surface-strong"
            href="https://www.google.com/maps/search/?api=1&query=Temesv%C3%A1ri+sug%C3%A1r%C3%BAt+6%2C+Cs%C3%ADkszereda%2C+Romania"
            rel="noopener noreferrer"
            target="_blank"
          >
            <LocationIcon />
            Megnyitás a térképen
          </a>
        </div>
      </section>
    </main>
  );
}
