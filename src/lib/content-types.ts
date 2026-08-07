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

export const PLATFORMS = ["instagram", "linkedin", "x", "tiktok"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PostSchema = z.object({
  day: z.string(),
  hook: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  bestTime: z.string(),
});

export const WeekSchema = z.object({
  posts: z.array(PostSchema).min(1),
});

export type GeneratedPost = z.infer<typeof PostSchema>;

export const GenerateInput = z.object({
  topic: z.string().min(2).max(200),
  tone: z.enum(TONES),
  platform: z.enum(PLATFORMS),
});

export function buildPrompt(input: z.infer<typeof GenerateInput>) {
  return `Create a 7-day social media content plan about: "${input.topic}".
Platform: ${input.platform}. Tone: ${input.tone}.
Return exactly 7 posts, one for each day Monday through Sunday (set "day" accordingly).
Each post needs: a scroll-stopping "hook" (max 60 characters), a "caption" written for the platform and tone (under 500 characters, no hashtags inside the caption), 5-8 relevant "hashtags" each starting with #, and a suggested "bestTime" to post like "Tue 8:00 AM".
Vary the angle each day (tip, story, question, myth-buster, behind the scenes, list, call to action).`;
}
