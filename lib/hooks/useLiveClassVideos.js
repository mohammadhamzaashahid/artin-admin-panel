"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveLiveClassVideo,
  createLiveClassVideo,
  getLiveClassVideo,
  listLiveClassVideos,
  reorderLiveClassVideos,
  updateLiveClassVideo,
} from "@/lib/api/live-class-videos.api";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useLiveClassVideos(liveClassId) {
  return useQuery({
    queryKey: ["live-classes", liveClassId, "videos"],
    queryFn: () => listLiveClassVideos(liveClassId),
    enabled: Boolean(liveClassId),
    select: (res) => {
      const data = res?.data || {};
      return data.videos || data.items || data.records || data.data || [];
    },
  });
}

export function useLiveClassVideo(videoId) {
  return useQuery({
    queryKey: ["live-class-videos", videoId],
    queryFn: () => getLiveClassVideo(videoId),
    enabled: Boolean(videoId),
    select: (res) => res?.data?.video,
  });
}

export function useCreateLiveClassVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ liveClassId, payload }) => createLiveClassVideo(liveClassId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["live-classes", variables.liveClassId, "videos"],
      });
      queryClient.invalidateQueries({ queryKey: ["live-classes", variables.liveClassId] });
      toast.success("Video created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateLiveClassVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, payload }) => updateLiveClassVideo(videoId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live-class-videos", variables.videoId] });

      if (variables.liveClassId) {
        queryClient.invalidateQueries({
          queryKey: ["live-classes", variables.liveClassId, "videos"],
        });
      }

      toast.success("Video updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useArchiveLiveClassVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId }) => archiveLiveClassVideo(videoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["live-classes", variables.liveClassId, "videos"],
      });
      toast.success("Video archived successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useReorderLiveClassVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ liveClassId, videos }) => reorderLiveClassVideos(liveClassId, videos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["live-classes", variables.liveClassId, "videos"],
      });
      toast.success("Videos reordered successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
