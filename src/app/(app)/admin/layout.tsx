import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const adminNav = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/org-types", label: "Org Types" },
  { href: "/admin/modules", label: "Modules" },
  { href: "/admin/content", label: "Content Blocks" },
  { href: "/admin/ai-models", label: "AI Models" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex-1 flex flex-col">
      {/* Admin topbar */}
      <div className="bg-white border-b border-[#EBEBEB] px-8 py-0 flex items-center gap-1">
        <span className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-[var(--muted)] mr-4 py-4">
          Admin
        </span>
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3.5 py-4 text-[13px] font-semibold text-[var(--mid)] hover:text-[var(--dark)] border-b-2 border-transparent hover:border-[var(--teal)] transition-all"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Page content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
