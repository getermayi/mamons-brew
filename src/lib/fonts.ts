import { DM_Sans, DM_Serif_Display, Fraunces, Instrument_Sans, Instrument_Serif, Inter, Manrope, Playfair_Display } from "next/font/google";

/** The curated font list offered in Admin › Settings › Theme. Only the chosen pair is preloaded. */

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK", "opsz"], display: "swap", style: ["normal", "italic"] });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument-serif", weight: "400", style: ["normal", "italic"], display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ["normal", "italic"], display: "swap", preload: false });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], variable: "--font-dm-serif", weight: "400", style: ["normal", "italic"], display: "swap", preload: false });

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: false });

export const DISPLAY_FONTS = {
  fraunces: { label: "Fraunces — soft editorial serif", font: fraunces },
  "instrument-serif": { label: "Instrument Serif — sharp & elegant", font: instrumentSerif },
  playfair: { label: "Playfair Display — classic contrast", font: playfair },
  "dm-serif": { label: "DM Serif Display — bold & warm", font: dmSerif },
} as const;

export const SANS_FONTS = {
  instrument: { label: "Instrument Sans — crisp geometric", font: instrumentSans },
  inter: { label: "Inter — neutral workhorse", font: inter },
  manrope: { label: "Manrope — friendly rounded", font: manrope },
  "dm-sans": { label: "DM Sans — soft geometric", font: dmSans },
} as const;

export type DisplayFontKey = keyof typeof DISPLAY_FONTS;
export type SansFontKey = keyof typeof SANS_FONTS;

export function fontClassNames() {
  return [...Object.values(DISPLAY_FONTS), ...Object.values(SANS_FONTS)].map((f) => f.font.variable).join(" ");
}

export function fontVars(display: string, sans: string) {
  const d = DISPLAY_FONTS[display as DisplayFontKey] ?? DISPLAY_FONTS.fraunces;
  const s = SANS_FONTS[sans as SansFontKey] ?? SANS_FONTS.instrument;
  return { display: d.font.style.fontFamily, sans: s.font.style.fontFamily };
}
