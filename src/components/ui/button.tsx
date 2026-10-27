import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pill buttons with a "fill on hover" sweep: a layer rises from the bottom
 * in the hover colour while the label stays put.
 */
export const buttonVariants = cva(
  "group/btn relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-medium transition-[color,box-shadow,transform] duration-500 ease-[var(--ease-out)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-offset-4 before:absolute before:inset-0 before:-z-10 before:translate-y-[101%] before:rounded-[inherit] before:transition-transform before:duration-500 before:ease-[var(--ease-out)] hover:before:translate-y-0",
  {
    variants: {
      variant: {
        primary: "bg-forest text-cream before:bg-brand",
        red: "bg-brand text-cream before:bg-ink",
        ink: "bg-ink text-cream before:bg-forest",
        cream: "bg-cream text-ink before:bg-sky",
        outline: "border border-current bg-transparent before:bg-ink hover:text-cream",
        "outline-light": "border border-cream/50 text-cream before:bg-cream hover:text-ink",
        ghost: "before:bg-ink/5 hover:before:translate-y-0",
        tint: "bg-tint text-tint-ink before:bg-ink hover:text-cream",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-[0.95rem]",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ComponentProps<"button"> & Variants) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ className, variant, size, href, children, external, ...props }: Omit<ComponentProps<typeof Link>, "href"> & Variants & { href: string; children: ReactNode; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant, size }), className)} {...(props as ComponentProps<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("size-4 transition-transform duration-500 ease-[var(--ease-out)] group-hover/btn:translate-x-1", className)} aria-hidden>
      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
