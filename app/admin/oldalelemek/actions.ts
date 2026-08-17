"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteTextDefinitions } from "@/lib/site-texts";

export type SiteTextFormState = { error?: string; success?: string };

export async function updateSiteTextsAction(_state: SiteTextFormState, formData: FormData): Promise<SiteTextFormState> {
  const admin = await requireAdmin();
  if (admin.role === "ADMIN") return { error: "Nincs jogosultságod az oldalelemek módosításához." };

  const values = siteTextDefinitions.map((definition) => ({
    key: definition.key,
    hu: String(formData.get(`${definition.key}.hu`) ?? "").trim(),
    ro: String(formData.get(`${definition.key}.ro`) ?? "").trim(),
    en: String(formData.get(`${definition.key}.en`) ?? "").trim(),
  }));
  if (values.some((value) => !value.hu || !value.ro || !value.en)) {
    return { error: "Minden oldalelemhez add meg mindhárom nyelvi változatot." };
  }
  if (values.some((value) => value.hu.length > 300 || value.ro.length > 300 || value.en.length > 300)) {
    return { error: "Egy szöveg legfeljebb 300 karakter hosszú lehet." };
  }

  await prisma.$transaction(values.map((value) => prisma.siteText.upsert({
    where: { key: value.key },
    update: { hu: value.hu, ro: value.ro, en: value.en },
    create: value,
  })));
  revalidatePath("/", "layout");
  return { success: "Az oldalelemek szövegei frissültek." };
}
