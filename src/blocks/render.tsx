import type { ReactNode } from "react";
import { getProducts } from "@/lib/data";
import { parseWithDefaults } from "@/lib/fields";
import * as D from "./definitions";
import {
  CtaBlock, FeaturesBlock, MarqueeBlock, MythsBlock, PageHeroBlock, RichTextBlock, StatementBlock, StatsBlock, TextImageBlock, TimelineBlock,
} from "./content-blocks";
import {
  BundlesBlock, ContactBlock, EventsBlock, FaqBlock, FlavourShowcaseBlock, FormBlock, GalleryBlock, JournalBlock, MapBlock, MilestonesBlock,
  NewsletterBlock, ProductGridBlock, StockistsBlock, TeamBlock, TestimonialsBlock,
} from "./data-blocks";
import { Hero } from "./hero";

type SectionRow = { id: string; type: string; content: unknown };

async function HeroBlock({ c }: { c: D.HeroContent }) {
  const products = await getProducts();
  const p = products.find((x) => x.slug === c.flavourSlug) ?? products[0];
  return <Hero c={c} flavour={{ name: p?.name ?? "Classic", accent: p?.accent ?? "#C98A3D" }} />;
}

function renderSection(s: SectionRow): ReactNode {
  const parse = <FS extends readonly import("@/lib/fields").Field[]>(def: { fields: FS; defaults: import("@/lib/fields").ValuesOf<FS> }) => parseWithDefaults(def.fields, s.content, def.defaults);
  switch (s.type) {
    case "hero": return <HeroBlock c={parse(D.heroBlock)} />;
    case "pageHero": return <PageHeroBlock c={parse(D.pageHeroBlock)} />;
    case "marquee": return <MarqueeBlock c={parse(D.marqueeBlock)} />;
    case "flavourShowcase": return <FlavourShowcaseBlock c={parse(D.flavourShowcaseBlock)} />;
    case "features": return <FeaturesBlock c={parse(D.featuresBlock)} />;
    case "textImage": return <TextImageBlock c={parse(D.textImageBlock)} />;
    case "timeline": return <TimelineBlock c={parse(D.timelineBlock)} />;
    case "stats": return <StatsBlock c={parse(D.statsBlock)} />;
    case "stockists": return <StockistsBlock c={parse(D.stockistsBlock)} />;
    case "events": return <EventsBlock c={parse(D.eventsBlock)} />;
    case "testimonials": return <TestimonialsBlock c={parse(D.testimonialsBlock)} />;
    case "gallery": return <GalleryBlock c={parse(D.galleryBlock)} />;
    case "cta": return <CtaBlock c={parse(D.ctaBlock)} />;
    case "newsletter": return <NewsletterBlock c={parse(D.newsletterBlock)} />;
    case "faq": return <FaqBlock c={parse(D.faqBlock)} />;
    case "richText": return <RichTextBlock c={parse(D.richTextBlock)} />;
    case "statement": return <StatementBlock c={parse(D.statementBlock)} />;
    case "myths": return <MythsBlock c={parse(D.mythsBlock)} />;
    case "map": return <MapBlock c={parse(D.mapBlock)} />;
    case "form": return <FormBlock c={parse(D.formBlock)} />;
    case "productGrid": return <ProductGridBlock c={parse(D.productGridBlock)} />;
    case "bundles": return <BundlesBlock c={parse(D.bundlesBlock)} />;
    case "team": return <TeamBlock c={parse(D.teamBlock)} />;
    case "milestones": return <MilestonesBlock c={parse(D.milestonesBlock)} />;
    case "journal": return <JournalBlock c={parse(D.journalBlock)} />;
    case "contact": return <ContactBlock c={parse(D.contactBlock)} />;
    default: return null;
  }
}

export function Blocks({ sections }: { sections: SectionRow[] }) {
  return <>{sections.map((s) => <div key={s.id} data-block={s.type}>{renderSection(s)}</div>)}</>;
}
