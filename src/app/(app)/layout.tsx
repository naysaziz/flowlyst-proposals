import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/ui/Sidebar";
import { ModelProvider } from "@/contexts/ModelContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("user_preferences")
      .select("preferred_model")
      .eq("user_id", user.id)
      .single(),
  ]);

  const defaultModel = prefs?.preferred_model ?? "claude-sonnet-4-6";

  return (
    <ModelProvider defaultModel={defaultModel}>
      <div className="flex min-h-screen bg-[var(--bg)]">
        <Sidebar user={profile} />
        <main className="flex-1 ml-[248px] flex flex-col min-h-screen">
          {children}
        </main>
      </div>
    </ModelProvider>
  );
}
