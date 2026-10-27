"use client";

import { useEffect, useState } from "react";
import { SETTINGS_TABS } from "@/admin/settings-fields";
import { saveSettings } from "@/app/admin/actions/settings";
import { FieldForm } from "@/components/admin/field-form";
import { Card } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export function SettingsTabs({ values }: { values: Record<string, Record<string, unknown>> }) {
  const [tab, setTab] = useState<string>("brand");
  useEffect(() => {
    const h = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deep link from the command palette
    if (SETTINGS_TABS.some((t) => t.key === h)) setTab(h);
  }, []);
  const def = SETTINGS_TABS.find((t) => t.key === tab) ?? SETTINGS_TABS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto lg:flex-col">
        {SETTINGS_TABS.map((t) => (
          <button key={t.key} type="button" aria-current={tab === t.key ? "page" : undefined} onClick={() => { setTab(t.key); history.replaceState(null, "", `#${t.key}`); }} className={cn("h-10 shrink-0 rounded-xl px-3 text-left text-sm", tab === t.key ? "bg-a-accent text-a-accent-ink" : "hover:bg-a-hover")}>{t.label}</button>
        ))}
      </nav>
      <Card title={def.label} description={def.description}>
        <FieldForm key={def.key} fields={def.fields} initial={values[def.key] ?? {}} onSave={(v) => saveSettings(def.key, v)} />
      </Card>
    </div>
  );
}
