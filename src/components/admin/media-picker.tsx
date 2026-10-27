"use client";

import { Dialog } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { deleteMedia, listMedia, updateMedia, uploadMedia, type MediaItem } from "@/app/admin/actions/media";
import { cn, isSvg } from "@/lib/utils";
import { AButton, AInput, ALabel, ASelect } from "./ui";

type Picked = { url: string; alt: string };

// ─── Upload + crop ──────────────────────────────────────────────────

async function cropToFile(src: string, area: Area, name: string, type: string): Promise<{ file: File; width: number; height: number }> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const maxW = 2400;
  const scale = Math.min(1, maxW / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  canvas.getContext("2d")?.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  const outType = type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? new Blob()), outType, 0.88));
  const ext = outType === "image/png" ? "png" : "webp";
  return { file: new File([blob], name.replace(/\.[^.]+$/, `.${ext}`), { type: outType }), width: canvas.width, height: canvas.height };
}

export function UploadPanel({ onUploaded, defaultFolder = "General" }: { onUploaded: (m: Picked & { id: string }) => void; defaultFolder?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | "original">("original");
  const [natural, setNatural] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [alt, setAlt] = useState("");
  const [folder, setFolder] = useState(defaultFolder);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  const choose = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setSrc(url);
    setAlt(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    const i = new Image();
    i.onload = () => setNatural(i.width / i.height);
    i.src = url;
  };

  const upload = async () => {
    if (!file || !src) return;
    if (!alt.trim()) { toast.error("Add a short description (alt text) — it helps accessibility and SEO."); return; }
    setBusy(true);
    try {
      let out: { file: File; width?: number; height?: number } = { file };
      if (!isSvg(file.name) && area && file.type !== "image/gif") out = await cropToFile(src, area, file.name, file.type);
      const fd = new FormData();
      fd.set("file", out.file);
      fd.set("alt", alt);
      fd.set("folder", folder);
      if (out.width) fd.set("width", String(out.width));
      if (out.height) fd.set("height", String(out.height));
      const res = await uploadMedia(fd);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Uploaded");
      onUploaded({ ...res.data });
      setFile(null);
      setSrc(null);
    } finally {
      setBusy(false);
    }
  };

  if (!src) {
    return (
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files[0]); }}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-a-line px-6 py-10 text-sm text-a-muted transition-colors hover:border-a-accent hover:text-a-text"
      >
        <svg viewBox="0 0 24 24" className="size-7" aria-hidden><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span><strong className="text-a-text">Click to upload</strong> or drop an image here</span>
        <span className="text-xs">JPG, PNG, WebP or SVG · up to 10 MB</span>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative h-72 overflow-hidden rounded-2xl bg-black/80">
        <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect === "original" ? natural : aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, px) => setArea(px)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <ALabel htmlFor="crop-aspect">Crop</ALabel>
          <ASelect id="crop-aspect" value={String(aspect)} onChange={(e) => setAspect(e.target.value === "original" ? "original" : Number(e.target.value))}>
            <option value="original">Original</option>
            <option value={1}>Square 1:1</option>
            <option value={4 / 5}>Portrait 4:5</option>
            <option value={3 / 4}>Portrait 3:4</option>
            <option value={16 / 9}>Wide 16:9</option>
            <option value={1200 / 630}>Social share 1.91:1</option>
          </ASelect>
        </div>
        <div>
          <ALabel htmlFor="crop-zoom">Zoom</ALabel>
          <input id="crop-zoom" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-3 w-full accent-[var(--a-accent)]" />
        </div>
        <div>
          <ALabel htmlFor="up-folder">Folder</ALabel>
          <AInput id="up-folder" value={folder} onChange={(e) => setFolder(e.target.value)} list="media-folders" />
        </div>
      </div>
      <div>
        <ALabel htmlFor="up-alt" hint="Describe the photo for screen readers & Google">Alt text</ALabel>
        <AInput id="up-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <AButton onClick={() => { setSrc(null); setFile(null); }}>Cancel</AButton>
        <AButton variant="primary" onClick={upload} disabled={busy}>{busy ? "Uploading…" : "Upload"}</AButton>
      </div>
    </div>
  );
}

// ─── Library grid (used by the picker and the Media page) ───────────

