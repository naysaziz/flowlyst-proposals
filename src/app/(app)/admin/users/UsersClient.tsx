"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

type Invitation = {
  id: string;
  email: string;
  role: string;
  expires_at: string;
};

const ROLES = ["admin", "editor", "viewer"] as const;

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    editor: "bg-teal-50 text-teal-700 border-teal-200",
    viewer: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${styles[role] ?? styles.viewer}`}>
      {role}
    </span>
  );
}

export default function UsersClient({
  users,
  invitations,
}: {
  users: UserProfile[];
  invitations: Invitation[];
}) {
  const supabase = createClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localUsers, setLocalUsers] = useState(users);
  const [localInvitations, setLocalInvitations] = useState(invitations);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setMessage(null);

    const { error } = await supabase
      .from("invitations")
      .insert({ email: inviteEmail.trim().toLowerCase(), role: inviteRole });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: `Invitation created for ${inviteEmail}` });
      setLocalInvitations([
        {
          id: crypto.randomUUID(),
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        },
        ...localInvitations,
      ]);
      setInviteEmail("");
    }
    setInviting(false);
  }

  async function handleRoleChange(userId: string, role: string) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role })
      .eq("id", userId);

    if (!error) {
      setLocalUsers(localUsers.map((u) => (u.id === userId ? { ...u, role: role as UserProfile["role"] } : u)));
    }
  }

  async function handleRevokeInvite(id: string) {
    const { error } = await supabase.from("invitations").delete().eq("id", id);
    if (!error) setLocalInvitations(localInvitations.filter((i) => i.id !== id));
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--dark)]">Users</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Manage team access and invite new members.</p>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-[14px] border border-[#EBEBEB] p-6 mb-8">
        <h2 className="text-[15px] font-extrabold text-[var(--dark)] mb-4">Invite User</h2>
        <form onSubmit={handleInvite} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)] mb-1.5 block">
              Email address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)] mb-1.5 block">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
              className="px-3.5 py-2.5 rounded-[9px] border border-[#DDDDE0] text-sm font-medium text-[var(--dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent bg-white transition"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="px-5 py-2.5 rounded-[9px] bg-[var(--teal)] text-white text-sm font-bold hover:bg-[var(--teal-dark)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {inviting ? "Sending…" : "Send Invite"}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm font-semibold ${message.type === "success" ? "text-[var(--teal)]" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#F5F5F5]">
          <h2 className="text-[15px] font-extrabold text-[var(--dark)]">
            Active Users <span className="text-[var(--muted)] font-semibold text-sm ml-1">({localUsers.length})</span>
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] border-b border-[#F5F5F5]">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {localUsers.map((user) => (
              <tr key={user.id} className="border-b border-[#F9F9F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[12px] font-black flex-shrink-0">
                      {user.full_name?.[0] ?? user.email[0].toUpperCase()}
                    </div>
                    <span className="text-[13.5px] font-semibold text-[var(--dark)]">
                      {user.full_name ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-[13px] text-[var(--mid)]">{user.email}</td>
                <td className="px-6 py-3.5">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-[12px] font-bold px-2.5 py-1 rounded-full border appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-3.5 text-[13px] text-[var(--muted)]">
                  {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {localUsers.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-[var(--muted)]">No users yet.</div>
        )}
      </div>

      {/* Pending invitations */}
      {localInvitations.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F5F5]">
            <h2 className="text-[15px] font-extrabold text-[var(--dark)]">
              Pending Invitations <span className="text-[var(--muted)] font-semibold text-sm ml-1">({localInvitations.length})</span>
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] border-b border-[#F5F5F5]">
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3">Expires</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {localInvitations.map((inv) => (
                <tr key={inv.id} className="border-b border-[#F9F9F9] last:border-0">
                  <td className="px-6 py-3.5 text-[13px] font-medium text-[var(--dark)]">{inv.email}</td>
                  <td className="px-6 py-3.5"><RoleBadge role={inv.role} /></td>
                  <td className="px-6 py-3.5 text-[13px] text-[var(--muted)]">
                    {new Date(inv.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="text-[12px] font-semibold text-red-400 hover:text-red-600 transition"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
