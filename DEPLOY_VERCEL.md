# Deploy to Vercel

This project is now configured to deploy to **Vercel** as a serverless SSR app. Local dev (`npm run dev`) is unchanged.

## How it works

- `vite build` produces `dist/client` (static assets) and `dist/server/server.js` (SSR + server functions).
- `vercel.json` tells Vercel to serve `dist/client` as static output.
- `api/index.js` is a Vercel Serverless Function that handles every non-static request through the TanStack Start SSR handler.

## One-time Vercel setup

1. Push to GitHub/GitLab and import the repo into Vercel.
2. **Framework preset:** Other (the included `vercel.json` configures everything).
3. Build command and output dir are picked up from `vercel.json` — leave defaults.
4. **Environment Variables** — add these in Vercel → Project Settings → Environment Variables (for Production + Preview):

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://ghntepdwctpsjuyodteq.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your anon/publishable key |
   | `VITE_SUPABASE_PROJECT_ID` | `ghntepdwctpsjuyodteq` |
   | `SUPABASE_URL` | same as above |
   | `SUPABASE_PUBLISHABLE_KEY` | same as anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key (Lovable Cloud → Backend) |
   | `LOVABLE_API_KEY` | for AI features (optional) |

5. Click **Deploy**.

## Why was Vercel showing 404?

The original config built the app for **Cloudflare Workers** (via `@cloudflare/vite-plugin` + `wrangler.jsonc`). Vercel can't serve a Workers bundle, so every page returned 404. Now the build outputs a standard Node SSR server that Vercel runs as a serverless function.

## Local development

`npm run dev` and `npm run build` work exactly the same as before.
