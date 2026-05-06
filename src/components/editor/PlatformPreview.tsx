import {
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Send,
  Repeat,
  MoreHorizontal,
  Play,
  Music2,
  Globe2,
  CheckCircle2,
  Forward,
  Volume2,
  Plus,
} from "lucide-react";
import { FORMAT_PRESETS, type FormatKey } from "./formatPresets";

type Platform = "instagram" | "linkedin" | "x" | "facebook" | "youtube";

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
}

const platformMeta = {
  instagram: { icon: Instagram, name: "Instagram", color: "text-pink-500" },
  linkedin: { icon: Linkedin, name: "LinkedIn", color: "text-blue-700" },
  x: { icon: Twitter, name: "X", color: "text-foreground" },
  facebook: { icon: Facebook, name: "Facebook", color: "text-blue-600" },
  youtube: { icon: Youtube, name: "YouTube", color: "text-red-600" },
};

interface PlatformPreviewProps {
  platform: Platform;
  text: string;
  media?: MediaFile[];
  formatKey?: FormatKey;
  displayName?: string;
  handle?: string;
  profileImageUrl?: string;
}

/** Reel/Short formats use full-bleed vertical 9:16 native UI */
function isVerticalFormat(formatKey: FormatKey) {
  return formatKey === "story_reel" || formatKey === "story_ad";
}

function Avatar({ url, name, size = "md" }: { url?: string; name?: string; size?: "sm" | "md" | "lg" }) {
  const sizeCls = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className={`${sizeCls} rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden`}>
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-primary">{name?.[0]?.toUpperCase() || "Y"}</span>
      )}
    </div>
  );
}

