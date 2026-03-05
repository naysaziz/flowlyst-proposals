"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types";

const navMain = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/proposals/new",
    label: "New Proposal",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    ),
  },
];

const navAdmin = [
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/modules", label: "Modules", icon: "📦" },
  { href: "/admin/content", label: "Content Blocks", icon: "✏️" },
  { href: "/admin/org-types", label: "Org Types", icon: "🏢" },
  { href: "/admin/ai-models", label: "AI Models", icon: "🤖" },
];

export default function Sidebar({ user }: { user: UserProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[248px] min-h-screen bg-white border-r border-[#EBEBEB] flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* Brand */}
      <div className="px-5 py-[22px] border-b border-[#F2F2F2]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[11px] bg-brand-gradient flex items-center justify-center shadow-teal flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 4h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5V4z" fill="white" />
              <path d="M5 11h9a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5v-4z" fill="rgba(255,255,255,0.75)" />
              <path d="M5 18h11a1 1 0 0 1 1 1v1H5v-2z" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <div>
            <div className="text-[17px] font-black text-[var(--dark)] tracking-tight leading-none">
              flowlyst
            </div>
            <div className="text-[10.5px] font-bold text-[var(--teal)] uppercase tracking-[1.2px] mt-0.5">
              Proposals
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <div className="text-[9.5px] font-extrabold uppercase tracking-[1.5px] text-[var(--muted)] px-2.5 py-3">
          Main
        </div>
        {navMain.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-[9px] rounded-[9px] text-[13.5px] font-semibold transition-all ${
              isActive(item.href)
                ? "bg-[var(--teal-light)] text-[var(--teal)]"
                : "text-[var(--mid)] hover:bg-[var(--bg)] hover:text-[var(--dark)]"
            }`}
          >
            <span className={isActive(item.href) ? "opacity-100" : "opacity-65"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="text-[9.5px] font-extrabold uppercase tracking-[1.5px] text-[var(--muted)] px-2.5 pt-5 pb-2">
              Admin
            </div>
            {navAdmin.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-[9px] rounded-[9px] text-[13.5px] font-semibold transition-all ${
                  isActive(item.href)
                    ? "bg-[var(--teal-light)] text-[var(--teal)]"
                    : "text-[var(--mid)] hover:bg-[var(--bg)] hover:text-[var(--dark)]"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-[#F2F2F2] p-4">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] hover:bg-[var(--bg)] transition-colors">
          <div className="w-[34px] h-[34px] rounded-full bg-brand-gradient flex items-center justify-center text-white text-[13px] font-black flex-shrink-0">
            {user?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-extrabold text-[var(--dark)] truncate">
              {user?.full_name ?? "Aziz"}
            </div>
            <div className="text-[11px] font-semibold text-[var(--muted)] truncate">
              flowlyst Consulting
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="p-1.5 rounded-[6px] text-[var(--muted)] hover:bg-[var(--light)] hover:text-[var(--dark)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
