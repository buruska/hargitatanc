"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type SocialLinksFormState = {
  message?: string;
  success?: boolean;
};

function isValidSocialUrl(value: string) {
  if (value === "#") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function updateSocialLinksAction(
  _state: SocialLinksFormState,
  formData: FormData,
): Promise<SocialLinksFormState> {
  await requireAdmin();
  const facebookUrl = String(formData.get("facebookUrl") ?? "").trim();
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim();
  const tiktokUrl = String(formData.get("tiktokUrl") ?? "").trim();

  if (![facebookUrl, instagramUrl, tiktokUrl].every(isValidSocialUrl)) {
    return { message: "Adj meg érvényes http vagy https hivatkozásokat.", success: false };
  }

  await prisma.companyProfile.upsert({
    create: { facebookUrl, id: "main", instagramUrl, tiktokUrl },
    update: { facebookUrl, instagramUrl, tiktokUrl },
    where: { id: "main" },
  });

  revalidatePath("/");
  revalidatePath("/ro");
  revalidatePath("/en");
  revalidatePath("/admin/kozossegi-media");

  return { message: "A közösségimédia-linkek mentve.", success: true };
}
