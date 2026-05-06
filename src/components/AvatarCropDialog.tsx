import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onCropComplete: (blob: Blob) => void;
}

async function getCroppedBlob(imageSrc: string, area: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageSrc;
  });
  const size = Math.min(area.width, area.height, 512);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.92);
  });
}

export function AvatarCropDialog({ open, imageSrc, onCancel, onCropComplete }: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !areaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(imageSrc, areaPixels);
      onCropComplete(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>
        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Zoom</label>
          <Slider min={1} max={3} step={0.05} value={[zoom]} onValueChange={(v) => setZoom(v[0])} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button onClick={handleSave} disabled={busy || !areaPixels}>
            {busy ? "Saving…" : "Save photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
