"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MediaPickerDialog } from "./media-picker";

/** Tiptap editor for long-form content. Output is sanitised again on the server. */
export function RichTextEditor({ value, onChange, id, disabled }: { value: string; onChange: (html: string) => void; id?: string; disabled?: boolean }) {
  const [picking, setPicking] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
    ],
    content: value,
    editorProps: { attributes: { class: "prose-brew min-h-56 px-4 py-3 outline-none text-a-text [--ink:var(--a-text)]", id: id ?? "", "aria-label": "Rich text editor" } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-a-line bg-a-panel focus-within:border-a-accent">
      {editor ? <Toolbar editor={editor} onImage={() => setPicking(true)} /> : <div className="h-11 border-b border-a-line" />}
      <EditorContent editor={editor} />
      <MediaPickerDialog
        open={picking}
        onOpenChange={setPicking}
        onPick={(m) => {
          editor?.chain().focus().setImage({ src: m.url, alt: m.alt }).run();
          setPicking(false);
        }}
      />
    </div>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const btn = (active: boolean) => cn("grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm transition-colors", active ? "bg-a-accent text-a-accent-ink" : "hover:bg-a-hover");
  const tools: { label: string; title: string; active: boolean; run: () => void }[] = [
    { label: "H2", title: "Heading", active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "H3", title: "Subheading", active: editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "B", title: "Bold", active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "I", title: "Italic", active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "•", title: "Bullet list", active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "1.", title: "Numbered list", active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "❝", title: "Quote", active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    {
      label: "🔗", title: "Link", active: editor.isActive("link"), run: () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
        if (url === null) return;
        if (!url) editor.chain().focus().unsetLink().run();
        else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      },
    },
    { label: "🖼", title: "Image", active: false, run: onImage },
    { label: "↶", title: "Undo", active: false, run: () => editor.chain().focus().undo().run() },
    { label: "↷", title: "Redo", active: false, run: () => editor.chain().focus().redo().run() },
  ];
  return (
    <div className="flex flex-wrap gap-1 border-b border-a-line bg-a-bg/60 p-1.5" role="toolbar" aria-label="Formatting">
      {tools.map((t) => (
        <button key={t.title} type="button" title={t.title} aria-label={t.title} aria-pressed={t.active} onClick={t.run} className={btn(t.active)}>{t.label}</button>
      ))}
    </div>
  );
}
