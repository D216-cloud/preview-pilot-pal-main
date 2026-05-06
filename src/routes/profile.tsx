import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Image as ImageIcon, Mail, Trash2, Pencil, History, Upload } from "lucide-react";
import logoPinpost from "@/assets/logo-pinpost.png";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — PinPost" },
      { name: "description", content: "View and manage your account details." },
    ],
  }),
  component: ProfilePage,
});

interface Profile {
  display_name: string;
  handle: string;
  avatar_url: string;
  bio: string;
  location: string;
  website: string;
  timezone: string;
}

interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: "", handle: "", avatar_url: "", bio: "", location: "", website: "", timezone: "" });
  const [avatarPath, setAvatarPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate, redirecting]);

  const loadActivity = useCallback(async () => {
    if (!user) return;
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from("account_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setActivity(data as Activity[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (!mounted) return;
        if (data) {
          const rawPath = data.avatar_url || "";
          setAvatarPath(rawPath);
          let avatarUrl = rawPath;
          if (avatarUrl && !avatarUrl.startsWith("http")) {
            const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(avatarUrl, 3600);
            avatarUrl = signed?.signedUrl || "";
          }
          setProfile({
            display_name: data.display_name || "",
            handle: data.handle || "",
            avatar_url: avatarUrl,
            bio: (data as { bio?: string }).bio || "",
            location: (data as { location?: string }).location || "",
            website: (data as { website?: string }).website || "",
            timezone: (data as { timezone?: string }).timezone || "",
          });
        }
        await loadActivity();
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, loadActivity]);

  const logActivity = useCallback(async (action: string, details = "") => {
    if (!user) return;
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("account_activity").insert({ user_id: user.id, action, details });
    await loadActivity();
  }, [user, loadActivity]);

  const getSignedAvatarUrl = useCallback(async (path: string): Promise<string> => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    return data?.signedUrl || "";
  }, []);

  const handlePickFile = (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCroppedUpload = useCallback(async (blob: Blob) => {
    if (!user) return;
    setCropSrc(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const path = `${user.id}/avatar.jpg`;
      await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      const signedUrl = await getSignedAvatarUrl(path);
      setAvatarPath(path);
      setProfile((p) => ({ ...p, avatar_url: `${signedUrl}&t=${Date.now()}` }));
      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: path,
        updated_at: new Date().toISOString(),
      });
      await logActivity("Updated profile photo");
    } catch (e) {
      console.error("Failed to upload avatar", e);
    }
  }, [user, getSignedAvatarUrl, logActivity]);

  const handleRemoveAvatar = useCallback(async () => {
    if (!user || !avatarPath) return;
    if (!confirm("Remove your profile photo?")) return;
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.storage.from("avatars").remove([avatarPath]);
      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: "",
        updated_at: new Date().toISOString(),
      });
      setAvatarPath("");
      setProfile((p) => ({ ...p, avatar_url: "" }));
      await logActivity("Removed profile photo");
    } catch (e) {
      console.error("Failed to remove avatar", e);
    }
  }, [user, avatarPath, logActivity]);

  const saveProfile = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profile.display_name,
        handle: profile.handle,
        avatar_url: avatarPath,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        timezone: profile.timezone,
        updated_at: new Date().toISOString(),
      });
      setSavedAt(new Date().toLocaleTimeString());
      await logActivity("Updated profile details", `Name: ${profile.display_name || "—"} · @${profile.handle || "—"}`);
    } catch (e) {
      console.error("Failed to save profile", e);
    } finally {
      setSaving(false);
    }
  }, [user, profile, avatarPath, logActivity]);

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
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10 space-y-8">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your basic profile details. These appear in your post previews.
          </p>
        </div>

        {/* Account info */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Account</h2>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email</span>
            <span className="ml-auto text-foreground truncate max-w-[260px]">{user.email}</span>
          </div>
        </section>

        {/* Profile */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-5">Profile details</h2>
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="flex items-start gap-5">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { handlePickFile(e.target.files); e.target.value = ""; }}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-20 w-20 shrink-0 rounded-full border border-border bg-muted/40 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {profile.avatar_url ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                    {profile.avatar_url ? "Change" : "Upload"}
                  </Button>
                  {profile.avatar_url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display name</label>
                  <input
                    value={profile.display_name}
                    onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <input
                      value={profile.handle}
                      onChange={(e) => setProfile((p) => ({ ...p, handle: e.target.value.replace(/^@/, "") }))}
                      placeholder="handle"
                      className="w-full rounded-lg border border-input bg-transparent pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="A short bio about yourself"
                    rows={3}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
                    <input
                      value={profile.location}
                      onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timezone</label>
                    <input
                      value={profile.timezone}
                      onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                      placeholder="e.g. UTC+5:30"
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Website</label>
                  <input
                    value={profile.website}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://yoursite.com"
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button size="sm" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  {savedAt && (
                    <span className="text-xs text-muted-foreground">Saved at {savedAt}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Activity */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No activity yet. Edits to your profile will show up here.
            </p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground leading-tight">{a.action}</p>
                    {a.details && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AvatarCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onCropComplete={handleCroppedUpload}
      />
    </div>
  );
}
