"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useModel } from "@/contexts/ModelContext";
import type { AIProviderModel } from "@/types";

const PROVIDER_ICONS: Record<string, string> = {
  anthropic: "◆",
  openai: "●",
  google: "▲",
};

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "text-[#CC6B49]",
  openai: "text-[#4A8B5C]",
  google: "text-[#4A7FD4]",
};

export default function ModelSelector() {
  const { model, setModel } = useModel();
  const [models, setModels] = useState<AIProviderModel[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("ai_providers")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setModels(data);
      });
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = models.find((m) => m.slug === model);

  // Group by provider
  const grouped = models.reduce<Record<string, AIProviderModel[]>>(
    (acc, m) => {
      if (!acc[m.provider]) acc[m.provider] = [];
      acc[m.provider].push(m);
      return acc;
    },
    {}
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-[7px] rounded-[8px] bg-[var(--bg)] hover:bg-[var(--light)] border border-[var(--light)] hover:border-[var(--muted)] transition-all text-[12.5px] font-semibold text-[var(--mid)]"
      >
        {current && (
          <span
            className={`text-[10px] font-black ${
              PROVIDER_COLORS[current.provider] ?? "text-[var(--muted)]"
            }`}
          >
            {PROVIDER_ICONS[current.provider] ?? "●"}
          </span>
        )}
        <span className="text-[var(--dark)]">
          {current?.label ?? "Select model"}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-[220px] bg-white rounded-[12px] shadow-md border border-[var(--light)] z-50 py-1.5 animate-fade-up">
          {Object.entries(grouped).map(([provider, providerModels]) => (
            <div key={provider}>
              <div className="px-3.5 py-1.5 text-[9.5px] font-extrabold uppercase tracking-[1.2px] text-[var(--muted)] flex items-center gap-1.5">
                <span
                  className={`text-[9px] ${
                    PROVIDER_COLORS[provider] ?? "text-[var(--muted)]"
                  }`}
                >
                  {PROVIDER_ICONS[provider]}
                </span>
                {provider}
              </div>
              {providerModels.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => {
                    setModel(m.slug);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[12.5px] font-semibold transition-colors flex items-center justify-between ${
                    m.slug === model
                      ? "text-[var(--teal)] bg-[var(--teal-light)]"
                      : "text-[var(--dark)] hover:bg-[var(--bg)]"
                  }`}
                >
                  {m.label}
                  {m.slug === model && (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
