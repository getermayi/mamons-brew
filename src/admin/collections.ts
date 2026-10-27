import type { Field } from "@/lib/fields";

/**
 * Admin content types. Each entry drives a searchable/sortable table and a
 * validated editor. Server-side persistence lives in app/admin/actions/collections.ts.
 */

export type ColumnKind = "text" | "badge" | "date" | "money" | "image" | "bool" | "color" | "number";
export type Column = { key: string; label: string; kind?: ColumnKind; filter?: boolean };

export type CollectionDef = {
  key: string;
  label: string;
  singular: string;
  description: string;
  group: "Catalogue" | "Content" | "Inbox" | "Audience";
  fields: readonly Field[];
  columns: Column[];
  sortable?: boolean;
  creatable?: boolean;
  /** Dynamic select sources the editor needs. */
  sources?: ("products" | "categories")[];
  /** Starting values for a brand-new item. */
  newDefaults?: Record<string, unknown>;
  /** Public URL to "View on site" for a row (uses {slug}). */
  viewPath?: string;
};

const stock = [
  { value: "IN_STOCK", label: "In stock" }, { value: "LOW_STOCK", label: "Almost gone" }, { value: "SOLD_OUT", label: "Sold out" }, { value: "COMING_SOON", label: "Coming soon" },
] as const;

