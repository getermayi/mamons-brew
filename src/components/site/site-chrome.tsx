import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-store";
import { Cursor } from "@/components/motion/cursor";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getLegalList, getNav, getSettings } from "@/lib/data";
import { AnnouncementBar } from "./announcement-bar";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { Footer } from "./footer";
import { Header } from "./header";
import { SiteProvider } from "./site-context";

/** Everything around a public page: providers, header, footer, cart, motion. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, header, footer, legal] = await Promise.all([getSettings(), getNav("header"), getNav("footer"), getLegalList()]);
  const level = settings.animation === "OFF" ? "off" : settings.animation === "REDUCED" ? "reduced" : "full";

  return (
    <MotionProvider level={level}>
      <SiteProvider
        value={{
          brandName: settings.brandName, whatsapp: settings.whatsapp, phone: settings.phone, instagram: settings.socials.instagram, features: settings.features,
          deliveryZones: settings.deliveryZones, minOrderValue: settings.minOrderValue, freeDeliveryAbove: settings.freeDeliveryAbove,
          deliveryEnabled: settings.deliveryEnabled, pickupEnabled: settings.pickupEnabled, pickupAddress: settings.pickupAddress,
        }}
      >
        <CartProvider>
          <a href="#main" className="sr-only z-[200] rounded-full bg-ink px-5 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
          <div className="flex min-h-svh flex-col">
            <AnnouncementBar a={settings.announcement} />
            <Header nav={header} brandName={settings.brandName} logoUrl={settings.logoUrl} />
            <main id="main" className="flex-1">{children}</main>
            <Footer settings={settings} nav={footer} legal={legal} />
          </div>
          <CartDrawer freeDeliveryAbove={settings.freeDeliveryAbove} />
          {settings.features.floatingWhatsapp ? <FloatingWhatsApp /> : null}
          <SmoothScroll />
          <Cursor />
          <LocalBusinessJsonLd settings={settings} />
        </CartProvider>
      </SiteProvider>
    </MotionProvider>
  );
}
