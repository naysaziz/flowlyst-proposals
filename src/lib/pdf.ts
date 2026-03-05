import type { Proposal, Module, ConsultingRateSettings } from "@/types";

interface ProposalModuleRow {
  module_id: string;
  included: boolean;
  price_override: number | null;
  module?: Module;
}

interface ProposalData extends Proposal {
  proposal_modules?: ProposalModuleRow[];
}

interface BuildPDFOptions {
  proposal: ProposalData;
  consultingRates: ConsultingRateSettings | null;
  aboutContent: string;
  termsContent: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function nl2html(text: string): string {
  if (!text) return "";
  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return "<br/>";
      if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        return `<div style="display:flex;gap:10px;margin:6px 0;"><span style="color:#00A568;flex-shrink:0;">&#9658;</span><span>${line.replace(/^[-•]\s*/, "")}</span></div>`;
      }
      return `<p style="margin:0 0 10px;line-height:1.65;">${line}</p>`;
    })
    .join("");
}

function section(title: string, content: string): string {
  return `
    <div style="margin-bottom:40px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
        <h2 style="margin:0;font-size:18px;font-weight:900;color:#404041;white-space:nowrap;">${title}</h2>
        <div style="flex:1;height:1px;background:#00A568;opacity:0.2;"></div>
      </div>
      <div style="font-size:14px;color:#404041;">${content}</div>
    </div>
  `;
}