export const COLLECTIONS: CollectionDef[] = [
  {
    key: "flavours", newDefaults: { published: true, stockStatus: "IN_STOCK", accent: "#C98A3D", variants: [{ label: "Single bottle", sku: "", price: "", compareAt: "" }] }, label: "Flavours", singular: "Flavour", group: "Catalogue", sortable: true, creatable: true, viewPath: "/flavours/{slug}",
    description: "Your kombucha line-up. Drag rows to change the order on the site.",
    columns: [{ key: "accent", label: "", kind: "color" }, { key: "name", label: "Name" }, { key: "price", label: "Price", kind: "money" }, { key: "stockStatus", label: "Stock", kind: "badge", filter: true }, { key: "featured", label: "Featured", kind: "bool" }, { key: "published", label: "Live", kind: "bool" }],
    fields: [
      { kind: "text", name: "name", label: "Name", half: true },
      { kind: "text", name: "slug", label: "URL slug", half: true, optional: true, help: "Leave empty to create from the name" },
      { kind: "text", name: "tagline", label: "Tagline", max: 160 },
      { kind: "richtext", name: "description", label: "Description" },
      { kind: "color", name: "accent", label: "Flavour colour", half: true, help: "Tints the page and cards" },
      { kind: "select", name: "stockStatus", label: "Stock status", half: true, options: stock },
      { kind: "boolean", name: "featured", label: "Featured", half: true, help: "Highlight on the home page" },
      { kind: "boolean", name: "published", label: "Visible on the site", half: true },
      { kind: "tags", name: "tags", label: "Taste tags", help: "Used for shop filters, e.g. fruity, earthy, zesty" },
      { kind: "tags", name: "tastingNotes", label: "Tasting notes" },
      { kind: "list", name: "variants", label: "Sizes & prices", itemLabel: "Size", max: 8, fields: [
        { kind: "text", name: "label", label: "Label", half: true, placeholder: "Single bottle" },
        { kind: "text", name: "sku", label: "SKU", half: true, optional: true },
        { kind: "number", name: "price", label: "Price (₹) — leave empty for “price soon”", min: 0, optional: true },
        { kind: "number", name: "compareAt", label: "Was price (₹)", min: 0, optional: true },
      ] },
      { kind: "list", name: "images", label: "Photos", itemLabel: "Photo", max: 12, fields: [
        { kind: "media", name: "url", label: "Image" },
        { kind: "text", name: "alt", label: "Alt text" },
      ] },
      { kind: "list", name: "ingredients", label: "Ingredients", itemLabel: "Ingredient", max: 30, fields: [
        { kind: "text", name: "name", label: "Ingredient" },
        { kind: "text", name: "note", label: "Note", optional: true },
        { kind: "boolean", name: "local", label: "Locally sourced" },
      ] },
      { kind: "textarea", name: "localStory", label: "Local ingredient story", rows: 4, optional: true },
      { kind: "tags", name: "pairsWith", label: "Pairs well with" },
      { kind: "list", name: "faqs", label: "Flavour FAQs", itemLabel: "Question", max: 20, fields: [
        { kind: "text", name: "q", label: "Question" },
        { kind: "textarea", name: "a", label: "Answer" },
      ] },
      { kind: "text", name: "seoTitle", label: "SEO title", optional: true, max: 70 },
      { kind: "textarea", name: "seoDescription", label: "SEO description", optional: true, max: 170, rows: 2 },
    ],
  },
  {
    key: "packs", newDefaults: { active: true }, label: "Packs & combos", singular: "Pack", group: "Catalogue", sortable: true, creatable: true, sources: ["products"],
    description: "Tasting flights and combo bundles with a discounted price.",
    columns: [{ key: "imageUrl", label: "", kind: "image" }, { key: "name", label: "Name" }, { key: "price", label: "Price", kind: "money" }, { key: "compareAt", label: "Was", kind: "money" }, { key: "active", label: "Live", kind: "bool" }],
    fields: [
      { kind: "text", name: "name", label: "Name", half: true },
      { kind: "text", name: "slug", label: "Slug", half: true, optional: true, help: "Auto from the title if empty" },
      { kind: "textarea", name: "description", label: "Description", rows: 2 },
      { kind: "number", name: "price", label: "Pack price (₹)", min: 0, half: true },
      { kind: "number", name: "compareAt", label: "Price if bought separately (₹)", min: 0, optional: true, half: true },
      { kind: "text", name: "badge", label: "Badge", optional: true, half: true, placeholder: "Best for first-timers" },
      { kind: "boolean", name: "active", label: "Visible on the site", half: true },
      { kind: "media", name: "imageUrl", label: "Image", optional: true },
      { kind: "text", name: "imageAlt", label: "Image alt text", optional: true },
      { kind: "list", name: "items", label: "What's inside", itemLabel: "Item", max: 24, fields: [
        { kind: "select", name: "productId", label: "Flavour", options: [], source: "products" },
        { kind: "number", name: "quantity", label: "Bottles", min: 1, max: 24 },
      ] },
    ],
  },
  {
    key: "discounts", newDefaults: { active: true, type: "PERCENT", value: 10 }, label: "Discount codes", singular: "Discount code", group: "Catalogue", creatable: true,
    description: "Optional codes customers can enter at checkout.",
    columns: [{ key: "code", label: "Code" }, { key: "summary", label: "Discount" }, { key: "usage", label: "Used" }, { key: "endsAt", label: "Ends", kind: "date" }, { key: "active", label: "Active", kind: "bool" }],
    fields: [
      { kind: "text", name: "code", label: "Code", half: true, help: "Letters and numbers, e.g. FIRSTPOUR" },
      { kind: "select", name: "type", label: "Type", half: true, options: [{ value: "PERCENT", label: "Percent off" }, { value: "FLAT", label: "Flat ₹ off" }] },
      { kind: "number", name: "value", label: "Amount", min: 1, half: true },
      { kind: "number", name: "minOrder", label: "Minimum order (₹)", min: 0, half: true },
      { kind: "date", name: "startsAt", label: "Starts", half: true, optional: true },
      { kind: "date", name: "endsAt", label: "Ends", half: true, optional: true },
      { kind: "number", name: "usageLimit", label: "Usage limit", min: 1, half: true, optional: true },
      { kind: "boolean", name: "active", label: "Active", half: true },
    ],
  },
  {
    key: "stockists", newDefaults: { active: true, kind: "Store" }, label: "Stockists", singular: "Stockist", group: "Content", sortable: true, creatable: true,
    description: "Shops, cafés and bars that carry Mamon Brews.",
    columns: [{ key: "name", label: "Name" }, { key: "area", label: "Area", filter: true }, { key: "kind", label: "Type", kind: "badge", filter: true }, { key: "active", label: "Live", kind: "bool" }],
    fields: [
      { kind: "text", name: "name", label: "Name", half: true },
      { kind: "select", name: "kind", label: "Type", half: true, options: ["Store", "Café", "Restaurant", "Bar", "Hotel", "Other"].map((v) => ({ value: v, label: v })) },
      { kind: "text", name: "address", label: "Address" },
      { kind: "text", name: "area", label: "Area / town", half: true },
      { kind: "text", name: "phone", label: "Phone", half: true, optional: true },
      { kind: "text", name: "hours", label: "Hours", optional: true },
      { kind: "text", name: "mapsUrl", label: "Google Maps link", optional: true, help: "Open the place in Google Maps → Share → Copy link" },
      { kind: "number", name: "lat", label: "Map pin latitude", half: true, optional: true },
      { kind: "number", name: "lng", label: "Map pin longitude", half: true, optional: true },
      { kind: "boolean", name: "active", label: "Show on the site" },
    ],
  },
  {
    key: "events", newDefaults: { published: true }, label: "Events", singular: "Event", group: "Content", creatable: true,
    description: "Upcoming events show a countdown; past events show their photos.",
    columns: [{ key: "posterUrl", label: "", kind: "image" }, { key: "title", label: "Title" }, { key: "startsAt", label: "Date", kind: "date" }, { key: "venue", label: "Venue" }, { key: "published", label: "Live", kind: "bool" }],
    fields: [
      { kind: "text", name: "title", label: "Title", half: true },
      { kind: "text", name: "slug", label: "Slug", half: true, optional: true, help: "Auto from the title if empty" },
      { kind: "date", name: "startsAt", label: "Starts", withTime: true, half: true },
      { kind: "date", name: "endsAt", label: "Ends", withTime: true, half: true, optional: true },
      { kind: "text", name: "venue", label: "Venue", half: true },
      { kind: "text", name: "address", label: "Address", half: true, optional: true },
      { kind: "textarea", name: "description", label: "Description", rows: 4 },
      { kind: "media", name: "posterUrl", label: "Poster", optional: true },
      { kind: "text", name: "posterAlt", label: "Poster alt text", optional: true },
      { kind: "tags", name: "partners", label: "Partners / hosts" },
      { kind: "list", name: "gallery", label: "Photos (shown for past events)", itemLabel: "Photo", max: 60, fields: [{ kind: "media", name: "url", label: "Image" }, { kind: "text", name: "alt", label: "Alt text" }] },
      { kind: "boolean", name: "published", label: "Show on the site" },
    ],
  },
  {
    key: "journal", newDefaults: { status: "DRAFT", authorName: "Mamon Brews" }, label: "Journal posts", singular: "Post", group: "Content", creatable: true, sources: ["categories"], viewPath: "/journal/{slug}",
    description: "Recipes, wellness notes, behind-the-brew stories and news.",
    columns: [{ key: "coverUrl", label: "", kind: "image" }, { key: "title", label: "Title" }, { key: "category", label: "Category", filter: true }, { key: "status", label: "Status", kind: "badge", filter: true }, { key: "publishedAt", label: "Published", kind: "date" }],
    fields: [
      { kind: "text", name: "title", label: "Title" },
      { kind: "text", name: "slug", label: "Slug", half: true, optional: true, help: "Auto from the title if empty" },
      { kind: "select", name: "categoryId", label: "Category", half: true, options: [], source: "categories" },
      { kind: "textarea", name: "excerpt", label: "Excerpt", rows: 2, max: 300 },
      { kind: "richtext", name: "content", label: "Article" },
      { kind: "media", name: "coverUrl", label: "Cover image", optional: true },
      { kind: "text", name: "coverAlt", label: "Cover alt text", optional: true },
      { kind: "text", name: "authorName", label: "Author", half: true },
      { kind: "select", name: "status", label: "Status", half: true, options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
      { kind: "date", name: "publishedAt", label: "Publish date", half: true, optional: true },
      { kind: "text", name: "seoTitle", label: "SEO title", optional: true, max: 70 },
      { kind: "textarea", name: "seoDescription", label: "SEO description", optional: true, max: 170, rows: 2 },
    ],
  },
  {
    key: "categories", label: "Journal categories", singular: "Category", group: "Content", sortable: true, creatable: true,
    description: "Group journal posts.",
    columns: [{ key: "name", label: "Name" }, { key: "slug", label: "Slug" }, { key: "posts", label: "Posts", kind: "number" }],
    fields: [{ kind: "text", name: "name", label: "Name", half: true }, { kind: "text", name: "slug", label: "Slug", half: true, optional: true, help: "Auto from the title if empty" }],
  },
  {
    key: "testimonials", newDefaults: { published: true, rating: 5 }, label: "Testimonials", singular: "Testimonial", group: "Content", sortable: true, creatable: true,
    description: "Customer and partner words. Only published ones appear on the site.",
    columns: [{ key: "quote", label: "Quote" }, { key: "name", label: "Name" }, { key: "rating", label: "★", kind: "number" }, { key: "published", label: "Live", kind: "bool" }],
    fields: [
      { kind: "textarea", name: "quote", label: "Quote", rows: 3 },
      { kind: "text", name: "name", label: "Name", half: true },
      { kind: "text", name: "context", label: "Context", half: true, optional: true, placeholder: "Café owner, Itanagar" },
      { kind: "number", name: "rating", label: "Rating (1–5)", min: 1, max: 5, half: true },
      { kind: "boolean", name: "published", label: "Show on the site", half: true },
    ],
  },
  {
    key: "faqs", newDefaults: { published: true, category: "Ordering" }, label: "FAQs", singular: "FAQ", group: "Content", sortable: true, creatable: true,
    description: "Questions shown on the FAQ page and in FAQ blocks.",
    columns: [{ key: "question", label: "Question" }, { key: "category", label: "Category", kind: "badge", filter: true }, { key: "showOnHome", label: "Home", kind: "bool" }, { key: "published", label: "Live", kind: "bool" }],
    fields: [
      { kind: "text", name: "question", label: "Question" },
      { kind: "textarea", name: "answer", label: "Answer", rows: 4 },
      { kind: "text", name: "category", label: "Category", half: true, help: "e.g. Ordering, Delivery, The Brew" },
      { kind: "boolean", name: "showOnHome", label: "Show on home page", half: true },
      { kind: "boolean", name: "published", label: "Show on the site" },
    ],
  },
  {
    key: "gallery", newDefaults: { width: 1200, height: 1500, category: "Bottles" }, label: "Gallery", singular: "Photo", group: "Content", sortable: true, creatable: true,
    description: "Photos for the gallery page and Instagram strip.",
    columns: [{ key: "url", label: "", kind: "image" }, { key: "alt", label: "Description" }, { key: "category", label: "Category", kind: "badge", filter: true }],
    fields: [
      { kind: "media", name: "url", label: "Photo" },
      { kind: "text", name: "alt", label: "Alt text" },
      { kind: "text", name: "caption", label: "Caption", optional: true },
      { kind: "text", name: "category", label: "Category", half: true, help: "Bottles, Brewing, Events, Arunachal…" },
      { kind: "number", name: "width", label: "Width (px)", min: 1, half: true },
      { kind: "number", name: "height", label: "Height (px)", min: 1, half: true },
    ],
  },
  {
    key: "team", label: "Team", singular: "Team member", group: "Content", sortable: true, creatable: true,
    description: "The people behind the brew.",
    columns: [{ key: "photoUrl", label: "", kind: "image" }, { key: "name", label: "Name" }, { key: "role", label: "Role" }],
    fields: [
      { kind: "text", name: "name", label: "Name", half: true },
      { kind: "text", name: "role", label: "Role", half: true },
      { kind: "textarea", name: "bio", label: "Bio", optional: true },
      { kind: "media", name: "photoUrl", label: "Photo", optional: true },
    ],
  },
  {
    key: "milestones", label: "Milestones", singular: "Milestone", group: "Content", sortable: true, creatable: true,
    description: "The story timeline on Our Story.",
    columns: [{ key: "dateLabel", label: "When" }, { key: "title", label: "Title" }],
    fields: [
      { kind: "text", name: "dateLabel", label: "When", half: true, placeholder: "November 2025" },
      { kind: "text", name: "title", label: "Title", half: true },
      { kind: "textarea", name: "description", label: "Description" },
    ],
  },
  {
    key: "legal", label: "Legal pages", singular: "Legal page", group: "Content", creatable: true, viewPath: "/legal/{slug}",
    description: "Privacy, terms, delivery & refunds.",
    columns: [{ key: "title", label: "Title" }, { key: "slug", label: "Slug" }, { key: "updatedAt", label: "Updated", kind: "date" }],
    fields: [{ kind: "text", name: "title", label: "Title", half: true }, { kind: "text", name: "slug", label: "Slug", half: true, optional: true, help: "Auto from the title if empty" }, { kind: "richtext", name: "content", label: "Content" }],
  },
  {
    key: "enquiries", label: "Enquiries", singular: "Enquiry", group: "Inbox",
    description: "Wholesale, event, tasting, gifting and contact messages.",
    columns: [{ key: "createdAt", label: "Received", kind: "date" }, { key: "name", label: "From" }, { key: "type", label: "Type", kind: "badge", filter: true }, { key: "status", label: "Status", kind: "badge", filter: true }, { key: "phone", label: "Phone" }],
    fields: [
      { kind: "select", name: "status", label: "Status", half: true, options: [{ value: "NEW", label: "New" }, { value: "CONTACTED", label: "Contacted" }, { value: "CONVERTED", label: "Converted" }, { value: "CLOSED", label: "Closed" }] },
      { kind: "text", name: "type", label: "Type", half: true, readOnly: true },
      { kind: "text", name: "name", label: "Name", half: true, readOnly: true },
      { kind: "text", name: "phone", label: "Phone", half: true, readOnly: true, optional: true },
      { kind: "text", name: "email", label: "Email", half: true, readOnly: true, optional: true },
      { kind: "text", name: "businessName", label: "Business", half: true, readOnly: true, optional: true },
      { kind: "text", name: "businessType", label: "Business type", half: true, readOnly: true, optional: true },
      { kind: "text", name: "location", label: "Location", half: true, readOnly: true, optional: true },
      { kind: "text", name: "monthlyVolume", label: "Monthly volume", half: true, readOnly: true, optional: true },
      { kind: "text", name: "eventDate", label: "Event date", half: true, readOnly: true, optional: true },
      { kind: "textarea", name: "message", label: "Message", readOnly: true, rows: 5 },
      { kind: "textarea", name: "notes", label: "Internal notes", optional: true, help: "Only visible to your team" },
    ],
  },
  {
    key: "subscriptions", label: "Subscriptions", singular: "Subscription", group: "Inbox",
    description: "Weekly and fortnightly subscription requests.",
    columns: [{ key: "createdAt", label: "Requested", kind: "date" }, { key: "name", label: "Customer" }, { key: "frequency", label: "Frequency", kind: "badge", filter: true }, { key: "bottles", label: "Bottles", kind: "number" }, { key: "status", label: "Status", kind: "badge", filter: true }, { key: "nextDelivery", label: "Next delivery", kind: "date" }],
    fields: [
      { kind: "select", name: "status", label: "Status", half: true, options: [{ value: "REQUESTED", label: "Requested" }, { value: "ACTIVE", label: "Active" }, { value: "PAUSED", label: "Paused" }, { value: "CANCELLED", label: "Cancelled" }] },
      { kind: "date", name: "nextDelivery", label: "Next delivery", half: true, optional: true },
      { kind: "select", name: "frequency", label: "Frequency", half: true, options: [{ value: "WEEKLY", label: "Weekly" }, { value: "BIWEEKLY", label: "Every two weeks" }] },
      { kind: "number", name: "bottles", label: "Bottles per delivery", min: 1, half: true },
      { kind: "textarea", name: "mix", label: "Flavour mix", readOnly: true, rows: 2 },
      { kind: "text", name: "name", label: "Name", half: true, readOnly: true },
      { kind: "text", name: "phone", label: "Phone", half: true, readOnly: true },
      { kind: "text", name: "area", label: "Area", half: true, readOnly: true },
      { kind: "text", name: "startDate", label: "Wants to start", half: true, readOnly: true, optional: true },
      { kind: "textarea", name: "address", label: "Address", readOnly: true, rows: 2, optional: true },
      { kind: "textarea", name: "notes", label: "Notes", optional: true },
    ],
  },
  {
    key: "customers", label: "Customers", singular: "Customer", group: "Audience",
    description: "Created automatically from orders and subscriptions.",
    columns: [{ key: "name", label: "Name" }, { key: "phone", label: "Phone" }, { key: "area", label: "Area", filter: true }, { key: "orders", label: "Orders", kind: "number" }, { key: "ltv", label: "Lifetime value", kind: "money" }, { key: "lastOrder", label: "Last order", kind: "date" }],
    fields: [
      { kind: "text", name: "name", label: "Name", half: true },
      { kind: "text", name: "phone", label: "Phone", half: true, readOnly: true },
      { kind: "text", name: "email", label: "Email", half: true, optional: true },
      { kind: "text", name: "area", label: "Area", half: true, optional: true },
      { kind: "textarea", name: "address", label: "Address", optional: true, rows: 2 },
      { kind: "textarea", name: "notes", label: "Notes", optional: true, help: "Preferences, allergies, gate codes…" },
    ],
  },
  {
    key: "newsletter", label: "Newsletter", singular: "Subscriber", group: "Audience",
    description: "Email sign-ups from the website. Export as CSV for your email tool.",
    columns: [{ key: "email", label: "Email" }, { key: "source", label: "Source" }, { key: "createdAt", label: "Joined", kind: "date" }, { key: "unsubscribed", label: "Unsubscribed", kind: "bool" }],
    fields: [{ kind: "text", name: "email", label: "Email", readOnly: true }, { kind: "boolean", name: "unsubscribed", label: "Unsubscribed" }],
  },
];

export function getCollection(key: string) {
  return COLLECTIONS.find((c) => c.key === key);
}
