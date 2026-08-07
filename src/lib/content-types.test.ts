import { describe, it, expect } from "vitest";
import { WeekSchema, GenerateInput, buildPrompt, PostSchema } from "./content-types";

const validPost = {
  day: "Monday",
  hook: "5 tools I use daily",
  caption: "A full caption.",
  hashtags: ["#tools", "#productivity"],
  bestTime: "Mon 8:00 AM",
};

describe("WeekSchema", () => {
  it("accepts a valid 7-day week", () => {
    const week = {
      posts: Array.from({ length: 7 }, (_, i) => ({ ...validPost, day: `Day ${i + 1}` })),
    };
    expect(WeekSchema.safeParse(week).success).toBe(true);
  });

  it("rejects a week with no posts", () => {
    expect(WeekSchema.safeParse({ posts: [] }).success).toBe(false);
  });

  it("rejects a post with missing fields", () => {
    expect(PostSchema.safeParse({ day: "Monday" }).success).toBe(false);
  });

  it("rejects non-string hashtags", () => {
    expect(PostSchema.safeParse({ ...validPost, hashtags: [1, 2] }).success).toBe(false);
  });
});

describe("GenerateInput", () => {
  it("accepts valid input", () => {
    expect(
      GenerateInput.safeParse({ topic: "freelancing", tone: "professional", platform: "linkedin" })
        .success,
    ).toBe(true);
  });

  it("rejects a too-short topic", () => {
    expect(GenerateInput.safeParse({ topic: "x", tone: "funny", platform: "x" }).success).toBe(
      false,
    );
  });

  it("rejects an invalid tone", () => {
    expect(
      GenerateInput.safeParse({ topic: "cooking", tone: "sarcastic", platform: "instagram" })
        .success,
    ).toBe(false);
  });
});

describe("buildPrompt", () => {
  it("includes the topic, platform and tone", () => {
    const prompt = buildPrompt({ topic: "AI tools", tone: "bold", platform: "tiktok" });
    expect(prompt).toContain("AI tools");
    expect(prompt).toContain("tiktok");
    expect(prompt).toContain("bold");
    expect(prompt).toContain("7-day");
  });
});
