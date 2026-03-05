"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo / brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] bg-brand-gradient shadow-teal mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M5 4h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5V4z" fill="white" />
              <path d="M5 11h9a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5v-4z" fill="rgba(255,255,255,0.75)" />
              <path d="M5 18h11a1 1 0 0 1 1 1v1H5v-2z" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[var(--dark)] tracking-tight">
            flowlyst
          </h1>
          <p className="text-sm font-semibold text-[var(--muted)] mt-1 uppercase tracking-widest">
            Proposals
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[14px] shadow p-8">
          <h2 className="text-lg font-extrabold text-[var(--dark)] mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[var(--mid)] mb-6">
            Sign in to manage your consulting proposals.
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[9px] border-[1.5px] border-[var(--light)] bg-white hover:bg-[var(--bg)] transition-all font-bold text-sm text-[var(--dark)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[var(--light)] border-t-[var(--teal)] rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </button>
        </div>

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          Access is by invitation only.
        </p>
      </div>
    </div>
  );
}
