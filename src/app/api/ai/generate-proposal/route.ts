import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { generateStream } from "@/lib/ai/generate";
import type { ProposalType } from "@/types";

interface GenerateProposalRequest {
  model: string;
  description: string;
  proposalType: ProposalType;
  orgType?: string;
  clientName: string;
  sections?: string[];
}

function buildUserMessage(req: GenerateProposalRequest): string {
  const requestedSections = req.sections?.length
    ? req.sections.join(", ")
    : "cover_note, scope_of_work, training_package, deliverables, timeline_content";

  const lines = [
    "MODE: Full Proposal Generation",
    "",
    `Client: ${req.clientName}`,
    `Proposal type: ${req.proposalType}`,
  ];

  if (req.orgType) lines.push(`Organization type: ${req.orgType}`);

  lines.push(
    "",
    `Description: ${req.description}`,
    "",
    `Generate content for these sections: ${requestedSections}`,
    "",
    "Return a JSON object with keys matching the section names. Each value must be clean prose ready to insert into the proposal."
  );

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateProposalRequest = await request.json();

    if (!body.description?.trim()) {
      return new Response("description is required", { status: 400 });
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
    console.error("[generate-proposal]", err);
    return new Response("Internal server error", { status: 500 });
  }
}
