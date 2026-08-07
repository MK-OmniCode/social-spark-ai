import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateWeek } from "@/lib/content.functions";
import {
  PLATFORMS,
  TONES,
  type GeneratedPost,
  type Platform,
  type Tone,
} from "@/lib/content-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PostPilot — AI Social Media Content Generator" },
      {
        name: "description",
        content:
          "Turn any topic into a week of scroll-stopping captions and hashtags, tuned to the tone and platform you choose.",
      },
      { property: "og:title", content: "PostPilot — AI Social Media Content Generator" },
      {
        property: "og:description",
        content:
          "Generate 7 days of captions, hooks and hashtags in seconds — professional, funny, bold and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X / Twitter",
  tiktok: "TikTok",
};

function PostCard({ post }: { post: GeneratedPost }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(
      `${post.hook}\n\n${post.caption}\n\n${post.hashtags.join(" ")}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <article className="card-surface flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.18em] text-primary">
            {post.day}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug">{post.hook}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={copy}
          aria-label={`Copy ${post.day} post`}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        </Button>
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {post.caption}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {post.hashtags.map((tag) => (
          <Badge key={tag} variant="secondary" className="font-normal">
            {tag}
          </Badge>
        ))}
      </div>

      <p className="mt-auto border-t border-border pt-3 text-xs text-muted-foreground">
        Best time · {post.bestTime}
      </p>
    </article>
  );
}

function Index() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [platform, setPlatform] = useState<Platform>("instagram");

  const run = useServerFn(generateWeek);
  const mutation = useMutation({
    mutationFn: (vars: { topic: string; tone: Tone; platform: Platform }) =>
      run({ data: vars }),
  });

  const posts = mutation.data?.posts ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-14 md:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI content planning
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-[1.05] md:text-6xl">
          A week of posts from
          <span className="text-primary"> one topic</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
          Captions, hooks and hashtags for seven days — written in the tone and format your
          platform rewards.
        </p>
      </header>

      <form
        className="card-surface mx-auto mt-10 flex max-w-3xl flex-col gap-6 p-6 md:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (topic.trim().length < 2) return;
          mutation.mutate({ topic: topic.trim(), tone, platform });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. sustainable coffee roasting for small cafés"
            maxLength={200}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
                    tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    platform === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {PLATFORM_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={mutation.isPending || topic.trim().length < 2}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Writing your week…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate 7 posts
            </>
          )}
        </Button>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {(mutation.error as Error).message || "Something went wrong. Try again."}
          </p>
        )}
      </form>

      {posts.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Your content week
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={`${post.day}-${i}`} post={post} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Built by <span className="font-medium text-foreground">Kashif</span>
      </footer>
    </main>
  );
}
