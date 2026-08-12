import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle } from "@/lib/styles";
import { SocialLinksForm } from "./social-links-form";

export default async function AdminKozossegiMediaPage() {
  const profile = await prisma.companyProfile.findUnique({
    where: { id: "main" },
    select: { facebookUrl: true, instagramUrl: true, tiktokUrl: true },
  });

  return (
    <AdminShell>
      <h1 className={adminTitle}>Közösségi média</h1>
      <SocialLinksForm
        facebookUrl={profile?.facebookUrl ?? "https://www.facebook.com/hargitaegyuttes"}
        instagramUrl={profile?.instagramUrl ?? "https://www.instagram.com/hargitaneptancszinhaz"}
        tiktokUrl={profile?.tiktokUrl ?? "#"}
      />
    </AdminShell>
  );
}
