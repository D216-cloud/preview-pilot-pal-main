import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/generate-media")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204 }),
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader) return Response.json({ error: "Missing auth" }, { status: 401 });

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
          });
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) return Response.json({ error: "Invalid session" }, { status: 401 });

          const body = await request.json();
          const prompt = String(body?.prompt || "").slice(0, 500);
          if (!prompt.trim()) return Response.json({ error: "Prompt required" }, { status: 400 });

          // Rate limit: 5/min
          const serviceClient = createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
          const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
          const { count } = await serviceClient
            .from("rate_limits")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id).eq("endpoint", "generate-media")
            .gte("created_at", oneMinuteAgo);
          if ((count ?? 0) >= 5) {
            return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
          }
          await serviceClient.from("rate_limits").insert({ user_id: user.id, endpoint: "generate-media" });

          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content: prompt }],
              modalities: ["image", "text"],
            }),
          });

          if (!response.ok) {
            if (response.status === 429) return Response.json({ error: "AI rate limit" }, { status: 429 });
            if (response.status === 402) return Response.json({ error: "AI credits exhausted" }, { status: 402 });
            return Response.json({ error: "AI error" }, { status: 500 });
          }

          const data = await response.json();
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (!imageUrl) return Response.json({ error: "No image returned" }, { status: 500 });
          return Response.json({ imageUrl });
        } catch (e) {
          console.error("generate-media error", e);
          return Response.json({ error: "Unexpected error" }, { status: 500 });
        }
      },
    },
  },
});
