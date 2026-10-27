import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="admin-root grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#1F3A2B] p-12 text-[#F5EFE3] lg:flex lg:flex-col lg:justify-between">
        <p className="text-sm tracking-[0.2em] text-[#9CCBE4]">MAMON BREWS 🍀</p>
        <div>
          <p className="font-display text-6xl leading-[0.95]">Brewed in the <em className="accent">hills.</em><br />Managed from anywhere.</p>
          <p className="mt-6 max-w-sm text-[#F5EFE3]/70">Orders, flavours, pages and photos — everything on the website, editable from your phone.</p>
        </div>
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full opacity-40" aria-hidden><path d="M0 160 C 240 70, 420 220, 660 110 S 1020 60, 1200 150 V300 H0Z" fill="#8FA67C" /><path d="M0 230 C 240 160, 420 280, 660 200 S 1020 170, 1200 230 V300 H0Z" fill="#2E5240" /></svg>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-a-muted">Sign in to manage the Mamon Brews website.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
