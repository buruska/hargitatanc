import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sanitizeHtml from "sanitize-html";

const prisma = new PrismaClient();
const origin = "https://hargitatanc.ro/";
const requestedLocale = process.argv.find((argument) => argument.startsWith("--locale="))?.split("=")[1] ?? "ro";
const source = {
  en: { label: "angol", listPath: "en/articles/list/0/1/news" },
  ro: { label: "román", listPath: "ro/articles/list/0/1/stiri" },
}[requestedLocale];

if (!source) throw new Error(`Nem támogatott nyelv: ${requestedLocale}`);

const listBaseUrl = `${origin}${source.listPath}`;
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "news", requestedLocale);

const romanianMonths = {
  ianuarie: 0,
  februarie: 1,
  martie: 2,
  aprilie: 3,
  mai: 4,
  iunie: 5,
  iulie: 6,
  august: 7,
  septembrie: 8,
  octombrie: 9,
  noiembrie: 10,
  decembrie: 11,
};

function decodeText(value = "") {
  return sanitizeHtml(value, { allowedAttributes: {}, allowedTags: [] })
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseLegacyDate(value, fallbackIndex) {
  const dateText = decodeText(value);
  if (requestedLocale === "en" && dateText) {
    const parsedDate = new Date(`${dateText} 12:00:00 UTC`);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
  }

  const normalized = dateText.toLocaleLowerCase("ro-RO");
  const match = normalized.match(/(\d{1,2})\s+([a-zăâîșşțţ]+)\s+(\d{4})/i);

  if (match) {
    const month = romanianMonths[match[2].replace("ş", "ș").replace("ţ", "ț")];
    if (month !== undefined) return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 12));
  }

  // The legacy archive contains one undated item before the first dated entry.
  return new Date(Date.UTC(2020, 2, 10, 12, Math.max(1, 59 - fallbackIndex)));
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

async function mapLimit(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));
  return results;
}

function parseListPage(html) {
  return html
    .split(/<div class="mansory-grid-item-2\s+in-view-once articles_list_item">/i)
    .slice(1)
    .map((segment) => {
      const titleMatch = segment.match(/<a class="title ajax nodec" href="([^"]+)">([\s\S]*?)<\/a>/i);
      if (!titleMatch) return null;

      const id = titleMatch[1].match(/\/articles\/(\d+)\//)?.[1];
      if (!id) return null;

      const date = segment.match(/<a class="uptitle ajax nodec"[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "";
      const subtitle = segment.match(/<a class="subtitle ajax nodec"[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "";
      const heading = segment.match(/<div class="heading">([\s\S]*?)<\/div>/i)?.[1] ?? "";
      const listImage = segment.match(/background:\s*url\(([^)]+)\)/i)?.[1]?.trim() ?? null;

      return {
        date,
        heading,
        href: new URL(titleMatch[1], origin).href,
        id,
        listImage: listImage ? new URL(listImage, origin).href : null,
        subtitle,
        title: decodeText(titleMatch[2]),
      };
    })
    .filter(Boolean);
}

function sanitizeArticleBody(value) {
  const withoutCover = value.replace(
    /<div class="main_image_container mobile_one">[\s\S]*?<\/a>\s*<\/div>/i,
    "",
  );
  const absoluteLinks = withoutCover.replace(
    /href=(["'])(?!https?:|mailto:|tel:|#)(.*?)\1/gi,
    (_match, quote, href) => `href=${quote}${new URL(href, origin).href}${quote}`,
  );

  return sanitizeHtml(absoluteLinks, {
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedTags: ["a", "b", "blockquote", "br", "em", "i", "li", "ol", "p", "strong", "u", "ul"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
      div: "p",
    },
  }).trim();
}

function parseDetailPage(html) {
  const description =
    html.match(/<div class="description">([\s\S]*?)<\/div>\s*<div class="cb"><\/div>/i)?.[1] ?? "";
  const mainImage =
    description.match(/<a class="main_image_link"[^>]*href="([^"]+)"/i)?.[1] ??
    description.match(/<img class="main_image"[^>]*src="([^"]+)"/i)?.[1] ??
    null;

  return {
    body: sanitizeArticleBody(description),
    mainImage: mainImage ? new URL(mainImage, origin).href : null,
  };
}

async function downloadImage(url, legacyId) {
  if (!url) return null;

  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const contentType = response.headers.get("content-type") ?? "";
    const sourceExtension = path.extname(new URL(response.url).pathname).toLowerCase();
    const extension =
      [".jpg", ".jpeg", ".png", ".webp", ".gif"].find((item) => sourceExtension.endsWith(item)) ??
      (contentType.includes("png") ? ".png" : contentType.includes("webp") ? ".webp" : ".jpg");
    const fileName = `legacy-${requestedLocale}-${legacyId}${extension}`;
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await response.arrayBuffer()));
    return `/uploads/news/${requestedLocale}/${fileName}`;
  } catch (error) {
    console.warn(`A(z) ${legacyId}. cikk képe nem tölthető le: ${error.message}`);
    return url;
  }
}

async function main() {
  await mkdir(uploadDirectory, { recursive: true });

  const offsets = Array.from({ length: 25 }, (_value, index) => index * 8);
  const listPages = await mapLimit(offsets, 5, (offset) =>
    fetchText(offset === 0 ? listBaseUrl : `${listBaseUrl}/page-${offset}-8`),
  );
  const articlesById = new Map();

  for (const page of listPages) {
    for (const article of parseListPage(page)) articlesById.set(article.id, article);
  }

  const articles = [...articlesById.values()];
  const hungarianPosts = await prisma.newsPost.findMany({
    where: { locale: "hu" },
    select: { id: true, publishedAt: true },
  });
  const hungarianDates = new Map(
    hungarianPosts
      .map((post) => [post.id.match(/^legacy-news-(\d+)$/)?.[1], post.publishedAt])
      .filter(([legacyId]) => legacyId),
  );
  console.log(`${articles.length} ${source.label} hír található a régi archívumban.`);

  const imported = await mapLimit(articles, 6, async (article, index) => {
    const detailHtml = await fetchText(article.href);
    const detail = parseDetailPage(detailHtml);
    const coverUrl = await downloadImage(detail.mainImage ?? article.listImage, article.id);
    const excerpt = decodeText(article.subtitle) || decodeText(article.heading) || article.title;
    const fallbackBody = decodeText(article.heading) || excerpt;
    const publishedAt = hungarianDates.get(article.id) ?? parseLegacyDate(article.date, index);
    const content = [
      coverUrl ? `<img src="${escapeHtml(coverUrl)}" alt="">` : "",
      detail.body || `<p>${escapeHtml(fallbackBody)}</p>`,
    ].join("");

    await prisma.newsPost.upsert({
      where: { slug: `${requestedLocale}-archiv-${article.id}` },
      create: {
        content,
        excerpt,
        id: `legacy-news-${requestedLocale}-${article.id}`,
        locale: requestedLocale,
        publishedAt,
        slug: `${requestedLocale}-archiv-${article.id}`,
        title: article.title,
      },
      update: {
        content,
        excerpt,
        locale: requestedLocale,
        publishedAt,
        title: article.title,
      },
    });

    if ((index + 1) % 25 === 0 || index + 1 === articles.length) {
      console.log(`${index + 1}/${articles.length} hír importálva.`);
    }
    return article.id;
  });

  console.log(`${imported.length} ${source.label} hír importálása befejeződött.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
