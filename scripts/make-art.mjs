// Generates the illustrated seed artwork in /public/seed (run: node scripts/make-art.mjs).
// These stand in for photography until the owner uploads real photos in Admin › Media.
import { mkdirSync, writeFileSync } from "node:fs";

const out = new URL("../public/seed/", import.meta.url);
mkdirSync(out, { recursive: true });

const C = { forest: "#1F3A2B", forest2: "#2E5240", red: "#A8242C", sky: "#9CCBE4", cream: "#F5EFE3", ink: "#141613", amber: "#C98A3D", sage: "#8FA67C", citrus: "#E9C53F", gold: "#F0A62E", saffron: "#F08A24", plum: "#6A2C4E" };

const grain = `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
const grainRect = (w, h) => `<rect width="${w}" height="${h}" filter="url(#g)" opacity=".35"/>`;

function bottle(x, y, s, liquid, label = "MAMON") {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="60" cy="372" rx="54" ry="9" fill="#000" opacity=".12"/>
    <path d="M44 0h32v10H44z" fill="${C.ink}"/>
    <path d="M42 10h36v18c0 10 8 22 20 38 12 16 18 30 18 52v236c0 10-8 18-18 18H22c-10 0-18-8-18-18V118c0-22 6-36 18-52 12-16 20-28 20-38z" fill="#3B2412" opacity=".88"/>
    <path d="M10 160h100v206c0 7-5 12-12 12H22c-7 0-12-5-12-12z" fill="${liquid}" opacity=".85"/>
    <rect x="14" y="190" width="92" height="104" rx="8" fill="${C.cream}"/>
    <circle cx="60" cy="222" r="15" fill="${C.red}"/><path d="M60 207a15 15 0 0 1 0 30a7.5 7.5 0 0 0 0-15a7.5 7.5 0 0 1 0-15z" fill="${C.sky}"/>
    <text x="60" y="262" font-family="Georgia,serif" font-size="13" text-anchor="middle" fill="${C.ink}" letter-spacing="2">${label}</text>
    <text x="60" y="280" font-family="Arial,sans-serif" font-size="7" text-anchor="middle" fill="${C.ink}" opacity=".7" letter-spacing="2">KOMBUCHA</text>
    <path d="M26 120c-4 30-4 170 0 232" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".28" fill="none"/>
  </g>`;
}
const hills = (w, h, cols) => cols.map((c, i) => {
  const base = h * (0.45 + i * 0.13);
  const amp = h * (0.12 - i * 0.02);
  return `<path d="M0 ${base} C ${w * .2} ${base - amp}, ${w * .35} ${base + amp * .4}, ${w * .55} ${base - amp * .6} S ${w * .85} ${base - amp}, ${w} ${base - amp * .2} V ${h} H 0 Z" fill="${c}"/>`;
}).join("");
const sun = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
const bubbles = (n, w, h, c, seed = 1) => {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: n }, () => `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(2 + rnd() * 9).toFixed(1)}" fill="none" stroke="${c}" stroke-width="2" opacity="${(0.3 + rnd() * 0.5).toFixed(2)}"/>`).join("");
};
const leaf = (x, y, s, r, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C40-60 120-70 180-40C130 10 60 30 0 0z" fill="${c}"/><path d="M0 0C60-20 120-35 180-40" stroke="${C.cream}" stroke-width="2" opacity=".5" fill="none"/></g>`;
const svg = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${grain}</defs><rect width="${w}" height="${h}" fill="${bg}"/>${body}${grainRect(w, h)}</svg>`;
const poster = (w, h, bg, fg, title, sub, date, art) => svg(w, h, `${art}
  <text x="70" y="${h - 260}" font-family="Georgia,serif" font-size="88" fill="${fg}" font-style="italic">${title[0]}</text>
  <text x="70" y="${h - 170}" font-family="Georgia,serif" font-size="88" fill="${fg}">${title[1]}</text>
  <text x="72" y="${h - 110}" font-family="Arial,sans-serif" font-size="26" fill="${fg}" letter-spacing="4">${sub}</text>
  <text x="72" y="${h - 66}" font-family="Arial,sans-serif" font-size="22" fill="${fg}" opacity=".75" letter-spacing="3">${date}</text>`, bg);

const files = {
  "hills-dawn.svg": svg(1200, 1500, sun(820, 520, 150, C.gold) + hills(1200, 1500, ["#B9C9A6", C.sage, C.forest2, C.forest]) + bubbles(30, 1200, 700, C.cream, 3), "#F3D9B1"),
  "bottle-row.svg": svg(1600, 1200, hills(1600, 1200, ["#E8DCC6"]) + [C.amber, C.sage, C.citrus, C.gold, C.saffron, C.plum].map((c, i) => bottle(150 + i * 220, 360, 1.5, c)).join(""), C.cream),
  "brew-jar.svg": svg(1200, 1500, `<rect x="330" y="360" width="540" height="820" rx="90" fill="#fff" opacity=".35" stroke="${C.ink}" stroke-width="6"/><rect x="350" y="620" width="500" height="540" rx="70" fill="${C.amber}" opacity=".85"/><ellipse cx="600" cy="640" rx="248" ry="40" fill="#E9D5B0"/><ellipse cx="600" cy="640" rx="248" ry="40" fill="none" stroke="#B9935C" stroke-width="5"/><rect x="300" y="300" width="600" height="90" rx="30" fill="${C.forest}"/>${bubbles(40, 500, 500, C.cream, 7).replace(/cx="/g, 'transform="translate(350 650)" cx="')}`, "#EEDFC6"),
  "carnival-stall.svg": svg(1200, 1500, `<path d="M150 520 L600 300 L1050 520 Z" fill="${C.red}"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${150 + i * 100} 520 q50 70 100 0" fill="${i % 2 ? C.cream : C.red}"/>`).join("")}<rect x="190" y="520" width="820" height="700" fill="${C.forest}"/><rect x="190" y="900" width="820" height="40" fill="#5B3A1E"/>${[C.amber, C.sage, C.citrus, C.gold, C.plum].map((c, i) => bottle(250 + i * 150, 640, 0.65, c)).join("")}<text x="600" y="1080" font-family="Georgia,serif" font-size="64" text-anchor="middle" fill="${C.cream}" font-style="italic">kombucha on tap</text>`, "#F2E3C9"),
  "bay-leaves.svg": svg(1200, 1500, [leaf(140, 360, 2.2, -18, C.sage), leaf(300, 760, 2.6, 12, C.forest2), leaf(520, 1120, 2, -30, "#6F8B5E"), leaf(700, 420, 1.6, 40, C.forest), leaf(120, 1260, 1.8, -8, C.sage)].join(""), C.cream),
  "ginger-lemon.svg": svg(1200, 1500, `${sun(420, 560, 260, C.citrus)}<circle cx="420" cy="560" r="210" fill="none" stroke="${C.cream}" stroke-width="8"/>${Array.from({ length: 10 }, (_, i) => `<path d="M420 560 L${420 + 200 * Math.cos(i * Math.PI / 5)} ${560 + 200 * Math.sin(i * Math.PI / 5)}" stroke="${C.cream}" stroke-width="6"/>`).join("")}<path d="M560 1040c60-80 170-70 220-20 40-60 150-40 160 40 70 0 90 90 30 120-120 60-330 40-410-20-40-30-30-90 0-120z" fill="#D9A55B"/>${bottle(860, 600, 1.2, C.citrus)}`, "#FBF3DA"),
  "pineapple.svg": svg(1200, 1500, `<ellipse cx="520" cy="900" rx="230" ry="320" fill="${C.gold}"/>${Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<path d="M${380 + c * 70 + (r % 2) * 35} ${680 + r * 80} l30 30 l-30 30 l-30 -30z" fill="none" stroke="#B87314" stroke-width="5"/>`).join("")).join("")}${[-40, -15, 10, 35].map((r, i) => `<path d="M520 590 C ${480 + i * 25} 450, ${470 + i * 30} 380, ${430 + i * 50} 300" stroke="${C.forest2}" stroke-width="34" stroke-linecap="round" fill="none" transform="rotate(${r} 520 590)"/>`).join("")}${bottle(840, 700, 1.15, C.gold)}`, "#FFF1D6"),
  "pour.svg": svg(1200, 1500, `<path d="M380 700 h440 l-50 640 h-340z" fill="#fff" opacity=".4" stroke="${C.ink}" stroke-width="6"/><path d="M402 960 h396 l-30 370 h-336z" fill="${C.amber}"/>${bubbles(50, 380, 360, C.cream, 11).replace(/cx="/g, 'transform="translate(410 970)" cx="')}<path d="M700 120 C 690 400, 640 600, 610 960" stroke="${C.amber}" stroke-width="30" fill="none" stroke-linecap="round"/>`, "#EFE3CF"),
  "crates.svg": svg(1200, 1500, `${[0, 1].map((r) => `<rect x="180" y="${560 + r * 360}" width="840" height="320" rx="14" fill="#9B6B3F"/><rect x="200" y="${580 + r * 360}" width="800" height="280" fill="#7A522F"/>`).join("")}${[C.amber, C.sage, C.citrus, C.gold, C.saffron, C.plum].map((c, i) => bottle(225 + i * 130, 300, 0.7, c)).join("")}<text x="600" y="1300" font-family="Georgia,serif" font-size="58" text-anchor="middle" fill="${C.forest}" font-style="italic">for cafés &amp; bars</text>`, C.cream),
  "watch-party.svg": svg(1200, 1500, `<rect x="160" y="300" width="880" height="520" rx="24" fill="${C.ink}"/><rect x="190" y="330" width="820" height="460" fill="${C.forest2}"/><circle cx="600" cy="560" r="90" fill="none" stroke="${C.cream}" stroke-width="6"/><path d="M600 470 v180 M190 560 h820" stroke="${C.cream}" stroke-width="6"/>${[C.citrus, C.amber, C.sage].map((c, i) => bottle(330 + i * 200, 900, 0.9, c)).join("")}`, "#E7D4B5"),
  "fair-hall.svg": svg(1200, 1500, `${Array.from({ length: 5 }, (_, i) => `<rect x="${120 + i * 200}" y="${400 + (i % 2) * 40}" width="160" height="700" fill="${[C.red, C.forest, C.sky, C.amber, C.forest2][i]}" opacity=".9"/>`).join("")}<rect x="0" y="1100" width="1200" height="400" fill="#D8C6A6"/>${bottle(520, 820, 1, C.sage)}<text x="600" y="1300" font-family="Arial,sans-serif" font-size="40" text-anchor="middle" fill="${C.ink}" letter-spacing="10">IITF 2025</text>`, "#F1E6D2"),
  "bottle-return.svg": svg(1200, 1500, `<circle cx="600" cy="700" r="360" fill="none" stroke="${C.forest}" stroke-width="26" stroke-dasharray="900 230"/><path d="M930 560 l60 -40 l10 80z" fill="${C.forest}"/>${bottle(530, 480, 1.1, C.sky)}`, C.cream),
};

files["poster-carnival.svg"] = poster(1200, 1500, C.red, C.cream, ["Food &amp;", "Beverage Carnival"], "STATE BANQUET HALL · ITANAGAR", "HOSTED BY MEZANG ACADEMY", bubbles(60, 1200, 800, C.cream, 5) + bottle(760, 140, 1.4, C.gold));
files["poster-fifa.svg"] = poster(1200, 1500, C.forest, C.cream, ["Final", "Watch Parties"], "2WO · FOXTRAIL SPORTS TV · FUJIN BAR", "KOMBUCHA ON ICE", `<circle cx="820" cy="420" r="230" fill="${C.cream}"/><path d="M820 300 l70 50 -27 82 h-86 l-27 -82z" fill="${C.ink}"/>` + bubbles(40, 1200, 800, C.sky, 9));
files["poster-iitf.svg"] = poster(1200, 1500, C.sky, C.ink, ["Arunachal", "at IITF 2025"], "BHARAT MANDAPAM · NEW DELHI", "INDIA INTERNATIONAL TRADE FAIR", bottle(780, 120, 1.4, C.sage) + leaf(120, 420, 1.8, -20, C.forest2));
files["cover-what-is.svg"] = svg(1600, 1000, `${sun(1150, 380, 220, C.gold)}${bottle(300, 220, 1.6, C.amber)}${bubbles(70, 1600, 1000, C.forest, 13)}`, "#F4E7CF");
files["cover-mocktails.svg"] = svg(1600, 1000, `${[C.citrus, C.plum, C.gold].map((c, i) => `<path d="M${300 + i * 380} 330 h260 l-40 520 h-180z" fill="#fff" opacity=".45" stroke="${C.ink}" stroke-width="5"/><path d="M${318 + i * 380} 520 h224 l-26 320 h-172z" fill="${c}"/>`).join("")}${leaf(1240, 240, 1, 20, C.sage)}`, C.cream);
files["cover-bay-leaf.svg"] = svg(1600, 1000, `${hills(1600, 1000, [C.sage, C.forest2, C.forest])}${leaf(380, 360, 2.2, -12, "#A9BE96")}${bottle(1100, 200, 1.3, C.sage)}`, "#EAE7D4");
files["cover-iitf.svg"] = svg(1600, 1000, `${Array.from({ length: 7 }, (_, i) => `<rect x="${80 + i * 210}" y="200" width="170" height="600" fill="${[C.red, C.sky, C.forest, C.amber, C.red, C.sky, C.forest][i]}" opacity=".85"/>`).join("")}${bottle(720, 380, 1, C.sage)}`, "#F1E6D2");
files["cover-storage.svg"] = svg(1600, 1000, `<rect x="520" y="120" width="560" height="780" rx="40" fill="#fff" stroke="${C.ink}" stroke-width="6"/><path d="M520 420 h560" stroke="${C.ink}" stroke-width="6"/>${[C.amber, C.citrus, C.plum].map((c, i) => bottle(580 + i * 160, 470, 0.95, c)).join("")}<text x="800" y="300" font-family="Arial,sans-serif" font-size="70" text-anchor="middle" fill="${C.sky}">4°C</text>`, "#E6EEF0");
files["hero-hills.svg"] = svg(1600, 900, hills(1600, 900, ["#C9D3B4", C.sage, C.forest2, C.forest]), "#F3E2C4");
files["og-default.svg"] = svg(1200, 630, `${hills(1200, 630, [C.sage, C.forest2, C.forest])}${bottle(860, 70, 1.25, C.amber)}<text x="80" y="230" font-family="Georgia,serif" font-size="84" fill="${C.ink}">Mamon Brews</text><text x="84" y="290" font-family="Arial,sans-serif" font-size="28" fill="${C.ink}" letter-spacing="3">ARUNACHAL'S HANDCRAFTED KOMBUCHA</text>`, C.cream);

for (const [name, content] of Object.entries(files)) writeFileSync(new URL(name, out), content);
console.log(`wrote ${Object.keys(files).length} files`);
