import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "burusakos@yahoo.co.uk";
const SUPER_ADMIN_PASSWORD_HASH = "$2b$12$fNcEOz6tH0xrUQD7Z.IRruGaE7ZcR5nQ1dII1G7cjBL8nxk1sJBIO";

async function main() {
  await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      passwordHash: SUPER_ADMIN_PASSWORD_HASH,
      role: "SUPER_ADMIN",
    },
    create: {
      email: SUPER_ADMIN_EMAIL,
      passwordHash: SUPER_ADMIN_PASSWORD_HASH,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.event.upsert({
    where: { slug: "nyito-eloadas" },
    update: {},
    create: {
      title: "Nyitó előadás",
      slug: "nyito-eloadas",
      startsAt: new Date("2026-09-12T19:00:00+03:00"),
      location: "Csíkszereda",
      summary: "Minta esemény a kezdőoldali naptár és eseménykártyák ellenőrzéséhez.",
      isFeatured: true,
    },
  });

  await prisma.newsPost.upsert({
    where: { slug: "elindult-az-uj-honlap-tervezese" },
    update: {},
    create: {
      title: "Elindult az új honlap tervezése",
      slug: "elindult-az-uj-honlap-tervezese",
      excerpt: "Modern, mobilbarát felület készül a társulat híreinek, eseményeinek és galériáinak.",
      content: "Ez egy minta hír, amelyet később az admin felületről lehet majd szerkeszteni.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
