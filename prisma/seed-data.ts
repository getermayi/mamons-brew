import bcrypt from "bcryptjs";
import type { PrismaClient } from "../src/generated/prisma/client";
import type { Prisma } from "../src/generated/prisma/client";

/** All of Mamon Brews' starting content. Everything here is editable later in /admin. */

const WA = "+91 76298 23243";

type SectionSeed = { type: string; content: Prisma.InputJsonValue; visible?: boolean };
const s = (type: string, content: Record<string, unknown>): SectionSeed => ({ type, content: content as Prisma.InputJsonValue });

const pages: { slug: string; title: string; seoTitle: string; seoDescription: string; sections: SectionSeed[] }[] = [
  {
    slug: "home",
    title: "Home",
    seoTitle: "Mamon Brews — Handcrafted Kombucha from Arunachal Pradesh",
    seoDescription: "Naturally fermented, small-batch kombucha brewed in Naharlagun. Order on WhatsApp for delivery across Itanagar and Naharlagun.",
    sections: [
      s("hero", {
        eyebrow: "Naturally fermented in Naharlagun",
        headline: "Brewed in the *hills.* Bottled alive.",
        subhead: "Arunachal's handcrafted kombucha — small batches of living tea, flavoured with what grows around us and delivered cold across Itanagar and Naharlagun.",
        primaryCta: { label: "Order on WhatsApp", href: "whatsapp" },
        secondaryCta: { label: "Explore flavours", href: "/flavours" },
        flavourSlug: "bay-leaf",
        image: { url: "", alt: "" },
        badges: [{ text: "Incubated at APIIP" }, { text: "Exhibited at IITF 2025" }, { text: "Glass bottles, returnable" }],
      }),
      s("marquee", { items: ["Naturally fermented", "Small-batch", "Made in Arunachal", "Living cultures", "Lightly sparkling", "Glass, not plastic", "Delivered cold"], tone: "forest" }),
      s("flavourShowcase", {
        eyebrow: "The flavours",
        title: "Six bottles. One valley.",
        intro: "Each brew starts as the same living tea and ends up somewhere entirely its own. Scroll through — the page will change colour with you.",
        mode: "story",
        featuredOnly: false,
        cta: { label: "Shop all flavours", href: "/flavours" },
      }),
      s("features", {
        eyebrow: "Why Mamon",
        title: "Good for the gut. Better for the hills.",
        intro: "We keep it simple: real tea, slow fermentation, honest ingredients and a bottle you can bring back.",
        layout: "bento",
        tone: "cream",
        items: [
          { icon: "bubbles", title: "Alive in every bottle", text: "Our kombucha is fermented with a living culture, so every bottle carries the gentle fizz and tang that only time can make." },
          { icon: "leaf", title: "Flavours from home", text: "Bay leaf, ginger, pineapple, plum — we reach for what Arunachal grows, not what a lab can imitate." },
          { icon: "flask", title: "Small batches, tasted daily", text: "Brewed in small runs in Naharlagun and tasted at every stage, so each bottle tastes the way we meant it to." },
          { icon: "recycle", title: "Glass that comes back", text: "Return your empties and we'll clean, sterilise and refill them. Fewer bottles in the hills, more brews in the fridge." },
          { icon: "truck", title: "Delivered cold", text: "Live drinks like it cool. We deliver chilled across Itanagar and Naharlagun, straight from our fridge to yours." },
        ],
      }),
      s("textImage", {
        eyebrow: "Rooted in Arunachal",
        title: "A drink that tastes like where it's from",
        body: "Mamon Brews began with a simple idea: the fermented drinks the world is falling in love with can carry the flavour of the Northeast too.\n\nSo we brew in Naharlagun, with tea, patience and ingredients from the markets and kitchen gardens around us. Bay leaf you'd find in any Arunachali kitchen. Ginger with real bite. Fruit when it's in season.\n\nTogether, let's brew a cleaner, conscious future.",
        image: { url: "", alt: "" },
        art: "hills",
        imageSide: "right",
        tone: "cream",
        cta: { label: "Read our story", href: "/story" },
      }),
      s("timeline", {
        eyebrow: "How it's brewed",
        title: "From leaf to fizz, slowly",
        intro: "Kombucha can't be rushed. Here's what happens before a bottle reaches you.",
        style: "brew",
        steps: [
          { title: "Tea", text: "We steep real tea leaves and sweeten the brew lightly — that sugar is food for the culture, not for you.", meta: "Day 0" },
          { title: "SCOBY", text: "A living culture of bacteria and yeast — the SCOBY — goes into the cooled tea. This is where the magic starts.", meta: "Day 1" },
          { title: "First ferment", text: "The culture eats most of the sugar and turns sweet tea into a tangy, living base.", meta: "7–14 days" },
          { title: "Flavour", text: "We add bay leaf, ginger, lemon or fruit, and let the brew soak up its character.", meta: "1–2 days" },
          { title: "Second ferment", text: "Sealed in glass, the brew builds its natural, gentle fizz.", meta: "2–4 days" },
          { title: "Bottle", text: "Chilled to slow everything down, labelled by hand and sent out cold.", meta: "Ready" },
        ],
      }),
      s("stats", {
        title: "",
        tone: "forest",
        items: [
          { value: 14, suffix: "", label: "Days fermented, give or take" },
          { value: 6, suffix: "", label: "Flavours in the line-up" },
          { value: 100, suffix: "%", label: "Brewed in Arunachal" },
          { value: 2, suffix: "", label: "Towns we deliver to" },
        ],
      }),
      s("stockists", { eyebrow: "Find us", title: "On shelves in Itanagar", intro: "Pick up a cold bottle from our stockists, or get it delivered across Itanagar and Naharlagun.", showMap: false, showZones: true, cta: { label: "All stockists & delivery", href: "/where-to-buy" } }),
      s("events", { eyebrow: "Out & about", title: "Find us pouring", mode: "strip", limit: 6, cta: { label: "All events", href: "/events" } }),
      s("testimonials", { eyebrow: "Word of mouth", title: "Poured, sipped, talked about" }),
      s("gallery", { eyebrow: "@mamoon.brews", title: "From the brewhouse", mode: "strip", limit: 8 }),
      s("cta", {
        eyebrow: "For cafés, bars & stores",
        title: "Put living kombucha on your menu",
        body: "Wholesale crates, event bars and corporate gifting — brewed fresh in Naharlagun and delivered cold.",
        primary: { label: "Become a stockist", href: "/business" },
        secondary: { label: "WhatsApp us", href: "whatsapp" },
        tone: "red",
        art: "crate",
      }),
      s("newsletter", { title: "Fresh batch notes", body: "New flavours, pop-ups and the occasional recipe. One short email when there's something worth pouring — never more.", buttonLabel: "Subscribe" }),
      s("faq", { eyebrow: "Questions", title: "New to kombucha?", mode: "home", category: "", cta: { label: "Learn about kombucha", href: "/learn" } }),
    ],
  },
  {
    slug: "flavours",
    title: "Flavours",
    seoTitle: "Shop Kombucha Flavours — Bay Leaf, Ginger Lemon, Pineapple & more",
    seoDescription: "Shop Mamon Brews kombucha in Itanagar and Naharlagun: Classic, Bay Leaf, Ginger Lemon, Pineapple, Mango and Plum. Order online, pay on WhatsApp.",
    sections: [
      s("pageHero", { eyebrow: "The shop", title: "Pick your *pour*", intro: "Six small-batch kombuchas, each with its own mood. Earthy, zesty or fruity — build a mix and we'll deliver it cold.", tone: "cream", art: "bottles", image: { url: "", alt: "" } }),
      s("productGrid", { title: "", showFilters: true }),
      s("bundles", { eyebrow: "Packs", title: "Better together", intro: "Can't choose? Our packs mix favourites at a kinder price." }),
      s("cta", { eyebrow: "Never run out", title: "Kombucha, every week", body: "Set up a weekly or fortnightly drop and we'll keep your fridge stocked.", primary: { label: "Request a subscription", href: "/subscribe" }, secondary: { label: "", href: "" }, tone: "forest", art: "bottles" }),
    ],
  },
  {
    slug: "packs",
    title: "Combo & Tasting Packs",
    seoTitle: "Kombucha Tasting Packs & Combos — Mamon Brews",
    seoDescription: "Try every Mamon Brews flavour with a tasting pack, or stock up with a combo. Delivered across Itanagar and Naharlagun.",
    sections: [
      s("pageHero", { eyebrow: "Packs", title: "Taste the *whole* valley", intro: "Tasting flights for the curious, combos for the converted. Every pack is priced below the bottles on their own.", tone: "sky", art: "bottles", image: { url: "", alt: "" } }),
      s("bundles", { eyebrow: "", title: "Choose a pack", intro: "" }),
      s("faq", { eyebrow: "Good to know", title: "About packs", mode: "category", category: "Ordering", cta: { label: "", href: "" } }),
    ],
  },
  {
    slug: "learn",
    title: "What is Kombucha?",
    seoTitle: "What is Kombucha? A plain-language guide — Mamon Brews",
    seoDescription: "Fermentation, probiotics, sugar, trace alcohol and storage — everything first-time kombucha drinkers in Arunachal want to know.",
    sections: [
      s("pageHero", { eyebrow: "Kombucha 101", title: "So, what *is* kombucha?", intro: "It's tea that's been brought to life. Here's everything you need to know before your first sip — in plain words, no wellness jargon.", tone: "cream", art: "bubbles", image: { url: "", alt: "" } }),
      s("textImage", {
        eyebrow: "The short version",
        title: "Fermented tea, gently fizzy",
        body: "Kombucha is sweetened tea fermented by a living culture of bacteria and yeast, called a SCOBY. Over a week or two, the culture eats most of the sugar and turns the tea tangy, lightly sparkling and full of character.\n\nPeople have brewed it for centuries. We brew it in Naharlagun and flavour it with the Northeast.",
        image: { url: "", alt: "" },
        art: "jar",
        imageSide: "left",
        tone: "cream",
        cta: { label: "", href: "" },
      }),
      s("features", {
        eyebrow: "The details",
        title: "What's actually in the bottle",
        intro: "",
        layout: "list",
        tone: "cream",
        items: [
          { icon: "flask", title: "Fermentation", text: "The SCOBY converts sugar into organic acids, a little carbonation and a tiny amount of alcohol. That's where kombucha's tang and fizz come from — no artificial carbonation needed." },
          { icon: "bubbles", title: "Live cultures", text: "Unpasteurised kombucha carries live bacteria and yeast from fermentation. Many people enjoy it as part of a varied diet; it isn't a medicine, and we won't pretend it cures anything." },
          { icon: "droplet", title: "Sugar", text: "Sugar is needed to feed the culture, and most of it is used up during fermentation. A little remains for balance and flavour — far less than you'd expect from a fizzy soft drink." },
          { icon: "glass", title: "Trace alcohol", text: "Like all naturally fermented drinks, kombucha contains a trace of alcohol — kept within the limit for non-alcoholic beverages. Keeping it cold keeps it that way." },
          { icon: "thermometer", title: "Storage & shelf life", text: "Always keep it in the fridge. Cold slows the culture down so the flavour and fizz stay just right. Enjoy within the best-before on the label, and drink an opened bottle within two days." },
        ],
      }),
      s("statement", { text: "Not a miracle. Not a medicine. Just a *living* drink made with care.", attribution: "", tone: "forest" }),
      s("myths", {
        eyebrow: "Straight answers",
        title: "Myths vs facts",
        items: [
          { myth: "Kombucha is basically alcohol.", fact: "Naturally fermented kombucha contains only a trace of alcohol — about as much as very ripe fruit — and is sold as a non-alcoholic drink." },
          { myth: "The floaty bits mean it's gone bad.", fact: "Small strands or a tiny new culture are a sign the brew is alive. Give it a gentle tilt and enjoy. If it smells off or looks fuzzy, don't drink it and tell us." },
          { myth: "It's full of sugar.", fact: "The culture eats most of the sugar during fermentation. What's left is there for balance, not sweetness overload." },
          { myth: "More is better.", fact: "Start with a small glass a day and see how you feel. It's a drink to enjoy, not a dose to take." },
          { myth: "It can sit outside the fridge.", fact: "Kombucha is alive and keeps fermenting when warm. Keep it cold from the moment it arrives." },
        ],
      }),
      s("features", {
        eyebrow: "Please check first",
        title: "Who should ask a doctor before drinking",
        intro: "Kombucha suits most adults, but because it's fermented, unpasteurised and contains a little caffeine and trace alcohol, a quick word with your doctor is wise if you are:",
        layout: "columns",
        tone: "sky",
        items: [
          { icon: "heart", title: "Pregnant or breastfeeding", text: "Unpasteurised drinks and trace alcohol are worth discussing with your doctor first." },
          { icon: "shield", title: "Immunocompromised", text: "If your immune system is weakened by illness or treatment, check before drinking any live-culture food." },
          { icon: "droplet", title: "Managing blood sugar", text: "There's a little residual sugar. If you have diabetes, ask how it fits your plan." },
          { icon: "users", title: "Buying for children", text: "We recommend kombucha for adults. Ask a paediatrician before giving it to kids." },
          { icon: "flask", title: "On regular medication", text: "If you take medicines that interact with alcohol or caffeine, check first." },
          { icon: "sun", title: "Sensitive to caffeine", text: "Tea-based kombucha carries a small amount of caffeine." },
        ],
      }),
      s("faq", { eyebrow: "More questions", title: "About the brew", mode: "category", category: "The Brew", cta: { label: "See all FAQs", href: "/faq" } }),
      s("cta", { eyebrow: "Ready?", title: "Start with a tasting pack", body: "Not sure which flavour is yours? Try them side by side.", primary: { label: "Shop tasting packs", href: "/packs" }, secondary: { label: "Ask us on WhatsApp", href: "whatsapp" }, tone: "red", art: "bottles" }),
    ],
  },
  {
    slug: "story",
    title: "Our Story",
    seoTitle: "Our Story — Kombucha brewed in Naharlagun, Arunachal Pradesh",
    seoDescription: "How Mamon Brews brings Arunachal's flavours to handcrafted kombucha — our roots, our mission and our milestones from APIIP to IITF 2025.",
    sections: [
      s("pageHero", { eyebrow: "Our story", title: "Brewed with the *Northeast* in mind", intro: "Mamon Brews is a small kombucha brewery in Naharlagun, Arunachal Pradesh — making living drinks that taste like home.", tone: "forest", art: "hills", image: { url: "", alt: "" } }),
      s("textImage", {
        eyebrow: "Where it began",
        title: "A kitchen, a jar and a hunch",
        body: "Every Mamon Brews bottle starts with the same question we asked at the very beginning: why should the Northeast import its idea of a healthy drink, when the hills around us are full of flavour?\n\nWe started brewing in small jars, testing tea, time and temperature until the brew tasted right. Then we reached for the ingredients we grew up with — bay leaf, ginger, local fruit — and Mamon Brews was born.\n\nToday we're incubated at the Arunachal Pradesh Innovation & Investment Park (APIIP), we've poured our kombucha at IITF 2025 in New Delhi, and you'll find us on shelves across Itanagar. We're still small, still hands-on, and still tasting every batch.",
        image: { url: "", alt: "" },
        art: "jar",
        imageSide: "right",
        tone: "cream",
        cta: { label: "", href: "" },
      }),
      s("statement", { text: "Together, let's brew a *cleaner,* conscious future.", attribution: "The Mamon Brews mission", tone: "red" }),
      s("features", {
        eyebrow: "Sustainability",
        title: "Small choices, brewed in",
        intro: "",
        layout: "columns",
        tone: "cream",
        items: [
          { icon: "recycle", title: "Returnable glass", text: "Glass bottles that come back to us to be cleaned and refilled, instead of plastic that stays in the hills." },
          { icon: "sprout", title: "Local first", text: "We buy from nearby markets and growers whenever we can, keeping flavour fresh and money local." },
          { icon: "leaf", title: "Nothing artificial", text: "No artificial colours, flavours or forced carbonation — just fermentation doing what it does." },
        ],
      }),
      s("milestones", { eyebrow: "So far", title: "Milestones" }),
      s("team", { eyebrow: "The brewers", title: "Small team, big pot" }),
      s("cta", { eyebrow: "Come along", title: "Taste where we're from", body: "", primary: { label: "Shop flavours", href: "/flavours" }, secondary: { label: "Find a stockist", href: "/where-to-buy" }, tone: "forest", art: "leaf" }),
    ],
  },
  {
    slug: "where-to-buy",
    title: "Where to Buy",
    seoTitle: "Where to Buy Kombucha in Itanagar & Naharlagun — Mamon Brews",
    seoDescription: "Find Mamon Brews kombucha at stockists in Itanagar, or order delivery across Itanagar and Naharlagun, Arunachal Pradesh.",
    sections: [
      s("pageHero", { eyebrow: "Where to buy", title: "Cold bottles, *close by*", intro: "Grab Mamon Brews from a stockist in Itanagar, or let us bring it to your door in Itanagar and Naharlagun.", tone: "sky", art: "hills", image: { url: "", alt: "" } }),
      s("stockists", { eyebrow: "Stockists", title: "On the shelf", intro: "", showMap: true, showZones: true, cta: { label: "", href: "" } }),
      s("cta", { eyebrow: "Own a store or café?", title: "Stock Mamon Brews", body: "Join our growing list of stockists across Arunachal.", primary: { label: "Wholesale enquiry", href: "/business" }, secondary: { label: "", href: "" }, tone: "red", art: "crate" }),
    ],
  },
  {
    slug: "business",
    title: "For Business",
    seoTitle: "Wholesale Kombucha for Cafés, Bars & Events in Arunachal — Mamon Brews",
    seoDescription: "Stock handcrafted kombucha at your café, restaurant, bar or store in Itanagar and Naharlagun. Event bars, bulk orders and corporate gifting.",
    sections: [
      s("pageHero", { eyebrow: "Wholesale & events", title: "Good business, *naturally* fermented", intro: "From café fridges to carnival counters, Mamon Brews gives your customers something local, alive and genuinely different.", tone: "forest", art: "bottles", image: { url: "", alt: "" } }),
      s("features", {
        eyebrow: "Why stock us",
        title: "What your menu gets",
        intro: "",
        layout: "bento",
        tone: "cream",
        items: [
          { icon: "store", title: "A local hero product", text: "Customers love discovering something made in Arunachal. Mamon Brews gives your shelf a story." },
          { icon: "glass", title: "The alcohol-free option people want", text: "A grown-up, interesting drink for guests who aren't drinking — perfect for bars and late-night menus." },
          { icon: "truck", title: "Fresh, cold delivery", text: "We deliver chilled stock across Itanagar and Naharlagun on a schedule that suits you." },
          { icon: "sparkles", title: "Mocktail-ready", text: "Our flavours make a brilliant base for kombucha mocktails. We're happy to share recipes with your team." },
          { icon: "recycle", title: "Bottle returns built in", text: "We collect empties when we restock, so sustainability is easy." },
        ],
      }),
      s("features", {
        eyebrow: "Ways to work together",
        title: "Pick what fits",
        intro: "",
        layout: "columns",
        tone: "sky",
        items: [
          { icon: "store", title: "Wholesale supply", text: "Regular crates for cafés, restaurants, bars and stores, with stockist pricing." },
          { icon: "calendar", title: "Events & pop-ups", text: "A Mamon Brews bar at your carnival, watch party, wedding or launch." },
          { icon: "gift", title: "Corporate gifting", text: "Tasting packs for teams and clients, with a handwritten note if you like." },
          { icon: "users", title: "Tasting sessions", text: "A guided tasting for your team or guests — learn how kombucha is made, then sip all six." },
        ],
      }),
      s("form", { formType: "BUSINESS", eyebrow: "Let's talk", title: "Wholesale & events enquiry", intro: "Tell us a little about your business and we'll reply within a working day.", successMessage: "Thank you — we'll be in touch within a working day." }),
      s("faq", { eyebrow: "Business FAQs", title: "Before you ask", mode: "category", category: "Business", cta: { label: "", href: "" } }),
    ],
  },
  {
    slug: "events",
    title: "Events",
    seoTitle: "Kombucha Events in Itanagar — Pop-ups, Carnivals & Tastings | Mamon Brews",
    seoDescription: "Upcoming and past Mamon Brews events: pop-ups, carnivals, watch parties and tastings across Itanagar and beyond.",
    sections: [
      s("pageHero", { eyebrow: "Events", title: "Where we're *pouring*", intro: "Carnivals, watch parties, trade fairs and tastings — come say hello and try a glass.", tone: "red", art: "bubbles", image: { url: "", alt: "" } }),
      s("events", { eyebrow: "Coming up", title: "Upcoming", mode: "upcoming", limit: 12, cta: { label: "", href: "" } }),
      s("events", { eyebrow: "Look back", title: "Past events", mode: "past", limit: 12, cta: { label: "", href: "" } }),
      s("form", { formType: "EVENT", eyebrow: "Host us", title: "Book a Mamon Brews bar", intro: "Planning a party, launch or festival? Tell us the date and we'll bring the fizz.", successMessage: "Lovely — we'll be in touch soon to plan the pour." }),
    ],
  },
  {
    slug: "journal",
    title: "Journal",
    seoTitle: "The Mamon Brews Journal — Recipes, Wellness & Behind the Brew",
    seoDescription: "Kombucha mocktail recipes, wellness basics, behind-the-brew stories and news from Mamon Brews in Arunachal Pradesh.",
    sections: [
      s("pageHero", { eyebrow: "Journal", title: "Notes from the *brew log*", intro: "Recipes, kombucha basics, stories from the brewhouse and news from the hills.", tone: "cream", art: "leaf", image: { url: "", alt: "" } }),
      s("journal", { eyebrow: "", title: "", limit: 24, showCategories: true }),
      s("newsletter", { title: "Get new posts first", body: "One short email when there's a new recipe or story.", buttonLabel: "Subscribe" }),
    ],
  },
  {
    slug: "bottle-return",
    title: "Bottle Return",
    seoTitle: "Bottle Return & Refill Programme — Mamon Brews",
    seoDescription: "Return your Mamon Brews glass bottles in Itanagar and Naharlagun. We clean, sterilise and refill them — and say thanks with a discount.",
    sections: [
      s("pageHero", { eyebrow: "Bottle return", title: "Bring the *glass* back", intro: "Every bottle that comes home to us is one less in the hills. Here's how our return and refill programme works.", tone: "forest", art: "leaf", image: { url: "", alt: "" } }),
      s("timeline", {
        eyebrow: "How it works",
        title: "Three easy steps",
        intro: "",
        style: "steps",
        steps: [
          { title: "Rinse", text: "Give your empty bottles a quick rinse and keep the caps together.", meta: "At home" },
          { title: "Return", text: "Hand them to our delivery rider with your next order, or drop them at the brewhouse in Naharlagun.", meta: "Any order" },
          { title: "Refill", text: "We inspect, wash, sterilise and refill every bottle that's in good shape.", meta: "Back in the loop" },
        ],
      }),
      s("features", {
        eyebrow: "The thank-you",
        title: "Why it's worth it",
        intro: "",
        layout: "columns",
        tone: "cream",
        items: [
          { icon: "gift", title: "Return credit", text: "Every five bottles returned earns credit off your next order. Just mention your returns when you order on WhatsApp." },
          { icon: "recycle", title: "Less waste", text: "A glass bottle can be refilled many times over. That's a lot of packaging that never needs making." },
          { icon: "mountain", title: "Cleaner hills", text: "Fewer bottles in drains, rivers and roadsides around Itanagar and Naharlagun." },
        ],
      }),
      s("statement", { text: "Together, let's brew a *cleaner,* conscious future.", attribution: "", tone: "sky" }),
      s("faq", { eyebrow: "Questions", title: "About returns", mode: "category", category: "Sustainability", cta: { label: "", href: "" } }),
    ],
  },
  {
    slug: "gallery",
    title: "Gallery",
    seoTitle: "Gallery — Mamon Brews Kombucha",
    seoDescription: "Bottles, brewing, events and the hills of Arunachal — a look inside Mamon Brews.",
    sections: [
      s("pageHero", { eyebrow: "Gallery", title: "Through the *glass*", intro: "Brewing days, pop-ups and the hills that flavour every bottle.", tone: "cream", art: "bottles", image: { url: "", alt: "" } }),
      s("gallery", { eyebrow: "", title: "", mode: "masonry", limit: 120 }),
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    seoTitle: "Kombucha FAQs — Ordering, Delivery & the Brew | Mamon Brews",
    seoDescription: "Answers about ordering Mamon Brews kombucha in Itanagar and Naharlagun, delivery, storage, sugar, alcohol and bottle returns.",
    sections: [
      s("pageHero", { eyebrow: "Help", title: "Questions, *answered*", intro: "Search below, or message us on WhatsApp — a real person replies.", tone: "sky", art: "bubbles", image: { url: "", alt: "" } }),
      s("faq", { eyebrow: "", title: "", mode: "all", category: "", cta: { label: "", href: "" } }),
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    seoTitle: "Contact Mamon Brews — Naharlagun, Arunachal Pradesh",
    seoDescription: `Call or WhatsApp Mamon Brews on ${WA}, or send us a message. Based in Naharlagun, delivering across Itanagar.`,
    sections: [
      s("pageHero", { eyebrow: "Contact", title: "Say *hello*", intro: "Orders, questions, collaborations or kombucha confessions — we'd love to hear from you.", tone: "cream", art: "hills", image: { url: "", alt: "" } }),
      s("contact", { title: "Reach the brewhouse", intro: "WhatsApp is the quickest way to reach us. We usually reply within a few hours.", showMap: true }),
      s("form", { formType: "CONTACT", eyebrow: "Write to us", title: "Send a message", intro: "", successMessage: "Thank you — we'll reply soon." }),
    ],
  },
  {
    slug: "subscribe",
    title: "Subscribe",
    seoTitle: "Weekly Kombucha Subscription — Itanagar & Naharlagun | Mamon Brews",
    seoDescription: "Get Mamon Brews kombucha delivered weekly or every two weeks across Itanagar and Naharlagun. Choose your mix, pause anytime.",
    sections: [
      s("pageHero", { eyebrow: "Subscribe", title: "Your fridge, *always* stocked", intro: "Choose your flavours and how often — we'll bring a fresh, cold batch to your door.", tone: "forest", art: "bottles", image: { url: "", alt: "" } }),
      s("timeline", {
        eyebrow: "How it works",
        title: "Simple as a standing order",
        intro: "",
        style: "steps",
        steps: [
          { title: "Build your mix", text: "Pick flavours and how many bottles you want each drop.", meta: "2 minutes" },
          { title: "We confirm on WhatsApp", text: "We'll message to confirm your first delivery date and payment.", meta: "Same day" },
          { title: "Fresh drops", text: "Cold bottles every week or fortnight. Swap flavours, pause or stop any time with a message.", meta: "Ongoing" },
        ],
      }),
      s("form", { formType: "SUBSCRIBE", eyebrow: "Request", title: "Set up your subscription", intro: "No payment now — we'll confirm everything with you on WhatsApp.", successMessage: "Request received — we'll WhatsApp you to confirm your first drop." }),
    ],
  },
];

const products = [
  {
    name: "Classic", slug: "classic", accent: "#C98A3D", price: 200, tags: ["original"], stockStatus: "IN_STOCK" as const, featured: true,
    tagline: "The original, the one that started it all.",
    description: "<p>Our house kombucha: black tea fermented slowly until it turns bright, tangy and gently sparkling. Nothing added but time. Classic is where every Mamon Brews flavour begins — and for plenty of our regulars, where it ends too.</p>",
    tastingNotes: ["Amber tea", "Green apple", "Honeyed tang"],
    ingredients: [{ name: "Filtered water", note: "", local: false }, { name: "Black tea", note: "Steeped fresh for every batch", local: false }, { name: "Cane sugar", note: "Food for the culture — mostly fermented away", local: false }, { name: "Kombucha culture (SCOBY)", note: "Our own living culture", local: true }],
    localStory: "Brewed in Naharlagun from a culture we've nurtured batch after batch.",
    pairsWith: ["Momos", "Spicy chutneys", "A slow evening"],
  },
  {
    name: "Bay Leaf", slug: "bay-leaf", accent: "#8FA67C", price: 230, tags: ["earthy"], stockStatus: "IN_STOCK" as const, featured: true,
    tagline: "Earthy, aromatic and unmistakably Arunachali.",
    description: "<p>Bay leaf is in nearly every kitchen in the hills, and it turns out it's magic in kombucha. Warm, gently spiced and herbal, with a clean, dry finish. This is the flavour that tastes most like home — and the one visitors always ask about.</p>",
    tastingNotes: ["Warm spice", "Herbal", "Dry finish"],
    ingredients: [{ name: "Kombucha (tea, sugar, culture)", note: "", local: false }, { name: "Bay leaf (tej patta)", note: "Sourced from local markets around Itanagar", local: true }],
    localStory: "We use the same tej patta you'd find simmering in a dal or a pot of rice in any Arunachali home — sourced from local markets and steeped into the brew for a warm, aromatic finish.",
    pairsWith: ["Smoked pork", "Bamboo shoot dishes", "Roasted nuts"],
  },
  {
    name: "Ginger Lemon", slug: "ginger-lemon", accent: "#E9C53F", price: 230, tags: ["zesty"], stockStatus: "IN_STOCK" as const, featured: true,
    tagline: "Bright, zesty and properly fiery.",
    description: "<p>Fresh ginger for heat, lemon for sparkle. Ginger Lemon wakes you up like the first sun over the ridge — sharp, clean and seriously refreshing. Pour it over ice, or keep it close on a cold evening.</p>",
    tastingNotes: ["Fresh ginger", "Lemon zest", "Peppery warmth"],
    ingredients: [{ name: "Kombucha (tea, sugar, culture)", note: "", local: false }, { name: "Fresh ginger", note: "Grated by hand", local: true }, { name: "Lemon", note: "", local: false }],
    localStory: "The Northeast grows some of India's finest ginger. We grate it fresh into every batch, so the heat is real.",
    pairsWith: ["Fried snacks", "Thukpa", "After a long day"],
  },
  {
    name: "Pineapple", slug: "pineapple", accent: "#F0A62E", price: 250, tags: ["fruity"], stockStatus: "IN_STOCK" as const, featured: true,
    tagline: "Sunny, juicy and dangerously drinkable.",
    description: "<p>Ripe pineapple folded into our kombucha for a tropical, sweet-tart pour. It's the easiest introduction to kombucha we know — the one we hand to first-timers.</p>",
    tastingNotes: ["Ripe pineapple", "Tropical", "Sweet-tart"],
    ingredients: [{ name: "Kombucha (tea, sugar, culture)", note: "", local: false }, { name: "Pineapple", note: "Ripe fruit from the Northeast", local: true }],
    localStory: "Northeast pineapples are famously sweet. We use ripe fruit and let the second ferment do the rest.",
    pairsWith: ["Grilled chicken", "Spicy salads", "Sunny afternoons"],
  },
  {
    name: "Mango", slug: "mango", accent: "#F08A24", price: null, tags: ["fruity"], stockStatus: "COMING_SOON" as const, featured: false,
    tagline: "Golden, lush and worth the wait.",
    description: "<p>Our seasonal mango brew — rich, round and full of summer. Mango arrives when the fruit is at its best, so keep an eye on our Instagram for the next batch.</p>",
    tastingNotes: ["Ripe mango", "Silky", "Bright finish"],
    ingredients: [{ name: "Kombucha (tea, sugar, culture)", note: "", local: false }, { name: "Mango", note: "Seasonal", local: false }],
    localStory: "A seasonal brew, made only when mangoes are at their peak.",
    pairsWith: ["Chilli-salt snacks", "Desserts", "Summer"],
  },
  {
    name: "Plum", slug: "plum", accent: "#6A2C4E", price: null, tags: ["fruity"], stockStatus: "COMING_SOON" as const, featured: false,
    tagline: "Deep, jammy and a little bit moody.",
    description: "<p>Dark plum for a deep, jammy kombucha with a gentle tartness — the most grown-up flavour in our line-up. Arriving soon; message us to be the first to know.</p>",
    tastingNotes: ["Dark plum", "Jammy", "Tart finish"],
    ingredients: [{ name: "Kombucha (tea, sugar, culture)", note: "", local: false }, { name: "Plum", note: "From the hills, in season", local: true }],
    localStory: "Plums grow well in the cooler hills of Arunachal. We're waiting for the right harvest.",
    pairsWith: ["Cheese", "Roast meats", "Late dinners"],
  },
];

const faqs = [
  { category: "Ordering", question: "How do I order?", answer: "Add bottles to your cart and check out. We'll save your order and open WhatsApp with everything filled in — just hit send and we'll confirm delivery and payment.", showOnHome: true },
  { category: "Ordering", question: "How do I pay?", answer: "Right now we confirm every order on WhatsApp and you can pay by UPI or cash on delivery. Online card payments are coming soon.", showOnHome: false },
  { category: "Ordering", question: "Is there a minimum order?", answer: "No minimum for pickup. For delivery, check the cart — any minimum and the delivery fee for your area are shown before you order.", showOnHome: false },
  { category: "Delivery", question: "Where do you deliver?", answer: "We deliver across Itanagar and Naharlagun. If you're nearby but outside those areas, choose \"Other\" at checkout and we'll do our best.", showOnHome: true },
  { category: "Delivery", question: "When will my order arrive?", answer: "Most orders arrive the same or next day. Pick a preferred date and time at checkout and we'll confirm on WhatsApp.", showOnHome: false },
  { category: "The Brew", question: "What does kombucha taste like?", answer: "Tangy, lightly sweet and gently fizzy — somewhere between a sparkling iced tea and a dry cider. Each flavour then takes it somewhere different.", showOnHome: true },
  { category: "The Brew", question: "Does kombucha contain alcohol?", answer: "Like any naturally fermented drink it contains a trace of alcohol, kept within the limit for non-alcoholic drinks. Keeping it refrigerated keeps it that way.", showOnHome: true },
  { category: "The Brew", question: "How should I store it?", answer: "Always in the fridge. Kombucha is alive, and cold keeps the flavour and fizz just right. Drink an opened bottle within two days.", showOnHome: false },
  { category: "The Brew", question: "What are the bits floating in my bottle?", answer: "Tiny strands of culture are completely normal in raw kombucha — a sign it's alive. Tilt gently before pouring.", showOnHome: false },
  { category: "Business", question: "Do you supply cafés and restaurants?", answer: "Yes! We supply cafés, restaurants, bars and stores with chilled crates. Fill in the enquiry form on our For Business page or WhatsApp us.", showOnHome: false },
  { category: "Business", question: "Can you do a kombucha bar at our event?", answer: "We love an event. Tell us the date, venue and number of guests and we'll put together a plan.", showOnHome: false },
  { category: "Sustainability", question: "How do bottle returns work?", answer: "Rinse your empties and hand them to our delivery rider, or drop them at the brewhouse. Every five bottles returned earns credit on your next order.", showOnHome: false },
];

const posts = [
  {
    title: "Kombucha, explained over one glass", slug: "kombucha-explained", category: "wellness", cover: "/seed/cover-what-is.svg",
    excerpt: "What it is, how it's made and why it fizzes — a plain-language guide for anyone in Itanagar trying kombucha for the first time.",
    content: "<p>If you've never tried kombucha, the word alone can sound intimidating. It isn't. Kombucha is tea that's been fermented by a living culture, the same way curd is milk that's been fermented.</p><h2>How it's made</h2><p>We brew sweet tea, cool it and add a SCOBY — a symbiotic culture of bacteria and yeast. Over one to two weeks, the culture eats most of the sugar and turns the tea tangy. Then we flavour it and seal it in glass, where it builds a gentle natural fizz.</p><h2>What it tastes like</h2><p>Bright and tangy, a little sweet, lightly sparkling. Think of a dry sparkling iced tea with personality.</p><h2>How to start</h2><p>Start with a small glass, chilled. Pineapple and Classic are the friendliest first sips. Then work your way to Bay Leaf — our favourite.</p>",
  },
  {
    title: "Three kombucha mocktails for an Itanagar evening", slug: "kombucha-mocktails", category: "recipes", cover: "/seed/cover-mocktails.svg",
    excerpt: "Easy, alcohol-free drinks built on Mamon Brews — ready in two minutes, no bar tools needed.",
    content: "<p>Kombucha makes a brilliant mocktail base: it's already tangy, fizzy and complex. Here are three we make at home.</p><h2>1. The Ridge Line</h2><ul><li>150 ml Ginger Lemon</li><li>A squeeze of fresh lime</li><li>A few mint leaves</li><li>Lots of ice</li></ul><p>Muddle the mint gently, add ice, top with kombucha and lime.</p><h2>2. Golden Hour</h2><ul><li>150 ml Pineapple</li><li>A pinch of chilli salt on the rim</li><li>A slice of fresh pineapple</li></ul><h2>3. Smoke &amp; Leaf</h2><ul><li>150 ml Bay Leaf</li><li>A splash of cold black tea</li><li>An orange twist</li></ul><p>Stir over ice and serve in a short glass. Perfect with smoked dishes.</p>",
  },
  {
    title: "Why we put bay leaf in kombucha", slug: "why-bay-leaf", category: "behind-the-brew", cover: "/seed/cover-bay-leaf.svg",
    excerpt: "The story behind our most Arunachali flavour — and why a kitchen staple became our signature brew.",
    content: "<p>Every kitchen in the hills has bay leaf. It goes into dal, rice and stews without anyone thinking twice. We kept thinking about it.</p><p>When we started experimenting with flavours, we wanted at least one that could only come from here. Bay leaf turned out to be perfect: warm, aromatic and a little spiced, it rounds out kombucha's tang beautifully and leaves a dry, clean finish.</p><h2>How we use it</h2><p>We source tej patta from local markets around Itanagar, steep it into the brew after the first ferment, and let it rest until the flavour is just right. No extracts, no shortcuts.</p><p>It's the flavour visitors ask about most, and the one we're proudest of.</p>",
  },
  {
    title: "Mamon Brews at IITF 2025", slug: "iitf-2025", category: "news", cover: "/seed/cover-iitf.svg",
    excerpt: "We took Arunachal's kombucha to the India International Trade Fair in New Delhi. Here's what we learned.",
    content: "<p>In 2025 we packed our bottles and carried Mamon Brews to the India International Trade Fair at Bharat Mandapam, New Delhi.</p><p>For a small brewery from Naharlagun, it was a big moment: thousands of visitors from across India tasting kombucha flavoured with Arunachal — and a lot of them coming back for a second glass of Bay Leaf.</p><p>We're grateful to APIIP for backing us, and to everyone who stopped by. Next stop: more shelves at home.</p>",
  },
  {
    title: "How to store kombucha (and why it matters)", slug: "how-to-store-kombucha", category: "wellness", cover: "/seed/cover-storage.svg",
    excerpt: "Kombucha is alive. A few simple habits keep every bottle tasting the way we brewed it.",
    content: "<p>Because kombucha is a living drink, how you store it changes how it tastes.</p><h2>Keep it cold</h2><p>Straight into the fridge, always. Cold slows the culture so the flavour, fizz and sweetness stay balanced.</p><h2>Open gently</h2><p>Natural fizz can be lively. Open slowly, pointing away from you.</p><h2>Finish it soon</h2><p>Once opened, drink within two days for the best fizz.</p><h2>Return the bottle</h2><p>Rinse it and give it back to us on your next order — we'll refill it.</p>",
  },
];

export async function seedAll(db: PrismaClient, opts: { reset: boolean }) {
  if (opts.reset) {
    await db.$transaction([
      db.orderItem.deleteMany(), db.order.deleteMany(), db.subscription.deleteMany(), db.customer.deleteMany(),
      db.bundleItem.deleteMany(), db.bundle.deleteMany(), db.productImage.deleteMany(), db.productVariant.deleteMany(), db.product.deleteMany(),
      db.section.deleteMany(), db.page.deleteMany(), db.navItem.deleteMany(), db.navigationMenu.deleteMany(),
      db.post.deleteMany(), db.category.deleteMany(), db.event.deleteMany(), db.stockist.deleteMany(), db.testimonial.deleteMany(),
      db.faq.deleteMany(), db.galleryItem.deleteMany(), db.teamMember.deleteMany(), db.milestone.deleteMany(), db.legalPage.deleteMany(),
      db.discountCode.deleteMany(), db.enquiry.deleteMany(), db.newsletterSubscriber.deleteMany(), db.analyticsEvent.deleteMany(),
      db.media.deleteMany(), db.siteSettings.deleteMany(), db.themeSettings.deleteMany(),
    ]);
  }

  await db.siteSettings.create({
    data: {
      id: "site",
      brandName: "Mamon Brews",
      brandStyled: "MamOn Brews 🍀",
      tagline: "Arunachal's handcrafted, naturally fermented kombucha",
      missionLine: "Together, let's brew a cleaner, conscious future.",
      logoUrl: "/brand/logo.svg",
      ogImageUrl: "/seed/og-default.svg",
      whatsapp: WA,
      phone: WA,
      email: null,
      address: "Naharlagun",
      city: "Naharlagun",
      region: "Arunachal Pradesh",
      postalCode: "791110",
      hours: [{ days: "Monday – Saturday", time: "10:00 am – 7:00 pm" }, { days: "Sunday", time: "Orders on WhatsApp only" }],
      fssai: null,
      socials: { instagram: "https://www.instagram.com/mamoon.brews/", facebook: "", youtube: "", x: "" },
      announcement: { enabled: true, text: "Now delivering cold across Itanagar & Naharlagun", linkLabel: "Order now", href: "/flavours", bg: "#141613", fg: "#F5EFE3" },
      features: { onlinePayments: false, subscriptions: true, blog: true, events: true, bottleReturn: true, newsletter: true, floatingWhatsapp: true },
      animation: "FULL",
      whatsappTemplate:
        "Hi Mamon Brews! 🍀 I'd like to place an order.\n\n*Order {orderId}*\n{items}\n\nSubtotal: {subtotal}\nDiscount: {discount}\nDelivery: {delivery}\n*Total: {total}*\n\nName: {name}\nPhone: {phone}\n{fulfilment}: {area}\nAddress: {address}\nPreferred: {date} {time}\nNotes: {notes}",
      deliveryZones: [{ name: "Naharlagun", fee: 30, eta: "Same / next day" }, { name: "Itanagar", fee: 50, eta: "Same / next day" }, { name: "Other (nearby)", fee: 80, eta: "We'll confirm" }],
      minOrderValue: 200,
      deliveryEnabled: true,
      pickupEnabled: true,
      pickupAddress: "Brewhouse, Naharlagun — we'll share the pin on WhatsApp",
      freeDeliveryAbove: 1000,
    },
  });

  await db.themeSettings.create({
    data: { id: "theme", forest: "#1F3A2B", brandRed: "#A8242C", sky: "#9CCBE4", cream: "#F5EFE3", ink: "#141613", displayFont: "fraunces", sansFont: "instrument", radius: 18, grain: true },
  });

  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@mamonbrews.in";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  if (ownerPassword && !(await db.user.findUnique({ where: { email: ownerEmail } }))) {
    await db.user.create({ data: { email: ownerEmail, name: "Mamon Brews Owner", role: "OWNER", passwordHash: await bcrypt.hash(ownerPassword, 12) } });
  }

  for (const [i, p] of pages.entries()) {
    await db.page.create({
      data: {
        slug: p.slug, title: p.title, seoTitle: p.seoTitle, seoDescription: p.seoDescription, system: true, status: "PUBLISHED",
        sections: { create: p.sections.map((sec, order) => ({ type: sec.type, content: sec.content, order, visible: sec.visible ?? true })) },
      },
    });
    void i;
  }

  const header = await db.navigationMenu.create({ data: { key: "header", name: "Header menu" } });
  const headerItems: [string, string, [string, string][]?][] = [
    ["Flavours", "/flavours", [["All flavours", "/flavours"], ["Tasting & combo packs", "/packs"], ["Subscribe", "/subscribe"]]],
    ["Learn", "/learn"],
    ["Our Story", "/story"],
    ["Where to Buy", "/where-to-buy"],
    ["For Business", "/business"],
    ["More", "/journal", [["Journal", "/journal"], ["Events", "/events"], ["Bottle return", "/bottle-return"], ["Gallery", "/gallery"], ["FAQ", "/faq"], ["Contact", "/contact"]]],
  ];
  for (const [order, [label, href, children]] of headerItems.entries()) {
    const parent = await db.navItem.create({ data: { menuId: header.id, label, href, order } });
    for (const [co, [cl, ch]] of (children ?? []).entries()) await db.navItem.create({ data: { menuId: header.id, parentId: parent.id, label: cl, href: ch, order: co } });
  }
  const footer = await db.navigationMenu.create({ data: { key: "footer", name: "Footer menu" } });
  const footerCols: [string, [string, string][]][] = [
    ["Shop", [["Flavours", "/flavours"], ["Packs", "/packs"], ["Subscribe", "/subscribe"], ["Where to buy", "/where-to-buy"]]],
    ["Brand", [["Our story", "/story"], ["What is kombucha?", "/learn"], ["Journal", "/journal"], ["Events", "/events"], ["Gallery", "/gallery"]]],
    ["Help", [["FAQ", "/faq"], ["Contact", "/contact"], ["Bottle return", "/bottle-return"], ["For business", "/business"]]],
  ];
  for (const [order, [label, children]] of footerCols.entries()) {
    const parent = await db.navItem.create({ data: { menuId: footer.id, label, href: "#", order } });
    for (const [co, [cl, ch]] of children.entries()) await db.navItem.create({ data: { menuId: footer.id, parentId: parent.id, label: cl, href: ch, order: co } });
  }

  const productIds: Record<string, string> = {};
  for (const [order, p] of products.entries()) {
    const created = await db.product.create({
      data: {
        name: p.name, slug: p.slug, tagline: p.tagline, description: p.description, tastingNotes: p.tastingNotes, ingredients: p.ingredients,
        localStory: p.localStory, accent: p.accent, tags: p.tags, stockStatus: p.stockStatus, featured: p.featured, sortOrder: order, pairsWith: p.pairsWith,
        faqs: [
          { q: "How long does it keep?", a: "Keep it refrigerated and enjoy within the best-before date on the label. Once opened, finish within two days." },
          { q: `Is ${p.name} sweet?`, a: "It's gently sweet with a tangy finish — the culture ferments away most of the sugar." },
        ],
        seoTitle: `${p.name} Kombucha — Mamon Brews, Arunachal Pradesh`,
        seoDescription: `${p.tagline} Handcrafted ${p.name.toLowerCase()} kombucha from Naharlagun, delivered across Itanagar.`,
        variants: { create: [{ label: "Single bottle", price: p.price, isDefault: true, order: 0, sku: `MB-${p.slug.toUpperCase()}` }] },
      },
    });
    productIds[p.slug] = created.id;
  }

  const bundles = [
    { name: "Tasting Flight", slug: "tasting-flight", description: "One each of Classic, Bay Leaf, Ginger Lemon and Pineapple — the perfect introduction.", price: 850, compareAt: 910, badge: "Best for first-timers", items: ["classic", "bay-leaf", "ginger-lemon", "pineapple"], image: "/seed/bottle-row.svg" },
    { name: "Earthy & Zesty Pair", slug: "earthy-zesty-pair", description: "Bay Leaf and Ginger Lemon — our two most Northeast flavours, side by side.", price: 430, compareAt: 460, badge: null, items: ["bay-leaf", "ginger-lemon"], image: "/seed/ginger-lemon.svg" },
    { name: "Fridge Restock", slug: "fridge-restock", description: "Two Classic, two Bay Leaf, two Pineapple. A week of good decisions.", price: 1280, compareAt: 1360, badge: "Free delivery", items: ["classic", "classic", "bay-leaf", "bay-leaf", "pineapple", "pineapple"], image: "/seed/crates.svg" },
  ];
  for (const [order, b] of bundles.entries()) {
    const counts = b.items.reduce<Record<string, number>>((acc, slug) => ({ ...acc, [slug]: (acc[slug] ?? 0) + 1 }), {});
    await db.bundle.create({
      data: {
        name: b.name, slug: b.slug, description: b.description, price: b.price, compareAt: b.compareAt, badge: b.badge, imageUrl: b.image, imageAlt: `${b.name} pack illustration`, sortOrder: order,
        items: { create: Object.entries(counts).map(([slug, quantity]) => ({ productId: productIds[slug], quantity })) },
      },
    });
  }

  await db.discountCode.create({ data: { code: "FIRSTPOUR", type: "PERCENT", value: 10, minOrder: 400, usageLimit: 100, active: false } });

  await db.stockist.createMany({
    data: [
      { name: "NE Departmental Store", address: "Itanagar, Arunachal Pradesh", area: "Itanagar", kind: "Store", mapsUrl: "https://www.google.com/maps/search/?api=1&query=NE+Departmental+Store+Itanagar", lat: 27.0844, lng: 93.6053, hours: "Call ahead for stock", sortOrder: 0 },
      { name: "Arunachal Fresh Store", address: "Secretariat, Itanagar, Arunachal Pradesh", area: "Itanagar", kind: "Store", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Arunachal+Fresh+Store+Secretariat+Itanagar", lat: 27.0905, lng: 93.6065, hours: "Call ahead for stock", sortOrder: 1 },
    ],
  });

  await db.event.createMany({
    data: [
      {
        title: "Arunachal Food & Beverage Carnival", slug: "arunachal-food-beverage-carnival", startsAt: new Date("2025-12-13T11:00:00+05:30"), endsAt: new Date("2025-12-14T20:00:00+05:30"),
        venue: "State Banquet Hall, Itanagar", address: "Itanagar, Arunachal Pradesh",
        description: "A celebration of the state's food and drink, hosted by Mezang Academy. We poured all our flavours for a packed hall — Bay Leaf ran out first.",
        posterUrl: "/seed/poster-carnival.svg", posterAlt: "Arunachal Food & Beverage Carnival poster",
        gallery: [{ url: "/seed/carnival-stall.svg", alt: "Mamon Brews stall at the carnival" }, { url: "/seed/pour.svg", alt: "A glass of kombucha being poured" }],
        partners: ["Mezang Academy"],
      },
      {
        title: "FIFA Final Watch Parties", slug: "fifa-final-watch-parties", startsAt: new Date("2026-07-19T20:30:00+05:30"),
        venue: "2WO Restaurant · Foxtrail Sports TV · Fujin Bar", address: "Itanagar, Arunachal Pradesh",
        description: "Three venues, one final, plenty of cold kombucha. We partnered with 2WO Restaurant, Foxtrail Sports TV and Fujin Bar to give fans a brilliant alcohol-free option on the big night.",
        posterUrl: "/seed/poster-fifa.svg", posterAlt: "FIFA Final watch parties poster",
        gallery: [{ url: "/seed/watch-party.svg", alt: "Kombucha bottles in front of the big screen" }],
        partners: ["2WO Restaurant", "Foxtrail Sports TV", "Fujin Bar"],
      },
      {
        title: "India International Trade Fair 2025", slug: "iitf-2025", startsAt: new Date("2025-11-14T10:00:00+05:30"), endsAt: new Date("2025-11-27T19:00:00+05:30"),
        venue: "Bharat Mandapam, New Delhi", address: "Pragati Maidan, New Delhi",
        description: "We took Arunachal's kombucha to IITF 2025, pouring for visitors from across India at the Arunachal Pradesh showcase.",
        posterUrl: "/seed/poster-iitf.svg", posterAlt: "IITF 2025 poster",
        gallery: [{ url: "/seed/fair-hall.svg", alt: "The trade fair hall" }],
        partners: ["APIIP"],
      },
    ],
  });

  const cats = [["Recipes", "recipes"], ["Wellness", "wellness"], ["Behind the Brew", "behind-the-brew"], ["News", "news"]] as const;
  const catIds: Record<string, string> = {};
  for (const [order, [name, slug]] of cats.entries()) catIds[slug] = (await db.category.create({ data: { name, slug, order } })).id;
  for (const [i, p] of posts.entries()) {
    const words = p.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    await db.post.create({
      data: {
        title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, coverUrl: p.cover, coverAlt: p.title, categoryId: catIds[p.category],
        authorName: "Mamon Brews", status: "PUBLISHED", publishedAt: new Date(Date.UTC(2026, 9, 20 - i * 9)), readingMinutes: Math.max(2, Math.round(words / 220)),
      },
    });
  }

  // Samples so the owner can see how testimonials look. Unpublished until real reviews replace them.
  await db.testimonial.createMany({
    data: [
      { quote: "The Bay Leaf one tastes like home, but fizzy. I've stopped buying soda.", name: "Sample review", context: "Replace with a real customer quote", published: false, sortOrder: 0 },
      { quote: "Our guests keep asking for the Ginger Lemon. It's the best alcohol-free option on our menu.", name: "Sample review", context: "Replace with a real café partner quote", published: false, sortOrder: 1 },
      { quote: "First time trying kombucha — Pineapple won me over in one sip.", name: "Sample review", context: "Replace with a real customer quote", published: false, sortOrder: 2 },
    ],
  });

  await db.faq.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });

  await db.galleryItem.createMany({
    data: [
      { url: "/seed/bottle-row.svg", alt: "Six Mamon Brews bottles in a row", category: "Bottles", width: 1600, height: 1200 },
      { url: "/seed/hills-dawn.svg", alt: "Hills of Arunachal at dawn", category: "Arunachal", width: 1200, height: 1500 },
      { url: "/seed/brew-jar.svg", alt: "A brewing jar with a kombucha culture", category: "Brewing", width: 1200, height: 1500 },
      { url: "/seed/carnival-stall.svg", alt: "Mamon Brews stall at the Food & Beverage Carnival", category: "Events", width: 1200, height: 1500 },
      { url: "/seed/bay-leaves.svg", alt: "Bay leaves", category: "Ingredients", width: 1200, height: 1500 },
      { url: "/seed/ginger-lemon.svg", alt: "Ginger and lemon with a bottle of Ginger Lemon kombucha", category: "Ingredients", width: 1200, height: 1500 },
      { url: "/seed/pineapple.svg", alt: "Pineapple with a bottle of Pineapple kombucha", category: "Bottles", width: 1200, height: 1500 },
      { url: "/seed/pour.svg", alt: "Kombucha poured into a glass", category: "Brewing", width: 1200, height: 1500 },
      { url: "/seed/watch-party.svg", alt: "Kombucha at a FIFA final watch party", category: "Events", width: 1200, height: 1500 },
      { url: "/seed/crates.svg", alt: "Crates of kombucha ready for cafés", category: "Bottles", width: 1200, height: 1500 },
      { url: "/seed/fair-hall.svg", alt: "IITF 2025 trade fair hall", category: "Events", width: 1200, height: 1500 },
      { url: "/seed/bottle-return.svg", alt: "Bottle return loop illustration", category: "Brewing", width: 1200, height: 1500 },
    ].map((g, i) => ({ ...g, sortOrder: i })),
  });

  await db.teamMember.create({
    data: { name: "The Mamon Brews team", role: "Brewers · bottlers · delivery riders", bio: "A small crew in Naharlagun who taste every batch, label bottles by hand and still do most deliveries ourselves.", sortOrder: 0 },
  });

  await db.milestone.createMany({
    data: [
      { dateLabel: "The beginning", title: "First batches in Naharlagun", description: "Small jars, lots of tasting, and the first bottle of Bay Leaf.", sortOrder: 0 },
      { dateLabel: "Incubation", title: "Incubated at APIIP", description: "Backed by the Arunachal Pradesh Innovation & Investment Park to grow from kitchen brewery to brand.", sortOrder: 1 },
      { dateLabel: "On shelves", title: "Our first stockists", description: "NE Departmental Store and Arunachal Fresh Store, Secretariat, start stocking Mamon Brews in Itanagar.", sortOrder: 2 },
      { dateLabel: "November 2025", title: "Exhibited at IITF 2025", description: "Pouring Arunachal's kombucha for visitors at the India International Trade Fair in New Delhi.", sortOrder: 3 },
      { dateLabel: "Carnival season", title: "Arunachal Food & Beverage Carnival", description: "A packed State Banquet Hall in Itanagar, hosted by Mezang Academy.", sortOrder: 4 },
      { dateLabel: "July 2026", title: "FIFA Final watch parties", description: "Partnering with 2WO Restaurant, Foxtrail Sports TV and Fujin Bar on the big night.", sortOrder: 5 },
    ],
  });

  await db.legalPage.createMany({
    data: [
      {
        slug: "privacy", title: "Privacy Policy",
        content: "<p>Mamon Brews (\"we\", \"us\") respects your privacy. This policy explains what we collect when you use this website and how we use it.</p><h2>What we collect</h2><ul><li><strong>Order details</strong> — your name, phone number, area, address, optional email and order notes, so we can deliver your order.</li><li><strong>Enquiries and subscriptions</strong> — the information you choose to send us through our forms.</li><li><strong>Newsletter</strong> — your email address, if you subscribe.</li><li><strong>Basic analytics</strong> — anonymous, aggregated information about how the site is used (for example, which pages are popular). We do not use advertising trackers.</li></ul><h2>How we use it</h2><p>Only to process and deliver orders, reply to you, send newsletters you asked for, and improve our service. We never sell your data.</p><h2>WhatsApp</h2><p>When you check out, we open WhatsApp with your order details. Messages you send are handled under WhatsApp's own privacy policy.</p><h2>Your choices</h2><p>You can ask us to view, correct or delete your information at any time by messaging us on WhatsApp. You can unsubscribe from emails using the link in any email.</p><h2>Contact</h2><p>Questions? WhatsApp or call us on +91 76298 23243.</p>",
      },
      {
        slug: "terms", title: "Terms of Use",
        content: "<p>By using this website or placing an order with Mamon Brews, you agree to these terms.</p><h2>Orders</h2><p>Submitting an order on this website is a request to purchase. Your order is confirmed once we reply on WhatsApp (or once online payment succeeds, where available). We may decline or cancel an order if a product is unavailable or details can't be confirmed.</p><h2>Prices</h2><p>Prices are in Indian Rupees and include applicable taxes unless stated. Delivery charges are shown before you order.</p><h2>Our products</h2><p>Kombucha is a live, fermented beverage containing trace alcohol and caffeine. Keep refrigerated. Please read our <a href=\"/learn\">guide to kombucha</a>, and check with a doctor first if you are pregnant, breastfeeding, immunocompromised or have a medical condition.</p><h2>Content</h2><p>All text, images and branding on this site belong to Mamon Brews and may not be reused without permission.</p><h2>Changes</h2><p>We may update these terms from time to time. The latest version will always be on this page.</p>",
      },
      {
        slug: "delivery-refunds", title: "Delivery & Refund Policy",
        content: "<h2>Delivery areas</h2><p>We deliver across Itanagar and Naharlagun, Arunachal Pradesh. Nearby areas may be possible — choose \"Other\" at checkout and we'll confirm.</p><h2>Timing</h2><p>Most orders are delivered the same or next day. We'll confirm a delivery window on WhatsApp. Pickup from our Naharlagun brewhouse is also available.</p><h2>Delivery charges</h2><p>Charges depend on your area and are shown at checkout. Orders above the free-delivery threshold ship free.</p><h2>Keep it cold</h2><p>Kombucha is a live product. Please refrigerate it as soon as it arrives.</p><h2>Refunds &amp; replacements</h2><p>If a bottle arrives damaged, leaking or not as expected, message us on WhatsApp within 24 hours with a photo and we'll replace it or refund you. Because our drinks are perishable, we can't accept returns of opened bottles for change-of-mind.</p><h2>Cancellations</h2><p>You can cancel any time before your order leaves for delivery — just message us.</p><h2>Online payments</h2><p>Where online payment is used, approved refunds are returned to the original payment method within 5–7 working days.</p>",
      },
    ],
  });
}
