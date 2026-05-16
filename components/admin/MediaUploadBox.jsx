"use client";

import { useMemo, useState } from "react";
import {
  FileAudio,
  FileVideo,
  ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadMedia } from "@/lib/hooks/useMedia";
import { formatBytes } from "@/lib/utils";

const acceptMap = {
  IMAGE: "image/png,image/jpeg,image/jpg,image/webp",
  AUDIO: "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/aac,audio/mp4",
  VIDEO: "video/mp4,video/webm,video/quicktime",
};

const iconMap = {
  IMAGE: ImageIcon,
  AUDIO: FileAudio,
  VIDEO: FileVideo,
};

function normalizeMimeType(file, mediaKind) {
  if (file.type) return file.type;

  const name = file.name.toLowerCase();

  if (name.endsWith(".mp3")) return "audio/mpeg";
  if (name.endsWith(".wav")) return "audio/wav";
  if (name.endsWith(".aac")) return "audio/aac";
  if (name.endsWith(".mp4") && mediaKind === "VIDEO") return "video/mp4";
  if (name.endsWith(".mp4") && mediaKind === "AUDIO") return "audio/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";

  return "application/octet-stream";
}

export default function MediaUploadBox({
  mediaKind = "IMAGE",
  label = "Upload file",
  description = "Select a file to upload.",
  onUploaded,
  disabled = false,
  requireDuration = false,
}) {
  const [file, setFile] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState("");
  const [progress, setProgress] = useState(0);

  const uploadMutation = useUploadMedia();

  const Icon = iconMap[mediaKind] || UploadCloud;
  const isUploading = uploadMutation.isPending;
  const accept = useMemo(() => acceptMap[mediaKind] || undefined, [mediaKind]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const mimeType = normalizeMimeType(file, mediaKind);

    const asset = await uploadMutation.mutateAsync({
      file,
      mediaKind,
      mimeType,
      durationSeconds: durationSeconds || undefined,
      onProgress: setProgress,
    });

    onUploaded?.(asset);

    setFile(null);
    setDurationSeconds("");
    setProgress(0);
  };

  return (
    <div className="min-w-0 rounded-2xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
          <Icon className="h-5 w-5 text-neutral-700" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {!file ? (
          <label className="flex min-h-40 min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-neutral-50 px-4 py-6 text-center transition hover:bg-neutral-100">
            <UploadCloud className="h-7 w-7 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">Choose file</p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Direct upload to Cloudflare R2
            </p>

            <input
              type="file"
              accept={accept}
              disabled={disabled || isUploading}
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                if (selectedFile) setFile(selectedFile);
              }}
            />
          </label>
        ) : (
          <div className="min-w-0 rounded-2xl border bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {normalizeMimeType(file, mediaKind)} · {formatBytes(file.size)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                disabled={isUploading}
                onClick={() => {
                  setFile(null);
                  setProgress(0);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {(mediaKind === "AUDIO" ||
              mediaKind === "VIDEO" ||
              requireDuration) && (
              <div className="mt-4 space-y-2">
                <Label>Duration seconds</Label>
                <Input
                  type="number"
                  min="0"
                  className="h-10 rounded-xl bg-white"
                  value={durationSeconds}
                  disabled={isUploading}
                  onChange={(event) => setDurationSeconds(event.target.value)}
                  placeholder="Example: 300"
                />
              </div>
            )}

            {isUploading && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            <Button
              type="button"
              className="mt-4 h-10 w-full rounded-xl"
              disabled={disabled || isUploading || !file}
              onClick={handleUpload}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload and attach
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
