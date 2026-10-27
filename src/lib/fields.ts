import { z } from "zod";

/**
 * A tiny schema language shared by the page builder and the admin's
 * content forms. One descriptor gives us: the admin form UI, server-side
 * Zod validation and the TypeScript type the public component receives.
 */

export type ImageValue = { url: string; alt: string };
export type LinkValue = { label: string; href: string };

type Base<K extends string> = {
  readonly kind: K;
  readonly name: string;
  readonly label: string;
  readonly help?: string;
  readonly placeholder?: string;
  readonly optional?: boolean;
  /** Shown but not editable in the admin (e.g. customer-submitted data). */
  readonly readOnly?: boolean;
  /** Half-width in the admin form grid. */
  readonly half?: boolean;
};

export type TextField = Base<"text"> & { readonly max?: number };
export type TextareaField = Base<"textarea"> & { readonly rows?: number; readonly max?: number };
export type RichTextField = Base<"richtext">;
export type ImageField = Base<"image">;
/** A single media URL (no alt) — stored as a plain string column. */
export type MediaField = Base<"media">;
/** yyyy-mm-dd or yyyy-mm-ddThh:mm strings; empty string = not set. */
export type DateField = Base<"date"> & { readonly withTime?: boolean };
export type LinkField = Base<"link">;
export type ColorField = Base<"color">;
export type NumberField = Base<"number"> & { readonly min?: number; readonly max?: number };
export type BooleanField = Base<"boolean">;
export type SelectField = Base<"select"> & { readonly options: readonly { readonly value: string; readonly label: string }[]; /** Options loaded at runtime (e.g. categories). */ readonly source?: string };
export type TagsField = Base<"tags">;
export type ListField = Base<"list"> & { readonly fields: readonly Field[]; readonly itemLabel: string; readonly max?: number };

export type Field =
  | TextField
  | TextareaField
  | RichTextField
  | ImageField
  | MediaField
  | DateField
  | LinkField
  | ColorField
  | NumberField
  | BooleanField
  | SelectField
  | TagsField
  | ListField;

export type FieldValue<F> = F extends { kind: "select"; options: readonly { value: infer V }[] }
  ? V
  : F extends { kind: "text" | "textarea" | "richtext" | "color" | "media" | "date" }
  ? string
  : F extends { kind: "number"; optional: true }
    ? number | null
  : F extends { kind: "number" }
    ? number
    : F extends { kind: "boolean" }
      ? boolean
      : F extends { kind: "image" }
        ? ImageValue
        : F extends { kind: "link" }
          ? LinkValue
          : F extends { kind: "tags" }
            ? string[]
            : F extends { kind: "list"; fields: infer S extends readonly Field[] }
              ? Array<ValuesOf<S>>
              : never;

export type ValuesOf<FS extends readonly Field[]> = { [F in FS[number] as F["name"]]: FieldValue<F> };

const imageSchema = z.object({ url: z.string().max(2048), alt: z.string().max(300) });
const linkSchema = z.object({ label: z.string().max(80), href: z.string().max(500) });

export function fieldSchema(field: Field): z.ZodType {
  switch (field.kind) {
    case "text":
      return z.string().trim().max(field.max ?? 300);
    case "textarea":
      return z.string().trim().max(field.max ?? 4000);
    case "richtext":
      return z.string().max(100_000);
    case "color":
      return z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Use a hex colour like #1F3A2B");
    case "select":
      return field.source || !field.options.length ? z.string().max(100) : z.enum(field.options.map((o) => o.value) as [string, ...string[]]);
    case "media":
      return z.string().trim().max(2048);
    case "date":
      return z.string().trim().regex(/^$|^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, "Pick a valid date").max(20);
    case "number": {
      const n = z.coerce.number().min(field.min ?? -1e9).max(field.max ?? 1e9);
      return field.optional ? z.union([z.literal("").transform(() => null), z.null(), n]) : n;
    }
    case "boolean":
      return z.boolean();
    case "image":
      return imageSchema;
    case "link":
      return linkSchema;
    case "tags":
      return z.array(z.string().trim().max(60)).max(50);
    case "list":
      return z.array(fieldsSchema(field.fields, true)).max(field.max ?? 60);
  }
}

export function fieldsSchema(fields: readonly Field[], keepId = false) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  // List rows may carry the database id of the record they edit (e.g. a product variant).
  if (keepId) shape.id = z.string().max(40).optional();
  return z.object(shape);
}

export function emptyValue(field: Field): unknown {
  switch (field.kind) {
    case "number":
      return field.optional ? "" : field.min ?? 0;
    case "boolean":
      return false;
    case "image":
      return { url: "", alt: "" };
    case "link":
      return { label: "", href: "" };
    case "tags":
    case "list":
      return [];
    case "select":
      return field.options[0]?.value ?? "";
    case "color":
      return "#1F3A2B";
    default:
      return "";
  }
}

export function emptyValues(fields: readonly Field[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

/** Validate unknown JSON, falling back to defaults field-by-field so a bad value never breaks a page. */
export function parseWithDefaults<FS extends readonly Field[]>(fields: FS, raw: unknown, defaults: ValuesOf<FS>): ValuesOf<FS> {
  const input = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  const fallback = defaults as Record<string, unknown>;
  for (const f of fields) {
    const parsed = fieldSchema(f).safeParse(input[f.name]);
    out[f.name] = parsed.success ? parsed.data : fallback[f.name];
  }
  return out as ValuesOf<FS>;
}
