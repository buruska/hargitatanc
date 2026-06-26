import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeaderScrollBorder } from "./header-scroll-border";
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

const socialLinks = [
  {
    href: "#",
    label: "Facebook",
    icon: (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
        <path
          d="M14.1 8.2V6.7c0-.7.5-.9.9-.9h2.3V2h-3.2c-3.5 0-4.3 2.6-4.3 4.3v1.9H7v3.9h2.8V22h4.3v-9.9H17l.5-3.9h-3.4Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "#",
    label: "Instagram",
    icon: (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
        <path
          d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm9.6 2.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "#",
    label: "TikTok",
    icon: (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
        <path
          d="M15.8 2c.3 2.5 1.7 4 4.2 4.2v4.1a7.8 7.8 0 0 1-4.1-1.2v6.4c0 4.1-2.7 6.5-6.2 6.5A6 6 0 0 1 8.9 10c.4 0 .8 0 1.2.1v4.2a2.2 2.2 0 1 0 1.6 2.1V2h4.1Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const languages = ["HU", "RO", "EN"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="m-0 bg-warm-canvas font-sans leading-normal text-charcoal">
        <header className="fixed inset-x-0 top-0 z-10 flex h-[92px] flex-col items-center justify-between gap-6 bg-[linear-gradient(180deg,rgb(33_31_27_/_100%)_0%,rgb(33_31_27_/_0%)_100%)] px-[clamp(18px,4vw,56px)] py-4 pt-6 min-[861px]:flex-row">
          <HeaderScrollBorder />
          <Link href="/" className="relative inline-flex h-full items-center gap-3 pl-[60px]" aria-label="Hargita Székely Néptáncszínház főoldal">
            <Image
              className="absolute left-0 top-1/2 block size-[52px] -translate-y-1/2 object-cover"
              src="/logo.png"
              alt=""
              width={52}
              height={52}
              priority
            />
            <span className="font-serif tracking-[0.035em] text-surface-strong">
              <span className="block text-[18px] leading-[1.28]">Hargita Székely</span>
              <span className="block text-[18px] leading-[1.28]">Néptáncszínház</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-start gap-3 min-[861px]:justify-end">
            <nav className="flex flex-wrap items-center justify-start gap-1.5 min-[861px]:justify-end" aria-label="Fő navigáció">
              {navigation.map((item) => (
                <Link
                  className="inline-flex items-center px-2.5 py-2 text-[13px] font-extrabold uppercase tracking-[0.09em] text-surface-strong transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95"
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav className="flex items-center gap-px" aria-label="Közösségi média">
              {socialLinks.map((item) => (
                <Link
                  aria-label={item.label}
                  className="inline-flex size-6 items-center justify-center text-surface-strong transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95"
                  href={item.href}
                  key={item.label}
                >
                  {item.icon}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col items-center gap-0.5" aria-label="Nyelvválasztó">
              {languages.map((language) => (
                <Link
                  className="text-[12px] font-extrabold leading-none tracking-[0.08em] text-surface-strong transition duration-200 hover:text-thread-red active:scale-95"
                  href="#"
                  key={language}
                >
                  {language}
                </Link>
              ))}
            </nav>
          </div>
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
