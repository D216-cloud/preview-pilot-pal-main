// Vercel serverless function entry — runs the TanStack Start SSR handler
// for every non-static route. Static assets in dist/client are served by Vercel directly.
import server from "../dist/server/server.js";

export default async function handler(request) {
  return server.fetch(request);
}
