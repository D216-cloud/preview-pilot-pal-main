import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Instagram, Plus, Trash2, Zap, MessageCircle } from "lucide-react";
import logoPinpost from "@/assets/logo-pinpost.png";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/automation")({
  head: () => ({
    meta: [
      { title: "Automation — PinPost" },
      { name: "description", content: "Auto-DM Instagram users when they comment specific keywords." },
    ],
  }),
  component: AutomationPage,
});

interface Rule {
  id: string;
  name: string;
  platform: string;
  trigger_keyword: string;
  reply_message: string;
  target_post_url: string;
  active: boolean;
  created_at: string;
}

function AutomationPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    trigger_keyword: "",
    reply_message: "",
    target_post_url: "",
  });
  const [saving, setSaving] = useState(false);

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
      .from("automation_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRules(data as Rule[]);
    setLoadingData(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createRule = useCallback(async () => {
    if (!user || !form.trigger_keyword.trim() || !form.reply_message.trim()) return;
    setSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("automation_rules").insert({
        user_id: user.id,
        platform: "instagram",
        name: form.name.trim() || "Untitled rule",
        trigger_keyword: form.trigger_keyword.trim(),
        reply_message: form.reply_message.trim(),
        target_post_url: form.target_post_url.trim(),
        active: true,
      });
      setForm({ name: "", trigger_keyword: "", reply_message: "", target_post_url: "" });
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }, [user, form, load]);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("automation_rules").update({ active }).eq("id", id);
    setRules((r) => r.map((x) => x.id === id ? { ...x, active } : x));
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("automation_rules").delete().eq("id", id);
    setRules((r) => r.filter((x) => x.id !== id));
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Automation</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Auto-DM users when they comment a keyword on your Instagram post.
              </p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setShowForm((s) => !s)}>
              <Plus className="h-3.5 w-3.5" /> New rule
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
          <Instagram className="h-4 w-4 text-pink-500" />
          <span className="text-sm font-medium">Instagram</span>
          <span className="ml-auto text-xs text-muted-foreground">Only platform supported</span>
        </div>

        {showForm && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold">Create auto-DM rule</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rule name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Free guide giveaway"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Trigger keyword (in comments)</label>
              <input
                value={form.trigger_keyword}
                onChange={(e) => setForm((f) => ({ ...f, trigger_keyword: e.target.value }))}
                placeholder="e.g. GUIDE"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">DM reply message</label>
              <textarea
                value={form.reply_message}
                onChange={(e) => setForm((f) => ({ ...f, reply_message: e.target.value }))}
                placeholder="Hey! Here's the link you asked for…"
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target post URL (optional)</label>
              <input
                value={form.target_post_url}
                onChange={(e) => setForm((f) => ({ ...f, target_post_url: e.target.value }))}
                placeholder="https://instagram.com/p/…"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createRule} disabled={saving}>{saving ? "Saving…" : "Create rule"}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold mb-3">Your rules</h2>
          {loadingData ? (
            <div className="flex justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : rules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                <Zap className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No automation rules yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first rule to start auto-replying.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-500 shrink-0" />
                        <p className="text-sm font-medium truncate">{rule.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${rule.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                          {rule.active ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-muted/40 px-2 py-1.5">
                          <span className="text-muted-foreground">When comment contains:</span>{" "}
                          <span className="font-mono font-medium">{rule.trigger_keyword}</span>
                        </div>
                        <div className="rounded-md bg-muted/40 px-2 py-1.5 flex items-start gap-1.5">
                          <MessageCircle className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="line-clamp-2">{rule.reply_message}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(rule.id, !rule.active)}
                        className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted"
                      >
                        {rule.active ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
