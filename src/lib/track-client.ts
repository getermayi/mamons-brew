export type TrackType = "whatsapp_click" | "add_to_cart" | "checkout_start" | "phone_click" | "instagram_click";

/** Fire-and-forget analytics that survives page navigation (sendBeacon). */
export function track(type: TrackType, label?: string) {
  try {
    const body = JSON.stringify({ type, label: label?.slice(0, 120), path: window.location.pathname });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
  } catch {
    /* analytics must never break the page */
  }
}
