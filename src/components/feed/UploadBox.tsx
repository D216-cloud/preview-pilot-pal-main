import { useRef } from "react";
import { Image as ImageIcon, Link2, X as XIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface UserPost {
  text: string;
  title: string; // YouTube title
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

export function UploadBox({
  post,
  onChange,
  showTitle,
}: {
  post: UserPost;
  onChange: (p: UserPost) => void;
  showTitle: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
    onChange({ ...post, mediaUrl: url, mediaType: type });
  };

  const clearMedia = () => onChange({ ...post, mediaUrl: undefined, mediaType: undefined });

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Your post</h3>
        <span className="text-[11px] text-muted-foreground">Live preview</span>
      </div>

      {showTitle && (
        <Input
          placeholder="Video title (YouTube)"
          value={post.title}
          onChange={(e) => onChange({ ...post, title: e.target.value })}
          className="text-sm"
        />
      )}

      <Textarea
        placeholder={showTitle ? "Description, hashtags…" : "Write your caption, add #hashtags and emojis ✨"}
        value={post.text}
        onChange={(e) => onChange({ ...post, text: e.target.value })}
        rows={3}
        className="resize-none text-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload media
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="…or paste an image / video URL"
            className="h-8 text-xs"
            value={post.mediaUrl?.startsWith("blob:") ? "" : post.mediaUrl || ""}
            onChange={(e) => {
              const url = e.target.value.trim();
              if (!url) return clearMedia();
              const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
              onChange({ ...post, mediaUrl: url, mediaType: isVideo ? "video" : "image" });
            }}
          />
        </div>
        {post.mediaUrl && (
          <Button type="button" variant="ghost" size="sm" onClick={clearMedia} className="gap-1 text-muted-foreground">
            <XIcon className="h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>

      {post.mediaUrl && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} className="max-h-44 w-full object-cover" muted playsInline />
          ) : (
            <img src={post.mediaUrl} alt="" className="max-h-44 w-full object-cover" />
          )}
        </div>
      )}

      {!post.mediaUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          No media yet — your post will appear as text-only.
        </div>
      )}
    </div>
  );
}
