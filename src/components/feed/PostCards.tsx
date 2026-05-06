import {
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
  ThumbsUp, Repeat, Share2, Globe2, CheckCircle2, Forward,
  Play, Music2, Instagram as IgIcon,
} from "lucide-react";
import type { DummyPost, Platform } from "./dummyData";
import { avatar } from "./dummyData";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

interface CardProps {
  post: DummyPost;
  isUser?: boolean;
  compare?: boolean;
  onPlayVideo?: (post: DummyPost) => void;
}

/* ---------------- Instagram ---------------- */
export function InstagramCard({ post, isUser, compare, onPlayVideo }: CardProps) {
  return (
    <article
      className={`bg-white rounded-xl border overflow-hidden ${
        isUser ? "border-pink-500 shadow-[0_0_0_3px_rgba(236,72,153,0.18)]" : "border-border"
      }`}
    >
      <header className="flex items-center gap-2.5 px-3.5 py-2.5">
        <img src={avatar(post.author.avatarSeed)} alt="" className="h-9 w-9 rounded-full bg-muted" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none truncate">
            {post.author.handle}
            {post.author.verified && <CheckCircle2 className="inline h-3.5 w-3.5 ml-1 text-blue-500 fill-blue-500 stroke-white" />}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Sponsored · {post.postedAgo}</p>
        </div>
        {isUser && <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-pink-500 text-white px-2 py-0.5">You</span>}
        <MoreHorizontal className="h-4 w-4" />
      </header>

      {post.mediaUrl && (
        <div className="relative bg-black" style={{ aspectRatio: post.mediaType === "video" ? "9/16" : "4/5" }}>
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} className="h-full w-full object-cover" controls={!!isUser} muted playsInline loop autoPlay={!isUser} />
          ) : (
            <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
      )}

      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-3.5 mb-2">
          <Heart className={`h-6 w-6 ${isUser ? "text-pink-500 fill-pink-500" : ""}`} />
          <MessageCircle className="h-6 w-6" />
          <Send className="h-6 w-6" />
          <Bookmark className="h-6 w-6 ml-auto" />
        </div>
        <p className="text-sm font-semibold">{fmt(post.likes)} likes</p>
        <p className="text-sm mt-1 leading-relaxed">
          <span className="font-semibold mr-1.5">{post.author.handle}</span>
          {post.text}
        </p>
        <p className="text-xs text-muted-foreground mt-1">View all {fmt(post.comments)} comments</p>
      </div>

      {compare && isUser && <CompareBar post={post} accent="bg-pink-500" />}
    </article>
  );
}

/* ---------------- LinkedIn ---------------- */
export function LinkedInCard({ post, isUser, compare }: CardProps) {
  return (
    <article
      className={`bg-white rounded-xl border overflow-hidden ${
        isUser ? "border-blue-700 shadow-[0_0_0_3px_rgba(29,78,216,0.18)]" : "border-border"
      }`}
    >
      <header className="flex items-start gap-2.5 px-4 pt-3.5">
        <img src={avatar(post.author.avatarSeed)} alt="" className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{post.author.name}</p>
          <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{post.author.title}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">{post.postedAgo} · <Globe2 className="h-3 w-3" /></p>
        </div>
        {isUser && <span className="text-[10px] font-bold uppercase tracking-wide rounded bg-blue-700 text-white px-2 py-0.5">You</span>}
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </header>

      <p className="px-4 py-3 text-sm leading-relaxed whitespace-pre-line">{post.text}</p>

      {post.mediaUrl && (
        <div className="bg-black" style={{ aspectRatio: post.mediaType === "video" ? "16/9" : "1.91/1" }}>
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} className="h-full w-full object-cover" controls muted playsInline />
          ) : (
            <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
      )}

      <div className="flex items-center gap-1 px-4 py-2 text-[12px] text-muted-foreground border-b border-border">
        <span className="inline-flex h-4 w-4 rounded-full bg-blue-600 text-white items-center justify-center text-[8px]">👍</span>
        <span className="inline-flex h-4 w-4 -ml-1 rounded-full bg-red-500 text-white items-center justify-center text-[8px]">❤</span>
        <span className="ml-1">{fmt(post.likes)} · {fmt(post.comments)} comments · {post.shares ?? 0} reposts</span>
      </div>
      <div className="grid grid-cols-4 px-2 py-1 text-xs text-muted-foreground">
        <span className="flex items-center justify-center gap-1.5 py-2"><ThumbsUp className="h-4 w-4" /> Like</span>
        <span className="flex items-center justify-center gap-1.5 py-2"><MessageCircle className="h-4 w-4" /> Comment</span>
        <span className="flex items-center justify-center gap-1.5 py-2"><Repeat className="h-4 w-4" /> Repost</span>
        <span className="flex items-center justify-center gap-1.5 py-2"><Send className="h-4 w-4" /> Send</span>
      </div>

      {compare && isUser && <CompareBar post={post} accent="bg-blue-700" />}
    </article>
  );
}

