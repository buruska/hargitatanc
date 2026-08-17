import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const siteTextDefinitions = [
  { key: "nav.home", label: "Menü – Főoldal", hu: "Főoldal", ro: "Acasă", en: "Home" },
  { key: "nav.about", label: "Menü – Rólunk", hu: "Rólunk", ro: "Despre noi", en: "About us" },
  { key: "nav.news", label: "Menü – Hírek", hu: "Hírek", ro: "Știri", en: "News" },
  { key: "nav.events", label: "Menü – Eseményeink", hu: "Eseményeink", ro: "Evenimente", en: "Events" },
  { key: "nav.gallery", label: "Menü – Galéria", hu: "Galéria", ro: "Galerie", en: "Gallery" },
  { key: "nav.contact", label: "Menü – Kapcsolat", hu: "Kapcsolat", ro: "Contact", en: "Contact" },
  { key: "home.calendar.eyebrow", label: "Főoldal – Naptár felirat", hu: "Naptár", ro: "Calendar", en: "Calendar" },
  { key: "home.calendar.title", label: "Főoldal – Naptár cím", hu: "Közelgő fellépések és rendezvények", ro: "Spectacole și evenimente viitoare", en: "Upcoming performances and events" },
  { key: "home.news.eyebrow", label: "Főoldal – Hírek felirat", hu: "Hírek és beszámolók", ro: "Știri și relatări", en: "News and reports" },
  { key: "home.news.title", label: "Főoldal – Hírek cím", hu: "Aktuális", ro: "Actualitate", en: "Latest" },
  { key: "about.eyebrow", label: "Rólunk – Felirat", hu: "Rólunk", ro: "Despre noi", en: "About us" },
  { key: "about.title", label: "Rólunk – Cím", hu: "Hargita Székely Néptáncszínház", ro: "Teatrul de Dans Popular Secuiesc Harghita", en: "Hargita Székely Folk Dance Theatre" },
  { key: "news.eyebrow", label: "Hírek – Felirat", hu: "Aktuális", ro: "Actualitate", en: "Latest" },
  { key: "news.title", label: "Hírek – Cím", hu: "Hírek és beszámolók", ro: "Știri și relatări", en: "News and reports" },
  { key: "events.eyebrow", label: "Események – Felirat", hu: "Eseményeink", ro: "Evenimente", en: "Events" },
  { key: "events.title", label: "Események – Cím", hu: "Előadások és rendezvények", ro: "Spectacole și evenimente", en: "Performances and events" },
  { key: "events.subtitle", label: "Események – Alcím", hu: "A közelgő előadások és rendezvények elsőként jelennek meg.", ro: "Spectacolele și evenimentele viitoare sunt afișate primele.", en: "Upcoming performances and events are shown first." },
  { key: "gallery.eyebrow", label: "Galéria – Felirat", hu: "Galéria", ro: "Galerie", en: "Gallery" },
  { key: "gallery.title", label: "Galéria – Cím", hu: "Előadásképek és albumok", ro: "Fotografii de spectacol și albume", en: "Performance photos and albums" },
  { key: "contact.eyebrow", label: "Kapcsolat – Felirat", hu: "Kapcsolat", ro: "Contact", en: "Contact" },
  { key: "contact.title", label: "Kapcsolat – Cím", hu: "Elérhetőségeink", ro: "Datele noastre de contact", en: "Contact details" },
  { key: "documents.eyebrow", label: "Dokumentumok – Felirat", hu: "Dokumentumtár", ro: "Arhivă de documente", en: "Document archive" },
  { key: "documents.title", label: "Dokumentumok – Cím", hu: "Hivatalos dokumentumok", ro: "Documente oficiale", en: "Official documents" },
] as const;

const defaults = Object.fromEntries(siteTextDefinitions.map((item) => [item.key, item]));

export async function getSiteTextMap(locale: Locale) {
  const savedTexts = await prisma.siteText.findMany();
  const savedByKey = new Map(savedTexts.map((item) => [item.key, item]));
  return Object.fromEntries(siteTextDefinitions.map((definition) => [
    definition.key,
    savedByKey.get(definition.key)?.[locale] || defaults[definition.key][locale],
  ])) as Record<string, string>;
}
