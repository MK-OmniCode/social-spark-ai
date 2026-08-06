import { streamText, Output, NoObjectGeneratedError } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { WeekSchema, buildPrompt, type GenerateInput } from "./content-types";

export async function runGeneration(data: z.infer<typeof GenerateInput>) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const gateway = createLovableAiGatewayProvider(key);

  try {
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
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
