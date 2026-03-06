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

export interface PDFImages {
  logoFullColor: string;
  logoFullWhite: string;
  logoIconColor: string;
  patternStrip: string;
  patternAccent: string;
  patternAccentWhite: string;
  patternAccentSingle: string;       // Solid triangle only (for decorative accents)
  patternAccentSingleWhite: string;  // White solid triangle
  azizPhoto: string;
  aiVisual: string;       // AI/automation image for Our Mission page (clipped to triangle)
  trainingPhoto: string;  // Training room photo for Recognition page
}

interface BuildPDFOptions {
  proposal: ProposalData;
  consultingRates: ConsultingRateSettings | null;
  aboutContent: string;
  termsContent: string;
  images: PDFImages;
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
        return `<div style="display:flex;gap:10px;margin:7px 0;"><span style="color:#00A568;flex-shrink:0;margin-top:2px;">&#9654;</span><span>${line.replace(/^[-•]\s*/, "")}</span></div>`;
      }
      return `<p style="margin:0 0 12px;line-height:1.7;">${line}</p>`;
    })
    .join("");
}

// Large left-aligned green italic heading (used on most pages)
function sectionHeading(title: string): string {
  return `<h2 style="font-size:30px;font-weight:900;color:#00A568;margin:0 0 20px;font-style:italic;line-height:1.1;">${title}</h2>`;
}

// Centered green italic heading (used on Our Services page)
function centeredHeading(title: string): string {
  return `<h2 style="font-size:32px;font-weight:900;color:#00A568;margin:0 0 28px;font-style:italic;line-height:1.1;text-align:center;">${title}</h2>`;
}

// Dark bold subsection heading (used within Our Services)
function subHeading(title: string): string {
  return `<h3 style="font-size:16px;font-weight:900;color:#404041;margin:0 0 10px;">${title}</h3>`;
}

// Pattern accent helper (small decorative element)
function accent(src: string, style: string): string {
  if (!src) return "";
  return `<div style="${style}"><img src="${src}" style="width:100%;height:auto;display:block;" /></div>`;
}

