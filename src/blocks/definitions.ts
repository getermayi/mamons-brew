import type { Field, ValuesOf } from "@/lib/fields";

/**
 * Every page is a stack of these blocks. Each definition drives the admin
 * editor, validation and the public component's prop types.
 */

export const ICONS = [
  "leaf", "sprout", "bubbles", "heart", "shield", "sun", "mountain", "recycle", "truck", "gift",
  "sparkles", "droplet", "clock", "flask", "users", "store", "calendar", "thermometer", "glass", "award",
] as const;
const iconOptions = ICONS.map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));

const toneOptions = [
  { value: "forest", label: "Forest green" },
  { value: "red", label: "Brand red" },
  { value: "cream", label: "Cream" },
  { value: "ink", label: "Ink" },
  { value: "sky", label: "Sky blue" },
] as const;

function defineBlock<const FS extends readonly Field[]>(def: {
  type: string;
  label: string;
  description: string;
  group: "Hero" | "Story" | "Commerce" | "Social proof" | "Engagement" | "Layout";
  fields: FS;
  defaults: ValuesOf<FS>;
}) {
  return def;
}

export const heroBlock = defineBlock({
  type: "hero",
  label: "Home hero",
  description: "Full-bleed opening with the bottle, hills and rising fizz.",
  group: "Hero",
  fields: [
    { kind: "text", name: "eyebrow", label: "Small line above the headline" },
    { kind: "text", name: "headline", label: "Headline", help: "Wrap a word in *asterisks* to set it in italic accent." },
    { kind: "textarea", name: "subhead", label: "Supporting line", rows: 3 },
    { kind: "link", name: "primaryCta", label: "Primary button", help: "Use href \"whatsapp\" to open a WhatsApp chat." },
    { kind: "link", name: "secondaryCta", label: "Secondary button" },
    { kind: "text", name: "flavourSlug", label: "Bottle shown (flavour slug)", placeholder: "bay-leaf" },
    { kind: "image", name: "image", label: "Custom hero photo (optional — replaces the illustrated bottle)", optional: true },
    { kind: "list", name: "badges", label: "Proof badges", itemLabel: "Badge", max: 4, fields: [{ kind: "text", name: "text", label: "Text" }] },
  ],
  defaults: {
    eyebrow: "Naturally fermented in Naharlagun",
    headline: "Brewed in the *hills.* Bottled alive.",
    subhead: "",
    primaryCta: { label: "Order on WhatsApp", href: "whatsapp" },
    secondaryCta: { label: "Explore flavours", href: "/flavours" },
    flavourSlug: "bay-leaf",
    image: { url: "", alt: "" },
    badges: [],
  },
});

export const pageHeroBlock = defineBlock({
  type: "pageHero",
  label: "Page header",
  description: "Editorial page opening with an oversized title.",
  group: "Hero",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title", help: "Wrap a word in *asterisks* for the italic accent." },
    { kind: "textarea", name: "intro", label: "Intro", rows: 3 },
    { kind: "select", name: "tone", label: "Background", options: toneOptions },
    { kind: "select", name: "art", label: "Illustration", options: [
      { value: "hills", label: "Hills" }, { value: "bottles", label: "Bottle trio" }, { value: "leaf", label: "Bay leaf" }, { value: "bubbles", label: "Bubbles" }, { value: "none", label: "None" },
    ] },
    { kind: "image", name: "image", label: "Photo (optional)", optional: true },
  ],
  defaults: { eyebrow: "", title: "A new *page*", intro: "", tone: "cream", art: "hills", image: { url: "", alt: "" } },
});

export const marqueeBlock = defineBlock({
  type: "marquee",
  label: "Fizz ticker",
  description: "A slow-scrolling ribbon of words.",
  group: "Layout",
  fields: [
    { kind: "tags", name: "items", label: "Words / phrases" },
    { kind: "select", name: "tone", label: "Colour", options: toneOptions },
  ],
  defaults: { items: ["Raw", "Living", "Small-batch"], tone: "forest" },
});

