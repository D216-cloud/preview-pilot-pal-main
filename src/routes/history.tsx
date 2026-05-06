import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, FileText, Clock, Trash2 } from "lucide-react";
import logoPinpost from "@/assets/logo-pinpost.png";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { FORMAT_PRESETS, type FormatKey } from "@/components/editor/formatPresets";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Draft history — PinPost" },
      { name: "description", content: "View all your saved drafts." },
    ],
  }),
  component: HistoryPage,
});

interface Draft {
  id: string;
  title: string;
  text: string;
  format_key: string;
  updated_at: string;
  created_at: string;
}

function HistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate, redirecting]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) setDrafts(data as Draft[]);
      setLoadingData(false);
    })();
  }, [user]);

  const deleteDraft = useCallback(async (id: string) => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("drafts").delete().eq("id", id);
    setDrafts((p) => p.filter((d) => d.id !== id));
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

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Draft history</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All drafts you've created. {drafts.length > 0 && `${drafts.length} total.`}
          </p>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <FileText className="h-7 w-7 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No drafts yet</p>
            <Button size="sm" className="mt-4" asChild>
              <Link to="/editor">Create a draft</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {drafts.map((draft) => {
              const format = FORMAT_PRESETS[draft.format_key as FormatKey];
              return (
                <div key={draft.id} className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <Link
                    to="/editor"
                    search={{ draft: draft.id }}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{draft.title || "Untitled draft"}</p>
                      {format && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {format.shortLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {draft.text?.slice(0, 140) || "Empty draft"}
                    </p>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5">
                      <Clock className="h-2.5 w-2.5" />
                      Updated {new Date(draft.updated_at).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