export function buildProposalHTML(opts: BuildPDFOptions): string {
  const { proposal, consultingRates, aboutContent, termsContent, images } = opts;
  const includedModules = (proposal.proposal_modules ?? []).filter((pm) => pm.included);
  const totalInvestment = includedModules.reduce(
    (sum, pm) => sum + (pm.price_override ?? pm.module?.default_price ?? 0),
    0
  );
  const virtualRate = proposal.hourly_rate_virtual ?? consultingRates?.rate_virtual ?? 350;
  const onsiteRate = proposal.hourly_rate_onsite ?? consultingRates?.rate_onsite ?? 500;
  const formattedDate = proposal.proposal_date ? formatDate(proposal.proposal_date) : "";

  // ── Investment table rows ──────────────────────────────────────
  const investmentRows = includedModules
    .map(
      (pm) => `
      <tr>
        <td style="padding:13px 16px 13px 0;border-bottom:1px solid #EBEBEB;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#404041;">${pm.module?.name ?? "Service"}</div>
          ${pm.module?.description ? `<div style="font-size:12px;color:#767677;margin-top:3px;">${pm.module.description}</div>` : ""}
        </td>
        <td style="padding:13px 0;border-bottom:1px solid #EBEBEB;text-align:right;font-size:14px;font-weight:800;color:#404041;white-space:nowrap;">
          $${(pm.price_override ?? pm.module?.default_price ?? 0).toLocaleString()}
        </td>
      </tr>`
    )
    .join("");

  const depositRow =
    proposal.deposit_amount && proposal.deposit_amount > 0
      ? `<tr>
          <td style="padding:8px 0;color:#767677;font-size:13px;border-bottom:1px solid #EBEBEB;">Deposit (due upon agreement)</td>
          <td style="padding:8px 0;text-align:right;font-size:13px;font-weight:700;color:#767677;border-bottom:1px solid #EBEBEB;">$${proposal.deposit_amount.toLocaleString()}</td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${proposal.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      color: #404041;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    p { margin: 0 0 14px; line-height: 1.7; }
    /* Cover page: full bleed, no header/footer margin */
    @page :first { margin: 0; }
  </style>
</head>
<body>

<!-- ============================================================ -->
<!-- PAGE 1: COVER — full bleed                                   -->
<!-- ============================================================ -->
<div style="width:816px;height:1056px;display:flex;overflow:hidden;page-break-after:always;background:white;">

  <!-- Left content: 70% -->
  <div style="width:571px;flex-shrink:0;padding:64px 56px 64px 64px;display:flex;flex-direction:column;justify-content:space-between;">
    <div>
      ${images.logoFullColor
        ? `<img src="${images.logoFullColor}" style="height:50px;width:auto;" />`
        : `<div style="font-size:28px;font-weight:900;color:#00A568;">flowlyst</div>`}
    </div>
    <div>
      <h1 style="font-size:42px;font-weight:900;color:#00A568;line-height:1.1;font-style:italic;margin:0 0 18px;">
        ${proposal.title}
      </h1>
      <div style="font-size:14px;color:#404041;font-weight:600;">AI &amp; Workflow Automation</div>
    </div>
    <div style="font-size:13px;color:#555;line-height:1.9;">
      <div>Date : ${formattedDate}</div>
      <div>Prepared for : <strong style="color:#404041;">${proposal.client_name}</strong></div>
    </div>
  </div>

  <!-- Right pattern strip: 30% at 30% opacity -->
  <div style="flex:1;overflow:hidden;opacity:0.3;">
    ${images.patternStrip
      ? `<img src="${images.patternStrip}" style="height:100%;width:100%;object-fit:cover;object-position:left top;display:block;" />`
      : `<div style="height:100%;background:#00A568;"></div>`}
  </div>

</div>

<!-- ============================================================ -->
<!-- PAGE 2: OUR MISSION — static brand page                     -->
<!-- ============================================================ -->
<div style="page-break-before:always;position:relative;min-height:200px;">

  ${accent(images.patternAccentSingle, "position:absolute;top:0;right:-16px;width:44px;opacity:0.2;")}

  ${sectionHeading("Our Mission")}

  <p style="margin-bottom:18px;line-height:1.8;">At flowlyst, our mission is to revolutionize business offices by enhancing operational efficiency through innovative automation solutions. We are committed to liberating valuable time for your team by streamlining and automating business office workflows. By developing adaptable data structures, we enable deeper analysis and foster data-driven decision-making, making complex tasks like forecasting and risk assessment more accessible and efficient.</p>

  <div style="display:flex;gap:28px;align-items:flex-start;margin-bottom:18px;">
    <div style="flex:1;">
      <p style="line-height:1.8;">Our vision is to empower leaders, including Business Managers, Chief Financial Officers, Superintendents, Operations Managers, and other Administrators with the tools they need to excel. We provide cutting-edge automation technologies that simplify processes, enhance productivity, and allow leaders to focus on strategic goals rather than routine tasks. This empowerment leads to more dynamic and effective management across organizations.</p>
      <p style="line-height:1.8;">We are dedicated to building lasting relationships with our clients, whom we consider part of our extended family. Our commitment to enhancing your team's productivity is unwavering, and we strive to achieve complete satisfaction in every project. Partnering with flowlyst means investing in a future where your organizational needs are met with precision and your operations run smoother than ever. We ensure that working with us is a decision that brings lasting benefits and success.</p>
    </div>
    ${images.aiVisual && images.patternAccentSingle
      ? `<div style="flex-shrink:0;width:270px;height:270px;position:relative;">
           <img src="${images.aiVisual}"
             style="width:100%;height:100%;object-fit:cover;
                    -webkit-mask-image:url(${images.patternAccentSingle});
                    mask-image:url(${images.patternAccentSingle});
                    -webkit-mask-size:contain;mask-size:contain;
                    -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
                    -webkit-mask-position:center;mask-position:center;" />
         </div>`
      : images.aiVisual
        ? `<div style="flex-shrink:0;width:270px;">
             <img src="${images.aiVisual}" style="width:100%;height:auto;border-radius:12px;" />
           </div>`
        : ""}
  </div>

  ${accent(images.patternAccentSingle, "position:absolute;bottom:60px;right:-10px;width:60px;opacity:0.15;")}

</div>

<!-- ============================================================ -->
<!-- PAGE 3: OUR SERVICES — static brand page                    -->
<!-- ============================================================ -->
<div style="page-break-before:always;position:relative;min-height:200px;">

  ${accent(images.patternAccentSingle, "position:absolute;top:60px;left:-48px;width:40px;opacity:1;")}

  ${centeredHeading("Our Services")}

  ${subHeading("Automation consulting")}
  <p style="margin-bottom:22px;line-height:1.8;">Our automation services encompass a wide range of solutions including the development of structured budgeting systems, data visualization techniques, multi-year salary projection, enrollment projection, risk assessment models, financial projections, and the automation of Excel and Google Sheet worksheets for internal operations, among others. Our approach to automation simplifies the sharing and collaboration of data across different departments within your organization. This methodology not only facilitates the easy collection and contribution of data by allowing controlled access, but also ensures the integrity of your meticulously crafted formulas and workflows. With a central, dynamic approach to reporting, you will witness real-time updates as various departments submit their inputs. This streamlined process is designed to significantly reduce both time and stress, empowering you with critical insights. We invite you to inquire about our past projects to see how we can tailor our expertise to your needs.</p>

  ${subHeading("Training packages")}
  <p style="margin-bottom:14px;line-height:1.8;">Dive into the rapidly evolving world of artificial intelligence with our hands-on AI Training, tailored specifically for your organization. As AI reshapes how teams research, analyze, and communicate information, developing practical AI fluency has become essential for improving efficiency, transparency, and decision-making.</p>
  <p style="margin-bottom:14px;line-height:1.8;">This program demystifies the fundamentals of generative AI and focuses on real-world applications. From automating recurring reporting and streamlining operational workflows to strengthening communications, project management, and stakeholder updates, participants learn how to apply AI tools to build efficient workflows, produce actionable insights, and reduce manual workload.</p>
  <p style="margin-bottom:14px;line-height:1.8;">Each session is grounded in practical, hands-on exercises. Participants will learn how to create automated reports, perform advanced data analysis, and design AI-supported solutions for common challenges specific to your workflows.</p>
  <p style="line-height:1.8;">By the end of the program, your team will not only understand key AI tools, but will also develop tangible workflows and templates they can use immediately, positioning your organization to operate more effectively and serve your stakeholders with greater agility.</p>

  ${accent(images.patternAccentSingle, "position:absolute;bottom:40px;left:-10px;width:90px;opacity:0.18;")}

</div>

<!-- ============================================================ -->
<!-- PAGE 4: ABOUT THE TRAINER — semi-static (DB content)        -->
<!-- ============================================================ -->
<div style="page-break-before:always;position:relative;">

  ${sectionHeading("About the Trainer")}

  <div style="display:flex;gap:24px;align-items:flex-start;margin-bottom:20px;">
    ${images.azizPhoto
      ? `<img src="${images.azizPhoto}" style="width:155px;height:175px;object-fit:cover;object-position:top;border-radius:8px;flex-shrink:0;" />`
      : ""}
    <div style="font-size:14px;color:#404041;line-height:1.75;flex:1;">${nl2html(aboutContent)}</div>
  </div>

  ${accent(images.patternAccentSingle, "position:absolute;bottom:50px;right:-10px;width:55px;opacity:0.2;")}

</div>

<!-- ============================================================ -->
<!-- PAGE 5: RECOGNITION & CLIENT FEEDBACK — static brand page   -->
<!-- ============================================================ -->
<div style="page-break-before:always;position:relative;min-height:200px;">

  ${sectionHeading("Recognition &amp; Client Feedback")}

  <p style="font-weight:800;margin-bottom:12px;">Participants and partners describe Aziz's trainings as:</p>

  <p style="font-style:italic;margin-bottom:10px;">"Engaging, insightful, and filled with practical examples we can use immediately."</p>

  <div style="display:flex;gap:24px;align-items:flex-start;margin-bottom:18px;">
    <div style="flex:1;">
      <p style="font-style:italic;line-height:1.8;margin-bottom:12px;">"AI can do a lot more than I expected… The creative juices started flowing and I learned how to prompt AI so it sounds more like me, authentic and useful, not robotic."</p>
      <p style="font-style:italic;line-height:1.8;margin-bottom:18px;">"Interactive training on the practical application of Artificial Intelligence (AI) in agriculture and personal development… Key topics included AI integration into daily workflows, automation, ethics, and data-driven decision-making."</p>
    </div>
    ${images.trainingPhoto
      ? `<div style="flex-shrink:0;width:260px;">
           <img src="${images.trainingPhoto}" style="width:100%;height:auto;border-radius:8px;" />
         </div>`
      : ""}
  </div>

  <p style="font-weight:800;margin-bottom:10px;">Notable Engagements</p>
  <div style="display:flex;gap:10px;margin:7px 0;"><span style="color:#00A568;flex-shrink:0;margin-top:2px;">&#9654;</span><span><strong>Ministry of Agriculture, Azerbaijan</strong> — Led interactive, hands-on AI workshops supporting digital transformation in the agricultural sector</span></div>
  <div style="display:flex;gap:10px;margin:7px 0;"><span style="color:#00A568;flex-shrink:0;margin-top:2px;">&#9654;</span><span><strong>ASBO, NJASBO, MASBO, AASA</strong> — Multiple highly-rated sessions on AI, automation, and prompt engineering for public sector and education leaders</span></div>
  <div style="display:flex;gap:10px;margin:7px 0;"><span style="color:#00A568;flex-shrink:0;margin-top:2px;">&#9654;</span><span><strong>City of Lucas, Chicago Public Schools, and many more</strong> — Training for municipal, urban, and suburban clients across industries including retail and small business</span></div>

  <p style="margin-top:16px;line-height:1.8;">Aziz's work with flowlyst has empowered hundreds of professionals to integrate AI into their work, enhance productivity, and lead digital change in their organizations. He brings both the strategic mindset of a CFO and the technical fluency of a modern software developer, ensuring each training is practical, relevant, and impactful.</p>

  <p style="margin-top:14px;font-size:12px;color:#767677;">* You can watch more testimonials on our YouTube and LinkedIn pages:<br/>
  youtube.com/@flowlyst &nbsp;·&nbsp; linkedin.com/company/flowlyst &nbsp;·&nbsp; linkedin.com/in/azizaghayev</p>

  ${accent(images.patternAccentSingle, "position:absolute;bottom:50px;left:-10px;width:70px;opacity:0.18;")}
  ${accent(images.patternAccentSingle, "position:absolute;bottom:40px;right:-10px;width:48px;opacity:0.2;")}

</div>

<!-- ============================================================ -->
<!-- PAGE 6: RELEVANT ENGAGEMENTS — static brand page            -->
<!-- ============================================================ -->
<div style="page-break-before:always;position:relative;min-height:200px;">

  ${sectionHeading("Relevant Engagements &amp; Testimonials")}

  <p style="font-weight:800;font-size:15px;margin-bottom:6px;">Chicago Public Schools (CPS) — Transforming Operations with AI &amp; Automation</p>

  <p style="font-weight:700;margin-bottom:6px;">Context:</p>
  <p style="margin-bottom:14px;line-height:1.8;">Chicago Public Schools is one of the largest school systems in the US, with over 60,000 employees and a $9.9 billion budget. Working closely with CPS, Aziz Aghayev led a series of high-impact automation projects, integrating AI and digital tools to address complex operational and financial challenges.</p>

  <p style="font-weight:700;color:#00A568;margin-bottom:10px;">Key Solutions &amp; Impact:</p>

  <p style="font-weight:800;margin-bottom:4px;">Grant Reporting Automation:</p>
  <p style="margin-bottom:12px;line-height:1.8;">Implemented AI-driven automation for CPS's grant reporting process, saving the team approximately 60 hours per quarter.</p>

  <p style="font-weight:800;margin-bottom:4px;">Payroll Audit Automation:</p>
  <p style="margin-bottom:12px;line-height:1.8;">Designed a payroll audit workflow that reduced manual processing from 3 hours to just 30 minutes per biweekly cycle, dramatically increasing efficiency and accuracy.</p>

  <p style="font-weight:800;margin-bottom:4px;">Error Reduction &amp; Reporting Automation:</p>
  <p style="margin-bottom:12px;line-height:1.8;">Developed tools for cross-checking and comparing payroll data, minimizing errors and making compliance easier.</p>

  <p style="font-weight:800;margin-bottom:4px;">Rapid Report Generation:</p>
  <p style="margin-bottom:12px;line-height:1.8;">Enabled teams to create 60 different reports in under 15 minutes, a process that previously took up to 6 hours, allowing for faster decision-making and more time spent on strategic work.</p>

  <p style="font-weight:800;margin-bottom:4px;">Custom AI Dashboards:</p>
  <p style="margin-bottom:12px;line-height:1.8;">Supported the deployment of a dashboard with 10+ custom GPTs, empowering employees to find information and follow procedures independently. This reduced the volume of phone calls to the business office and HR, increased employee self-sufficiency, and improved overall workflow transparency.</p>

  <p style="font-weight:700;margin-bottom:6px;">Outcome:</p>
  <p style="line-height:1.8;">These automations led to significant time and cost savings, reduced human error, and empowered CPS employees to use data-driven decision-making in their day-to-day roles.</p>

  ${accent(images.patternAccentSingle, "position:absolute;bottom:50px;right:-10px;width:52px;opacity:0.2;")}

</div>

<!-- ============================================================ -->
<!-- DYNAMIC PROPOSAL SECTIONS — one page each                   -->
<!-- ============================================================ -->

${proposal.cover_note ? `
<div style="page-break-before:always;">
  ${sectionHeading("Introduction")}
  <div style="font-size:14px;color:#404041;line-height:1.75;">${nl2html(proposal.cover_note)}</div>
</div>
` : ""}

${proposal.scope_of_work ? `
<div style="page-break-before:always;">
  ${sectionHeading("Scope of Work")}
  <div style="font-size:14px;color:#404041;line-height:1.75;">${nl2html(proposal.scope_of_work)}</div>
</div>
` : ""}

${proposal.training_package ? `
<div style="page-break-before:always;">
  ${sectionHeading("Training Package")}
  <div style="font-size:14px;color:#404041;line-height:1.75;">${nl2html(proposal.training_package)}</div>
</div>
` : ""}

${proposal.deliverables ? `
<div style="page-break-before:always;">
  ${sectionHeading("Deliverables")}
  <div style="font-size:14px;color:#404041;line-height:1.75;">${nl2html(proposal.deliverables)}</div>
</div>
` : ""}

${proposal.timeline_content ? `
<div style="page-break-before:always;">
  ${sectionHeading("Timeline")}
  <div style="font-size:14px;color:#404041;line-height:1.75;">${nl2html(proposal.timeline_content)}</div>
</div>
` : ""}

${includedModules.length > 0 ? `
<div style="page-break-before:always;">
  ${sectionHeading("Investment")}
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="border-bottom:2px solid #00A568;">
        <th style="text-align:left;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.8px;color:#A8A8A9;padding:8px 16px 10px 0;">Service</th>
        <th style="text-align:right;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.8px;color:#A8A8A9;padding:8px 0 10px;">Investment</th>
      </tr>
    </thead>
    <tbody>${investmentRows}</tbody>
    <tfoot>
      ${depositRow}
      <tr>
        <td style="padding:18px 0 0;font-size:15px;font-weight:900;color:#404041;">Total Investment</td>
        <td style="padding:18px 0 0;text-align:right;font-size:26px;font-weight:900;color:#00A568;">$${totalInvestment.toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>
</div>
` : ""}

${termsContent ? `
<div style="page-break-before:always;">
  ${sectionHeading("Terms")}
  <div style="font-size:14px;color:#404041;line-height:1.75;">${nl2html(termsContent)}</div>
</div>
` : ""}

<!-- ============================================================ -->
<!-- HOURLY CONSULTING — conditional, own page                   -->
<!-- ============================================================ -->
${proposal.include_hourly_page ? `
<div style="page-break-before:always;">
  ${sectionHeading("Hourly Consulting")}

  <div style="margin-bottom:22px;">
    <div style="font-size:11px;font-weight:900;color:#00A568;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Purpose</div>
    <div style="font-size:14px;color:#404041;line-height:1.75;">
      ${nl2html(proposal.hourly_purpose || `In addition to the training package, flowlyst offers flexible hourly consulting for ${proposal.client_name} to address specific workflow needs, implementation support, or ongoing advisory as priorities evolve.`)}
    </div>
  </div>

  <div style="margin-bottom:22px;">
    <div style="font-size:11px;font-weight:900;color:#00A568;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">How I Can Help</div>
    <p style="margin-bottom:10px;">Hourly consulting can cover one or multiple areas below, depending on your priorities:</p>
    ${(proposal.hourly_service_areas ?? [
      "AI automation — drafting, summarization, classification, workflow acceleration",
      "Spreadsheet automation — Excel and Google Sheets optimization and templates",
      "Reporting automation — automated dashboards and pipelines using Looker Studio",
      "Workflow automation — repeatable processes for data intake and reconciliations",
      "Scripting and macros — Google Apps Script, Excel macros, process automation",
    ])
      .map((a) => `<div style="display:flex;gap:10px;margin:7px 0;font-size:14px;color:#404041;"><span style="color:#00A568;flex-shrink:0;margin-top:2px;">&#9654;</span><span>${a}</span></div>`)
      .join("")}
  </div>

  <div style="margin-bottom:22px;">
    <div style="font-size:11px;font-weight:900;color:#00A568;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">Professional Fee</div>
    <div style="display:flex;gap:16px;">
      <div style="padding:14px 22px;border-radius:10px;border:1.5px solid #E2E2E2;background:#F8F9FA;">
        <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:4px;">Virtual</div>
        <div style="font-size:24px;font-weight:900;color:#00A568;">$${virtualRate}<span style="font-size:13px;color:#767677;font-weight:600;">/hr</span></div>
      </div>
      <div style="padding:14px 22px;border-radius:10px;border:1.5px solid #E2E2E2;background:#F8F9FA;">
        <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#A8A8A9;margin-bottom:4px;">On-site</div>
        <div style="font-size:24px;font-weight:900;color:#00A568;">$${onsiteRate}<span style="font-size:13px;color:#767677;font-weight:600;">/hr</span></div>
      </div>
    </div>
  </div>

  <div>
    <div style="font-size:11px;font-weight:900;color:#00A568;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Terms</div>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:#404041;">
      <div><span style="color:#00A568;margin-right:6px;">&#9654;</span> <strong>Minimum:</strong> ${consultingRates?.terms_minimum ?? "1-hour minimum per session"}</div>
      <div><span style="color:#00A568;margin-right:6px;">&#9654;</span> <strong>Billing:</strong> ${consultingRates?.terms_billing ?? "Net 30"}</div>
      <div><span style="color:#00A568;margin-right:6px;">&#9654;</span> <strong>Scope:</strong> ${consultingRates?.terms_scope ?? "Flexible and can evolve based on progress and priorities"}</div>
      ${consultingRates?.travel_note ? `<div><span style="color:#00A568;margin-right:6px;">&#9654;</span> <strong>Travel:</strong> ${consultingRates.travel_note}</div>` : ""}
    </div>
  </div>
</div>
` : ""}

<!-- ============================================================ -->
<!-- BACK COVER — full teal, own page                            -->
<!-- ============================================================ -->
<div style="page-break-before:always;display:flex;align-items:center;justify-content:center;min-height:840px;">
  <div style="background:#00A568;border-radius:20px;padding:90px 64px;text-align:center;width:100%;display:flex;flex-direction:column;align-items:center;gap:44px;min-height:740px;justify-content:center;">

    ${images.patternAccentWhite
      ? `<div style="opacity:0.25;"><img src="${images.patternAccentWhite}" style="width:90px;height:auto;" /></div>`
      : ""}

    <p style="color:white;font-size:16px;line-height:1.9;font-weight:400;max-width:440px;">
      <strong>Thank you</strong> for considering this proposal. We are excited about the possibility of partnering with your organization to harness the power of AI for enhancing your operations. We look forward to the opportunity to work together and contribute to your success. Please do not hesitate to reach out with any questions or for further discussion.
    </p>

    ${images.logoFullWhite
      ? `<img src="${images.logoFullWhite}" style="height:52px;width:auto;" />`
      : `<div style="font-size:30px;font-weight:900;color:white;">flowlyst</div>`}

  </div>
</div>

</body>
</html>`;
}