export const flavourShowcaseBlock = defineBlock({
  type: "flavourShowcase",
  label: "Flavour showcase",
  description: "Scroll story that re-tints the page to each flavour's colour.",
  group: "Commerce",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
    { kind: "select", name: "mode", label: "Layout", options: [{ value: "story", label: "Scroll story (re-tints page)" }, { value: "rail", label: "Card rail" }] },
    { kind: "boolean", name: "featuredOnly", label: "Featured flavours only" },
    { kind: "link", name: "cta", label: "Button" },
  ],
  defaults: { eyebrow: "The flavours", title: "Six bottles, one valley", intro: "", mode: "story", featuredOnly: false, cta: { label: "Shop all flavours", href: "/flavours" } },
});

export const featuresBlock = defineBlock({
  type: "features",
  label: "Features / benefits",
  description: "Icon cards in a bento grid, list or columns.",
  group: "Story",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
    { kind: "select", name: "layout", label: "Layout", options: [{ value: "bento", label: "Bento grid" }, { value: "columns", label: "Columns" }, { value: "list", label: "Editorial list" }] },
    { kind: "select", name: "tone", label: "Background", options: toneOptions },
    { kind: "list", name: "items", label: "Items", itemLabel: "Item", max: 12, fields: [
      { kind: "select", name: "icon", label: "Icon", options: iconOptions },
      { kind: "text", name: "title", label: "Title" },
      { kind: "textarea", name: "text", label: "Text", rows: 3 },
    ] },
  ],
  defaults: { eyebrow: "", title: "Why it matters", intro: "", layout: "bento", tone: "cream", items: [] },
});

export const textImageBlock = defineBlock({
  type: "textImage",
  label: "Text + image",
  description: "Story block with an image or illustration beside it.",
  group: "Story",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "body", label: "Body", rows: 6, help: "Blank lines start a new paragraph." },
    { kind: "image", name: "image", label: "Image", optional: true },
    { kind: "select", name: "art", label: "Illustration (when no image)", options: [{ value: "hills", label: "Hills" }, { value: "leaf", label: "Bay leaf" }, { value: "bottles", label: "Bottle trio" }, { value: "jar", label: "Brewing jar" }] },
    { kind: "select", name: "imageSide", label: "Image side", options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }] },
    { kind: "select", name: "tone", label: "Background", options: toneOptions },
    { kind: "link", name: "cta", label: "Button (optional)" },
  ],
  defaults: { eyebrow: "", title: "Our story", body: "", image: { url: "", alt: "" }, art: "hills", imageSide: "right", tone: "cream", cta: { label: "", href: "" } },
});

export const timelineBlock = defineBlock({
  type: "timeline",
  label: "Timeline / steps",
  description: "Numbered steps. The \"brew\" style animates as you scroll.",
  group: "Story",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
    { kind: "select", name: "style", label: "Style", options: [{ value: "brew", label: "Brew process (scroll-driven)" }, { value: "steps", label: "Numbered steps" }] },
    { kind: "list", name: "steps", label: "Steps", itemLabel: "Step", max: 10, fields: [
      { kind: "text", name: "title", label: "Title" },
      { kind: "textarea", name: "text", label: "Text", rows: 3 },
      { kind: "text", name: "meta", label: "Small detail (e.g. \"7–10 days\")" },
    ] },
  ],
  defaults: { eyebrow: "", title: "How it works", intro: "", style: "steps", steps: [] },
});

export const statsBlock = defineBlock({
  type: "stats",
  label: "Stats counters",
  description: "Big animated numbers.",
  group: "Social proof",
  fields: [
    { kind: "text", name: "title", label: "Title (optional)" },
    { kind: "select", name: "tone", label: "Background", options: toneOptions },
    { kind: "list", name: "items", label: "Numbers", itemLabel: "Stat", max: 6, fields: [
      { kind: "number", name: "value", label: "Number", min: 0 },
      { kind: "text", name: "suffix", label: "Suffix (e.g. +, %)" },
      { kind: "text", name: "label", label: "Label" },
    ] },
  ],
  defaults: { title: "", tone: "forest", items: [] },
});

