"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#F5EFE3", color: "#141613", fontFamily: "Georgia, serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 48, fontWeight: 400, margin: 0 }}>The brewhouse needs a minute.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", opacity: 0.7 }}>Please try again, or WhatsApp us on +91 76298 23243.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "14px 28px", borderRadius: 999, border: 0, background: "#1F3A2B", color: "#F5EFE3", fontSize: 16, cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
