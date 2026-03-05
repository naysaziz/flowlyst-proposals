import { createClient } from "@/lib/supabase/server";
import ContentClient from "./ContentClient";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("*")
    .order("key", { ascending: true });

  return <ContentClient blocks={blocks ?? []} />;
}
