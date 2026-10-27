"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createPage } from "@/app/admin/actions/pages";
import { AButton } from "@/components/admin/ui";

export function NewPageButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <AButton variant="primary" disabled={pending} onClick={() => {
      const title = window.prompt("Page title", "");
      if (!title) return;
      start(async () => {
        const r = await createPage({ title });
        if (r.ok) router.push(`/admin/pages/${r.data.id}`);
        else toast.error(r.error);
      });
    }}>+ New page</AButton>
  );
}
