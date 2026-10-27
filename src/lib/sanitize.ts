import "server-only";
import sanitizeHtml from "sanitize-html";

/** Rich text from the Tiptap editor is sanitised on every save. */
export function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "h4", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "br", "hr", "img", "figure", "figcaption", "code"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return { tagName, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
      },
    },
  });
}

export function plainText(input: string) {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
}
