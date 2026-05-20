"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingState from "@/components/common/LoadingState";
import PaginationBar from "@/components/common/PaginationBar";
import MediaAssetPreview from "@/components/admin/MediaAssetPreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useMedia } from "@/lib/hooks/useMedia";
import { cn } from "@/lib/utils";

function canUseAsset(asset) {
  return ["UPLOADED", "READY"].includes(asset?.uploadStatus || asset?.status);
}

export default function MediaAssetPicker({
  open,
  onOpenChange,
  mediaKind = "IMAGE",
  title,
  description,
  selectedAssetId,
  onSelect,
}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  const params = useMemo(
    () => ({
      page,
      limit: 12,
      mediaKind,
      search: debouncedSearch || undefined,
    }),
    [page, mediaKind, debouncedSearch]
  );

  const mediaQuery = useMedia(params);
  const mediaAssets = mediaQuery.data?.mediaAssets || [];
  const pagination = mediaQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const handleSelect = (asset) => {
    if (!canUseAsset(asset)) return;
    onSelect?.(asset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-3xl p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-5 py-5 text-left">
          <DialogTitle className="text-xl">
            {title || `Select ${mediaKind.toLowerCase()} asset`}
          </DialogTitle>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description ||
              "Choose an uploaded media asset from the library and attach it here."}
          </p>
        </DialogHeader>

        <div className="border-b bg-white px-5 py-4">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-xl pl-10"
              placeholder={`Search ${mediaKind.toLowerCase()} assets...`}
            />
          </div>
        </div>

        <div className="admin-scrollbar max-h-[calc(92vh-14rem)] overflow-y-auto bg-[#f7f7f5]">
          {mediaQuery.isLoading ? (
            <LoadingState label="Loading media assets..." />
          ) : mediaQuery.isError ? (
            <ErrorState error={mediaQuery.error} onRetry={mediaQuery.refetch} />
          ) : mediaAssets.length === 0 ? (
            <EmptyState
              title="No media assets found"
              description="Upload media first, then it will be available for reuse here."
            />
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {mediaAssets.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                const isUsable = canUseAsset(asset);

                return (
                  <div
                    key={asset.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white shadow-sm",
                      isSelected && "border-neutral-950 ring-2 ring-neutral-950/10"
                    )}
                  >
                    <div className="p-3">
                      <MediaAssetPreview asset={asset} compact showDetails />
                    </div>

                    <div className="border-t px-3 py-3">
                      <Button
                        type="button"
                        className="h-10 w-full rounded-xl"
                        variant={isSelected ? "default" : "outline"}
                        disabled={!isUsable}
                        onClick={() => handleSelect(asset)}
                      >
                        {isSelected && <Check className="mr-2 h-4 w-4" />}
                        {isUsable
                          ? isSelected
                            ? "Selected"
                            : "Use this asset"
                          : "Not ready"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!mediaQuery.isLoading && mediaAssets.length > 0 && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            isFetching={mediaQuery.isFetching}
            onPageChange={setPage}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
