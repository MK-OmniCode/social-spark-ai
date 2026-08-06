import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

export const TONES = [
  "professional",
  "funny",
  "inspirational",
  "bold",
  "friendly",
  "educational",
] as const;

export type Tone = (typeof TONES)[number];

const PostSchema = z.object({
  day: z.string(),
  hook: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  bestTime: z.string(),
});

const WeekSchema = z.object({
  posts: z.array(PostSchema),
});

export type GeneratedPost = z.infer<typeof PostSchema>;

const Input = z.object({
  topic: z.string().min(2).max(200),
  tone: z.enum(TONES),
  platform: z.enum(["instagram", "linkedin", "x", "tiktok"]),
});

export const generateWeek = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `Create a 7-day social media content plan about: "${data.topic}".
Platform: ${data.platform}. Tone: ${data.tone}.
Return exactly 7 posts, one for each day Monday through Sunday (set "day" accordingly).
Each post needs: a scroll-stopping "hook" (max 60 characters), a "caption" written for the platform and tone (under 500 characters, no hashtags inside the caption), 5-8 relevant "hashtags" each starting with #, and a suggested "bestTime" to post like "Tue 8:00 AM".
Vary the angle each day (tip, story, question, myth-buster, behind the scenes, list, call to action).`;

    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        output: Output.object({ schema: WeekSchema }),
        prompt,
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
  });
