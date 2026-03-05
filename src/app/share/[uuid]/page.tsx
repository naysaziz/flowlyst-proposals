import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ProposalPreview from "@/components/preview/ProposalPreview";

export default async function SharePage({
  params,
}: {
  params: { uuid: string };
}) {
  // Use anon key — RLS allows public read by share_uuid
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: proposal } = await supabase
    .from("proposals")
    .select(
      "*, org_type:organization_types(*), proposal_modules(*, module:modules(*))"
    )
    .eq("share_uuid", params.uuid)
    .single();

  if (!proposal) notFound();

  // Use service role for rate settings (not in public RLS)
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: consultingRates }, { data: contentBlocks }] = await Promise.all([
    adminSupabase.from("consulting_rate_settings").select("*").single(),
    adminSupabase.from("content_blocks").select("key, content"),
  ]);

  const aboutContent =
    contentBlocks?.find((b: { key: string }) => b.key === "about_flowlyst_full")
      ?.content ?? "";
  const termsContent =
    contentBlocks?.find((b: { key: string }) => b.key === "terms_standard")
      ?.content ?? "";

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Public header */}
      <div className="bg-white border-b border-[var(--light)] px-8 py-4 flex items-center justify-between">
        <div className="text-[17px] font-black text-[var(--dark)] tracking-tight">
          flowlyst
          <span className="text-[var(--teal)]">.</span>
        </div>
        <div className="text-[12px] text-[var(--muted)] font-semibold">
          Proposal — {proposal.client_name}
        </div>
      </div>

      {/* Preview */}
      <div className="py-8">
        <div className="max-w-[900px] mx-auto bg-white shadow-md rounded-[4px] overflow-hidden">
          <ProposalPreview
            proposal={proposal}
            consultingRates={consultingRates}
            aboutContent={aboutContent}
            termsContent={termsContent}
          />
        </div>
      </div>

      <div className="text-center py-6 text-[11.5px] text-[var(--muted)]">
        Prepared by flowlyst · flowlyst.io
      </div>
    </div>
  );
}
