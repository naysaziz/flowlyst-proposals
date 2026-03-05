"use client";

import { useState, useRef } from "react";
import type { AISectionRequest, ProposalType } from "@/types";

interface InlineChangerProps {
  section: AISectionRequest["section"];
  currentContent: string;
  proposalType: ProposalType;
  orgType?: string;
  clientName: string;
  model: string;
  onAccept: (newContent: string) => void;
  label?: string;
}

type State = "idle" | "open" | "streaming" | "preview";

const SPARKLE_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

export default function InlineChanger({
  section,
  currentContent,
  proposalType,
  orgType,
  clientName,
  model,
  onAccept,
  label = "Change with AI",
}: InlineChangerProps) {
  const [state, setState] = useState<State>("idle");
  const [instruction, setInstruction] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit() {
    if (!instruction.trim()) return;
    setStreamedText("");
    setError("");
    setState("streaming");

    const body: AISectionRequest = {
      section,
      currentContent,
      changeInstruction: instruction,
      proposalType,
      orgType,
      clientName,
      model,
    };

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/ai/change-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedText(accumulated);
      }

      setState("preview");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setState("open");
    }
  }

  function handleAccept() {
    onAccept(streamedText);
    setInstruction("");
    setStreamedText("");
    setState("idle");
  }

  function handleReject() {
    setStreamedText("");
    setState("open");
  }

  function handleCancel() {
    abortRef.current?.abort();
    setInstruction("");
    setStreamedText("");
    setError("");
    setState("idle");
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("open")}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--teal)] hover:text-[var(--teal-dark)] transition-colors group"
      >
        <span className="opacity-80 group-hover:opacity-100 transition-opacity">
          {SPARKLE_ICON}
        </span>
        {label}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-[12px] border border-[var(--teal)] border-opacity-30 bg-[var(--teal-light)] overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--teal)] border-opacity-20">
        <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--teal)]">
          {SPARKLE_ICON}
          <span>Change with AI</span>
          {state === "streaming" && (
            <span className="flex gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-[var(--teal)] animate-pulse-teal"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </span>
          )}
        </div>
        {state !== "streaming" && (
          <button
            onClick={handleCancel}
            className="text-[var(--muted)] hover:text-[var(--dark)] transition-colors p-0.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Instruction input — visible in open + streaming */}
        {(state === "open" || state === "streaming") && (
          <div className="space-y-3">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              placeholder="Describe what to change… (e.g. Make it shorter, Add week 3, Change tone for a law firm)"
              rows={2}
              disabled={state === "streaming"}
              className="w-full text-[13px] text-[var(--dark)] bg-white rounded-[8px] border border-[var(--teal)] border-opacity-30 px-3 py-2.5 resize-none placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && (
              <p className="text-[11.5px] text-red-500 font-medium">{error}</p>
            )}
            {state === "open" && (
              <button
                onClick={handleSubmit}
                disabled={!instruction.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[var(--teal)] text-white text-[12.5px] font-bold hover:bg-[var(--teal-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {SPARKLE_ICON}
                Apply change
                <span className="text-white/60 text-[10px] ml-1">⌘↵</span>
              </button>
            )}
          </div>
        )}

        {/* Streamed / preview output */}
        {(state === "streaming" || state === "preview") && streamedText && (
          <div className="mt-3 space-y-3">
            <div
              className={`text-[13px] text-[var(--dark)] leading-relaxed bg-white rounded-[8px] px-3 py-3 border border-[var(--light)] whitespace-pre-wrap ${
                state === "streaming" ? "animate-pulse-teal" : ""
              }`}
              style={{ animationDuration: "2s" }}
            >
              {streamedText}
              {state === "streaming" && (
                <span className="inline-block w-0.5 h-4 bg-[var(--teal)] animate-pulse ml-0.5 align-middle" />
              )}
            </div>

            {state === "preview" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] bg-[var(--teal)] text-white text-[12px] font-bold hover:bg-[var(--teal-dark)] transition-all"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  Accept
                </button>
                <button
                  onClick={handleReject}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] bg-white border border-[var(--light)] text-[var(--mid)] text-[12px] font-bold hover:text-[var(--dark)] hover:border-[var(--muted)] transition-all"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
