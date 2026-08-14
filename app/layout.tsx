import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeaderScrollBorder } from "./header-scroll-border";
import { SiteFooter } from "./site-footer";
import { TicketPurchaseModal, type TicketModalItem } from "./ticket-purchase-modal";
import { prisma } from "@/lib/prisma";
import { getLocale, localizeHref } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import "./globals.css";
import { getLocalizedPerformanceTitle } from "@/lib/localize-performance";

export const metadata: Metadata = {
  title: "Hargita Székely Néptáncszínház",
  description: "Modern, mobilbarát oldal a Hargita Székely Néptáncszínház eseményeinek, híreinek és galériáinak.",
  icons: {
    icon: "/icon.png",
  },
};

export const revalidate = 300;

const navigation = {
  hu: ["Főoldal", "Rólunk", "Hírek", "Eseményeink", "Galéria", "Kapcsolat"],
  ro: ["Acasă", "Despre noi", "Știri", "Evenimente", "Galerie", "Contact"],
  en: ["Home", "About us", "News", "Events", "Gallery", "Contact"],
};
const navigationHrefs = ["/", "/tarsulat", "/hirek", "/esemenyeink", "/galeria", "/kapcsolat"];

const socialLinkDefinitions = [
  {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const now = new Date();
  const [performanceEvents, events, companyProfile] = await Promise.all([
    prisma.runningPerformanceEvent.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        location: true,
        startsAt: true,
        ticketMode: true,
        ticketText: true,
        ticketUrl: true,
        runningPerformance: {
          select: {
            summary: true,
            summaryEn: true,
            summaryRo: true,
            title: true,
            titleEn: true,
            titleRo: true,
          },
        },
      },
    }),
    prisma.event.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      select: { id: true, location: true, startsAt: true, title: true },
    }),
    prisma.companyProfile.findUnique({
      where: { id: "main" },
      select: { facebookUrl: true, instagramUrl: true, tiktokUrl: true },
    }),
  ]);
  const socialUrls = [
    companyProfile?.facebookUrl ?? "https://www.facebook.com/hargitaegyuttes",
    companyProfile?.instagramUrl ?? "https://www.instagram.com/hargitaneptancszinhaz",
    companyProfile?.tiktokUrl ?? "#",
  ];
  const socialLinks = socialLinkDefinitions.map((item, index) => ({ ...item, href: socialUrls[index] }));
  const ticketItems: TicketModalItem[] = [
    ...performanceEvents.map((event) => ({
      id: event.id,
      kind: "performance" as const,
      location: event.location,
      startsAt: event.startsAt.toISOString(),
      ticketMode: event.ticketMode,
      ticketText: event.ticketText,
      ticketUrl: event.ticketUrl,
      title: getLocalizedPerformanceTitle(event.runningPerformance, locale),
    })),
    ...events.map((event) => ({
      id: event.id,
      kind: "event" as const,
      location: event.location,
      startsAt: event.startsAt.toISOString(),
      ticketMode: "LINK" as const,
      ticketText: "",
      ticketUrl: "",
      title: event.title,
    })),
  ].sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());

  return (
    <html lang={locale}>
      <body className="m-0 bg-warm-canvas font-sans leading-normal text-charcoal">
        <HeaderScrollBorder />
        <header className="fixed inset-x-0 top-0 z-[80] flex h-[84px] items-center justify-between gap-2 bg-[linear-gradient(180deg,rgb(33_31_27_/_100%)_0%,rgb(33_31_27_/_82%)_72%,rgb(33_31_27_/_0%)_100%)] px-[clamp(14px,4vw,56px)] py-3 min-[861px]:h-[92px] min-[861px]:gap-6 min-[861px]:py-4 min-[861px]:pt-6">
          <Link href={localizeHref("/", locale)} className="relative inline-flex h-full min-w-[52px] items-center gap-3 pl-[52px] min-[861px]:pl-[60px]" aria-label="Hargita Székely Néptáncszínház">
            <Image
              className="absolute left-0 top-1/2 block size-[46px] -translate-y-1/2 object-cover min-[861px]:size-[52px]"
              src="/logo.png"
              alt=""
              width={52}
              height={52}
              priority
            />
            <span className="hidden font-serif tracking-[0.035em] text-surface-strong min-[470px]:block min-[861px]:hidden min-[1060px]:block">
              <span className="block text-[18px] leading-[1.28]">Hargita Székely</span>
              <span className="block text-[18px] leading-[1.28]">Néptáncszínház</span>
            </span>
          </Link>
          <div className="hidden flex-wrap items-center justify-end gap-3 min-[861px]:flex">
            <nav className="flex flex-wrap items-center justify-start gap-1.5 min-[861px]:justify-end" aria-label="Fő navigáció">
              {navigationHrefs.map((href, index) => (
                <Link
                  className="inline-flex items-center px-2.5 py-2 text-[13px] font-extrabold uppercase tracking-[0.09em] text-surface-strong transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95 min-[861px]:text-[11px] min-[1060px]:text-[13px]"
                  key={href}
                  href={localizeHref(href, locale)}
                >
                  {navigation[locale][index]}
                </Link>
              ))}
            </nav>
            <TicketPurchaseModal items={ticketItems} locale={locale} />
            <nav className="flex items-center gap-px" aria-label="Közösségi média">
              {socialLinks.map((item) => (
                <Link
                  aria-label={item.label}
                  className="inline-flex size-6 items-center justify-center text-surface-strong transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95"
                  href={item.href}
                  key={item.label}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.icon}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2 min-[861px]:hidden">
            <TicketPurchaseModal items={ticketItems} locale={locale} />
            <LanguageSwitcher />
            <details className="group relative">
              <summary
                aria-label={locale === "ro" ? "Deschide meniul" : locale === "en" ? "Open menu" : "Menü megnyitása"}
                className="grid size-11 cursor-pointer list-none place-items-center border border-white/45 bg-charcoal/45 text-surface-strong backdrop-blur-sm marker:hidden"
              >
                <span className="grid gap-1.5" aria-hidden="true">
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                </span>
              </summary>
              <div className="absolute right-0 top-[calc(100%+10px)] w-[min(300px,calc(100vw-28px))] border border-line-strong bg-charcoal p-3 text-surface-strong shadow-[10px_10px_0_rgb(33_31_27_/_24%)]">
                <nav className="grid" aria-label={locale === "ro" ? "Navigare principală" : locale === "en" ? "Main navigation" : "Fő navigáció"}>
                  {navigationHrefs.map((href, index) => (
                    <Link
                      className="border-b border-white/15 px-3 py-3 text-[14px] font-extrabold uppercase tracking-[0.08em] transition hover:bg-white/10 hover:text-thread-red"
                      key={href}
                      href={localizeHref(href, locale)}
                    >
                      {navigation[locale][index]}
                    </Link>
                  ))}
                </nav>
                <nav className="mt-3 flex items-center gap-2" aria-label="Közösségi média">
                  {socialLinks.map((item) => (
                    <Link
                      aria-label={item.label}
                      className="inline-flex size-11 items-center justify-center border border-white/25 text-surface-strong transition hover:bg-white/10 hover:text-thread-red"
                      href={item.href}
                      key={item.label}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                    >
                      {item.icon}
                    </Link>
                  ))}
                </nav>
              </div>
            </details>
          </div>
        </header>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
