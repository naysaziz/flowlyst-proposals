"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { OrganizationType, Module } from "@/types";

export default function NewProposalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [orgTypes, setOrgTypes] = useState<OrganizationType[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_name: "",
    client_contact: "",
    client_email: "",
    proposal_date: new Date().toISOString().split("T")[0],
    org_type_id: "",
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [includeHourly, setIncludeHourly] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: orgData }, { data: modData }] = await Promise.all([
        supabase.from("organization_types").select("*").eq("active", true).order("sort_order"),
        supabase.from("modules").select("*").eq("active", true).order("sort_order"),
      ]);
      if (orgData) setOrgTypes(orgData);
      if (modData) setAllModules(modData);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function toggleModule(id: string) {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  const selectedOrgType = orgTypes.find((o) => o.id === form.org_type_id);
  const trainingModules = allModules.filter((m) => m.category === "training");
  const addonModules = allModules.filter((m) => m.category === "addon");
  const selectedTotal = allModules
    .filter((m) => selectedModules.includes(m.id))
    .reduce((sum, m) => sum + m.default_price, 0);

  const title = form.client_name
    ? `AI Training Proposal — ${form.client_name}`
    : "AI Training Proposal";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_name.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: proposal, error: insertError } = await supabase
        .from("proposals")
        .insert({
          title,
          type: "training",
          status: "draft",
          client_name: form.client_name,
          client_contact: form.client_contact || null,
          client_email: form.client_email || null,
          proposal_date: form.proposal_date,
          org_type_id: form.org_type_id || null,
          include_hourly_page: includeHourly,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError || !proposal) throw insertError;

      if (selectedModules.length > 0) {
        await supabase.from("proposal_modules").insert(
          selectedModules.map((moduleId, i) => ({
            proposal_id: proposal.id,
            module_id: moduleId,
            sort_order: i,
            included: true,
          }))
        );
      }

      router.push(`/proposals/${proposal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <header className="bg-white border-b border-[var(--light)] px-8 h-[62px] flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-[var(--muted)] hover:text-[var(--dark)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12,19 5,12 12,5" />
            </svg>
          </Link>
          <h1 className="text-[18px] font-black text-[var(--dark)] tracking-tight">
            New Proposal
          </h1>
        </div>
        <button
          form="new-proposal-form"
          type="submit"
          disabled={submitting || !form.client_name.trim() || loading}
          className="inline-flex items-center gap-2 px-5 py-[9px] rounded-[9px] bg-[var(--teal)] text-white text-[13.5px] font-bold hover:bg-[var(--teal-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-px hover:shadow-teal"
        >
          {submitting ? "Creating…" : "Create Proposal →"}
        </button>
      </header>

      <form
        id="new-proposal-form"
        onSubmit={handleSubmit}
        className="flex gap-6 p-8 flex-1 items-start"
      >
        {/* Left — Form */}
        <div className="flex-1 space-y-5 max-w-[640px]">
          {/* Client Info */}
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-5">
              Client Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--dark)] mb-1.5">
                  Organization / Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hartwell & Associates LLP"
                  value={form.client_name}
                  onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-[9px] border border-[var(--light)] text-[13.5px] text-[var(--dark)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30 focus:border-[var(--teal)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[var(--dark)] mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Chen"
                    value={form.client_contact}
                    onChange={(e) => setForm((p) => ({ ...p, client_contact: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[9px] border border-[var(--light)] text-[13.5px] text-[var(--dark)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[var(--dark)] mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. schen@hartwell.com"
                    value={form.client_email}
                    onChange={(e) => setForm((p) => ({ ...p, client_email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[9px] border border-[var(--light)] text-[13.5px] text-[var(--dark)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[var(--dark)] mb-1.5">
                  Proposal Date
                </label>
                <input
                  type="date"
                  value={form.proposal_date}
                  onChange={(e) => setForm((p) => ({ ...p, proposal_date: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-[9px] border border-[var(--light)] text-[13.5px] text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                />
              </div>
            </div>
          </div>

          {/* Org Type */}
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-5">
              Organization Type
            </h2>
            {loading ? (
              <div className="h-10 bg-[var(--bg)] rounded-[9px] animate-pulse" />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {orgTypes.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, org_type_id: org.id }))}
                      className={`text-left px-4 py-3 rounded-[10px] border text-[13px] font-semibold transition-all ${
                        form.org_type_id === org.id
                          ? "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--teal)]"
                          : "border-[var(--light)] text-[var(--dark)] hover:border-[var(--teal)] hover:bg-[var(--teal-light)]"
                      }`}
                    >
                      {org.label}
                    </button>
                  ))}
                </div>
                {selectedOrgType?.description && (
                  <p className="text-[12px] text-[var(--mid)] bg-[var(--bg)] rounded-[8px] px-3 py-2.5 animate-fade-in">
                    {selectedOrgType.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modules */}
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-5">
              Training Package
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[var(--bg)] rounded-[9px] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {trainingModules.length > 0 && (
                  <div className="space-y-2">
                    {trainingModules.map((mod) => (
                      <ModuleRow
                        key={mod.id}
                        module={mod}
                        selected={selectedModules.includes(mod.id)}
                        onToggle={() => toggleModule(mod.id)}
                      />
                    ))}
                  </div>
                )}
                {addonModules.length > 0 && (
                  <>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] pt-1">
                      Add-ons
                    </div>
                    <div className="space-y-2">
                      {addonModules.map((mod) => (
                        <ModuleRow
                          key={mod.id}
                          module={mod}
                          selected={selectedModules.includes(mod.id)}
                          onToggle={() => toggleModule(mod.id)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-5">
              Options
            </h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={includeHourly}
                  onChange={(e) => setIncludeHourly(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all ${
                    includeHourly
                      ? "bg-[var(--teal)] border-[var(--teal)]"
                      : "border-[var(--light)]"
                  }`}
                >
                  {includeHourly && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-[var(--dark)]">
                  Include Hourly Consulting Page
                </div>
                <div className="text-[12px] text-[var(--mid)] mt-0.5">
                  Appends a standalone consulting rate page ($350/hr virtual, $500/hr on-site)
                </div>
              </div>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium bg-red-50 rounded-[9px] px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Right — Summary */}
        <div className="w-[300px] flex-shrink-0 space-y-4 sticky top-[78px]">
          <div className="bg-white rounded-[14px] shadow-sm p-5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">
              Proposal Preview
            </div>
            <div className="text-[14px] font-extrabold text-[var(--dark)] leading-snug mb-1">
              {title}
            </div>
            {form.client_contact && (
              <div className="text-[12px] text-[var(--mid)]">
                Attn: {form.client_contact}
              </div>
            )}
            <div className="text-[12px] text-[var(--mid)]">
              {new Date(form.proposal_date + "T00:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {selectedOrgType && (
              <div className="mt-3 px-2.5 py-1.5 rounded-[6px] bg-[var(--purple-light)] text-[var(--purple)] text-[11.5px] font-bold inline-block">
                {selectedOrgType.label}
              </div>
            )}
          </div>

          {selectedModules.length > 0 && (
            <div className="bg-white rounded-[14px] shadow-sm p-5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">
                Selected Modules
              </div>
              <div className="space-y-2">
                {allModules
                  .filter((m) => selectedModules.includes(m.id))
                  .map((m) => (
                    <div key={m.id} className="flex justify-between items-start gap-2">
                      <span className="text-[12px] font-semibold text-[var(--dark)] leading-snug">
                        {m.name}
                      </span>
                      <span className="text-[12px] font-bold text-[var(--teal)] flex-shrink-0">
                        ${m.default_price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-[var(--light)] mt-3 pt-3 flex justify-between">
                  <span className="text-[12px] font-extrabold text-[var(--dark)]">
                    Total
                  </span>
                  <span className="text-[14px] font-black text-[var(--teal)]">
                    ${selectedTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-[11.5px] text-[var(--muted)] text-center px-2">
            You can add more detail and use AI to write the sections in the editor.
          </p>
        </div>
      </form>
    </div>
  );
}

function ModuleRow({
  module,
  selected,
  onToggle,
}: {
  module: Module;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-[10px] border transition-all ${
        selected
          ? "border-[var(--teal)] bg-[var(--teal-light)]"
          : "border-[var(--light)] hover:border-[var(--teal)] hover:bg-[var(--teal-light)]"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? "bg-[var(--teal)] border-[var(--teal)]" : "border-[var(--light)]"
        }`}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[var(--dark)]">{module.name}</div>
        {module.description && (
          <div className="text-[11.5px] text-[var(--mid)] mt-0.5 truncate">
            {module.description}
          </div>
        )}
      </div>
      <div className="text-[13px] font-black text-[var(--teal)] flex-shrink-0">
        ${module.default_price.toLocaleString()}
      </div>
    </button>
  );
}
