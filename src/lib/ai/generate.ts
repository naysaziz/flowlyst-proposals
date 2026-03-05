import { streamWithAnthropic } from "./providers/anthropic";
import { streamWithOpenAI } from "./providers/openai";
import { streamWithGoogle } from "./providers/google";

export interface GenerateStreamParams {
  model: string;
  systemPrompt: string;
  userMessage: string;
}

export async function generateStream(
  params: GenerateStreamParams
): Promise<ReadableStream<Uint8Array>> {
  const { model, systemPrompt, userMessage } = params;

  if (model.startsWith("claude")) {
    return streamWithAnthropic(model, systemPrompt, userMessage);
  }

  if (
    model.startsWith("gpt") ||
    model.startsWith("o1") ||
    model.startsWith("o3") ||
    model.startsWith("o4")
  ) {
    return streamWithOpenAI(model, systemPrompt, userMessage);
  }

  if (model.startsWith("gemini")) {
    return streamWithGoogle(model, systemPrompt, userMessage);
  }

  throw new Error(`Unknown model: ${model}`);
}
