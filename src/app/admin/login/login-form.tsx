"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AButton, AInput, ALabel } from "@/components/admin/ui";
import { loginSchema } from "@/lib/schemas";
import { login } from "../actions/session";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await login(values);
    if (res.ok) { router.replace("/admin"); router.refresh(); }
    else setError(res.error);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
      <div>
        <ALabel htmlFor="email" error={errors.email?.message}>Email</ALabel>
        <AInput id="email" type="email" autoComplete="username" className="h-12 text-base" aria-invalid={Boolean(errors.email)} {...register("email")} />
      </div>
      <div>
        <ALabel htmlFor="password" error={errors.password?.message}>Password</ALabel>
        <AInput id="password" type="password" autoComplete="current-password" className="h-12 text-base" aria-invalid={Boolean(errors.password)} {...register("password")} />
      </div>
      {error ? <p role="alert" className="rounded-xl bg-[#f04438]/10 px-3 py-2 text-sm text-[#b42318]">{error}</p> : null}
      <AButton type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</AButton>
      <p className="text-center text-xs text-a-muted">Forgot your password? Ask the site owner to reset it in Users &amp; roles.</p>
    </form>
  );
}
