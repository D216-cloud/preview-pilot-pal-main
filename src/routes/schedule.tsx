import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Calendar, Image as ImageIcon, Sparkles, Trash2, Instagram, Linkedin, Twitter, Facebook, Youtube, Video } from "lucide-react";
import logoPinpost from "@/assets/logo-pinpost.png";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule content — PinPost" },
      { name: "description", content: "Generate AI media and schedule autoposts." },
    ],
  }),
  component: SchedulePage,
});

interface Scheduled {
  id: string;
  caption: string;
  media_url: string;
  media_type: string;
  platforms: string[];
  scheduled_for: string;
  status: string;
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { id: "x", label: "X", icon: Twitter, color: "text-foreground" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-600" },
] as const;

function SchedulePage() {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [items, setItems] = useState<Scheduled[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate, redirecting]);

  const load = useCallback(async () => {
    if (!user) return;
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: true });
    if (data) setItems(data as Scheduled[]);
    setLoadingData(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const togglePlatform = (id: string) => {
    setPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const generateMedia = useCallback(async () => {
    if (!prompt.trim() || !session) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: mediaType === "video"
            ? `Vertical 9:16 social media short cover image: ${prompt}`
            : prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setGeneratedUrl(data.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [prompt, session, mediaType]);

  const schedulePost = useCallback(async () => {
    if (!user || !generatedUrl || !scheduledFor || platforms.length === 0) return;
    setSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("scheduled_posts").insert({
        user_id: user.id,
        caption,
        media_url: generatedUrl,
        media_type: mediaType,
        platforms,
        scheduled_for: new Date(scheduledFor).toISOString(),
        status: "pending",
      });
      setPrompt("");
      setCaption("");
      setGeneratedUrl("");
      setScheduledFor("");
      await load();
    } finally {
      setSaving(false);
    }
  }, [user, generatedUrl, caption, mediaType, platforms, scheduledFor, load]);

  const remove = useCallback(async (id: string) => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("scheduled_posts").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
  }, []);

  if (loading || redirecting || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-white px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src={logoPinpost} alt="PinPost" className="h-7 w-auto" />
        </Link>
        <UserMenu />
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate AI images for posts or short-form video covers, then schedule autoposts.
          </p>
        </div>

        {/* Generator */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Generate media</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMediaType("image")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${mediaType === "image" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}
            >
              <ImageIcon className="h-4 w-4 inline mr-1.5" /> Image (post)
            </button>
            <button
              onClick={() => setMediaType("video")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${mediaType === "video" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}
            >
              <Video className="h-4 w-4 inline mr-1.5" /> Reel / Short cover
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what to generate. e.g. Minimal product shot of a coffee mug on a wooden table, soft morning light"
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <Button onClick={generateMedia} disabled={generating || !prompt.trim()} size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate"}
          </Button>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {generatedUrl && (
            <div className="rounded-lg overflow-hidden border border-border max-w-sm">
              <img src={generatedUrl} alt="Generated" className="w-full h-auto" />
            </div>
          )}
        </section>

        {/* Scheduling */}
        {generatedUrl && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Schedule autopost</h2>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption…"
                rows={2}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Platforms (allowed)</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const active = platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? "" : p.color}`} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Schedule for</label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button onClick={schedulePost} disabled={saving || !scheduledFor || platforms.length === 0} size="sm">
              {saving ? "Scheduling…" : "Schedule post"}
            </Button>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Upcoming posts</h2>
          {loadingData ? (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <Calendar className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Nothing scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex gap-3">
                  {item.media_url && (
                    <img src={item.media_url} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.caption || "(No caption)"}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {item.platforms.map((id) => {
                        const p = PLATFORMS.find((x) => x.id === id);
                        if (!p) return null;
                        const Icon = p.icon;
                        return <Icon key={id} className={`h-3 w-3 ${p.color}`} />;
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(item.scheduled_for).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
