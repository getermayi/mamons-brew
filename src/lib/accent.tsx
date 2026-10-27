import { Fragment } from "react";

/** "Brewed in the *hills.*" → [{text:"Brewed in the "}, {text:"hills.", accent:true}] */
export function parseAccent(text: string) {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((t) => (t.startsWith("*") && t.endsWith("*") ? { text: t.slice(1, -1), accent: true } : { text: t, accent: false }));
}

export function AccentText({ text }: { text: string }) {
  return (
    <>
      {parseAccent(text).map((p, i) => (p.accent ? <em key={i} className="accent">{p.text}</em> : <Fragment key={i}>{p.text}</Fragment>))}
    </>
  );
}

export function stripAccent(text: string) {
  return text.replace(/\*/g, "");
}
