"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useModel } from "@/contexts/ModelContext";
import InlineChanger from "@/components/ai/InlineChanger";
import AIChatPanel from "@/components/ai/AIChatPanel";
import ModelSelector from "@/components/ui/ModelSelector";
import type {
  Proposal,
  Module,
  OrganizationType,
  ConsultingRateSettings,
} from "@/types";

interface ProposalModuleRow {
  id: string;
  module_id: string;
  price_override: number | null;
  included: boolean;
  sort_order: number;
  module?: Module;
}

interface Props {
  proposal: Proposal & {
    org_type?: OrganizationType;
    proposal_modules?: ProposalModuleRow[];
  };
  allModules: Module[];
  orgTypes: OrganizationType[];
  consultingRates: ConsultingRateSettings | null;
}

type SaveState = "saved" | "dirty" | "saving";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-[#F5F5F5] text-[#999]" },
  { value: "sent", label: "Sent", color: "bg-[#EEF6FF] text-[#2A7FD4]" },
  {
    value: "accepted",
    label: "Accepted",
    color: "bg-[var(--teal-light)] text-[var(--teal)]",
  },
  { value: "declined", label: "Declined", color: "bg-[#FFF0F0] text-[#D44B4B]" },
];

export default function ProposalEditor({
  proposal,
  allModules,
  orgTypes,
  consultingRates,
}: Props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), []);
  const { model } = useModel();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const saveRef = useRef<() => void>(() => {});

  // ── Content fields ──────────────────────────────────────────────
  const [title, setTitle] = useState(proposal.title);
  const [status, setStatus] = useState(proposal.status);
  const [clientName, setClientName] = useState(proposal.client_name);
  const [clientContact, setClientContact] = useState(proposal.client_contact ?? "");
  const [clientEmail, setClientEmail] = useState(proposal.client_email ?? "");
  const [proposalDate, setProposalDate] = useState(proposal.proposal_date);
  const [orgTypeId, setOrgTypeId] = useState(proposal.org_type_id ?? "");
  const [coverNote, setCoverNote] = useState(proposal.cover_note ?? "");
  const [scopeOfWork, setScopeOfWork] = useState(proposal.scope_of_work ?? "");
  const [trainingPackage, setTrainingPackage] = useState(proposal.training_package ?? "");
  const [deliverables, setDeliverables] = useState(proposal.deliverables ?? "");
  const [timelineContent, setTimelineContent] = useState(proposal.timeline_content ?? "");
  const [includeHourly, setIncludeHourly] = useState(proposal.include_hourly_page);
  const [hourlyPurpose, setHourlyPurpose] = useState(proposal.hourly_purpose ?? "");
  const [depositAmount, setDepositAmount] = useState(
    proposal.deposit_amount?.toString() ?? ""
  );

  // ── Module state ────────────────────────────────────────────────
  const [moduleRows, setModuleRows] = useState<
    { module_id: string; included: boolean; price_override: number | null }[]
  >(() => {
    const existingIds = new Set(
      (proposal.proposal_modules ?? []).map((pm) => pm.module_id)
    );
    const rows = (proposal.proposal_modules ?? []).map((pm) => ({
      module_id: pm.module_id,
      included: pm.included,
      price_override: pm.price_override,
    }));
    // Add any active modules not yet in proposal
    allModules
      .filter((m) => !existingIds.has(m.id))
      .forEach((m) => {
        rows.push({ module_id: m.id, included: false, price_override: null });
      });
    return rows;
  });

  const selectedOrgType = orgTypes.find((o) => o.id === orgTypeId);

  const totalInvestment = moduleRows
    .filter((r) => r.included)
    .reduce((sum, r) => {
      const mod = allModules.find((m) => m.id === r.module_id);
      return sum + (r.price_override ?? mod?.default_price ?? 0);
    }, 0);

  // ── Auto-save ───────────────────────────────────────────────────
  const markDirty = useCallback(() => {
    setSaveState("dirty");
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveRef.current(), 2500);
  }, []);

  async function save() {
    setSaveState("saving");
    try {
      // Update proposal
      await supabase
        .from("proposals")
        .update({
          title,
          status,
          client_name: clientName,
          client_contact: clientContact || null,
          client_email: clientEmail || null,
          proposal_date: proposalDate,
          org_type_id: orgTypeId || null,
          cover_note: coverNote || null,
          scope_of_work: scopeOfWork || null,
          training_package: trainingPackage || null,
          deliverables: deliverables || null,
          timeline_content: timelineContent || null,
          include_hourly_page: includeHourly,
          hourly_purpose: hourlyPurpose || null,
          deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
        })
        .eq("id", proposal.id);

      // Sync modules: delete + re-insert
      await supabase
        .from("proposal_modules")
        .delete()
        .eq("proposal_id", proposal.id);

      const included = moduleRows.filter((r) => r.included);
      if (included.length > 0) {
        await supabase.from("proposal_modules").insert(
          included.map((r, i) => ({
            proposal_id: proposal.id,
            module_id: r.module_id,
            price_override: r.price_override,
            sort_order: i,
            included: true,
          }))
        );
      }

      setSaveState("saved");
    } catch {
      setSaveState("dirty");
    }
  }

  // Keep saveRef pointing at the latest save function (fixes stale closure)
  useEffect(() => {
    saveRef.current = save;
  });

  // Trigger auto-save when content changes (skip initial mount)
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    markDirty();
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    title, status, clientName, clientContact, clientEmail, proposalDate,
    orgTypeId, coverNote, scopeOfWork, trainingPackage, deliverables,
    timelineContent, includeHourly, hourlyPurpose, depositAmount, moduleRows,
  ]);

  function applyAISection(section: string, content: string) {
    switch (section) {
      case "intro": setCoverNote(content); break;
      case "scope": setScopeOfWork(content); break;
      case "training_package": setTrainingPackage(content); break;
      case "deliverables": setDeliverables(content); break;
      case "timeline": setTimelineContent(content); break;
      case "hourly_page": setHourlyPurpose(content); break;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <header className="bg-white border-b border-[var(--light)] px-6 h-[62px] flex items-center gap-4 sticky top-0 z-40">
        <Link
          href="/"
          className="text-[var(--muted)] hover:text-[var(--dark)] transition-colors flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
        </Link>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-[15px] font-black text-[var(--dark)] bg-transparent border-none outline-none min-w-0 truncate"
          placeholder="Proposal title"
        />

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className={`text-[11.5px] font-bold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer flex-shrink-0 ${
            STATUS_OPTIONS.find((s) => s.value === status)?.color ?? ""
          }`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ModelSelector />

          <button
            onClick={() => setAiPanelOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] bg-brand-gradient text-white text-[12.5px] font-bold hover:opacity-90 transition-opacity"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
            AI Assistant
          </button>

          <Link
            href={`/proposals/${proposal.id}/preview`}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] bg-[var(--bg)] border border-[var(--light)] text-[12.5px] font-semibold text-[var(--mid)] hover:text-[var(--dark)] hover:border-[var(--muted)] transition-all"
            onClick={() => clearTimeout(saveTimeoutRef.current)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Link>

          <a
            href={`/api/pdf/${proposal.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] bg-[var(--bg)] border border-[var(--light)] text-[12.5px] font-semibold text-[var(--mid)] hover:text-[var(--dark)] hover:border-[var(--muted)] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </a>

          {/* Save indicator */}
          <div className="text-[11px] font-semibold flex-shrink-0 w-16 text-right">
            {saveState === "saving" && (
              <span className="text-[var(--muted)]">Saving…</span>
            )}
            {saveState === "dirty" && (
              <button
                onClick={() => { clearTimeout(saveTimeoutRef.current); save(); }}
                className="text-[var(--teal)] hover:underline"
              >
                Save
              </button>
            )}
            {saveState === "saved" && (
              <span className="text-[var(--muted)]">Saved ✓</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-0">
        {/* Main — Sections */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Client info */}
          <SectionCard title="Client Details">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Organization Name"
                value={clientName}
                onChange={setClientName}
                placeholder="Client organization"
              />
              <Field
                label="Contact Name"
                value={clientContact}
                onChange={setClientContact}
                placeholder="Primary contact"
              />
              <Field
                label="Contact Email"
                value={clientEmail}
                onChange={setClientEmail}
                placeholder="email@client.com"
                type="email"
              />
              <div>
                <label className="block text-[11.5px] font-bold text-[var(--mid)] mb-1.5">
                  Proposal Date
                </label>
                <input
                  type="date"
                  value={proposalDate}
                  onChange={(e) => setProposalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[var(--light)] text-[13px] text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[11.5px] font-bold text-[var(--mid)] mb-1.5">
                Organization Type
              </label>
              <select
                value={orgTypeId}
                onChange={(e) => setOrgTypeId(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[var(--light)] text-[13px] text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
              >
                <option value="">— Select org type —</option>
                {orgTypes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* Cover Note */}
          <SectionCard title="Introduction / Cover Note">
            <SectionTextarea
              value={coverNote}
              onChange={setCoverNote}
              placeholder="A brief personal note to the client introducing this proposal…"
              rows={4}
            />
            <InlineChanger
              section="intro"
              currentContent={coverNote}
              proposalType="training"
              orgType={selectedOrgType?.label}
              clientName={clientName || proposal.client_name}
              model={model}
              onAccept={setCoverNote}
            />
          </SectionCard>

          {/* Scope of Work */}
          <SectionCard title="Scope of Work">
            <SectionTextarea
              value={scopeOfWork}
              onChange={setScopeOfWork}
              placeholder="Describe what flowlyst will deliver in this engagement…"
              rows={6}
            />
            <InlineChanger
              section="scope"
              currentContent={scopeOfWork}
              proposalType="training"
              orgType={selectedOrgType?.label}
              clientName={clientName || proposal.client_name}
              model={model}
              onAccept={setScopeOfWork}
            />
          </SectionCard>

          {/* Training Package */}
          <SectionCard title="Training Package">
            <SectionTextarea
              value={trainingPackage}
              onChange={setTrainingPackage}
              placeholder="Describe the training program structure, format, sessions, topics…"
              rows={5}
            />
            <InlineChanger
              section="training_package"
              currentContent={trainingPackage}
              proposalType="training"
              orgType={selectedOrgType?.label}
              clientName={clientName || proposal.client_name}
              model={model}
              onAccept={setTrainingPackage}
            />
          </SectionCard>

          {/* Deliverables */}
          <SectionCard title="Deliverables">
            <SectionTextarea
              value={deliverables}
              onChange={setDeliverables}
              placeholder="List what the client receives — recordings, slide decks, reports…"
              rows={5}
            />
            <InlineChanger
              section="deliverables"
              currentContent={deliverables}
              proposalType="training"
              orgType={selectedOrgType?.label}
              clientName={clientName || proposal.client_name}
              model={model}
              onAccept={setDeliverables}
            />
          </SectionCard>

          {/* Timeline */}
          <SectionCard title="Timeline">
            <SectionTextarea
              value={timelineContent}
              onChange={setTimelineContent}
              placeholder="Describe the engagement timeline phase by phase…"
              rows={5}
            />
            <InlineChanger
              section="timeline"
              currentContent={timelineContent}
              proposalType="training"
              orgType={selectedOrgType?.label}
              clientName={clientName || proposal.client_name}
              model={model}
              onAccept={setTimelineContent}
            />
          </SectionCard>

          {/* Hourly Consulting */}
          <SectionCard
            title="Hourly Consulting Page"
            badge={
              <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <div
                  onClick={() => setIncludeHourly((p) => !p)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                    includeHourly ? "bg-[var(--teal)]" : "bg-[var(--light)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      includeHourly ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-[12px] font-semibold text-[var(--mid)]">
                  {includeHourly ? "Included" : "Not included"}
                </span>
              </label>
            }
          >
            {includeHourly ? (
              <>
                <SectionTextarea
                  value={hourlyPurpose}
                  onChange={setHourlyPurpose}
                  placeholder="Describe the purpose and scope of hourly consulting support…"
                  rows={4}
                />
                <div className="mt-3 flex gap-4 text-[12px] text-[var(--mid)] bg-[var(--bg)] rounded-[8px] px-3 py-2.5">
                  <span>Virtual: <strong className="text-[var(--dark)]">${consultingRates?.rate_virtual ?? 350}/hr</strong></span>
                  <span>On-site: <strong className="text-[var(--dark)]">${consultingRates?.rate_onsite ?? 500}/hr</strong></span>
                </div>
                <InlineChanger
                  section="hourly_page"
                  currentContent={hourlyPurpose}
                  proposalType="training"
                  orgType={selectedOrgType?.label}
                  clientName={clientName || proposal.client_name}
                  model={model}
                  onAccept={setHourlyPurpose}
                />
              </>
            ) : (
              <p className="text-[12.5px] text-[var(--muted)]">
                Toggle on to append an hourly consulting rate page to this proposal.
              </p>
            )}
          </SectionCard>

          {/* Deposit */}
          <SectionCard title="Pricing Settings">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[var(--mid)] mb-1.5">
                  Deposit Amount (optional)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[var(--mid)] font-bold">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-36 px-3 py-2 rounded-[8px] border border-[var(--light)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
                  />
                </div>
              </div>
              <div className="text-[12px] text-[var(--muted)] mt-5">
                Leave blank to not show a deposit line
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar — Modules */}
        <div className="w-[320px] flex-shrink-0 border-l border-[var(--light)] bg-white overflow-y-auto">
          <div className="p-5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-4">
              Modules & Pricing
            </div>

            <div className="space-y-2">
              {allModules.map((mod) => {
                const row = moduleRows.find((r) => r.module_id === mod.id);
                const included = row?.included ?? false;
                const price = row?.price_override ?? mod.default_price;

                return (
                  <div
                    key={mod.id}
                    className={`rounded-[10px] border transition-all ${
                      included
                        ? "border-[var(--teal)] bg-[var(--teal-light)]"
                        : "border-[var(--light)] bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 p-3">
                      <button
                        onClick={() =>
                          setModuleRows((prev) =>
                            prev.map((r) =>
                              r.module_id === mod.id
                                ? { ...r, included: !r.included }
                                : r
                            )
                          )
                        }
                        className={`mt-0.5 w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          included
                            ? "bg-[var(--teal)] border-[var(--teal)]"
                            : "border-[var(--light)]"
                        }`}
                      >
                        {included && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-bold text-[var(--dark)] leading-snug">
                          {mod.name}
                        </div>
                        {included && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="text-[11px] text-[var(--mid)]">$</span>
                            <input
                              type="number"
                              value={price}
                              onChange={(e) =>
                                setModuleRows((prev) =>
                                  prev.map((r) =>
                                    r.module_id === mod.id
                                      ? {
                                          ...r,
                                          price_override:
                                            e.target.value
                                              ? parseFloat(e.target.value)
                                              : null,
                                        }
                                      : r
                                  )
                                )
                              }
                              className="w-24 text-[12px] font-bold text-[var(--teal)] bg-white rounded-[6px] border border-[var(--teal)] border-opacity-30 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 border-t border-[var(--light)]">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  Total Investment
                </span>
                <span className="text-[20px] font-black text-[var(--teal)]">
                  ${totalInvestment.toLocaleString()}
                </span>
              </div>
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-[11px] text-[var(--muted)]">Deposit</span>
                  <span className="text-[13px] font-bold text-[var(--mid)]">
                    ${parseFloat(depositAmount).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Share link */}
            <div className="mt-5 pt-4 border-t border-[var(--light)]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-2">
                Shareable Link
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/share/${proposal.share_uuid}`;
                  navigator.clipboard.writeText(url);
                }}
                className="w-full text-left px-3 py-2 rounded-[8px] border border-[var(--light)] bg-[var(--bg)] text-[11.5px] text-[var(--mid)] font-medium hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors truncate"
              >
                📋 Copy share link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        proposalType="training"
        orgType={selectedOrgType?.label}
        clientName={clientName || proposal.client_name}
        model={model}
        onApplySection={applyAISection}
      />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[14px] shadow-sm p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-extrabold text-[var(--dark)]">{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11.5px] font-bold text-[var(--mid)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-[8px] border border-[var(--light)] text-[13px] text-[var(--dark)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
      />
    </div>
  );
}

function SectionTextarea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-3 rounded-[9px] border border-[var(--light)] text-[13.5px] text-[var(--dark)] leading-relaxed placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30 resize-none"
    />
  );
}