export const stockistsBlock = defineBlock({
  type: "stockists",
  label: "Where to buy",
  description: "Stockist cards, map and delivery zones.",
  group: "Commerce",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
    { kind: "boolean", name: "showMap", label: "Show the map" },
    { kind: "boolean", name: "showZones", label: "Show delivery zones" },
    { kind: "link", name: "cta", label: "Button (optional)" },
  ],
  defaults: { eyebrow: "Find us", title: "Where to buy", intro: "", showMap: false, showZones: true, cta: { label: "", href: "" } },
});

export const eventsBlock = defineBlock({
  type: "events",
  label: "Events",
  description: "Upcoming events with countdowns, or past events with photos.",
  group: "Social proof",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "select", name: "mode", label: "Show", options: [{ value: "strip", label: "Strip of recent + upcoming" }, { value: "upcoming", label: "Upcoming (with countdown)" }, { value: "past", label: "Past (with gallery)" }] },
    { kind: "number", name: "limit", label: "How many", min: 1, max: 24 },
    { kind: "link", name: "cta", label: "Button (optional)" },
  ],
  defaults: { eyebrow: "Out & about", title: "Find us pouring", mode: "strip", limit: 6, cta: { label: "", href: "" } },
});

export const testimonialsBlock = defineBlock({
  type: "testimonials",
  label: "Testimonials",
  description: "Customer words, from Content › Testimonials.",
  group: "Social proof",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
  ],
  defaults: { eyebrow: "Word of mouth", title: "Poured, sipped, talked about" },
});

export const galleryBlock = defineBlock({
  type: "gallery",
  label: "Gallery / Instagram",
  description: "Instagram-style strip or full masonry gallery with categories.",
  group: "Social proof",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "select", name: "mode", label: "Layout", options: [{ value: "strip", label: "Instagram strip" }, { value: "masonry", label: "Masonry with categories" }] },
    { kind: "number", name: "limit", label: "How many photos", min: 3, max: 120 },
  ],
  defaults: { eyebrow: "@mamoon.brews", title: "From the brewhouse", mode: "strip", limit: 8 },
});

export const ctaBlock = defineBlock({
  type: "cta",
  label: "Call to action",
  description: "A bold panel with one or two buttons.",
  group: "Engagement",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "body", label: "Body" },
    { kind: "link", name: "primary", label: "Primary button" },
    { kind: "link", name: "secondary", label: "Secondary button" },
    { kind: "select", name: "tone", label: "Colour", options: toneOptions },
    { kind: "select", name: "art", label: "Illustration", options: [{ value: "bottles", label: "Bottle trio" }, { value: "crate", label: "Crate" }, { value: "leaf", label: "Bay leaf" }, { value: "none", label: "None" }] },
  ],
  defaults: { eyebrow: "", title: "Let's brew something", body: "", primary: { label: "Talk to us", href: "/contact" }, secondary: { label: "", href: "" }, tone: "red", art: "bottles" },
});

export const newsletterBlock = defineBlock({
  type: "newsletter",
  label: "Newsletter",
  description: "Email sign-up.",
  group: "Engagement",
  fields: [
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "body", label: "Body" },
    { kind: "text", name: "buttonLabel", label: "Button label" },
  ],
  defaults: { title: "Fresh batch notes", body: "", buttonLabel: "Subscribe" },
});

export const faqBlock = defineBlock({
  type: "faq",
  label: "FAQ",
  description: "Accordion from Content › FAQs. Full mode adds search and categories.",
  group: "Engagement",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "select", name: "mode", label: "Show", options: [{ value: "home", label: "Only FAQs marked \"show on home\"" }, { value: "all", label: "All, searchable" }, { value: "category", label: "One category" }] },
    { kind: "text", name: "category", label: "Category (for \"one category\")" },
    { kind: "link", name: "cta", label: "Button (optional)" },
  ],
  defaults: { eyebrow: "Questions", title: "Good questions", mode: "home", category: "", cta: { label: "", href: "" } },
});

