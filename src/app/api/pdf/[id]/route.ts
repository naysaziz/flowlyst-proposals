import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildProposalHTML } from "@/lib/pdf";
import fs from "fs";
import path from "path";

function loadBase64(filename: string): string {
  try {
    const filepath = path.join(process.cwd(), "public", "images", filename);
    const data = fs.readFileSync(filepath);
    const ext = path.extname(filename).toLowerCase();
    const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${data.toString("base64")}`;
  } catch {
    return "";
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [
      { data: proposal },
      { data: consultingRates },
      { data: contentBlocks },
    ] = await Promise.all([
      supabase
        .from("proposals")
        .select("*, proposal_modules(*, module:modules(*))")
        .eq("id", params.id)
        .single(),
      supabase.from("consulting_rate_settings").select("*").single(),
      supabase.from("content_blocks").select("key, content"),
    ]);

    if (!proposal) {
      return new Response("Proposal not found", { status: 404 });
    }

    const aboutContent =
      contentBlocks?.find((b: { key: string }) => b.key === "about_flowlyst_full")
        ?.content ?? "";
    const termsContent =
      contentBlocks?.find((b: { key: string }) => b.key === "terms_standard")
        ?.content ?? "";

    const images = {
      logoFullColor: loadBase64("logo-full-color.png"),
      logoFullWhite: loadBase64("logo-full-white.png"),
      logoIconColor: loadBase64("logo-icon-color.png"),
      patternStrip: loadBase64("pattern-strip.png"),
      patternAccent: loadBase64("pattern-accent.png"),
      patternAccentWhite: loadBase64("pattern-accent-white.png"),
      azizPhoto: loadBase64("aziz-photo.png"),
      aiVisual: loadBase64("ai-visual.png"),
      trainingPhoto: loadBase64("training-photo.jpg"),
      patternAccentSingle: loadBase64("pattern-accent-single.png"),
      patternAccentSingleWhite: loadBase64("pattern-accent-single-white.png"),
    };

    const html = buildProposalHTML({
      proposal,
      consultingRates,
      aboutContent,
      termsContent,
      images,
    });

    // Lazy-require puppeteer to avoid import issues
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Running header: logo icon + "Proposal prepared for: Client" on every non-cover page
    const headerTemplate = `<div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;width:100%;padding:18px 64px 0;display:flex;align-items:center;gap:10px;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#A8A8A9;">
      ${images.logoIconColor ? `<img src="${images.logoIconColor}" style="height:22px;width:auto;flex-shrink:0;" />` : ""}
      <span>Proposal prepared for : <strong style="color:#404041;">${proposal.client_name}</strong></span>
      <div style="flex:1;height:1px;background:#E0E0E0;margin-left:12px;"></div>
    </div>`;

    // Running footer: teal rule + contact info centered
    const footerTemplate = `<div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;width:100%;padding:0 64px 14px;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#A8A8A9;text-align:center;border-top:1.5px solid #00A568;">
      +1(857)999-1234 &nbsp;&nbsp;|&nbsp;&nbsp; flowlyst.io &nbsp;&nbsp;|&nbsp;&nbsp; aziz@flowlyst.io
    </div>`;

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      // Cover page uses @page :first { margin: 0 } in CSS → full bleed, no header/footer space
      // All other pages use these margins → proper gutters + header/footer area
      margin: { top: "68px", right: "64px", bottom: "52px", left: "64px" },
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
    });

    await browser.close();

    const filename = `${proposal.title.replace(/[^a-z0-9\s-]/gi, "").replace(/\s+/g, "-")}.pdf`;

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[pdf]", err);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
