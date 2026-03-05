import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProposalEditor from "@/components/proposal/ProposalEditor";

export default async function ProposalEditorPage({
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
    { data: allModules },
    { data: orgTypes },
    { data: consultingRates },
  ] = await Promise.all([
    supabase
      .from("proposals")
      .select(
        "*, org_type:organization_types(*), proposal_modules(*, module:modules(*))"
      )
      .eq("id", params.id)
      .single(),
    supabase.from("modules").select("*").eq("active", true).order("sort_order"),
    supabase
      .from("organization_types")
      .select("*")
      .eq("active", true)
      .order("sort_order"),
    supabase.from("consulting_rate_settings").select("*").single(),
  ]);

  if (!proposal) notFound();

  return (
    <ProposalEditor
      proposal={proposal}
      allModules={allModules ?? []}
      orgTypes={orgTypes ?? []}
      consultingRates={consultingRates}
    />
  );
}
