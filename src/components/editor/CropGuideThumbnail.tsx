import { useState } from "react";
import { Instagram, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import { FORMAT_PRESETS, type FormatKey, type Platform } from "./formatPresets";

interface CropGuideThumbnailProps {
  url: string;
  type: "image" | "video";
  formatKey: FormatKey;
}

const PLATFORM_ICONS: Record<Platform, typeof Instagram> = {
  instagram: Instagram,
  linkedin: Linkedin,
  x: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

/**
 * Parse a "w/h" ratio string into a numeric aspect ratio (w / h).
 */
function parseRatio(ratio: string): number {
  const [w, h] = ratio.split("/").map(Number);
  return w / h;
}

/**
 * Compute the safe area for the given format across all 4 platforms.
 * The safe area is the *intersection* of all platform crops centered on
 * the canonical (Instagram) format ratio. Anything outside the dashed
 * box risks being cropped on at least one platform.
 *
 * Returned values are width/height percentages of the canonical box.
 */
function computeSafeArea(formatKey: FormatKey): { widthPct: number; heightPct: number } {
  const preset = FORMAT_PRESETS[formatKey];
  const canonical = parseRatio(preset.platforms.instagram.ratio);

  let minW = 1;
  let minH = 1;

  for (const p of Object.keys(preset.platforms) as Platform[]) {
    const r = parseRatio(preset.platforms[p].ratio);
    if (r >= canonical) {
      // Platform is wider — vertically it's the same, horizontally smaller share visible
      minW = Math.min(minW, canonical / r);
    } else {
      // Platform is taller — horizontally same, vertically smaller share visible
      minH = Math.min(minH, r / canonical);
    }
  }

  return { widthPct: minW * 100, heightPct: minH * 100 };
}

/**
 * Per-platform crop preview. Renders the media inside a box with the
 * platform's own aspect ratio, object-cover-cropped from center — i.e.
 * exactly how that platform will display the upload.
 */
function PlatformCropPreview({
  url,
  type,
  formatKey,
  platform,
}: {
  url: string;
  type: "image" | "video";
  formatKey: FormatKey;
  platform: Platform;
}) {
  const Icon = PLATFORM_ICONS[platform];
  const dims = FORMAT_PRESETS[formatKey].platforms[platform];
  const aspect = dims.ratio.replace("/", " / ");

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-full overflow-hidden rounded-md border border-border bg-muted"
        style={{ aspectRatio: aspect }}
      >
        {type === "image" ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video src={url} className="h-full w-full object-cover" muted playsInline />
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        <span className="font-mono tabular-nums">{dims.width}×{dims.height}</span>
      </div>
    </div>
  );
}

/**
 * Thumbnail that renders media at the selected format's canonical
 * aspect ratio with a dashed safe-area overlay. Clicking opens a
 * per-platform crop preview popover.
 */
export function CropGuideThumbnail({ url, type, formatKey }: CropGuideThumbnailProps) {
  const [showGuides, setShowGuides] = useState(false);
  const preset = FORMAT_PRESETS[formatKey];
  const canonicalRatio = preset.platforms.instagram.ratio.replace("/", " / ");
  const { widthPct, heightPct } = computeSafeArea(formatKey);
  const hasSafeAreaInset = widthPct < 99.5 || heightPct < 99.5;

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-lg border border-border bg-muted"
        style={{ aspectRatio: canonicalRatio }}
      >
        {type === "image" ? (
          <img src={url} alt="Upload preview" className="h-full w-full object-cover" />
        ) : (
          <video src={url} className="h-full w-full object-cover" controls playsInline />
        )}

        {/* Safe-area overlay — dashed box marking the area visible on every platform */}
        {hasSafeAreaInset && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="border border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]"
              style={{ width: `${widthPct}%`, height: `${heightPct}%` }}
              title="Safe area — visible on all platforms"
            />
          </div>
        )}

        {/* Format badge */}
        <div className="pointer-events-none absolute left-1.5 top-1.5 rounded bg-foreground/70 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide text-background">
          {preset.shortLabel}
        </div>

        {/* Toggle crop guides */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowGuides(true); }}
          className="absolute bottom-1.5 right-1.5 rounded bg-foreground/70 px-1.5 py-0.5 text-[9px] font-medium text-background opacity-90 transition-opacity hover:opacity-100"
        >
          Crop guides
        </button>
      </div>

      {/* Per-platform crop preview overlay */}
      {showGuides && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
          onClick={() => setShowGuides(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Per-platform crop preview
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                {preset.shortLabel}
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              How this media will be cropped on each platform.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(preset.platforms) as Platform[]).map((p) => (
                <PlatformCropPreview
                  key={p}
                  url={url}
                  type={type}
                  formatKey={formatKey}
                  platform={p}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowGuides(false)}
              className="mt-4 w-full rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
