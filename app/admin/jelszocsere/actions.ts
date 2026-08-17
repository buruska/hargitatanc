"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ChangePasswordState = { error?: string };

export async function changeRequiredPasswordAction(
  _state: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const admin = await requireAdmin({ allowRequiredPasswordChange: true });
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (!admin.mustChangePassword) redirect("/admin/statisztikak");
  if (password.length < 12) return { error: "Az új jelszó legalább 12 karakter hosszú legyen." };
  if (!/[A-ZÁÉÍÓÖŐÚÜŰ]/.test(password)) return { error: "Az új jelszó tartalmazzon legalább egy nagybetűt." };
  if (!/[a-záéíóöőúüű]/.test(password)) return { error: "Az új jelszó tartalmazzon legalább egy kisbetűt." };
  if (!/[0-9]/.test(password)) return { error: "Az új jelszó tartalmazzon legalább egy számot." };
  if (!/[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű0-9]/.test(password)) {
    return { error: "Az új jelszó tartalmazzon legalább egy speciális karaktert." };
  }
  if (password !== passwordConfirmation) return { error: "A két jelszó nem egyezik." };

  const currentUser = await prisma.user.findUnique({
    where: { email: admin.email },
    select: { passwordHash: true },
  });
  if (!currentUser) redirect("/admin");
  if (await bcrypt.compare(password, currentUser.passwordHash)) {
    return { error: "Az új jelszó nem egyezhet meg az ideiglenes jelszóval." };
  }

  await prisma.user.update({
    where: { email: admin.email },
    data: {
      mustChangePassword: false,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  redirect("/admin/statisztikak");
}