export function MediaLibrary({ onPick, manage = false }: { onPick?: (m: Picked) => void; manage?: boolean }) {
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("All");
  const [data, setData] = useState<Awaited<ReturnType<typeof listMedia>> | null>(null);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => setData(await listMedia({ q, folder })), [q, folder]);
  useEffect(() => {
    const t = window.setTimeout(load, 200);
    return () => window.clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <AInput type="search" placeholder="Search by alt text or filename" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" aria-label="Search media" />
        <ASelect value={folder} onChange={(e) => setFolder(e.target.value)} className="sm:w-48" aria-label="Folder">
          <option>All</option>
          {data?.folders.map((f) => <option key={f.name} value={f.name}>{f.name} ({f.count})</option>)}
        </ASelect>
        <AButton variant="primary" className="sm:ml-auto" onClick={() => setShowUpload((s) => !s)}>{showUpload ? "Close upload" : "Upload image"}</AButton>
      </div>
      <datalist id="media-folders">{data?.folders.map((f) => <option key={f.name} value={f.name} />)}</datalist>
      {showUpload ? <UploadPanel defaultFolder={folder === "All" ? "General" : folder} onUploaded={(m) => { setShowUpload(false); void load(); if (onPick) onPick(m); }} /> : null}
      {!data ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i} className="skeleton aspect-square" />)}</div>
      ) : data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-a-line p-10 text-center text-sm text-a-muted">No images yet. Upload your first photo — product shots, events, the brewhouse.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {data.items.map((m) => (
            <li key={m.id} className="group relative">
              <button
                type="button"
                onClick={() => (onPick ? onPick({ url: m.url, alt: m.alt }) : setEditing(m))}
                className="block aspect-square w-full overflow-hidden rounded-xl border border-a-line bg-a-hover focus-visible:ring-2 focus-visible:ring-a-accent"
                title={m.alt || m.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails of arbitrary uploads */}
                <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />
              </button>
              {manage ? <p className="mt-1 truncate text-xs text-a-muted">{m.alt || <span className="text-[#d92d20]">No alt text</span>}</p> : null}
            </li>
          ))}
        </ul>
      )}
      {editing ? <MediaEditDialog item={editing} onClose={() => setEditing(null)} onChanged={() => { setEditing(null); void load(); }} /> : null}
    </div>
  );
}

function MediaEditDialog({ item, onClose, onChanged }: { item: MediaItem; onClose: () => void; onChanged: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [folder, setFolder] = useState(item.folder);
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="admin-root fixed left-1/2 top-1/2 z-50 w-[min(42rem,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-a-line bg-a-panel p-5 shadow-2xl">
          <Dialog.Title className="font-semibold">Edit image</Dialog.Title>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
            <img src={item.url} alt={item.alt} className="max-h-72 w-full rounded-xl object-contain bg-a-hover" />
            <div className="space-y-3">
              <div><ALabel htmlFor="me-alt">Alt text</ALabel><AInput id="me-alt" value={alt} onChange={(e) => setAlt(e.target.value)} /></div>
              <div><ALabel htmlFor="me-folder">Folder</ALabel><AInput id="me-folder" value={folder} onChange={(e) => setFolder(e.target.value)} list="media-folders" /></div>
              <p className="break-all text-xs text-a-muted">{item.filename} · {(item.size / 1024).toFixed(0)} KB{item.width ? ` · ${item.width}×${item.height}` : ""}</p>
              <AButton size="sm" onClick={() => { void navigator.clipboard.writeText(item.url); toast.success("URL copied"); }}>Copy URL</AButton>
            </div>
          </div>
          <div className="mt-5 flex justify-between gap-2">
            <AButton variant="danger-ghost" onClick={async () => {
              if (!window.confirm("Delete this image? Pages still using it will show an empty space.")) return;
              const r = await deleteMedia(item.id);
              if (r.ok) { toast.success("Deleted"); onChanged(); } else toast.error(r.error);
            }}>Delete</AButton>
            <div className="flex gap-2">
              <AButton onClick={onClose}>Cancel</AButton>
              <AButton variant="primary" onClick={async () => {
                const r = await updateMedia(item.id, { alt, folder });
                if (r.ok) { toast.success("Saved"); onChanged(); } else toast.error(r.error);
              }}>Save</AButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function MediaPickerDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (m: Picked) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content aria-describedby={undefined} className={cn("admin-root fixed inset-x-2 bottom-2 top-10 z-50 flex flex-col overflow-hidden rounded-2xl border border-a-line bg-a-panel shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:h-[80vh] sm:w-[min(60rem,94vw)] sm:-translate-x-1/2 sm:-translate-y-1/2", typeof document !== "undefined" && document.querySelector(".admin-root.dark") ? "dark" : "")}>
          <div className="flex items-center justify-between border-b border-a-line px-5 py-3">
            <Dialog.Title className="font-semibold">Choose an image</Dialog.Title>
            <Dialog.Close className={cn("grid size-8 place-items-center rounded-lg hover:bg-a-hover")} aria-label="Close">✕</Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{open ? <MediaLibrary onPick={onPick} /> : null}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
