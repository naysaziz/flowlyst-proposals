"use client";

import { useState, useRef, useEffect } from "react";
import type { ProposalType } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  proposalType: ProposalType;
  orgType?: string;
  clientName: string;
  model: string;
  onApplySection: (section: string, content: string) => void;
}

const SECTION_OPTIONS = [
  { value: "full", label: "Entire proposal" },
  { value: "intro", label: "Introduction" },
  { value: "scope", label: "Scope of Work" },
  { value: "training_package", label: "Training Package" },
  { value: "deliverables", label: "Deliverables" },
  { value: "timeline", label: "Timeline" },
  { value: "hourly_page", label: "Hourly Consulting Page" },
];

const SPARKLE_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

export default function AIChatPanel({
  isOpen,
  onClose,
  proposalType,
  orgType,
  clientName,
  model,
  onApplySection,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedSection, setSelectedSection] = useState("full");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);
    setInput("");
    setIsStreaming(true);

    const body = {
      section: selectedSection,
      currentContent: "",
      changeInstruction: input,
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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulated, streaming: true }
              : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Something went wrong. Please try again.",
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleApply(messageContent: string) {
    onApplySection(selectedSection, messageContent);
  }

  function handleStop() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[420px] bg-white shadow-md z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--light)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-brand-gradient flex items-center justify-center text-white">
              {SPARKLE_ICON}
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-[var(--dark)]">
                AI Assistant
              </div>
              <div className="text-[10.5px] font-semibold text-[var(--muted)]">
                {model}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--dark)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Section selector */}
        <div className="px-4 py-3 border-b border-[var(--light)] bg-[var(--bg)]">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
            Target section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full text-[12.5px] font-semibold text-[var(--dark)] bg-white border border-[var(--light)] rounded-[8px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30"
          >
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-12 h-12 rounded-[14px] bg-brand-gradient flex items-center justify-center text-white mb-3 opacity-80">
                {SPARKLE_ICON}
              </div>
              <p className="text-[13.5px] font-bold text-[var(--dark)] mb-1">
                What would you like to write?
              </p>
              <p className="text-[12px] text-[var(--muted)] max-w-[240px]">
                Describe the change you want &mdash; I&apos;ll write the proposal content for you.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`animate-fade-up ${
                msg.role === "user" ? "flex justify-end" : ""
              }`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[80%] px-3.5 py-2.5 rounded-[12px] bg-[var(--teal)] text-white text-[13px] font-medium leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[13px] text-[var(--dark)] leading-relaxed bg-[var(--bg)] rounded-[12px] px-4 py-3 whitespace-pre-wrap">
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-0.5 h-4 bg-[var(--teal)] animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                  {!msg.streaming && msg.content && (
                    <button
                      onClick={() => handleApply(msg.content)}
                      className="text-[11.5px] font-bold text-[var(--teal)] hover:text-[var(--teal-dark)] transition-colors flex items-center gap-1"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Apply to proposal
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--light)] p-4 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe what to write or change…"
              rows={2}
              disabled={isStreaming}
              className="flex-1 text-[13px] text-[var(--dark)] bg-[var(--bg)] rounded-[10px] border border-[var(--light)] px-3 py-2.5 resize-none placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-opacity-30 disabled:opacity-50"
            />
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="flex-shrink-0 w-[38px] h-[38px] rounded-[10px] bg-red-100 text-red-500 hover:bg-red-200 transition-colors flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex-shrink-0 w-[38px] h-[38px] rounded-[10px] bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22,2 15,22 11,13 2,9" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-[10.5px] text-[var(--muted)] mt-2">
            ↵ Send · Shift+↵ new line
          </p>
        </div>
      </div>
    </>
  );
}
