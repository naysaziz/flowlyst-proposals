import { createClient } from "@/lib/supabase/server";
import OrgTypesClient from "./OrgTypesClient";

export default async function AdminOrgTypesPage() {
  const supabase = await createClient();
  const { data: orgTypes } = await supabase
    .from("organization_types")
    .select("*")
    .order("sort_order", { ascending: true });

  return <OrgTypesClient orgTypes={orgTypes ?? []} />;
}
