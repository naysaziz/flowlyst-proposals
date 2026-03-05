"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Module } from "@/types";

const CATEGORIES = ["training", "software", "salary", "addon"] as const;

const categoryColors: Record<string, string> = {
  training: "bg-teal-50 text-teal-700 border-teal-200",
  software: "bg-blue-50 text-blue-700 border-blue-200",
  salary: "bg-purple-50 text-purple-700 border-purple-200",
  addon: "bg-orange-50 text-orange-700 border-orange-200",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${categoryColors[category] ?? ""}`}>
      {category}
    </span>
  );
}

type ModuleRow = Omit<Module, "created_at">;

export default function ModulesClient({ modules }: { modules: Module[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<Module[]>(modules);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<ModuleRow>>>({});
  const [showNew, setShowNew] = useState(false);
  const [newDraft, setNewDraft] = useState<Partial<ModuleRow>>({
    name: "", category: "training", description: "", default_price: 0, notes: "", active: true,
  });
  const [creating, setCreating] = useState(false);

  function startEdit(id: string) {
    const item = items.find((m) => m.id === id)!;
    setDrafts((d) => ({ ...d, [id]: { ...item } }));
    setEditing(id);
  }

  function cancelEdit(id: string) {
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    setEditing(null);
  }

  function updateDraft(id: string, field: keyof ModuleRow, value: string | number | boolean) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function save(id: string) {
    setSaving(id);
    const draft = drafts[id];
    const { error } = await supabase
      .from("modules")
      .update({
        name: draft.name,
        category: draft.category,
        description: draft.description,
        default_price: Number(draft.default_price),
        notes: draft.notes,
        active: draft.active,
      })
      .eq("id", id);

    if (!error) {
      setItems(items.map((m) => (m.id === id ? { ...m, ...draft } : m)));
      setEditing(null);
      setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    }
    setSaving(null);
  }

  async function createModule() {
    if (!newDraft.name?.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("modules")
      .insert({
        name: newDraft.name,
        category: newDraft.category ?? "training",
        description: newDraft.description ?? "",
        default_price: Number(newDraft.default_price ?? 0),
        notes: newDraft.notes ?? "",
        active: true,
        sort_order: items.length + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setItems([...items, data]);
      setShowNew(false);
      setNewDraft({ name: "", category: "training", description: "", default_price: 0, notes: "", active: true });
    }
    setCreating(false);
  }

  async function toggleActive(id: string, active: boolean) {
    const { error } = await supabase.from("modules").update({ active }).eq("id", id);
    if (!error) setItems(items.map((m) => (m.id === id ? { ...m, active } : m)));
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--dark)]">Modules</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Manage proposal modules and default pricing.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 rounded-[9px] bg-[var(--teal)] text-white text-sm font-bold hover:bg-[var(--teal-dark)] transition"
        >
          + Add Module
        </button>
      </div>

      {/* New module form */}
      {showNew && (
        <div className="bg-white rounded-[14px] border-2 border-[var(--teal)] p-6 mb-6">
          <h2 className="text-[15px] font-extrabold text-[var(--dark)] mb-4">New Module</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormLabel>Name</FormLabel>
              <input
                type="text"
                value={newDraft.name ?? ""}
                onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
                placeholder="Module name"
                className="w-full px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent"
              />
            </div>
            <div>
              <FormLabel>Category</FormLabel>
              <select
                value={newDraft.category ?? "training"}
                onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value as Module["category"] })}
                className="w-full px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FormLabel>Default Price ($)</FormLabel>
              <input
                type="number"
                value={newDraft.default_price ?? 0}
                onChange={(e) => setNewDraft({ ...newDraft, default_price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
              />
            </div>
            <div className="col-span-2">
              <FormLabel>Description</FormLabel>
              <textarea
                value={newDraft.description ?? ""}
                onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2 rounded-[9px] text-sm font-semibold text-[var(--mid)] hover:bg-[var(--bg)] transition"
            >
              Cancel
            </button>
            <button
              onClick={createModule}
              disabled={creating || !newDraft.name?.trim()}
              className="px-5 py-2 rounded-[9px] bg-[var(--teal)] text-white text-sm font-bold hover:bg-[var(--teal-dark)] transition disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Module"}
            </button>
          </div>
        </div>
      )}

      {/* Modules table */}
      <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] border-b border-[#F5F5F5]">
              <th className="text-left px-6 py-3">Module</th>
              <th className="text-left px-6 py-3">Category</th>
              <th className="text-left px-6 py-3">Price</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((mod) => {
              const isEditing = editing === mod.id;
              const draft = drafts[mod.id] ?? mod;

              return (
                <tr key={mod.id} className="border-b border-[#F9F9F9] last:border-0">
                  <td className="px-6 py-4 max-w-xs">
                    {isEditing ? (
                      <input
                        value={String(draft.name ?? "")}
                        onChange={(e) => updateDraft(mod.id, "name", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-[7px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                      />
                    ) : (
                      <div>
                        <div className="text-[13.5px] font-semibold text-[var(--dark)]">{mod.name}</div>
                        {mod.description && (
                          <div className="text-[11.5px] text-[var(--muted)] mt-0.5 truncate max-w-[260px]">{mod.description}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select
                        value={String(draft.category ?? mod.category)}
                        onChange={(e) => updateDraft(mod.id, "category", e.target.value)}
                        className="px-2.5 py-1.5 rounded-[7px] border border-[#DDDDE0] text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <CategoryBadge category={mod.category} />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={Number(draft.default_price ?? mod.default_price)}
                        onChange={(e) => updateDraft(mod.id, "default_price", Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 rounded-[7px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                      />
                    ) : (
                      <span className="text-[13.5px] font-semibold text-[var(--dark)]">
                        ${Number(mod.default_price).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(mod.id, !mod.active)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                        mod.active
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                      }`}
                    >
                      {mod.active ? "active" : "inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => cancelEdit(mod.id)} className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--dark)] transition">Cancel</button>
                        <button onClick={() => save(mod.id)} disabled={saving === mod.id} className="text-[12px] font-bold text-[var(--teal)] hover:text-[var(--teal-dark)] transition disabled:opacity-60">
                          {saving === mod.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(mod.id)} className="text-[12px] font-semibold text-[var(--mid)] hover:text-[var(--teal)] transition">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)] mb-1.5 block">
      {children}
    </label>
  );
}
