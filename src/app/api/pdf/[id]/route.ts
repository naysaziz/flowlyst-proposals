import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildProposalHTML } from "@/lib/pdf";

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

    const html = buildProposalHTML({
      proposal,
      consultingRates,
      aboutContent,
      termsContent,
    });

    // Lazy-require puppeteer to avoid import issues
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
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
