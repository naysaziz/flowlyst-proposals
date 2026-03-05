import type { Proposal, Module, OrganizationType, ConsultingRateSettings } from "@/types";

interface ProposalModuleRow {
  module_id: string;
  included: boolean;
  price_override: number | null;
  module?: Module;
}

interface ProposalData extends Proposal {
  org_type?: OrganizationType;
  proposal_modules?: ProposalModuleRow[];
}

interface Props {
  proposal: ProposalData;
  consultingRates: ConsultingRateSettings | null;
  aboutContent: string;
  termsContent: string;
}

export default function ProposalPreview({
  proposal,
  consultingRates,
  aboutContent,
  termsContent,
}: Props) {
  const includedModules = (proposal.proposal_modules ?? []).filter((pm) => pm.included);
  const totalInvestment = includedModules.reduce(
    (sum, pm) => sum + (pm.price_override ?? pm.module?.default_price ?? 0),
    0
  );

  const formattedDate = proposal.proposal_date
    ? new Date(proposal.proposal_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const virtualRate = proposal.hourly_rate_virtual ?? consultingRates?.rate_virtual ?? 350;
  const onsiteRate = proposal.hourly_rate_onsite ?? consultingRates?.rate_onsite ?? 500;

  return (
    <div className="font-sans text-[var(--dark)] bg-white">
      {/* ── Cover Page ─────────────────────────────────────── */}
      <section className="min-h-[900px] flex flex-col relative overflow-hidden print-break">
        {/* Teal header band */}
        <div className="h-2 bg-[var(--teal)]" />

        <div className="flex-1 flex flex-col justify-between px-16 py-16">
          {/* Logo area */}
          <div>
            <div className="text-[28px] font-black text-[var(--teal)] tracking-tight leading-none">
              flowlyst
            </div>
            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[2px] mt-1">
              Consulting & Training
            </div>
          </div>

          {/* Title block */}
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[2px] text-[var(--teal)] mb-3">
                Proposal
              </div>
              <h1 className="text-[42px] font-black text-[var(--dark)] leading-[1.1] tracking-tight">
                {proposal.title}
              </h1>
            </div>

            <div className="flex gap-12 border-t border-[var(--light)] pt-8">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--muted)] mb-1.5">
                  Prepared for
                </div>
                <div className="text-[18px] font-extrabold text-[var(--dark)]">
                  {proposal.client_name}
                </div>
                {proposal.client_contact && (
                  <div className="text-[13px] text-[var(--mid)] mt-0.5">
                    Attn: {proposal.client_contact}
                  </div>
                )}
                {proposal.client_email && (
                  <div className="text-[12px] text-[var(--muted)] mt-0.5">
                    {proposal.client_email}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--muted)] mb-1.5">
                  Date
                </div>
                <div className="text-[16px] font-bold text-[var(--dark)]">
                  {formattedDate}
                </div>
              </div>
              {totalInvestment > 0 && (
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--muted)] mb-1.5">
                    Total Investment
                  </div>
                  <div className="text-[24px] font-black text-[var(--teal)]">
                    ${totalInvestment.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--light)] pt-6 text-[11px] text-[var(--muted)]">
            <span>flowlyst.io · aziz@flowlyst.io · +1(857)999-1234</span>
            <span className="font-semibold">Confidential</span>
          </div>
        </div>
      </section>

      {/* ── Body sections ──────────────────────────────────── */}
      <div className="px-16 py-12 space-y-12 max-w-[900px] mx-auto">

        {/* Introduction */}
        {proposal.cover_note && (
          <ProposalSection title="Introduction">
            <Prose text={proposal.cover_note} />
          </ProposalSection>
        )}

        {/* About flowlyst */}
        {aboutContent && (
          <ProposalSection title="About flowlyst">
            <Prose text={aboutContent} />
          </ProposalSection>
        )}

        {/* Scope of Work */}
        {proposal.scope_of_work && (
          <ProposalSection title="Scope of Work">
            <Prose text={proposal.scope_of_work} />
          </ProposalSection>
        )}

        {/* Training Package */}
        {proposal.training_package && (
          <ProposalSection title="Training Package">
            <Prose text={proposal.training_package} />
          </ProposalSection>
        )}

        {/* Deliverables */}
        {proposal.deliverables && (
          <ProposalSection title="Deliverables">
            <Prose text={proposal.deliverables} />
          </ProposalSection>
        )}

        {/* Timeline */}
        {proposal.timeline_content && (
          <ProposalSection title="Timeline">
            <Prose text={proposal.timeline_content} />
          </ProposalSection>
        )}

        {/* Investment */}
        {includedModules.length > 0 && (
          <ProposalSection title="Investment">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--teal)]">
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] py-2 pr-4">
                    Service
                  </th>
                  <th className="text-right text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] py-2">
                    Investment
                  </th>
                </tr>
              </thead>
              <tbody>
                {includedModules.map((pm, i) => (
                  <tr key={i} className="border-b border-[var(--light)]">
                    <td className="py-3 pr-4">
                      <div className="text-[14px] font-bold text-[var(--dark)]">
                        {pm.module?.name ?? "Service"}
                      </div>
                      {pm.module?.description && (
                        <div className="text-[12px] text-[var(--mid)] mt-0.5">
                          {pm.module.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right text-[14px] font-extrabold text-[var(--dark)]">
                      ${(pm.price_override ?? pm.module?.default_price ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {proposal.deposit_amount && proposal.deposit_amount > 0 && (
                  <tr className="border-b border-[var(--light)]">
                    <td className="py-2 text-[13px] text-[var(--mid)]">
                      Deposit (due upon agreement)
                    </td>
                    <td className="py-2 text-right text-[13px] font-bold text-[var(--mid)]">
                      ${proposal.deposit_amount.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="pt-4 text-[15px] font-extrabold text-[var(--dark)]">
                    Total Investment
                  </td>
                  <td className="pt-4 text-right text-[22px] font-black text-[var(--teal)]">
                    ${totalInvestment.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </ProposalSection>
        )}

        {/* Terms */}
        {termsContent && (
          <ProposalSection title="Terms">
            <Prose text={termsContent} />
          </ProposalSection>
        )}

        {/* Contact */}
        <div className="border-t-2 border-[var(--teal)] pt-8">
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-[var(--teal)] mb-4">
            Ready to Get Started?
          </div>
          <p className="text-[14px] text-[var(--dark)] mb-4">
            We look forward to the opportunity to work with {proposal.client_name}. Please reach out with
            any questions.
          </p>
          <div className="flex gap-8 text-[13px] text-[var(--mid)]">
            <span><strong className="text-[var(--dark)]">Aziz Aghayev</strong> · flowlyst</span>
            <span>aziz@flowlyst.io</span>
            <span>+1(857)999-1234</span>
            <span>flowlyst.io</span>
          </div>
        </div>
      </div>

      {/* ── Hourly Consulting Page ──────────────────────────── */}
      {proposal.include_hourly_page && (
        <section className="px-16 py-16 border-t-4 border-[var(--teal)] print-break max-w-[900px] mx-auto mt-8">
          <div className="text-[11px] font-extrabold uppercase tracking-[2px] text-[var(--teal)] mb-3">
            Addendum
          </div>
          <h2 className="text-[32px] font-black text-[var(--dark)] mb-8">
            Hourly Consulting
          </h2>

          {proposal.hourly_purpose ? (
            <Prose text={proposal.hourly_purpose} />
          ) : (
            <p className="text-[14px] text-[var(--dark)] leading-relaxed mb-6">
              In addition to the training package, flowlyst offers flexible hourly consulting
              for {proposal.client_name} to address specific workflow needs, implementation
              support, or ongoing advisory as priorities evolve.
            </p>
          )}

          <h3 className="text-[14px] font-extrabold text-[var(--dark)] mt-8 mb-3">
            How I Can Help
          </h3>
          <ul className="space-y-2 mb-8">
            {(
              proposal.hourly_service_areas ?? [
                "AI automation — drafting, summarization, classification, workflow acceleration",
                "Spreadsheet automation — Excel and Google Sheets optimization and templates",
                "Reporting automation — dashboards and pipelines using Looker Studio",
                "Workflow automation — repeatable processes for data intake and reconciliations",
                "Scripting and macros — Google Apps Script, Excel macros, process automation",
              ]
            ).map((area, i) => (
              <li key={i} className="flex gap-3 text-[13.5px] text-[var(--dark)]">
                <span className="text-[var(--teal)] mt-0.5 flex-shrink-0">▸</span>
                {area}
              </li>
            ))}
          </ul>

          <h3 className="text-[14px] font-extrabold text-[var(--dark)] mb-3">
            Professional Fee
          </h3>
          <div className="flex gap-8 mb-8">
            <div className="px-5 py-4 rounded-[12px] border border-[var(--light)] bg-[var(--bg)]">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-1">
                Virtual
              </div>
              <div className="text-[26px] font-black text-[var(--teal)]">
                ${virtualRate}
                <span className="text-[14px] text-[var(--mid)] font-semibold">/hr</span>
              </div>
            </div>
            <div className="px-5 py-4 rounded-[12px] border border-[var(--light)] bg-[var(--bg)]">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-1">
                On-site
              </div>
              <div className="text-[26px] font-black text-[var(--teal)]">
                ${onsiteRate}
                <span className="text-[14px] text-[var(--mid)] font-semibold">/hr</span>
              </div>
            </div>
          </div>

          <h3 className="text-[14px] font-extrabold text-[var(--dark)] mb-3">Terms</h3>
          <ul className="space-y-1.5 text-[13.5px] text-[var(--dark)]">
            <li>
              <strong>Minimum:</strong>{" "}
              {consultingRates?.terms_minimum ?? "1-hour minimum per session"}
            </li>
            <li>
              <strong>Billing:</strong>{" "}
              {consultingRates?.terms_billing ?? "Net 30"}
            </li>
            <li>
              <strong>Scope:</strong>{" "}
              {consultingRates?.terms_scope ??
                "Flexible and can evolve based on progress and priorities"}
            </li>
            {consultingRates?.travel_note && (
              <li>
                <strong>Travel:</strong> {consultingRates.travel_note}
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}

function ProposalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[18px] font-extrabold text-[var(--dark)] whitespace-nowrap">
          {title}
        </h2>
        <div className="flex-1 h-px bg-[var(--teal)] opacity-20" />
      </div>
      {children}
    </section>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
          return (
            <div key={i} className="flex gap-3 text-[14px] text-[var(--dark)] leading-relaxed">
              <span className="text-[var(--teal)] flex-shrink-0 mt-0.5">▸</span>
              <span>{line.replace(/^[-•]\s*/, "")}</span>
            </div>
          );
        }
        return (
          <p key={i} className="text-[14px] text-[var(--dark)] leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
