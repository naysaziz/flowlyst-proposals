"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AIProviderModel } from "@/types";

const providerMeta: Record<string, { color: string; logo: React.ReactNode }> = {
  anthropic: {
    color: "bg-orange-50 text-orange-700 border-orange-200",
    logo: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-orange-600">
        <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-3.654 0H6.57L0 20h3.603l1.357-3.415h6.396l1.357 3.415h3.603L10.173 3.52zm-1.31 10.285 2.063-5.18 2.063 5.18H8.863z" />
      </svg>
    ),
  },
  openai: {
    color: "bg-green-50 text-green-700 border-green-200",
    logo: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
  },
  google: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    logo: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
};

const providerOrder = ["anthropic", "openai", "google"];

export default function AIModelsClient({ models }: { models: AIProviderModel[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(models);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleActive(id: string, active: boolean) {
    setToggling(id);
    const { error } = await supabase.from("ai_providers").update({ active }).eq("id", id);
    if (!error) setItems(items.map((m) => (m.id === id ? { ...m, active } : m)));
    setToggling(null);
  }

  const grouped = providerOrder.reduce<Record<string, AIProviderModel[]>>((acc, provider) => {
    acc[provider] = items.filter((m) => m.provider === provider);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--dark)]">AI Models</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Enable or disable models available in the proposal writer.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {providerOrder.map((provider) => {
          const providerModels = grouped[provider];
          if (!providerModels?.length) return null;
          const meta = providerMeta[provider];

          return (
            <div key={provider} className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
              {/* Provider header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[12px] font-bold ${meta.color}`}>
                  {meta.logo}
                  <span className="capitalize">{provider}</span>
                </div>
                <span className="text-[12px] text-[var(--muted)]">
                  {providerModels.filter((m) => m.active).length} of {providerModels.length} active
                </span>
              </div>

              {/* Models list */}
              <div className="divide-y divide-[#F9F9F9]">
                {providerModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="text-[14px] font-semibold text-[var(--dark)]">{model.label}</div>
                      <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">{model.slug}</div>
                    </div>
                    <button
                      onClick={() => toggleActive(model.id, !model.active)}
                      disabled={toggling === model.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                        model.active ? "bg-[var(--teal)]" : "bg-[#DDDDE0]"
                      }`}
                      role="switch"
                      aria-checked={model.active}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          model.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[12px] text-[var(--muted)] mt-6">
        Disabled models won&apos;t appear in the proposal writer dropdown. At least one model must remain active.
      </p>
    </div>
  );
}
