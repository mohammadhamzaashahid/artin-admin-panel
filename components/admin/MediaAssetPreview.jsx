"use client";

/* eslint-disable @next/next/no-img-element */

import { FileAudio, FileImage, FileVideo, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useMediaPreviewUrl } from "@/lib/hooks/useMedia";
import { cn, formatBytes, formatDuration } from "@/lib/utils";

function getAssetName(asset) {
  return (
    asset?.originalFilename ||
    asset?.originalFileName ||
    asset?.fileName ||
    asset?.objectKey ||
    "Media asset"
  );
}

function getDirectUrl(asset) {
  return asset?.url || asset?.publicUrl || null;
}

function MediaFallback({ mediaKind, label, loading }) {
  const Icon =
    mediaKind === "AUDIO" ? FileAudio : mediaKind === "VIDEO" ? FileVideo : FileImage;

  return (
    <div className="flex h-full min-h-36 flex-col items-center justify-center gap-2 rounded-xl bg-neutral-100 p-4 text-center text-muted-foreground">
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-6 w-6" />}
      <p className="line-clamp-2 text-xs">{loading ? "Loading preview..." : label}</p>
    </div>
  );
}

export default function MediaAssetPreview({
  asset,
  className,
  mediaClassName,
  showDetails = false,
  compact = false,
}) {
  const directUrl = getDirectUrl(asset);
  const previewQuery = useMediaPreviewUrl(asset?.id, Boolean(asset?.id));
  const sourceUrl = previewQuery.data?.url || directUrl || null;
  const mediaKind = asset?.mediaKind || "IMAGE";
  const name = getAssetName(asset);

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-white",
          compact ? "min-h-32" : "min-h-44",
          mediaClassName
        )}
      >
        {sourceUrl && mediaKind === "IMAGE" ? (
          <img
            src={sourceUrl}
            alt={name}
            className={cn("h-full w-full object-cover", compact ? "max-h-40" : "max-h-64")}
          />
        ) : sourceUrl && mediaKind === "AUDIO" ? (
          <div className="flex h-full min-h-36 flex-col justify-center gap-3 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <FileAudio className="h-5 w-5 text-neutral-700" />
              </div>
              <p className="line-clamp-2 text-sm font-medium">{name}</p>
            </div>
            <audio controls className="w-full" src={sourceUrl}>
              <track kind="captions" />
            </audio>
          </div>
        ) : sourceUrl && mediaKind === "VIDEO" ? (
          <video
            controls
            className={cn("h-full w-full bg-black object-contain", compact ? "max-h-48" : "max-h-72")}
            src={sourceUrl}
          >
            <track kind="captions" />
          </video>
        ) : (
          <MediaFallback
            mediaKind={mediaKind}
            label={name}
            loading={previewQuery.isLoading}
          />
        )}
      </div>

      {showDetails && (
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {asset?.mimeType || "-"}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 rounded-full">
              {mediaKind}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{formatBytes(asset?.fileSizeBytes)}</span>
            {mediaKind !== "IMAGE" && <span>{formatDuration(asset?.durationSeconds)}</span>}
            <span>{asset?.uploadStatus || asset?.status || "UPLOADED"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
