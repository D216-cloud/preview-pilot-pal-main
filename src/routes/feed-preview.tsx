import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/UserMenu";
import { PlatformSelector } from "@/components/feed/PlatformSelector";
import { UploadBox, type UserPost } from "@/components/feed/UploadBox";
import { PlatformCard } from "@/components/feed/PostCards";
import { DUMMY_FEED, PLATFORM_LABELS, avatar, type Platform, type DummyPost } from "@/components/feed/dummyData";
import { estimateEngagement } from "@/components/feed/engagement";
import logoPinpost from "@/assets/logo-pinpost.png";

export const Route = createFileRoute("/feed-preview")({
  head: () => ({
    meta: [
      { title: "Live Social Feed Preview — PinPost" },
      { name: "description", content: "See your post inserted into a real Instagram, LinkedIn, X, Facebook, or YouTube feed in real time." },
      { property: "og:title", content: "Live Social Feed Preview — PinPost" },
      { property: "og:description", content: "Drop your post into a realistic social feed and compare engagement instantly." },
    ],
  }),
  component: FeedPreviewPage,
});

function FeedPreviewPage() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [compare, setCompare] = useState(false);
  const [playing, setPlaying] = useState<DummyPost | null>(null);
  const [post, setPost] = useState<UserPost>({
    text: "Just shipped a new design system update — would love your feedback! ✨ #design #product",
    title: "I rebuilt our design system in a weekend — here's what I learned",
  });

  // Build user-as-post object derived from inputs
  const engagement = useMemo(
    () => estimateEngagement(post.text + " " + post.title, !!post.mediaUrl),
    [post.text, post.title, post.mediaUrl]
  );

  const userDummyPost: DummyPost = useMemo(() => ({
    id: "user-post",
    author: {
      name: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "You",
      handle: user?.user_metadata?.handle || (user?.email?.split("@")[0] ?? "you"),
      avatarSeed: user?.id || "you",
      verified: false,
      title: "Your title · 1st",
      subscribers: "Your channel",
    },
    text: post.text,
    videoTitle: post.title,
    mediaType: post.mediaType,
    mediaUrl: post.mediaUrl,
    duration: post.mediaType === "video" ? "—" : "0:42",
    views: `${formatViews(engagement.views)} views`,
    postedAgo: "just now",
    likes: engagement.likes,
    comments: engagement.comments,
    shares: engagement.shares,
    retweets: Math.round(engagement.likes * 0.12),
  }), [post, engagement, user]);

  // Insert user's post at position 1 (after first dummy post) for that "scrolling past your own post" feel
  const feed = useMemo(() => {
    const base = DUMMY_FEED[platform];
    const merged = [...base];
    merged.splice(1, 0, userDummyPost);
    return merged;
  }, [platform, userDummyPost]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (playing) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [playing]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <img src={logoPinpost} alt="PinPost" className="h-6 w-auto" />
          </Link>
          <div className="ml-2 hidden md:block">
            <h1 className="text-sm font-semibold leading-none">Live Feed Preview</h1>
            <p className="text-[11px] text-muted-foreground mt-1">Your post, inside a real {PLATFORM_LABELS[platform]} feed</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="compare" checked={compare} onCheckedChange={setCompare} />
              <Label htmlFor="compare" className="text-xs cursor-pointer">Compare mode</Label>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Platform selector */}
        <div className="mb-6">
          <PlatformSelector value={platform} onChange={setPlatform} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Left: composer */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start space-y-4">
            <UploadBox post={post} onChange={setPost} showTitle={platform === "youtube"} />

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Estimated engagement</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Likes" value={engagement.likes} />
                <Stat label="Comments" value={engagement.comments} />
                <Stat label={platform === "youtube" ? "Views" : "Shares"} value={platform === "youtube" ? engagement.views : engagement.shares} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                Numbers update live based on caption length, hashtags, and emojis. Try adding 2–3 hashtags and a clear hook.
              </p>
            </div>
          </aside>

          {/* Right: feed */}
          <section
            key={platform /* remount triggers fade animation */}
            className={`mx-auto w-full max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              platform === "youtube" ? "lg:max-w-2xl" : ""
            }`}
          >
            {feed.map((p) => (
              <PlatformCard
                key={p.id}
                platform={platform}
                post={p}
                isUser={p.id === "user-post"}
                compare={compare}
                onPlayVideo={(post) => setPlaying(post)}
              />
            ))}
            <div className="text-center text-xs text-muted-foreground py-6">You're all caught up ✨</div>
          </section>
        </div>
      </main>

      {/* YouTube video preview modal */}
      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPlaying(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </button>
            <div className="bg-black" style={{ aspectRatio: "16/9" }}>
              {playing.mediaType === "video" && playing.mediaUrl ? (
                <video src={playing.mediaUrl} className="h-full w-full" controls autoPlay />
              ) : (
                <img src={playing.mediaUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="bg-white p-4">
              <h2 className="text-base font-semibold leading-snug">{playing.videoTitle || playing.text}</h2>
              <div className="mt-2 flex items-center gap-2.5 text-xs text-muted-foreground">
                <img src={avatar(playing.author.avatarSeed)} alt="" className="h-7 w-7 rounded-full" />
                <span className="font-medium text-foreground">{playing.author.name}</span>
                <span>· {playing.author.subscribers} subscribers</span>
                <span className="ml-auto">{playing.views} · {playing.postedAgo}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 py-2">
      <p className="text-base font-semibold tabular-nums">{formatViews(value)}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function formatViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}
