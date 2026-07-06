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
      excerpt: "Modern, mobilbarát felület készül a hírek, események és galériák bemutatására.",
      content: "Ez egy minta hír, amelyet később az admin felületről lehet majd szerkeszteni.",
    },
  });

  const members = [
    {
      name: "Tánckar",
      role: "Előadóművészek",
      bio: "A táncos közösség bemutatkozó kártyája. A későbbi admin felületen név szerinti tagokra bontható.",
      sortOrder: 10,
    },
    {
      name: "Zenekar",
      role: "Élő zenei kíséret",
      bio: "A zenekar és a népzenei kíséret helye, amely később részletes taglistával bővíthető.",
      sortOrder: 20,
    },
    {
      name: "Alkotók",
      role: "Koreográfusok és rendezők",
      bio: "Az alkotói csapat bemutatására előkészített adatbázisrekord.",
      sortOrder: 30,
    },
    {
      name: "Munkatársak",
      role: "Szervezés és háttérmunka",
      bio: "A színház működését segítő szakmai háttércsapat bemutatkozó kártyája.",
      sortOrder: 40,
    },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { id: `seed-${member.sortOrder}` },
      update: member,
      create: {
        id: `seed-${member.sortOrder}`,
        ...member,
      },
    });
  }

  const albums = [
    {
      title: "Táncelőadások",
      slug: "tanceloadasok",
      description: "Színpadi előadások fotóválogatásának helye.",
    },
    {
      title: "Próbák",
      slug: "probak",
      description: "Próbatermi pillanatok és munkafolyamatok.",
    },
    {
      title: "Turnék",
      slug: "turnek",
      description: "Vendégszereplések, utazások és fesztiválok képei.",
    },
    {
      title: "Rendezvények",
      slug: "rendezvenyek",
      description: "Közösségi események és szakmai programok albumai.",
    },
    {
      title: "Portrék",
      slug: "portrek",
      description: "Rólunk oldalhoz kapcsolódó és alkotói portrék gyűjteménye.",
    },
    {
      title: "Archívum",
      slug: "archivum",
      description: "Régebbi előadások és emlékezetes pillanatok.",
    },
  ];

  for (const album of albums) {
    await prisma.galleryAlbum.upsert({
      where: { slug: album.slug },
      update: album,
      create: album,
    });
  }
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