export const richTextBlock = defineBlock({
  type: "richText",
  label: "Rich text",
  description: "Long-form writing with headings, lists and links.",
  group: "Layout",
  fields: [
    { kind: "richtext", name: "content", label: "Content" },
    { kind: "select", name: "width", label: "Width", options: [{ value: "narrow", label: "Narrow (reading)" }, { value: "wide", label: "Wide" }] },
  ],
  defaults: { content: "<p></p>", width: "narrow" },
});

export const statementBlock = defineBlock({
  type: "statement",
  label: "Big statement",
  description: "One oversized line — a manifesto moment.",
  group: "Layout",
  fields: [
    { kind: "textarea", name: "text", label: "Statement", help: "Wrap words in *asterisks* for the italic accent." },
    { kind: "text", name: "attribution", label: "Attribution (optional)" },
    { kind: "select", name: "tone", label: "Background", options: toneOptions },
  ],
  defaults: { text: "", attribution: "", tone: "cream" },
});

export const mythsBlock = defineBlock({
  type: "myths",
  label: "Myths vs facts",
  description: "Flip cards that set the record straight.",
  group: "Story",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "list", name: "items", label: "Myths", itemLabel: "Myth", max: 12, fields: [
      { kind: "text", name: "myth", label: "Myth" },
      { kind: "textarea", name: "fact", label: "Fact", rows: 3 },
    ] },
  ],
  defaults: { eyebrow: "", title: "Myths vs facts", items: [] },
});

export const mapBlock = defineBlock({
  type: "map",
  label: "Map",
  description: "Embedded Google map.",
  group: "Layout",
  fields: [
    { kind: "text", name: "title", label: "Title" },
    { kind: "text", name: "query", label: "Place to show", help: "An address or place name, e.g. \"Naharlagun, Arunachal Pradesh\"." },
    { kind: "textarea", name: "caption", label: "Caption" },
  ],
  defaults: { title: "Find us", query: "Naharlagun, Arunachal Pradesh", caption: "" },
});

export const formBlock = defineBlock({
  type: "form",
  label: "Form",
  description: "Enquiry, contact, tasting, gifting or subscription form.",
  group: "Engagement",
  fields: [
    { kind: "select", name: "formType", label: "Form", options: [
      { value: "BUSINESS", label: "Wholesale / business" }, { value: "EVENT", label: "Event booking" }, { value: "TASTING", label: "Tasting session" },
      { value: "GIFTING", label: "Corporate gifting" }, { value: "CONTACT", label: "Contact" }, { value: "SUBSCRIBE", label: "Subscription request" },
    ] },
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
    { kind: "text", name: "successMessage", label: "Thank-you message" },
  ],
  defaults: { formType: "CONTACT", eyebrow: "", title: "Say hello", intro: "", successMessage: "Thank you — we'll be in touch within a day." },
});

export const productGridBlock = defineBlock({
  type: "productGrid",
  label: "Shop grid",
  description: "All flavours with filters and quick add.",
  group: "Commerce",
  fields: [
    { kind: "text", name: "title", label: "Title (optional)" },
    { kind: "boolean", name: "showFilters", label: "Show taste filters" },
  ],
  defaults: { title: "", showFilters: true },
});

export const bundlesBlock = defineBlock({
  type: "bundles",
  label: "Combo & tasting packs",
  description: "Bundles from Catalogue › Packs.",
  group: "Commerce",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
  ],
  defaults: { eyebrow: "Packs", title: "Better together", intro: "" },
});

export const teamBlock = defineBlock({
  type: "team",
  label: "Team",
  description: "People from Content › Team.",
  group: "Story",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
  ],
  defaults: { eyebrow: "The brewers", title: "Small team, big pot" },
});

export const milestonesBlock = defineBlock({
  type: "milestones",
  label: "Milestones",
  description: "Timeline from Content › Milestones.",
  group: "Story",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
  ],
  defaults: { eyebrow: "So far", title: "Milestones" },
});

