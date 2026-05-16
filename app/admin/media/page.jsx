"use client";

import { useMemo, useState } from "react";
import { FileAudio, FileVideo, ImageIcon, Plus, Search, Trash2 } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import MediaUploadBox from "@/components/admin/MediaUploadBox";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { useDeleteMedia, useMedia } from "@/lib/hooks/useMedia";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatBytes, formatDateTime, formatDuration } from "@/lib/utils";

const mediaKindOptions = ["ALL", "IMAGE", "AUDIO", "VIDEO"];

function MediaIcon({ mediaKind }) {
  if (mediaKind === "AUDIO") return <FileAudio className="h-5 w-5" />;
  if (mediaKind === "VIDEO") return <FileVideo className="h-5 w-5" />;
  return <ImageIcon className="h-5 w-5" />;
}

export default function AdminMediaPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [mediaKind, setMediaKind] = useState("ALL");
  const [uploadKind, setUploadKind] = useState("IMAGE");
  const [assetToDelete, setAssetToDelete] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      mediaKind: mediaKind === "ALL" ? undefined : mediaKind,
    }),
    [page, debouncedSearch, mediaKind]
  );

  const mediaQuery = useMedia(params);
  const deleteMutation = useDeleteMedia();

  const mediaAssets = mediaQuery.data?.mediaAssets || [];
  const pagination = mediaQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const handleDelete = async () => {
    if (!assetToDelete?.id) return;
    await deleteMutation.mutateAsync(assetToDelete.id);
    setAssetToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload and manage R2 media assets used by courses and lectures."
      />

      <div className="mb-5 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Upload new asset</p>
                <p className="text-sm text-muted-foreground">
                  Direct upload to Cloudflare R2.
                </p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mb-4">
              <select
                value={uploadKind}
                onChange={(event) => setUploadKind(event.target.value)}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
              >
                <option value="IMAGE">Image</option>
                <option value="AUDIO">Audio</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>

            <MediaUploadBox
              mediaKind={uploadKind}
              label={`Upload ${uploadKind.toLowerCase()}`}
              description="The selected file will upload directly to R2, then be registered as a media asset."
              requireDuration={uploadKind !== "IMAGE"}
              onUploaded={() => mediaQuery.refetch()}
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="font-semibold">Media flow</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-neutral-50 p-4">
                <p className="text-sm font-medium">1. Request URL</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Backend creates signed R2 URL.
                </p>
              </div>
              <div className="rounded-2xl border bg-neutral-50 p-4">
                <p className="text-sm font-medium">2. Upload file</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Browser uploads file to R2.
                </p>
              </div>
              <div className="rounded-2xl border bg-neutral-50 p-4">
                <p className="text-sm font-medium">3. Attach asset</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use mediaAssetId in course/lecture.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-3xl border-0 shadow-sm">
        <div className="border-b bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl pl-10"
                placeholder="Search media..."
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {mediaKindOptions.map((item) => (
                <Button
                  key={item}
                  variant={mediaKind === item ? "default" : "outline"}
                  className="h-10 rounded-xl bg-white data-[active=true]:bg-neutral-950"
                  data-active={mediaKind === item}
                  onClick={() => {
                    setMediaKind(item);
                    setPage(1);
                  }}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {mediaQuery.isLoading ? (
            <LoadingState label="Loading media assets..." />
          ) : mediaQuery.isError ? (
            <ErrorState error={mediaQuery.error} onRetry={mediaQuery.refetch} />
          ) : mediaAssets.length === 0 ? (
            <EmptyState
              title="No media assets found"
              description="Upload your first media asset to use it for courses or lectures."
            />
          ) : (
            <>
              <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-3xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
                          <MediaIcon mediaKind={asset.mediaKind} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {asset.originalFileName ||
                              asset.fileName ||
                              asset.objectKey ||
                              "Media asset"}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {asset.mimeType || "-"}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-xl text-destructive"
                        onClick={() => setAssetToDelete(asset)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-muted-foreground">Kind</p>
                        <p className="mt-1 font-medium">{asset.mediaKind}</p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-muted-foreground">Size</p>
                        <p className="mt-1 font-medium">
                          {formatBytes(asset.fileSizeBytes)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-muted-foreground">Duration</p>
                        <p className="mt-1 font-medium">
                          {formatDuration(asset.durationSeconds)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-muted-foreground">Status</p>
                        <div className="mt-1">
                          <StatusBadge value={asset.status || "UPLOADED"} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-neutral-50 p-3">
                      <p className="text-xs text-muted-foreground">Asset ID</p>
                      <p className="mt-1 break-all text-xs font-medium">
                        {asset.id}
                      </p>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Created {formatDateTime(asset.createdAt)}
                    </p>
                  </div>
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                isFetching={mediaQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(assetToDelete)}
        onOpenChange={(open) => {
          if (!open) setAssetToDelete(null);
        }}
        title="Delete media asset?"
        description="This only works if the asset is not currently attached to a course or lecture."
        confirmLabel="Delete"
        confirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}