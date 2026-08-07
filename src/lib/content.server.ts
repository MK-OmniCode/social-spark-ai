import { streamText, Output, NoObjectGeneratedError } from "ai";
import type { z } from "zod";
import { createGeminiProvider } from "./ai-gateway.server";
import { WeekSchema, buildPrompt, type GenerateInput } from "./content-types";

export async function runGeneration(data: z.infer<typeof GenerateInput>) {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const provider = createGeminiProvider(key);

  try {
    const result = streamText({
      model: provider(process.env["GEMINI_MODEL"] || "gemini-3-flash-preview"),
      output: Output.object({ schema: WeekSchema }),
      prompt: buildPrompt(data),
    });
    const output = await result.output;
    return { posts: output.posts.slice(0, 7) };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The AI returned an unexpected format. Please try again.");
    }
    const message = error instanceof Error ? error.message : "Generation failed";
    if (message.includes("429")) throw new Error("Rate limit reached — try again in a moment.");
    if (message.includes("402")) throw new Error("AI credits exhausted — add credits to continue.");
    throw new Error(message);
  }
}
