# Mamon Brews — website & admin

Arunachal's handcrafted kombucha. A full-stack Next.js site where **every word, image, price and page is editable from `/admin`** — no code changes needed.

- **Public site:** flavour scroll story that re-tints the page, cart → order saved → WhatsApp checkout, subscriptions, wholesale/event enquiries, journal, events with countdowns, gallery, FAQ, stockists & delivery zones.
- **Admin:** dashboard with KPIs and charts, orders pipeline with invoices, customers, subscriptions, enquiries, flavours/packs/discounts, block-based page builder with drafts and live preview, menus, media library with crop, site settings & theme, users/roles and an activity log.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Server Components, Server Actions, Cache Components) · TypeScript strict |
| Styling | Tailwind CSS 4 with CSS-variable theme tokens · Radix primitives (`radix-ui`) |
| Motion | Motion (Framer Motion) · GSAP ScrollTrigger · Lenis smooth scroll — all respect reduced motion |
| Data | PostgreSQL (Neon) · Prisma 7 with the `pg` driver adapter |
| Auth | Auth.js v5 (credentials, bcrypt) · Owner / Editor / Viewer roles · DB-backed rate limiting |
| Forms | React Hook Form + Zod (same schemas on client and server) |
| Content | Tiptap rich text (sanitised server-side) · Vercel Blob for media |
| Other | Resend email · TanStack Table · Recharts · cmdk command palette · Vercel Analytics + first-party event tracking |

## Project layout

```
prisma/              schema, migrations, seed (all real brand content)
scripts/             local-db.mjs (embedded Postgres), make-art.mjs (seed artwork)
src/
  app/(site)/        public routes: home, [slug] CMS pages, flavours/[slug], journal/[slug], legal/[slug], checkout
  app/admin/         login, (panel)/ dashboard + modules, preview/[id], actions/ (server actions)
  admin/             collection registry, nav, settings field definitions
  blocks/            page-builder blocks: definitions (fields + defaults) and their components
  components/        site chrome, cart, shop, forms, motion, admin UI, brand art
  lib/               data (cached reads), schemas, fields engine, auth/session, pricing, whatsapp, email, storage
```

**How editing works:** each block and content type is described once as a list of fields (`src/blocks/definitions.ts`, `src/admin/collections.ts`). That single description renders the admin form, validates on the server with Zod, and types the public component. Public reads in `src/lib/data.ts` are cached with `"use cache"` + tags; every admin save calls `updateTag()` for exactly what changed, so edits are live on the next request.

---

## Run it locally

Requirements: Node 20+.

```bash
npm install
cp .env.example .env          # then fill in the values (see below)
```

**Local database** — any Postgres works. The repo includes a zero-install option:

```bash
node scripts/local-db.mjs     # starts Postgres on port 5433 (data in ../pgdata); leave it running
```

Set `DATABASE_URL="postgres://postgres:postgres@localhost:5433/mamon"` in `.env`, then:

```bash
npx prisma migrate deploy     # create tables
npm run db:seed               # load all Mamon Brews content + the owner account
npm run dev                   # http://localhost:3000  ·  admin at /admin
```

Sign in with `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` from your `.env`.

Useful scripts: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:studio`.
`npm run db:seed` **wipes and reloads** content — only use it locally.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string (Neon pooled URL in production) |
| `AUTH_SECRET` | ✅ | Random 32+ character string — signs admin sessions (`npx auth secret`) |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL, e.g. `https://mamonbrews.in` (canonical URLs, sitemap, emails) |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` | first deploy | Creates the first owner account when the database is empty |
| `BLOB_READ_WRITE_TOKEN` | for uploads | Vercel Blob store (added automatically when you connect one) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL` | optional | Order/enquiry emails to the owner and optional customer confirmations |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | optional | Online payments — also switch on in Admin › Site settings › Features |

---

## Deploy to Vercel

1. **Database:** create a free Postgres on [Neon](https://neon.tech) (region: Singapore is closest to Arunachal). Copy the **pooled** connection string.
2. **Repository:** push this folder to GitHub and import it in Vercel (framework is detected automatically).
3. **Environment variables:** add `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_SITE_URL`, `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD`.
4. **Media:** in Vercel › Storage, create a **Blob** store and connect it to the project (adds `BLOB_READ_WRITE_TOKEN`).
5. **Build command:** `vercel.json` already sets it to `npm run vercel-build`, which generates the Prisma client, applies migrations, seeds the database **only if it is empty**, then builds.
6. Deploy, open `/admin`, sign in, and **change your password** in Users & roles.
7. Optional: add a custom domain, a Resend API key (verify your domain in Resend) and Razorpay keys.

**Razorpay webhook (when you turn payments on):** in the Razorpay dashboard add a webhook to `https://<your-domain>/api/razorpay/webhook` for `payment.captured`, `order.paid` and `payment.failed`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`.

