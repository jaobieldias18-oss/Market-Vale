"use client";

import { useState } from "react";

export interface StoreTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export default function StoreTabs({
  tabs,
  accent,
}: {
  tabs: StoreTab[];
  accent: string;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");

  if (tabs.length <= 1) {
    return <>{tabs[0]?.content ?? null}</>;
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        className="flex flex-wrap justify-center gap-1.5"
        aria-label="Seções do site"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
              style={isActive ? { backgroundColor: accent } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-8">{active?.content ?? null}</div>
    </div>
  );
}