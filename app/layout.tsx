import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hargita Székely Néptáncszínház",
  description: "Modern, mobilbarát oldal a Hargita Székely Néptáncszínház eseményeinek, híreinek és galériáinak.",
  icons: {
    icon: "/icon.png",
  },
};

const navigation = [
  { href: "/", label: "Főoldal" },
  { href: "/tarsulat", label: "Társulat" },
  { href: "/hirek", label: "Hírek" },
  { href: "/esemenyeink", label: "Eseményeink" },
  { href: "/galeria", label: "Galéria" },
  { href: "/kapcsolat", label: "Kapcsolat" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="m-0 bg-warm-canvas bg-[linear-gradient(90deg,rgb(33_31_27_/_3%)_1px,transparent_1px),linear-gradient(rgb(33_31_27_/_3%)_1px,transparent_1px)] bg-[length:28px_28px] font-sans leading-normal text-charcoal">
        <header className="sticky top-0 z-10 flex min-h-[76px] flex-col items-start justify-between gap-6 border-b-[3px] border-b-charcoal border-t-8 border-t-thread-red bg-surface px-[clamp(18px,4vw,56px)] py-4 min-[861px]:flex-row min-[861px]:items-center">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Hargita Székely Néptáncszínház főoldal">
            <Image
              className="block size-[52px] shrink-0 border-2 border-charcoal bg-surface-strong object-cover p-0.5"
              src="/logo.png"
              alt=""
              width={52}
              height={52}
              priority
            />
            <span>
              <strong className="block font-serif text-[21px] leading-none">Hargita</strong>
              <small className="block text-xs font-bold uppercase text-muted">Székely Néptáncszínház</small>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-start gap-1.5 min-[861px]:justify-end" aria-label="Fő navigáció">
            {navigation.map((item) => (
              <Link
                className="border border-transparent px-2.5 py-2 text-[13px] font-extrabold uppercase text-muted hover:border-charcoal hover:bg-thread-red hover:text-surface-strong"
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
        <footer className="flex flex-col items-start justify-between border-t-[5px] border-t-thread-red bg-charcoal px-[clamp(18px,4vw,56px)] py-[22px] text-surface min-[861px]:flex-row min-[861px]:items-center">
          <div>
            <strong>Hargita Székely Néptáncszínház</strong>
            <p className="mt-1">Csíkszereda, Temesvári sugárút 6.</p>
          </div>
          <Link href="/admin">Admin</Link>
        </footer>
      </body>
    </html>
  );
}
