import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProposalPreview from "@/components/preview/ProposalPreview";
import PreviewToolbar from "@/components/preview/PreviewToolbar";

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: proposal },
    { data: consultingRates },
    { data: contentBlocks },
  ] = await Promise.all([
    supabase
      .from("proposals")
      .select(
        "*, org_type:organization_types(*), proposal_modules(*, module:modules(*))"
      )
      .eq("id", params.id)
      .single(),
    supabase.from("consulting_rate_settings").select("*").single(),
    supabase.from("content_blocks").select("key, content"),
  ]);

  if (!proposal) notFound();

  const aboutContent =
    contentBlocks?.find((b) => b.key === "about_flowlyst_full")?.content ?? "";
  const termsContent =
    contentBlocks?.find((b) => b.key === "terms_standard")?.content ?? "";

  return (
    <div className="flex flex-col min-h-screen">
      <PreviewToolbar
        proposalId={params.id}
        proposalTitle={proposal.title}
        shareUuid={proposal.share_uuid}
      />

      <div className="flex-1 bg-[var(--bg)] py-8">
        <div className="max-w-[900px] mx-auto bg-white shadow-md rounded-[4px] overflow-hidden">
          <ProposalPreview
            proposal={proposal}
            consultingRates={consultingRates}
            aboutContent={aboutContent}
            termsContent={termsContent}
          />
        </div>
      </div>
    </div>
  );
}