function Media({ media, ratio, rounded = "rounded-lg" }: { media: MediaFile[]; ratio: string; rounded?: string }) {
  if (media.length === 0) return null;
  const aspect = ratio.replace("/", " / ");
  if (media.length === 1) {
    const m = media[0];
    return (
      <div className={`relative overflow-hidden ${rounded} bg-muted`} style={{ aspectRatio: aspect }}>
        {m.type === "image" ? (
          <img src={m.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video src={m.url} className="h-full w-full object-cover" controls playsInline />
        )}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-2 gap-0.5 overflow-hidden ${rounded} border border-border`}>
      {media.slice(0, 4).map((m, i) => (
        <div
          key={m.id}
          className={`relative bg-muted ${media.length === 3 && i === 0 ? "row-span-2" : ""}`}
          style={{ aspectRatio: media.length === 3 && i === 0 ? aspect : "1 / 1" }}
        >
          {m.type === "image" ? (
            <img src={m.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <video src={m.url} className="h-full w-full object-cover" controls playsInline />
          )}
          {media.length > 4 && i === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
              <span className="text-lg font-semibold text-background">+{media.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- Instagram Reel (9:16) ---------- */
function InstagramReel({ text, media, displayName, handle, profileImageUrl }: PlatformPreviewProps) {
  const m = media?.[0];
  return (
    <div className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "9 / 16" }}>
      {m ? (
        m.type === "image" ? (
          <img src={m.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <video src={m.url} className="absolute inset-0 h-full w-full object-cover" controls playsInline />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-700/30" />
      )}
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 text-white">
        <span className="text-base font-semibold">Reels</span>
        <Instagram className="h-5 w-5" />
      </div>
      {/* Right rail */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center"><Heart className="h-6 w-6" /><span className="text-[10px]">12.4K</span></div>
        <div className="flex flex-col items-center"><MessageCircle className="h-6 w-6" /><span className="text-[10px]">320</span></div>
        <div className="flex flex-col items-center"><Send className="h-6 w-6" /><span className="text-[10px]">Share</span></div>
        <MoreHorizontal className="h-6 w-6" />
      </div>
      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 p-3 text-white bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar url={profileImageUrl} name={displayName} size="sm" />
          <span className="text-xs font-semibold">{handle || "your_handle"}</span>
          <button className="ml-1 rounded border border-white/70 px-2 py-0.5 text-[10px] font-medium">Follow</button>
        </div>
        <p className="text-xs leading-snug line-clamp-2">{text || "Your reel caption…"}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px]"><Music2 className="h-3 w-3" /> Original audio · {displayName || "you"}</div>
      </div>
    </div>
  );
}

/* ---------- Instagram Feed Post ---------- */
function InstagramPost({ text, media, formatKey, displayName, handle, profileImageUrl }: PlatformPreviewProps & { formatKey: FormatKey }) {
  const dims = FORMAT_PRESETS[formatKey].platforms.instagram;
  return (
    <div className="bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <Avatar url={profileImageUrl} name={displayName} size="sm" />
        <div className="flex-1">
          <p className="text-xs font-semibold leading-none">{handle || "your_handle"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Original audio</p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-foreground" />
      </div>
      <Media media={media || []} ratio={dims.ratio} rounded="rounded-none" />
      <div className="px-3 py-2">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-5 w-5" />
          <MessageCircle className="h-5 w-5" />
          <Send className="h-5 w-5" />
          <Bookmark className="h-5 w-5 ml-auto" />
        </div>
        <p className="text-xs font-semibold mb-1">1,284 likes</p>
        <p className="text-xs leading-relaxed">
          <span className="font-semibold mr-1">{handle || "your_handle"}</span>
          {text ? (text.length > 125 ? text.slice(0, 125) + "… more" : text) : "Your caption appears here…"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">View all 32 comments</p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase">2 hours ago</p>
      </div>
    </div>
  );
}

/* ---------- LinkedIn ---------- */
function LinkedInPost({ text, media, formatKey, displayName, handle, profileImageUrl }: PlatformPreviewProps & { formatKey: FormatKey }) {
  const dims = FORMAT_PRESETS[formatKey].platforms.linkedin;
  return (
    <div className="bg-white">
      <div className="flex items-start gap-2 px-4 pt-3">
        <Avatar url={profileImageUrl} name={displayName} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{displayName || "Your name"}</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{handle ? `${handle}` : "Your title · 1st"}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">2h · <Globe2 className="h-3 w-3" /></p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="px-4 py-3 text-sm leading-relaxed whitespace-pre-line">{text || "Your post text…"}</p>
      {media && media.length > 0 && <Media media={media} ratio={dims.ratio} rounded="rounded-none" />}
      <div className="flex items-center gap-1 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex h-4 w-4 rounded-full bg-blue-600 text-white items-center justify-center text-[8px]">👍</span>
        <span className="inline-flex h-4 w-4 -ml-1 rounded-full bg-red-500 text-white items-center justify-center text-[8px]">❤</span>
        <span className="ml-1">128 · 24 comments · 6 reposts</span>
      </div>
      <div className="grid grid-cols-4 gap-1 px-2 py-1 border-t border-border text-xs text-muted-foreground">
        <span className="flex items-center justify-center gap-1 py-1.5"><ThumbsUp className="h-4 w-4" /> Like</span>
        <span className="flex items-center justify-center gap-1 py-1.5"><MessageCircle className="h-4 w-4" /> Comment</span>
        <span className="flex items-center justify-center gap-1 py-1.5"><Repeat className="h-4 w-4" /> Repost</span>
        <span className="flex items-center justify-center gap-1 py-1.5"><Send className="h-4 w-4" /> Send</span>
      </div>
    </div>
  );
}

/* ---------- X (Twitter) ---------- */
function XPost({ text, media, formatKey, displayName, handle, profileImageUrl }: PlatformPreviewProps & { formatKey: FormatKey }) {
  const dims = FORMAT_PRESETS[formatKey].platforms.x;
  return (
    <div className="bg-white px-4 py-3 flex gap-3">
      <Avatar url={profileImageUrl} name={displayName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold">{displayName || "Your name"}</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500 stroke-white" />
          <span className="text-muted-foreground">@{handle || "you"}</span>
          <span className="text-muted-foreground">· 1h</span>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground ml-auto" />
        </div>
        <p className="text-sm whitespace-pre-line mt-0.5">{text || "What is happening?!"}</p>
        {media && media.length > 0 && (
          <div className="mt-2"><Media media={media} ratio={dims.ratio} rounded="rounded-2xl" /></div>
        )}
        <div className="mt-3 flex items-center justify-between max-w-xs text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> 24</span>
          <span className="flex items-center gap-1"><Repeat className="h-4 w-4" /> 12</span>
          <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> 248</span>
          <span className="flex items-center gap-1"><Forward className="h-4 w-4" /></span>
          <span className="flex items-center gap-1"><Share2 className="h-4 w-4" /></span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Facebook ---------- */
function FacebookPost({ text, media, formatKey, displayName, handle, profileImageUrl }: PlatformPreviewProps & { formatKey: FormatKey }) {
  const dims = FORMAT_PRESETS[formatKey].platforms.facebook;
  return (
    <div className="bg-white">
      <div className="flex items-start gap-2 px-3 pt-3">
        <Avatar url={profileImageUrl} name={displayName} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{displayName || "Your name"}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">Just now · <Globe2 className="h-3 w-3" /></p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line">{text || "What's on your mind?"}</p>
      {media && media.length > 0 && <Media media={media} ratio={dims.ratio} rounded="rounded-none" />}
      <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-flex h-4 w-4 rounded-full bg-blue-600 text-white items-center justify-center text-[8px]">👍</span>
          <span className="inline-flex h-4 w-4 -ml-1 rounded-full bg-red-500 text-white items-center justify-center text-[8px]">❤</span>
          <span className="ml-1">328</span>
        </div>
        <span>42 comments · 8 shares</span>
      </div>
      <div className="grid grid-cols-3 gap-1 px-2 py-1 border-t border-border text-xs text-muted-foreground">
        <span className="flex items-center justify-center gap-1 py-1.5"><ThumbsUp className="h-4 w-4" /> Like</span>
        <span className="flex items-center justify-center gap-1 py-1.5"><MessageCircle className="h-4 w-4" /> Comment</span>
        <span className="flex items-center justify-center gap-1 py-1.5"><Share2 className="h-4 w-4" /> Share</span>
      </div>
    </div>
  );
}

/* ---------- YouTube Short ---------- */
function YouTubeShort({ text, media, displayName, handle, profileImageUrl }: PlatformPreviewProps) {
  const m = media?.[0];
  return (
    <div className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "9 / 16" }}>
      {m ? (
        m.type === "image" ? (
          <img src={m.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <video src={m.url} className="absolute inset-0 h-full w-full object-cover" controls playsInline />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 to-black" />
      )}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 text-white">
        <span className="text-base font-semibold">Shorts</span>
        <Youtube className="h-5 w-5 text-red-500" />
      </div>
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center"><ThumbsUp className="h-6 w-6" /><span className="text-[10px]">8.2K</span></div>
        <div className="flex flex-col items-center"><ThumbsDown className="h-6 w-6" /><span className="text-[10px]">Dislike</span></div>
        <div className="flex flex-col items-center"><MessageCircle className="h-6 w-6" /><span className="text-[10px]">412</span></div>
        <div className="flex flex-col items-center"><Forward className="h-6 w-6" /><span className="text-[10px]">Share</span></div>
        <MoreHorizontal className="h-6 w-6" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 text-white bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar url={profileImageUrl} name={displayName} size="sm" />
          <span className="text-xs font-semibold">@{handle || "you"}</span>
          <button className="ml-1 rounded-full bg-red-600 px-3 py-0.5 text-[10px] font-semibold">Subscribe</button>
        </div>
        <p className="text-xs leading-snug line-clamp-2">{text || "Your Short title…"}</p>
      </div>
    </div>
  );
}

/* ---------- YouTube Video ---------- */
function YouTubeVideo({ text, media, displayName, handle, profileImageUrl }: PlatformPreviewProps) {
  const m = media?.[0];
  const title = (text || "Your video title appears here").split("\n")[0].slice(0, 100);
  return (
    <div className="bg-white">
      <div className="relative bg-black" style={{ aspectRatio: "16 / 9" }}>
        {m ? (
          m.type === "image" ? (
            <img src={m.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <video src={m.url} className="h-full w-full object-cover" controls playsInline />
          )
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-black">
            <Play className="h-12 w-12 text-white/70" />
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white font-mono">10:24</div>
      </div>
      <div className="px-3 pt-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-1">12K views · 2 hours ago</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-3">
        <Avatar url={profileImageUrl} name={displayName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-none">{displayName || "Your channel"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">128K subscribers</p>
        </div>
        <button className="rounded-full bg-foreground text-background px-3 py-1 text-xs font-semibold">Subscribe</button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto px-3 pb-3 text-xs">
        <div className="flex items-center rounded-full bg-muted">
          <span className="flex items-center gap-1 px-3 py-1.5 border-r border-border"><ThumbsUp className="h-3.5 w-3.5" /> 1.2K</span>
          <span className="flex items-center gap-1 px-3 py-1.5"><ThumbsDown className="h-3.5 w-3.5" /></span>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Forward className="h-3.5 w-3.5" /> Share</span>
        <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Plus className="h-3.5 w-3.5" /> Save</span>
      </div>
    </div>
  );
}

export function PlatformPreview({ platform, text, media = [], formatKey = "post_square", displayName, handle, profileImageUrl }: PlatformPreviewProps) {
  const meta = platformMeta[platform];
  const Icon = meta.icon;
  const preset = FORMAT_PRESETS[formatKey];
  const dims = preset.platforms[platform];
  const vertical = isVerticalFormat(formatKey);

  const props = { platform, text, media, formatKey, displayName, handle, profileImageUrl };

  let body: React.ReactNode;
  if (platform === "instagram") {
    body = vertical ? <InstagramReel {...props} /> : <InstagramPost {...props} formatKey={formatKey} />;
  } else if (platform === "linkedin") {
    body = <LinkedInPost {...props} formatKey={formatKey} />;
  } else if (platform === "x") {
    body = <XPost {...props} formatKey={formatKey} />;
  } else if (platform === "facebook") {
    body = <FacebookPost {...props} formatKey={formatKey} />;
  } else {
    body = vertical ? <YouTubeShort {...props} /> : <YouTubeVideo {...props} />;
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-white">
        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
        <span className="text-xs font-medium text-foreground">{meta.name}{vertical && (platform === "instagram" ? " · Reel" : platform === "youtube" ? " · Short" : "")}</span>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono tabular-nums">{dims.width}×{dims.height}</span>
      </div>
      {vertical ? <div className="p-4 bg-neutral-50">{body}</div> : body}
    </div>
  );
}
