import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getSettings, getTheme } from "@/lib/data";
import { fontClassNames, fontVars } from "@/lib/fonts";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const HEX = /^#[0-9a-f]{3,8}$/i;
const safe = (v: string, fallback: string) => (HEX.test(v) ? v : fallback);

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.brandName} — ${s.tagline}`, template: `%s · ${s.brandName}` },
    description: `${s.tagline}. Brewed in ${s.city}, ${s.region}. Delivered across Itanagar and Naharlagun.`,
    applicationName: s.brandName,
    openGraph: { type: "website", siteName: s.brandName, locale: "en_IN" },
    twitter: { card: "summary_large_image" },
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#F5EFE3",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [theme, settings] = await Promise.all([getTheme(), getSettings()]);
  const fonts = fontVars(theme.displayFont, theme.sansFont);
  const css = `:root{--forest:${safe(theme.forest, "#1F3A2B")};--brand-red:${safe(theme.brandRed, "#A8242C")};--sky:${safe(theme.sky, "#9CCBE4")};--cream:${safe(theme.cream, "#F5EFE3")};--ink:${safe(theme.ink, "#141613")};--radius:${Math.min(40, Math.max(0, theme.radius))}px;--font-display-family:${fonts.display};--font-sans-family:${fonts.sans}}`;
  const motion = settings.animation === "OFF" ? "off" : settings.animation === "REDUCED" ? "reduced" : "full";

  return (
    <html lang="en-IN" data-motion={motion} className={fontClassNames()} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body className={theme.grain ? "grain" : undefined}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
