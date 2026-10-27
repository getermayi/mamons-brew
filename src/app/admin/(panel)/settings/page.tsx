import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { announcementSchema, deliveryZonesSchema, featuresSchema, hoursSchema, socialsSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/session";
import { SettingsTabs } from "./settings-tabs";

export default async function SettingsPage() {
  await requireAdmin("OWNER");
  const [s, t] = await Promise.all([db.siteSettings.findUniqueOrThrow({ where: { id: "site" } }), db.themeSettings.findUnique({ where: { id: "theme" } })]);
  const socials = socialsSchema.catch({ instagram: "", facebook: "", youtube: "", x: "" }).parse(s.socials);
  const ann = announcementSchema.catch({ enabled: false, text: "", linkLabel: "", href: "", bg: "#141613", fg: "#F5EFE3" }).parse(s.announcement);
  const features = featuresSchema.parse(s.features);

  const values = {
    brand: { brandName: s.brandName, brandStyled: s.brandStyled, tagline: s.tagline, missionLine: s.missionLine, logoUrl: s.logoUrl ?? "", logoDarkUrl: s.logoDarkUrl ?? "", faviconUrl: s.faviconUrl ?? "", ogImageUrl: s.ogImageUrl ?? "" },
    contact: { whatsapp: s.whatsapp, phone: s.phone, email: s.email ?? "", fssai: s.fssai ?? "", address: s.address, city: s.city, region: s.region, postalCode: s.postalCode ?? "", hours: hoursSchema.catch([]).parse(s.hours), ...socials },
    theme: t ? { forest: t.forest, brandRed: t.brandRed, sky: t.sky, cream: t.cream, ink: t.ink, radius: t.radius, displayFont: t.displayFont, sansFont: t.sansFont, grain: t.grain } : {},
    announcement: ann,
    features: { ...features, animation: s.animation },
    orders: { whatsappTemplate: s.whatsappTemplate, deliveryZones: deliveryZonesSchema.catch([]).parse(s.deliveryZones), minOrderValue: s.minOrderValue, freeDeliveryAbove: s.freeDeliveryAbove ?? "", deliveryEnabled: s.deliveryEnabled, pickupEnabled: s.pickupEnabled, pickupAddress: s.pickupAddress ?? "" },
  };

  return (
    <>
      <PageHeader title="Site settings" description="Global details used across every page. Saving updates the live site immediately." />
      <SettingsTabs values={values} />
    </>
  );
}
