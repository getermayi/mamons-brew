import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared OG card: big serif title, a tinted circle and a simple bottle silhouette. */
export function ogCard({ eyebrow, title, subtitle, accent }: { eyebrow: string; title: string; subtitle: string; accent: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F5EFE3", color: "#141613", fontFamily: "Georgia, serif", position: "relative" }}>
        <div style={{ position: "absolute", right: 70, top: 60, width: 500, height: 500, borderRadius: 999, background: accent, display: "flex" }} />
        <div style={{ position: "absolute", right: 250, top: 120, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 50, height: 34, background: "#141613", borderRadius: 6 }} />
          <div style={{ width: 140, height: 360, background: "#4a2a0f", borderRadius: "60px 60px 22px 22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 112, height: 120, background: "#F5EFE3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>MAMON</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 70, width: 680 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#A8242C", fontFamily: "sans-serif" }}>{eyebrow.toUpperCase()}</div>
          <div style={{ fontSize: 96, lineHeight: 1, marginTop: 18 }}>{title}</div>
          <div style={{ fontSize: 32, marginTop: 22, color: "#4a4d47" }}>{subtitle}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