export const journalBlock = defineBlock({
  type: "journal",
  label: "Journal posts",
  description: "Latest articles with category filters.",
  group: "Engagement",
  fields: [
    { kind: "text", name: "eyebrow", label: "Eyebrow" },
    { kind: "text", name: "title", label: "Title" },
    { kind: "number", name: "limit", label: "How many", min: 1, max: 60 },
    { kind: "boolean", name: "showCategories", label: "Show category filter" },
  ],
  defaults: { eyebrow: "Journal", title: "From the brew log", limit: 12, showCategories: true },
});

export const contactBlock = defineBlock({
  type: "contact",
  label: "Contact details",
  description: "WhatsApp, phone, Instagram, hours and map from Settings.",
  group: "Engagement",
  fields: [
    { kind: "text", name: "title", label: "Title" },
    { kind: "textarea", name: "intro", label: "Intro" },
    { kind: "boolean", name: "showMap", label: "Show map" },
  ],
  defaults: { title: "Reach the brewhouse", intro: "", showMap: true },
});

export const BLOCKS = [
  heroBlock, pageHeroBlock, marqueeBlock, flavourShowcaseBlock, featuresBlock, textImageBlock, timelineBlock, statsBlock,
  stockistsBlock, eventsBlock, testimonialsBlock, galleryBlock, ctaBlock, newsletterBlock, faqBlock, richTextBlock,
  statementBlock, mythsBlock, mapBlock, formBlock, productGridBlock, bundlesBlock, teamBlock, milestonesBlock, journalBlock, contactBlock,
] as const;

export type BlockDef = (typeof BLOCKS)[number];
export type BlockType = BlockDef["type"];

export function getBlockDef(type: string) {
  return BLOCKS.find((b) => b.type === type);
}

export type HeroContent = ValuesOf<typeof heroBlock.fields>;
export type PageHeroContent = ValuesOf<typeof pageHeroBlock.fields>;
export type MarqueeContent = ValuesOf<typeof marqueeBlock.fields>;
export type FlavourShowcaseContent = ValuesOf<typeof flavourShowcaseBlock.fields>;
export type FeaturesContent = ValuesOf<typeof featuresBlock.fields>;
export type TextImageContent = ValuesOf<typeof textImageBlock.fields>;
export type TimelineContent = ValuesOf<typeof timelineBlock.fields>;
export type StatsContent = ValuesOf<typeof statsBlock.fields>;
export type StockistsContent = ValuesOf<typeof stockistsBlock.fields>;
export type EventsContent = ValuesOf<typeof eventsBlock.fields>;
export type TestimonialsContent = ValuesOf<typeof testimonialsBlock.fields>;
export type GalleryContent = ValuesOf<typeof galleryBlock.fields>;
export type CtaContent = ValuesOf<typeof ctaBlock.fields>;
export type NewsletterContent = ValuesOf<typeof newsletterBlock.fields>;
export type FaqContent = ValuesOf<typeof faqBlock.fields>;
export type RichTextContent = ValuesOf<typeof richTextBlock.fields>;
export type StatementContent = ValuesOf<typeof statementBlock.fields>;
export type MythsContent = ValuesOf<typeof mythsBlock.fields>;
export type MapContent = ValuesOf<typeof mapBlock.fields>;
export type FormContent = ValuesOf<typeof formBlock.fields>;
export type ProductGridContent = ValuesOf<typeof productGridBlock.fields>;
export type BundlesContent = ValuesOf<typeof bundlesBlock.fields>;
export type TeamContent = ValuesOf<typeof teamBlock.fields>;
export type MilestonesContent = ValuesOf<typeof milestonesBlock.fields>;
export type JournalContent = ValuesOf<typeof journalBlock.fields>;
export type ContactContent = ValuesOf<typeof contactBlock.fields>;
export type Tone = (typeof toneOptions)[number]["value"];
export type IconName = (typeof ICONS)[number];
