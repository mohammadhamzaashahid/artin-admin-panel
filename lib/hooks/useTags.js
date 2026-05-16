"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTag,
  getTag,
  listTags,
  updateTag,
} from "@/lib/api/tags.api";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useTags(params = {}) {
  return useQuery({
    queryKey: ["tags", params],
    queryFn: () => listTags(params),
    select: (res) => {
      const data = res?.data || {};

      return {
        tags:
          data.tags ||
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

export function useTag(tagId) {
  return useQuery({
    queryKey: ["tags", tagId],
    queryFn: () => getTag(tagId),
    enabled: Boolean(tagId),
    select: (res) => res?.data?.tag,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, payload }) => updateTag(tagId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}