/* ---------------- X (Twitter) ---------------- */
export function XCard({ post, isUser, compare }: CardProps) {
  return (
    <article
      className={`bg-white rounded-xl border px-4 py-3 flex gap-3 ${
        isUser ? "border-foreground shadow-[0_0_0_3px_rgba(0,0,0,0.12)]" : "border-border"
      }`}
    >
      <img src={avatar(post.author.avatarSeed)} alt="" className="h-10 w-10 rounded-full bg-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <span className="font-semibold">{post.author.name}</span>
          {post.author.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500 stroke-white" />}
          <span className="text-muted-foreground">@{post.author.handle}</span>
          <span className="text-muted-foreground">· {post.postedAgo}</span>
          {isUser && <span className="ml-1 text-[10px] font-bold uppercase rounded bg-foreground text-background px-1.5 py-0.5">You</span>}
          <MoreHorizontal className="h-4 w-4 text-muted-foreground ml-auto" />
        </div>
        <p className="text-[15px] whitespace-pre-line mt-0.5 leading-snug">{post.text}</p>
        {post.mediaUrl && (
          <div className="mt-2.5 overflow-hidden rounded-2xl border border-border bg-black" style={{ aspectRatio: post.mediaType === "video" ? "16/9" : "16/9" }}>
            {post.mediaType === "video" ? (
              <video src={post.mediaUrl} className="h-full w-full object-cover" controls muted playsInline />
            ) : (
              <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            )}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between max-w-md text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {fmt(post.comments)}</span>
          <span className="flex items-center gap-1.5"><Repeat className="h-4 w-4" /> {fmt(post.retweets || 0)}</span>
          <span className="flex items-center gap-1.5"><Heart className={`h-4 w-4 ${isUser ? "text-rose-500 fill-rose-500" : ""}`} /> {fmt(post.likes)}</span>
          <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4" /></span>
        </div>
        {compare && isUser && <div className="mt-2"><CompareBar post={post} accent="bg-foreground" /></div>}
      </div>
    </article>
  );
}

/* ---------------- Facebook ---------------- */
export function FacebookCard({ post, isUser, compare }: CardProps) {
  return (
    <article
      className={`bg-white rounded-xl border overflow-hidden ${
        isUser ? "border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.18)]" : "border-border"
      }`}
    >
      <header className="flex items-start gap-2.5 px-3.5 pt-3">
        <img src={avatar(post.author.avatarSeed)} alt="" className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{post.author.name}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">{post.postedAgo} · <Globe2 className="h-3 w-3" /></p>
        </div>
        {isUser && <span className="text-[10px] font-bold uppercase rounded bg-blue-600 text-white px-2 py-0.5">You</span>}
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </header>

      <p className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">{post.text}</p>

      {post.mediaUrl && (
        <div className="bg-black" style={{ aspectRatio: post.mediaType === "video" ? "16/9" : "4/3" }}>
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} className="h-full w-full object-cover" controls muted playsInline />
          ) : (
            <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-3.5 py-2 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-flex h-4 w-4 rounded-full bg-blue-600 text-white items-center justify-center text-[8px]">👍</span>
          <span className="inline-flex h-4 w-4 -ml-1 rounded-full bg-red-500 text-white items-center justify-center text-[8px]">❤</span>
          <span className="ml-1">{fmt(post.likes)}</span>
        </div>
        <span>{fmt(post.comments)} comments · {post.shares ?? 0} shares</span>
      </div>
      <div className="grid grid-cols-3 px-2 py-1 text-xs text-muted-foreground border-t border-border">
        <span className="flex items-center justify-center gap-1.5 py-2"><ThumbsUp className={`h-4 w-4 ${isUser ? "text-blue-600 fill-blue-600" : ""}`} /> Like</span>
        <span className="flex items-center justify-center gap-1.5 py-2"><MessageCircle className="h-4 w-4" /> Comment</span>
        <span className="flex items-center justify-center gap-1.5 py-2"><Share2 className="h-4 w-4" /> Share</span>
      </div>

      {compare && isUser && <CompareBar post={post} accent="bg-blue-600" />}
    </article>
  );
}

/* ---------------- YouTube card ---------------- */
export function YouTubeCard({ post, isUser, compare, onPlayVideo }: CardProps) {
  return (
    <article
      className={`bg-white rounded-xl border overflow-hidden ${
        isUser ? "border-red-600 shadow-[0_0_0_3px_rgba(220,38,38,0.18)]" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => onPlayVideo?.(post)}
        className="group relative block w-full bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        {post.mediaType === "video" && post.mediaUrl ? (
          <video src={post.mediaUrl} className="h-full w-full object-cover" muted playsInline />
        ) : post.mediaUrl ? (
          <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-black" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="rounded-full bg-red-600 p-3 opacity-90 shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
        {post.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-mono text-white">{post.duration}</div>
        )}
        {isUser && <div className="absolute top-2 left-2 rounded bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5">Your video</div>}
      </button>

      <div className="flex gap-3 p-3">
        <img src={avatar(post.author.avatarSeed)} alt="" className="h-9 w-9 rounded-full bg-muted shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug line-clamp-2">{post.videoTitle || post.text || "Untitled video"}</h3>
          <p className="text-[12px] text-muted-foreground mt-1 truncate">{post.author.name}{post.author.verified && " ✓"}</p>
          <p className="text-[12px] text-muted-foreground">{fmt(post.likes * 12 + (post.views ? 0 : 0))} {post.views || `${fmt(post.likes * 12)} views`} · {post.postedAgo}</p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>

      {compare && isUser && <CompareBar post={post} accent="bg-red-600" />}
    </article>
  );
}

/* ---------------- Compare bar ---------------- */
function CompareBar({ post, accent }: { post: DummyPost; accent: string }) {
  // Compare against an "average" baseline of 800 likes
  const baseline = 800;
  const ratio = Math.min(2, post.likes / baseline);
  const userPct = Math.min(100, (ratio / 2) * 100);
  const otherPct = Math.min(100, (1 / 2) * 100);
  return (
    <div className="border-t border-border bg-muted/40 px-4 py-3 text-xs">
      <p className="font-semibold text-foreground mb-2">Engagement vs. average post</p>
      <div className="space-y-1.5">
        <div>
          <div className="flex justify-between mb-1"><span>Your post</span><span className="font-semibold">{fmt(post.likes)} likes</span></div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div className={`h-full ${accent}`} style={{ width: `${userPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-muted-foreground"><span>Average</span><span>{fmt(baseline)} likes</span></div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-muted-foreground/40" style={{ width: `${otherPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dispatcher ---------------- */
export function PlatformCard(props: CardProps & { platform: Platform }) {
  const { platform, ...rest } = props;
  if (platform === "instagram") return <InstagramCard {...rest} />;
  if (platform === "linkedin") return <LinkedInCard {...rest} />;
  if (platform === "x") return <XCard {...rest} />;
  if (platform === "facebook") return <FacebookCard {...rest} />;
  return <YouTubeCard {...rest} />;
}
