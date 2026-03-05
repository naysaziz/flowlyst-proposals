"use client";

import Link from "next/link";

interface Props {
  proposalId: string;
  proposalTitle: string;
  shareUuid: string;
}

export default function PreviewToolbar({ proposalId, proposalTitle, shareUuid }: Props) {
  function copyShareLink() {
    const url = `${window.location.origin}/share/${shareUuid}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="no-print bg-[var(--dark)] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href={`/proposals/${proposalId}`}
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/60 hover:text-white transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
          Back to editor
        </Link>
        <span className="text-white/20">|</span>
        <span className="text-[13px] font-bold text-white truncate max-w-[300px]">
          {proposalTitle}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={copyShareLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-white/10 text-white text-[12px] font-semibold hover:bg-white/20 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy share link
        </button>

        <a
          href={`/api/pdf/${proposalId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[var(--teal)] text-white text-[12px] font-bold hover:bg-[var(--teal-dark)] transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export PDF
        </a>
      </div>
    </div>
  );
}
