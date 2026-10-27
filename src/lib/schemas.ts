import { z } from "zod";

/** Shared Zod schemas: used by client forms (React Hook Form) and re-checked in Server Actions. */

const phone = z
  .string()
  .trim()
  .min(10, "Enter a 10-digit mobile number")
  .max(16)
  .regex(/^[+\d][\d\s-]{8,}$/, "Enter a valid phone number");

const optionalEmail = z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional();
const honeypot = z.string().max(0, "Spam detected").optional();

// ─── Settings JSON shapes ───────────────────────────────────────────

export const hoursSchema = z.array(z.object({ days: z.string().max(60), time: z.string().max(60) })).max(10);
export const socialsSchema = z.object({
  instagram: z.string().max(200).default(""),
  facebook: z.string().max(200).default(""),
  youtube: z.string().max(200).default(""),
  x: z.string().max(200).default(""),
});
export const announcementSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(160),
  linkLabel: z.string().max(40),
  href: z.string().max(300),
  bg: z.string().max(20),
  fg: z.string().max(20),
});
export const featuresSchema = z.object({
  onlinePayments: z.boolean(),
  subscriptions: z.boolean(),
  blog: z.boolean(),
  events: z.boolean(),
  bottleReturn: z.boolean(),
  newsletter: z.boolean(),
  floatingWhatsapp: z.boolean(),
});
export const deliveryZonesSchema = z.array(z.object({ name: z.string().min(1).max(60), fee: z.coerce.number().min(0).max(5000), eta: z.string().max(60) })).max(20);

export type Hours = z.infer<typeof hoursSchema>;
export type Socials = z.infer<typeof socialsSchema>;
export type Announcement = z.infer<typeof announcementSchema>;
export type Features = z.infer<typeof featuresSchema>;
export type DeliveryZone = z.infer<typeof deliveryZonesSchema>[number];

export const ingredientsSchema = z.array(z.object({ name: z.string().min(1).max(80), note: z.string().max(200).default(""), local: z.boolean().default(false) })).max(30);
export const productFaqsSchema = z.array(z.object({ q: z.string().min(1).max(200), a: z.string().min(1).max(1200) })).max(20);
export const eventGallerySchema = z.array(z.object({ url: z.string().max(2048), alt: z.string().max(300) })).max(60);
export type Ingredient = z.infer<typeof ingredientsSchema>[number];

// ─── Public forms ───────────────────────────────────────────────────

export const cartLineSchema = z.object({
  kind: z.enum(["variant", "bundle"]),
  id: z.string().min(1).max(40),
  quantity: z.coerce.number().int().min(1).max(48),
});

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, "Tell us your name").max(80),
    phone,
    email: optionalEmail,
    fulfilment: z.enum(["DELIVERY", "PICKUP"]),
    area: z.string().trim().min(1, "Choose an area").max(60),
    address: z.string().trim().max(400).optional(),
    preferredDate: z.string().trim().max(20).optional(),
    preferredTime: z.string().trim().max(40).optional(),
    notes: z.string().trim().max(600).optional(),
    discountCode: z.string().trim().max(30).optional(),
    paymentMethod: z.enum(["WHATSAPP", "RAZORPAY"]),
    company_website: honeypot,
  })
  .superRefine((v, ctx) => {
    if (v.fulfilment === "DELIVERY" && (!v.address || v.address.length < 8)) {
      ctx.addIssue({ code: "custom", path: ["address"], message: "Add a delivery address so we can find you" });
    }
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const enquirySchema = z.object({
  type: z.enum(["BUSINESS", "EVENT", "CONTACT", "TASTING", "GIFTING"]),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone: z.union([z.literal(""), phone]).optional(),
  email: optionalEmail,
  businessName: z.string().trim().max(120).optional(),
  businessType: z.string().trim().max(60).optional(),
  location: z.string().trim().max(120).optional(),
  monthlyVolume: z.string().trim().max(60).optional(),
  eventDate: z.string().trim().max(20).optional(),
  message: z.string().trim().min(5, "A few words, please").max(3000),
  company_website: honeypot,
}).refine((v) => Boolean(v.phone) || Boolean(v.email), { path: ["phone"], message: "Leave a phone number or email so we can reply" });
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const subscriptionSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone,
  email: optionalEmail,
  area: z.string().trim().min(1, "Choose an area").max(60),
  address: z.string().trim().min(8, "Add your delivery address").max(400),
  frequency: z.enum(["WEEKLY", "BIWEEKLY"]),
  flavours: z.array(z.object({ slug: z.string().max(80), name: z.string().max(80), quantity: z.coerce.number().int().min(0).max(24) })).max(12)
    .refine((list) => list.some((f) => f.quantity > 0), "Pick at least one bottle"),
  startDate: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(600).optional(),
  company_website: honeypot,
});
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("That email looks off"),
  company_website: honeypot,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter your email"),
  password: z.string().min(1, "Enter your password").max(200),
});
