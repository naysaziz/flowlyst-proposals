import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { generateStream } from "@/lib/ai/generate";
import type { AISectionRequest } from "@/types";

const SECTION_LABELS: Record<string, string> = {
  scope: "Scope of Work",
  timeline: "Timeline",
  deliverables: "Deliverables",
  intro: "Introduction / Cover Note",
  training_package: "Training Package",
  hourly_page: "Hourly Consulting Page",
  full: "Full Proposal",
};

function buildUserMessage(req: AISectionRequest): string {
  const label = SECTION_LABELS[req.section] ?? req.section;
  const lines: string[] = [
    "MODE: Section Refinement",
    "",
    `Section: ${label}`,
    `Client: ${req.clientName}`,
  ];

  if (req.orgType) lines.push(`Organization type: ${req.orgType}`);
  if (req.proposalType) lines.push(`Proposal type: ${req.proposalType}`);
  if (req.modules?.length) lines.push(`Modules: ${req.modules.join(", ")}`);

  lines.push("");

  if (req.currentContent?.trim()) {
    lines.push(`Current content:\n"""\n${req.currentContent}\n"""`);
    lines.push("");
  }

  lines.push(`Instruction: ${req.changeInstruction}`);

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body: AISectionRequest = await request.json();

    if (!body.changeInstruction?.trim()) {
      return new Response("changeInstruction is required", { status: 400 });
    }
    if (!body.model?.trim()) {
      return new Response("model is required", { status: 400 });
    }

    const skillPath = join(
      process.cwd(),
      "src/lib/ai/proposal-writer-skill.md"
    );
    const systemPrompt = readFileSync(skillPath, "utf-8");
    const userMessage = buildUserMessage(body);

    const stream = await generateStream({
      model: body.model,
      systemPrompt,
      userMessage,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[change-section]", err);
    return new Response("Internal server error", { status: 500 });
  }
}
