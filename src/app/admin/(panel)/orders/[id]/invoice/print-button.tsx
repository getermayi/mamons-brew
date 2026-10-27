"use client";

import { AButton } from "@/components/admin/ui";

export function PrintButton() {
  return <AButton variant="primary" onClick={() => window.print()}>Print / Save as PDF</AButton>;
}