### Security notes
- Admin routes are gated in `src/proxy.ts` and every admin page/action re-checks the user and role against the database.
- Server Actions are CSRF-protected by Next.js (origin check). Public forms use Zod validation, a honeypot field and per-IP rate limits stored in Postgres; login is limited to 5 tries per 15 minutes.
- Rich text is sanitised on save; security headers (CSP, HSTS, frame, referrer, permissions) are set in `next.config.ts`.
- Cart prices are never trusted — orders are re-priced from the database on the server.

---

# Owner's guide

Everything below happens at **yourdomain/admin** and works on a phone. Press **⌘K / Ctrl+K** (or tap the search icon) to jump anywhere.

### Daily: orders
1. A shopper adds bottles to the cart and checks out. The order is **saved first**, then WhatsApp opens on their phone with the full order (items, total, address, order ID like `MB-27994`) addressed to your number.
2. Open **Orders**. New orders have a red count in the menu.
3. Open an order → **Message on WhatsApp** sends a ready-written reply → move it along **New → Confirmed → Out for delivery → Delivered** (or Cancel).
4. Mark **Paid** when you receive UPI/cash. Add **internal notes** (only your team sees them). **Print invoice** gives a clean PDF-ready invoice.
5. **Export CSV** on the Orders page for accounts.

### Flavours, prices & stock
**Flavours** → open one. Change the price under *Sizes & prices* (leave empty to show "Price soon"), set *Stock status* to *Sold out* or *Coming soon*, add photos, tasting notes and ingredients (tick *Locally sourced* for local ones). The flavour colour tints its page and cards. Drag rows on the Flavours list (**Reorder**) to change the order on the website.

**Packs & combos** — bundles with a discounted price. **Discount codes** — e.g. `FIRSTPOUR` for 10% off (created switched off; turn it on when you want to use it).

### Editing pages
**Pages** → choose a page. On the left are its blocks:
- Click a block to edit its text, buttons and images, then **Save to draft**.
- Drag ⋮⋮ to reorder, use the switch to hide a block, **Duplicate** or **Delete** it, or **+ Add a block**.
- The preview on the right (or **Preview ↗**) shows your draft. Nothing changes on the real site until you press **Publish**. **Discard draft** throws your edits away.
- *Page settings & SEO* holds the page name, Google title/description and share image.
- Headlines: wrap a word in `*asterisks*` to make it the italic accent, e.g. `Brewed in the *hills.*`
- Buttons: use `whatsapp` as the link to open a chat with you; `/flavours` for a page; a full `https://…` for other sites.

**Menus** edits the header (add links inside an item to make a dropdown) and the footer columns.

### Photos
**Media library** → **Upload image** → crop (Square / Portrait / Wide / Social) → write a short **alt text** describing the photo (helps blind visitors and Google) → Upload. Then pick it anywhere with **Choose image**. The site currently uses illustrated placeholders — replace them with real product, brewing and event photos as you take them.

### Everything else
- **Site settings** (owner only): brand name & logo, WhatsApp/phone/hours/FSSAI, **theme colours and fonts**, the **announcement bar**, **feature switches** (subscriptions, journal, events, bottle return, newsletter, floating WhatsApp button, online payments) and **animations** (full / reduced / off), the **WhatsApp order message** template and **delivery zones & charges**.
- **Journal**: write posts with the editor (headings, lists, links, images); set *Status* to *Published* to put them live.
- **Events**: upcoming events show a countdown; add photos after the event and they appear under *Past events*.
- **Stockists, FAQs, Testimonials, Gallery, Team, Milestones, Legal pages**: simple lists — add, edit, drag to reorder.
- **Enquiries & Subscriptions**: messages from the website forms. Set a status (Contacted / Converted / Closed) and keep notes.
- **Customers**: created automatically from orders, with order history and lifetime value.
- **Newsletter**: sign-ups; **Export CSV** to send with your email tool.
- **Users & roles** (owner only): invite your team as *Editor* (can edit everything except settings and users) or *Viewer* (read-only). Each person gets a one-time password to share privately. **Activity log** shows who changed what.

### Before launch — please check
These were filled in with sensible starting values and should be confirmed:
- Delivery fees (Naharlagun ₹30, Itanagar ₹50, nearby ₹80), ₹200 delivery minimum, free delivery over ₹1,000 — *Site settings › Orders & delivery*
- Opening hours, email address and **FSSAI licence number** — *Site settings › Contact & hours*
- Pack prices — *Packs & combos*
- Mango and Plum prices (currently "Price soon") — *Flavours*
- Event dates (carnival date is approximate) — *Events*
- The founder story wording — *Pages › Our Story*
- Testimonials are **unpublished samples** — replace with real customer quotes, then tick *Show on the site*.
