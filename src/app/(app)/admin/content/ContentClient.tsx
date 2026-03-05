"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ContentBlock = {
  id: string;
  key: string;
  label: string;
  content: string;
  updated_at: string;
};

export default function ContentClient({ blocks }: { blocks: ContentBlock[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(blocks);
  const [editing, setEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Record<string, string>>({});

  function startEdit(id: string) {
    const block = items.find((b) => b.id === id)!;
    setDrafts((d) => ({ ...d, [id]: block.content }));
    setEditing(id);
  }

  function cancelEdit(id: string) {
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    setEditing(null);
  }

  async function save(id: string) {
    setSaving(id);
    const content = drafts[id];
    const { error } = await supabase
      .from("content_blocks")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setItems(items.map((b) => (b.id === id ? { ...b, content, updated_at: new Date().toISOString() } : b)));
      setSavedAt((s) => ({ ...s, [id]: new Date().toLocaleTimeString() }));
      setEditing(null);
      setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    }
    setSaving(null);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--dark)]">Content Blocks</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Edit reusable content that appears across proposals — About sections, terms, etc.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {items.map((block) => {
          const isEditing = editing === block.id;

          return (
            <div key={block.id} className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
                <div>
                  <div className="text-[15px] font-extrabold text-[var(--dark)]">{block.label}</div>
                  <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">{block.key}</div>
                </div>
                <div className="flex items-center gap-3">
                  {savedAt[block.id] && !isEditing && (
                    <span className="text-[11px] text-[var(--teal)] font-semibold">
                      Saved at {savedAt[block.id]}
                    </span>
                  )}
                  {!isEditing && (
                    <span className="text-[11px] text-[var(--muted)]">
                      Updated {new Date(block.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {isEditing ? (
                    <>
                      <button onClick={() => cancelEdit(block.id)} className="px-3.5 py-1.5 rounded-[8px] text-[12.5px] font-semibold text-[var(--mid)] hover:bg-[var(--bg)] transition">
                        Cancel
                      </button>
                      <button
                        onClick={() => save(block.id)}
                        disabled={saving === block.id}
                        className="px-4 py-1.5 rounded-[8px] text-[12.5px] font-bold bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] transition disabled:opacity-60"
                      >
                        {saving === block.id ? "Saving…" : "Save"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(block.id)}
                      className="px-4 py-1.5 rounded-[8px] text-[12.5px] font-bold border border-[#DDDDE0] text-[var(--mid)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                {isEditing ? (
                  <textarea
                    value={drafts[block.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [block.id]: e.target.value }))}
                    rows={8}
                    className="w-full px-3.5 py-3 rounded-[9px] border border-[#DDDDE0] text-[13px] font-medium text-[var(--dark)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent resize-y transition"
                  />
                ) : (
                  <p className="text-[13px] text-[var(--mid)] leading-relaxed whitespace-pre-wrap">
                    {block.content || <span className="text-[var(--muted)] italic">No content set.</span>}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
