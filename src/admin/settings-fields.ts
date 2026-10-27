import type { Field } from "@/lib/fields";

export const SETTINGS_TABS = [
  {
    key: "brand", label: "Brand", description: "Name, logo and social sharing image.",
    fields: [
      { kind: "text", name: "brandName", label: "Brand name", half: true },
      { kind: "text", name: "brandStyled", label: "Styled name", half: true, help: "e.g. MamOn Brews 🍀" },
      { kind: "text", name: "tagline", label: "Tagline" },
      { kind: "text", name: "missionLine", label: "Mission line" },
      { kind: "media", name: "logoUrl", label: "Logo (light backgrounds)", optional: true, half: true },
      { kind: "media", name: "logoDarkUrl", label: "Logo (dark backgrounds)", optional: true, half: true },
      { kind: "media", name: "faviconUrl", label: "Favicon (square PNG/SVG)", optional: true, half: true },
      { kind: "media", name: "ogImageUrl", label: "Default share image (1200×630)", optional: true, half: true },
    ],
  },
  {
    key: "contact", label: "Contact & hours", description: "Shown in the footer, contact page, JSON-LD and WhatsApp buttons.",
    fields: [
      { kind: "text", name: "whatsapp", label: "WhatsApp number", half: true, help: "With country code, e.g. +91 76298 23243" },
      { kind: "text", name: "phone", label: "Phone", half: true },
      { kind: "text", name: "email", label: "Email", half: true, optional: true },
      { kind: "text", name: "fssai", label: "FSSAI licence number", half: true, optional: true },
      { kind: "text", name: "address", label: "Street / locality", half: true },
      { kind: "text", name: "city", label: "City", half: true },
      { kind: "text", name: "region", label: "State", half: true },
      { kind: "text", name: "postalCode", label: "PIN code", half: true, optional: true },
      { kind: "list", name: "hours", label: "Opening hours", itemLabel: "Row", max: 7, fields: [{ kind: "text", name: "days", label: "Days", half: true }, { kind: "text", name: "time", label: "Time", half: true }] },
      { kind: "text", name: "instagram", label: "Instagram URL", half: true, optional: true },
      { kind: "text", name: "facebook", label: "Facebook URL", half: true, optional: true },
      { kind: "text", name: "youtube", label: "YouTube URL", half: true, optional: true },
      { kind: "text", name: "x", label: "X / Twitter URL", half: true, optional: true },
    ],
  },
  {
    key: "theme", label: "Theme", description: "Colours and fonts update across the whole site instantly.",
    fields: [
      { kind: "color", name: "forest", label: "Primary — forest green", half: true },
      { kind: "color", name: "brandRed", label: "Accent — logo red", half: true },
      { kind: "color", name: "sky", label: "Secondary — logo blue", half: true },
      { kind: "color", name: "cream", label: "Background — cream", half: true },
      { kind: "color", name: "ink", label: "Text — ink", half: true },
      { kind: "number", name: "radius", label: "Corner roundness (px)", min: 0, max: 40, half: true },
      { kind: "select", name: "displayFont", label: "Display font", half: true, options: [
        { value: "fraunces", label: "Fraunces — soft editorial serif" }, { value: "instrument-serif", label: "Instrument Serif — sharp & elegant" }, { value: "playfair", label: "Playfair Display — classic" }, { value: "dm-serif", label: "DM Serif Display — bold & warm" },
      ] },
      { kind: "select", name: "sansFont", label: "Body font", half: true, options: [
        { value: "instrument", label: "Instrument Sans — crisp" }, { value: "inter", label: "Inter — neutral" }, { value: "manrope", label: "Manrope — friendly" }, { value: "dm-sans", label: "DM Sans — soft geometric" },
      ] },
      { kind: "boolean", name: "grain", label: "Paper grain texture", help: "A soft film-grain overlay" },
    ],
  },
  {
    key: "announcement", label: "Announcement bar", description: "The thin strip at the very top of every page.",
    fields: [
      { kind: "boolean", name: "enabled", label: "Show the announcement bar" },
      { kind: "text", name: "text", label: "Message", max: 160 },
      { kind: "text", name: "linkLabel", label: "Link text", half: true, optional: true },
      { kind: "text", name: "href", label: "Link URL", half: true, optional: true },
      { kind: "color", name: "bg", label: "Background", half: true },
      { kind: "color", name: "fg", label: "Text colour", half: true },
    ],
  },
  {
    key: "features", label: "Features", description: "Switch whole parts of the website on or off.",
    fields: [
      { kind: "boolean", name: "onlinePayments", label: "Online payments (Razorpay)", help: "Needs Razorpay keys in Vercel. Off = all orders confirm on WhatsApp." },
      { kind: "boolean", name: "subscriptions", label: "Subscriptions", half: true },
      { kind: "boolean", name: "blog", label: "Journal / blog", half: true },
      { kind: "boolean", name: "events", label: "Events", half: true },
      { kind: "boolean", name: "bottleReturn", label: "Bottle return page", half: true },
      { kind: "boolean", name: "newsletter", label: "Newsletter sign-up", half: true },
      { kind: "boolean", name: "floatingWhatsapp", label: "Floating WhatsApp button", half: true },
      { kind: "select", name: "animation", label: "Animations", options: [{ value: "FULL", label: "Full — smooth scroll, parallax, cursor" }, { value: "REDUCED", label: "Reduced — gentle fades only" }, { value: "OFF", label: "Off — completely static" }] },
    ],
  },
  {
    key: "orders", label: "Orders & delivery", description: "WhatsApp order message, delivery zones and charges.",
    fields: [
      { kind: "textarea", name: "whatsappTemplate", label: "WhatsApp order message", rows: 12, max: 2000, help: "Variables: {orderId} {items} {subtotal} {discount} {delivery} {total} {name} {phone} {fulfilment} {area} {address} {date} {time} {notes}" },
      { kind: "list", name: "deliveryZones", label: "Delivery zones", itemLabel: "Zone", max: 20, fields: [
        { kind: "text", name: "name", label: "Area name", half: true }, { kind: "number", name: "fee", label: "Delivery fee (₹)", min: 0, half: true }, { kind: "text", name: "eta", label: "Delivery time", optional: true },
      ] },
      { kind: "number", name: "minOrderValue", label: "Minimum order for delivery (₹)", min: 0, half: true },
      { kind: "number", name: "freeDeliveryAbove", label: "Free delivery above (₹)", min: 0, half: true, optional: true },
      { kind: "boolean", name: "deliveryEnabled", label: "Offer delivery", half: true },
      { kind: "boolean", name: "pickupEnabled", label: "Offer pickup", half: true },
      { kind: "text", name: "pickupAddress", label: "Pickup instructions", optional: true },
    ],
  },
] as const satisfies readonly { key: string; label: string; description: string; fields: readonly Field[] }[];

export type SettingsTab = (typeof SETTINGS_TABS)[number]["key"];
