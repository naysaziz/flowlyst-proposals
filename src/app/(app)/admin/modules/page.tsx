import { createClient } from "@/lib/supabase/server";
import ModulesClient from "./ModulesClient";

export default async function AdminModulesPage() {
  const supabase = await createClient();
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ModulesClient modules={modules ?? []} />;
}
