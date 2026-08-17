"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CreateAdminState = { error?: string; success?: string };

export async function createAdminAction(_state: CreateAdminState, formData: FormData): Promise<CreateAdminState> {
  const currentAdmin = await requireAdmin();
  if (currentAdmin.role === "ADMIN") return { error: "Nincs jogosultságod adminisztrátor hozzáadásához." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestedRole = String(formData.get("role") ?? "");
  const allowedRole = currentAdmin.role === "SUPER_ADMIN" ? requestedRole : "ADMIN";

  if (!email || !email.includes("@")) return { error: "Adj meg egy érvényes e-mail címet." };
  if (password.length < 12) return { error: "A jelszó legalább 12 karakter hosszú legyen." };
  if (allowedRole !== "MAIN_ADMIN" && allowedRole !== "ADMIN") return { error: "Érvénytelen jogosultsági szint." };

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) return { error: "Ezzel az e-mail címmel már létezik adminisztrátor." };

  await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(password, 12), role: allowedRole },
  });
  revalidatePath("/admin/adminok");
  return { success: allowedRole === "MAIN_ADMIN" ? "A főadmin létrejött." : "Az admin létrejött." };
}
