"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMedia,
  getMedia,
  getMediaPreviewUrl,
  listMedia,
  uploadAdminMedia,
} from "@/lib/api/media.api";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useMedia(params = {}) {
  return useQuery({
    queryKey: ["media", params],
    queryFn: () => listMedia(params),
    select: (res) => {
      const data = res?.data || {};

      return {
        mediaAssets:
          data.mediaAssets ||
          data.assets ||
          data.items ||
          data.records ||
          data.data ||
          [],
        pagination:
          data.pagination ||
          data.meta ||
          {
            page: params.page || 1,
            limit: params.limit || 20,
            totalPages: 1,
            total: 0,
          },
      };
    },
  });
}

export function useMediaAsset(mediaAssetId) {
  return useQuery({
    queryKey: ["media", mediaAssetId],
    queryFn: () => getMedia(mediaAssetId),
    enabled: Boolean(mediaAssetId),
    select: (res) => res?.data?.mediaAsset,
  });
}

export function useMediaPreviewUrl(mediaAssetId, enabled = true) {
  return useQuery({
    queryKey: ["media", mediaAssetId, "preview-url"],
    queryFn: () => getMediaPreviewUrl(mediaAssetId),
    enabled: Boolean(mediaAssetId) && enabled,
    staleTime: 1000 * 60 * 3,
    select: (res) => res?.data?.preview,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAdminMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media uploaded successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Media deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
