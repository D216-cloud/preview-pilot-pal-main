import { Instagram, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import type { Platform } from "./dummyData";
import { PLATFORM_LABELS } from "./dummyData";

const ICONS = {
  instagram: Instagram,
  linkedin: Linkedin,
  x: Twitter,
  facebook: Facebook,
  youtube: Youtube,
} as const;

const ACCENT: Record<Platform, string> = {
  instagram: "data-[active=true]:bg-pink-500/10 data-[active=true]:text-pink-600 data-[active=true]:border-pink-500",
  linkedin: "data-[active=true]:bg-blue-700/10 data-[active=true]:text-blue-700 data-[active=true]:border-blue-700",
  x: "data-[active=true]:bg-foreground/10 data-[active=true]:text-foreground data-[active=true]:border-foreground",
  facebook: "data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-600 data-[active=true]:border-blue-600",
  youtube: "data-[active=true]:bg-red-600/10 data-[active=true]:text-red-600 data-[active=true]:border-red-600",
};

export function PlatformSelector({
  value,
  onChange,
}: {
  value: Platform;
  onChange: (p: Platform) => void;
}) {
  const platforms: Platform[] = ["instagram", "linkedin", "x", "facebook", "youtube"];
  return (
    <div className="flex w-full gap-2 overflow-x-auto rounded-full border border-border bg-card p-1.5 shadow-sm">
      {platforms.map((p) => {
        const Icon = ICONS[p];
        const active = value === p;
        return (
          <button
            key={p}
            data-active={active}
            onClick={() => onChange(p)}
            className={`flex flex-1 min-w-fit items-center justify-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted ${ACCENT[p]}`}
          >
            <Icon className="h-4 w-4" />
            <span>{PLATFORM_LABELS[p]}</span>
          </button>
        );
      })}
    </div>
  );
}