export function buildProposalHTML(opts: BuildPDFOptions): string {
  const { proposal, consultingRates, aboutContent, termsContent } = opts;
  const includedModules = (proposal.proposal_modules ?? []).filter((pm) => pm.included);
  const totalInvestment = includedModules.reduce(
    (sum, pm) => sum + (pm.price_override ?? pm.module?.default_price ?? 0),
    0
  );
  const virtualRate = proposal.hourly_rate_virtual ?? consultingRates?.rate_virtual ?? 350;
  const onsiteRate = proposal.hourly_rate_onsite ?? consultingRates?.rate_onsite ?? 500;
  const formattedDate = proposal.proposal_date ? formatDate(proposal.proposal_date) : "";

  const investmentRows = includedModules
    .map(
      (pm) => `
        <tr>
          <td style="padding:12px 16px 12px 0;border-bottom:1px solid #E2E2E2;vertical-align:top;">
            <div style="font-size:14px;font-weight:700;color:#404041;">${pm.module?.name ?? "Service"}</div>
            ${pm.module?.description ? `<div style="font-size:12px;color:#767677;margin-top:2px;">${pm.module.description}</div>` : ""}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #E2E2E2;text-align:right;font-size:14px;font-weight:800;color:#404041;white-space:nowrap;">
            $${(pm.price_override ?? pm.module?.default_price ?? 0).toLocaleString()}
          </td>
        </tr>
      `
    )
    .join("");

  const depositRow =
    proposal.deposit_amount && proposal.deposit_amount > 0
      ? `<tr>
          <td style="padding:8px 0;color:#767677;font-size:13px;border-bottom:1px solid #E2E2E2;">Deposit (due upon agreement)</td>
          <td style="padding:8px 0;text-align:right;font-size:13px;font-weight:700;color:#767677;border-bottom:1px solid #E2E2E2;">$${proposal.deposit_amount.toLocaleString()}</td>
         </tr>`
      : "";

  const hourlyPage =
    proposal.include_hourly_page
      ? `
    <div style="page-break-before:always;padding:64px;max-width:900px;margin:0 auto;">
      <div style="font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#00A568;margin-bottom:12px;">Addendum</div>
      <h2 style="font-size:32px;font-weight:900;color:#404041;margin:0 0 32px;">Hourly Consulting</h2>

      <div style="font-size:14px;color:#404041;margin-bottom:24px;">
        ${nl2html(proposal.hourly_purpose || `In addition to the training package, flowlyst offers flexible hourly consulting for ${proposal.client_name} to address specific workflow needs, implementation support, or ongoing advisory as priorities evolve.`)}
      </div>

      <h3 style="font-size:14px;font-weight:900;margin:0 0 12px;">How I Can Help</h3>
      ${(proposal.hourly_service_areas ?? [
        "AI automation — drafting, summarization, classification, workflow acceleration",
        "Spreadsheet automation — Excel and Google Sheets optimization and templates",
        "Reporting automation — dashboards and pipelines using Looker Studio",
        "Workflow automation — repeatable processes for data intake and reconciliations",
        "Scripting and macros — Google Apps Script, Excel macros, process automation",
      ])
        .map(
          (a) => `<div style="display:flex;gap:10px;margin:6px 0;font-size:13.5px;color:#404041;"><span style="color:#00A568;flex-shrink:0;">&#9658;</span><span>${a}</span></div>`
        )
        .join("")}

      <h3 style="font-size:14px;font-weight:900;margin:32px 0 12px;">Professional Fee</h3>
      <div style="display:flex;gap:24px;margin-bottom:32px;">
        <div style="padding:16px 24px;border-radius:12px;border:1px solid #E2E2E2;background:#F4F5F7;">
          <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:4px;">Virtual</div>
          <div style="font-size:26px;font-weight:900;color:#00A568;">$${virtualRate}<span style="font-size:14px;color:#767677;font-weight:600;">/hr</span></div>
        </div>
        <div style="padding:16px 24px;border-radius:12px;border:1px solid #E2E2E2;background:#F4F5F7;">
          <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:4px;">On-site</div>
          <div style="font-size:26px;font-weight:900;color:#00A568;">$${onsiteRate}<span style="font-size:14px;color:#767677;font-weight:600;">/hr</span></div>
        </div>
      </div>

      <h3 style="font-size:14px;font-weight:900;margin:0 0 12px;">Terms</h3>
      <ul style="margin:0;padding:0;list-style:none;font-size:13.5px;color:#404041;line-height:2;">
        <li><strong>Minimum:</strong> ${consultingRates?.terms_minimum ?? "1-hour minimum per session"}</li>
        <li><strong>Billing:</strong> ${consultingRates?.terms_billing ?? "Net 30"}</li>
        <li><strong>Scope:</strong> ${consultingRates?.terms_scope ?? "Flexible and can evolve based on progress and priorities"}</li>
        ${consultingRates?.travel_note ? `<li><strong>Travel:</strong> ${consultingRates.travel_note}</li>` : ""}
      </ul>
    </div>
  `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${proposal.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      color: #404041;
      background: white;
      -webkit-font-smoothing: antialiased;
    }
    @page { margin: 0; size: Letter; }
  </style>
</head>
<body>

<!-- Cover Page -->
<div style="min-height:1056px;display:flex;flex-direction:column;position:relative;page-break-after:always;">
  <div style="height:6px;background:#00A568;"></div>

  <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:64px;max-width:900px;margin:0 auto;width:100%;">
    <div>
      <div style="font-size:28px;font-weight:900;color:#00A568;letter-spacing:-0.5px;">flowlyst</div>
      <div style="font-size:10px;font-weight:700;color:#A8A8A9;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Consulting &amp; Training</div>
    </div>

    <div>
      <div style="font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#00A568;margin-bottom:12px;">Proposal</div>
      <h1 style="font-size:42px;font-weight:900;color:#404041;line-height:1.1;letter-spacing:-1px;margin-bottom:32px;">
        ${proposal.title}
      </h1>

      <div style="display:flex;gap:48px;border-top:1px solid #E2E2E2;padding-top:32px;">
        <div>
          <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:6px;">Prepared for</div>
          <div style="font-size:18px;font-weight:900;color:#404041;">${proposal.client_name}</div>
          ${proposal.client_contact ? `<div style="font-size:13px;color:#767677;margin-top:2px;">Attn: ${proposal.client_contact}</div>` : ""}
          ${proposal.client_email ? `<div style="font-size:12px;color:#A8A8A9;margin-top:2px;">${proposal.client_email}</div>` : ""}
        </div>
        <div>
          <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:6px;">Date</div>
          <div style="font-size:16px;font-weight:700;color:#404041;">${formattedDate}</div>
        </div>
        ${
          totalInvestment > 0
            ? `<div>
              <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:6px;">Total Investment</div>
              <div style="font-size:24px;font-weight:900;color:#00A568;">$${totalInvestment.toLocaleString()}</div>
            </div>`
            : ""
        }
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;border-top:1px solid #E2E2E2;padding-top:24px;font-size:11px;color:#A8A8A9;">
      <span>flowlyst.io · aziz@flowlyst.io · +1(857)999-1234</span>
      <span style="font-weight:600;">Confidential</span>
    </div>
  </div>
</div>

<!-- Body -->
<div style="padding:64px;max-width:900px;margin:0 auto;">
  ${proposal.cover_note ? section("Introduction", nl2html(proposal.cover_note)) : ""}
  ${aboutContent ? section("About flowlyst", nl2html(aboutContent)) : ""}
  ${proposal.scope_of_work ? section("Scope of Work", nl2html(proposal.scope_of_work)) : ""}
  ${proposal.training_package ? section("Training Package", nl2html(proposal.training_package)) : ""}
  ${proposal.deliverables ? section("Deliverables", nl2html(proposal.deliverables)) : ""}
  ${proposal.timeline_content ? section("Timeline", nl2html(proposal.timeline_content)) : ""}

  ${
    includedModules.length > 0
      ? section(
          "Investment",
          `<table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid #00A568;">
                <th style="text-align:left;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.8px;color:#A8A8A9;padding:8px 16px 8px 0;">Service</th>
                <th style="text-align:right;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.8px;color:#A8A8A9;padding:8px 0;">Investment</th>
              </tr>
            </thead>
            <tbody>${investmentRows}</tbody>
            <tfoot>
              ${depositRow}
              <tr>
                <td style="padding:16px 0 0;font-size:15px;font-weight:900;color:#404041;">Total Investment</td>
                <td style="padding:16px 0 0;text-align:right;font-size:22px;font-weight:900;color:#00A568;">$${totalInvestment.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>`
        )
      : ""
  }

  ${termsContent ? section("Terms", nl2html(termsContent)) : ""}

  <!-- Contact footer -->
  <div style="border-top:2px solid #00A568;padding-top:32px;margin-top:40px;">
    <div style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#00A568;margin-bottom:16px;">Ready to Get Started?</div>
    <p style="font-size:14px;color:#404041;margin-bottom:16px;">
      We look forward to the opportunity to work with ${proposal.client_name}. Please reach out with any questions.
    </p>
    <div style="display:flex;gap:32px;font-size:13px;color:#767677;flex-wrap:wrap;">
      <span><strong style="color:#404041;">Aziz Aghayev</strong> · flowlyst</span>
      <span>aziz@flowlyst.io</span>
      <span>+1(857)999-1234</span>
      <span>flowlyst.io</span>
    </div>
  </div>
</div>

${hourlyPage}

</body>
</html>`;
}
