"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  archiveLiveClass,
  createLiveClass,
  createLiveClassPrice,
  deleteLiveClassPrice,
  getLiveClass,
  listLiveClasses,
  listLiveClassPrices,
  publishLiveClass,
  unpublishLiveClass,
  updateLiveClass,
  updateLiveClassPrice,
} from "@/lib/api/live-classes.api";
import { getApiErrorMessage } from "@/lib/utils";

export function useLiveClasses(params = {}) {
  return useQuery({
    queryKey: ["live-classes", params],
    queryFn: () => listLiveClasses(params),
    select: (res) => {
      const data = res?.data || {};
      return {
        liveClasses: data.liveClasses || data.items || data.data || [],
        pagination: data.pagination || data.meta || {
          page: params.page || 1,
          limit: params.limit || 20,
          totalPages: 1,
          total: 0,
        },
      };
    },
  });
}

export function useLiveClass(liveClassId) {
  return useQuery({
    queryKey: ["live-classes", liveClassId],
    queryFn: () => getLiveClass(liveClassId),
    enabled: Boolean(liveClassId),
    select: (res) => res?.data?.liveClass,
  });
}

export function useCreateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLiveClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-classes"] });
      toast.success("Live class created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ liveClassId, payload }) => updateLiveClass(liveClassId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live-classes"] });
      queryClient.invalidateQueries({ queryKey: ["live-classes", variables.liveClassId] });
      toast.success("Live class updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useArchiveLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveLiveClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-classes"] });
      toast.success("Live class archived successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function usePublishLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishLiveClass,
    onSuccess: (_, liveClassId) => {
      queryClient.invalidateQueries({ queryKey: ["live-classes"] });
      queryClient.invalidateQueries({ queryKey: ["live-classes", liveClassId] });
      toast.success("Live class published successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUnpublishLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishLiveClass,
    onSuccess: (_, liveClassId) => {
      queryClient.invalidateQueries({ queryKey: ["live-classes"] });
      queryClient.invalidateQueries({ queryKey: ["live-classes", liveClassId] });
      toast.success("Live class unpublished");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useLiveClassPrices(liveClassId) {
  return useQuery({
    queryKey: ["live-classes", liveClassId, "prices"],
    queryFn: () => listLiveClassPrices(liveClassId),
    enabled: Boolean(liveClassId),
    select: (res) => {
      const data = res?.data || {};
      return data.prices || data.liveClassPrices || data.items || [];
    },
  });
}

export function useCreateLiveClassPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ liveClassId, payload }) => createLiveClassPrice(liveClassId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live-classes", variables.liveClassId, "prices"] });
      queryClient.invalidateQueries({ queryKey: ["live-classes", variables.liveClassId] });
      toast.success("Price created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateLiveClassPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceId, payload, liveClassId: _id }) => updateLiveClassPrice(priceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["live-classes", variables.liveClassId, "prices"],
      });
      toast.success("Price updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteLiveClassPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceId }) => deleteLiveClassPrice(priceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["live-classes", variables.liveClassId, "prices"],
      });
      toast.success("Price deactivated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
