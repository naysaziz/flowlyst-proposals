import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  return (
    <UsersClient
      users={users ?? []}
      invitations={invitations ?? []}
    />
  );
}
