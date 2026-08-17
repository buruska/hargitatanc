import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteTextDefinitions } from "@/lib/site-texts";
import { adminTitle, eyebrow } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { SiteTextForm } from "./site-text-form";

export default async function SiteElementsPage() {
  const admin = await requireAdmin();
  if (admin.role === "ADMIN") redirect("/admin/statisztikak");
  const savedTexts = await prisma.siteText.findMany();
  const savedByKey = new Map(savedTexts.map((item) => [item.key, item]));
  const items = siteTextDefinitions.map((definition) => ({
    ...definition,
    hu: savedByKey.get(definition.key)?.hu ?? definition.hu,
    ro: savedByKey.get(definition.key)?.ro ?? definition.ro,
    en: savedByKey.get(definition.key)?.en ?? definition.en,
  }));

  return (
    <AdminShell>
      <div className="mb-6">
        <p className={eyebrow}>Háromnyelvű tartalom</p>
        <h1 className={`${adminTitle} mb-0`}>Oldalelemek változtatása</h1>
        <p className="mt-2 max-w-[760px] font-bold leading-relaxed text-muted">A menüpontok, publikus oldalcímek és feliratok magyar, román és angol változatainak szerkesztése.</p>
      </div>
      <SiteTextForm items={items} />
    </AdminShell>
  );
}
