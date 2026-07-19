import sanitizeHtml from "sanitize-html";

const SAFE_IMAGE_DATA_URL = /^data:image\/(?:gif|jpe?g|png|webp);base64,[a-z0-9+/=\s]+$/i;

function sanitizeImageSource(source: string | undefined) {
  if (!source) return undefined;

  if (source.startsWith("/")) return source;
  if (SAFE_IMAGE_DATA_URL.test(source)) return source;

  try {
    const url = new URL(source);
    return ["http:", "https:"].includes(url.protocol) ? source : undefined;
  } catch {
    return undefined;
  }
}

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "strong",
      "em",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "hr",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowProtocolRelative: false,
    nestingLimit: 20,
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...(attributes.href ? { href: attributes.href } : {}),
          ...(attributes.target === "_blank"
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {}),
        },
      }),
      img: (_tagName, attributes) => {
        const src = sanitizeImageSource(attributes.src);

        return {
          tagName: "img",
          attribs: {
            ...(src ? { src } : {}),
            ...(attributes.alt ? { alt: attributes.alt } : {}),
            ...(attributes.title ? { title: attributes.title } : {}),
          },
        };
      },
    },
  }).trim();
}

export function hasRichTextContent(html: string) {
  if (/<img(?:\s|>)/i.test(html)) return true;

  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\u00a0/g, " ")
    .trim().length > 0;
}
