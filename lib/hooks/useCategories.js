"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "@/lib/api/categories.api";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useCategories(params = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => listCategories(params),
    select: (res) => {
      const data = res?.data || {};

      return {
        categories:
          data.categories ||
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

export function useCategory(categoryId) {
  return useQuery({
    queryKey: ["categories", categoryId],
    queryFn: () => getCategory(categoryId),
    enabled: Boolean(categoryId),
    select: (res) => res?.data?.category,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, payload }) => updateCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}