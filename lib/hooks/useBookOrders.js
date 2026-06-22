"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBookOrder,
  listBookOrders,
  updateBookOrderStatus,
} from "@/lib/api/book-orders.api";
import { getApiErrorMessage } from "@/lib/utils";

export function useBookOrders(params = {}) {
  return useQuery({
    queryKey: ["book-orders", params],
    queryFn: () => listBookOrders(params),
    select: (res) => {
      const data = res?.data || {};
      return {
        orders: data.orders || data.items || data.records || data.data || [],
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

export function useBookOrder(orderId) {
  return useQuery({
    queryKey: ["book-orders", orderId],
    queryFn: () => getBookOrder(orderId),
    enabled: Boolean(orderId),
    select: (res) => res?.data?.order,
  });
}

export function useUpdateBookOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }) => updateBookOrderStatus(orderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["book-orders"] });
      queryClient.invalidateQueries({ queryKey: ["book-orders", variables.orderId] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
