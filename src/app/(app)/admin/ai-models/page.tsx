import { createClient } from "@/lib/supabase/server";
import AIModelsClient from "./AIModelsClient";

export default async function AdminAIModelsPage() {
  const supabase = await createClient();
  const { data: models } = await supabase
    .from("ai_providers")
    .select("*")
    .order("sort_order", { ascending: true });

  return <AIModelsClient models={models ?? []} />;
}
