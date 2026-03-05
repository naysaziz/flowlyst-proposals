"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrganizationType } from "@/types";

export default function OrgTypesClient({ orgTypes }: { orgTypes: OrganizationType[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(orgTypes);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<OrganizationType>>>({});

  function startEdit(id: string) {
    const item = items.find((o) => o.id === id)!;
    setDrafts((d) => ({ ...d, [id]: { ...item } }));
    setEditing(id);
  }

  function cancelEdit(id: string) {
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    setEditing(null);
  }

  function updateDraft(id: string, field: keyof OrganizationType, value: string | boolean) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function save(id: string) {
    setSaving(id);
    const draft = drafts[id];
    const { error } = await supabase
      .from("organization_types")
      .update({
        label: draft.label,
        description: draft.description,
        default_intro: draft.default_intro,
        default_about: draft.default_about,
        ai_tone_notes: draft.ai_tone_notes,
        active: draft.active,
      })
      .eq("id", id);

    if (!error) {
      setItems(items.map((o) => (o.id === id ? { ...o, ...draft } : o)));
      setEditing(null);
      setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    }
    setSaving(null);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--dark)]">Org Types</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Configure AI tone and default language for each client industry.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((org) => {
          const isEditing = editing === org.id;
          const draft = drafts[org.id] ?? org;

          return (
            <div key={org.id} className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-extrabold text-[var(--dark)]">{org.label}</span>
                  <span className="text-[11px] font-bold text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">
                    {org.slug}
                  </span>
                  {!org.active && (
                    <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      inactive
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => cancelEdit(org.id)}
                        className="px-3.5 py-1.5 rounded-[8px] text-[12.5px] font-semibold text-[var(--mid)] hover:bg-[var(--bg)] transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => save(org.id)}
                        disabled={saving === org.id}
                        className="px-4 py-1.5 rounded-[8px] text-[12.5px] font-bold bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] transition disabled:opacity-60"
                      >
                        {saving === org.id ? "Saving…" : "Save"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(org.id)}
                      className="px-4 py-1.5 rounded-[8px] text-[12.5px] font-bold border border-[#DDDDE0] text-[var(--mid)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="px-6 py-5 grid grid-cols-1 gap-4">
                <Field
                  label="Description"
                  value={draft.description ?? ""}
                  editing={isEditing}
                  onChange={(v) => updateDraft(org.id, "description", v)}
                  rows={2}
                />
                <Field
                  label="AI Tone Notes"
                  hint="Injected into every AI call for this org type"
                  value={draft.ai_tone_notes ?? ""}
                  editing={isEditing}
                  onChange={(v) => updateDraft(org.id, "ai_tone_notes", v)}
                  rows={4}
                />
                <Field
                  label="Default Intro"
                  hint="Pre-fills the proposal cover note"
                  value={draft.default_intro ?? ""}
                  editing={isEditing}
                  onChange={(v) => updateDraft(org.id, "default_intro", v)}
                  rows={3}
                />
                <Field
                  label="Default About"
                  hint="Pre-fills the About flowlyst section"
                  value={draft.default_about ?? ""}
                  editing={isEditing}
                  onChange={(v) => updateDraft(org.id, "default_about", v)}
                  rows={3}
                />
                {isEditing && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.active !== false}
                      onChange={(e) => updateDraft(org.id, "active", e.target.checked)}
                      className="w-4 h-4 accent-[var(--teal)]"
                    />
                    <span className="text-[13px] font-semibold text-[var(--dark)]">Active</span>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  editing,
  onChange,
  rows = 2,
}: {
  label: string;
  hint?: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)]">{label}</span>
        {hint && <span className="text-[11px] text-[var(--muted)]">— {hint}</span>}
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-[13px] font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent resize-none transition"
        />
      ) : (
        <p className="text-[13px] text-[var(--mid)] leading-relaxed whitespace-pre-wrap">
          {value || <span className="text-[var(--muted)] italic">Not set</span>}
        </p>
      )}
    </div>
  );
}
