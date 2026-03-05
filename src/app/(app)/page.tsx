import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ModelSelector from "@/components/ui/ModelSelector";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, org_type:organization_types(label)")
    .order("created_at", { ascending: false });

  const total = proposals?.length ?? 0;
  const sent = proposals?.filter((p) => p.status === "sent").length ?? 0;
  const accepted = proposals?.filter((p) => p.status === "accepted").length ?? 0;
  const winRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return (
    <div className="flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-[var(--light)] px-8 h-[62px] flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-[18px] font-black text-[var(--dark)] tracking-tight">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <ModelSelector />
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-2 px-4 py-[9px] rounded-[9px] bg-[var(--teal)] text-white text-[13.5px] font-bold hover:bg-[var(--teal-dark)] transition-all hover:-translate-y-px hover:shadow-teal"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Proposal
          </Link>
        </div>
      </header>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {[
            { label: "Total Proposals", value: total, color: "text-[var(--dark)]", icon: "📄" },
            { label: "Sent", value: sent, color: "text-[var(--purple)]", icon: "📤" },
            { label: "Accepted", value: accepted, color: "text-[var(--teal)]", icon: "✅" },
            { label: "Win Rate", value: total > 0 ? `${winRate}%` : "—", color: "text-[#C68A00]", icon: "🎯" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`bg-white rounded-[14px] shadow-sm p-5 animate-fade-up delay-${i + 1} hover:-translate-y-0.5 hover:shadow transition-all`}
            >
              <div className="text-xl mb-3">{stat.icon}</div>
              <div className={`text-3xl font-black tracking-tight leading-none mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Proposals table */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-black text-[var(--dark)]">All Proposals</h2>
        </div>

        <div className="bg-white rounded-[14px] shadow-sm overflow-hidden animate-fade-up delay-3">
          {proposals && proposals.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--light)]">
                  {["Proposal", "Client", "Type", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--muted)] px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-[13.5px] font-extrabold text-[var(--dark)] group-hover:text-[var(--teal)] transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11.5px] font-semibold text-[var(--muted)] mt-0.5">
                        {p.client_contact || p.client_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-[var(--dark)]">
                      {p.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <TypeChip type={p.type} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-[12.5px] font-semibold text-[var(--mid)]">
                      {new Date(p.proposal_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="text-[12px] font-bold text-[var(--teal)] hover:underline"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-[15px] font-extrabold text-[var(--dark)] mb-2">No proposals yet</h3>
              <p className="text-sm text-[var(--mid)] mb-6">Create your first proposal to get started.</p>
              <Link
                href="/proposals/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[9px] bg-[var(--teal)] text-white text-sm font-bold hover:bg-[var(--teal-dark)] transition-all"
              >
                + New Proposal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeChip({ type }: { type: string }) {
  const styles: Record<string, string> = {
    training: "bg-[var(--purple-light)] text-[var(--purple)]",
    software: "bg-[#EEF6FF] text-[#2A7FD4]",
    salary: "bg-[#FFF4ED] text-[#D06B2A]",
  };
  return (
    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-[5px] capitalize ${styles[type] || ""}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-[#F5F5F5] text-[#999]",
    sent: "bg-[#EEF6FF] text-[#2A7FD4]",
    accepted: "bg-[var(--teal-light)] text-[var(--teal)]",
    declined: "bg-[#FFF0F0] text-[#D44B4B]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full capitalize ${styles[status] || ""}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
