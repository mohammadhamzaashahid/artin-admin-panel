"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMe, loginAdmin } from "@/lib/api/auth.api";
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  isAdminRole,
  saveAuthSession,
} from "@/lib/auth/auth-store";
import { getApiErrorMessage } from "@/lib/utils";

export function useCurrentUser() {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const storedUser = typeof window !== "undefined" ? getStoredUser() : null;

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: Boolean(token),
    select: (res) => res?.data?.user,
    initialData: storedUser ? { data: { user: storedUser } } : undefined,
  });
}

export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: async (res) => {
      const accessToken = res?.data?.accessToken;
      const user = res?.data?.user;

      if (!accessToken || !user) {
        toast.error("Invalid login response");
        return;
      }

      if (!isAdminRole(user.role)) {
        toast.error("This account does not have admin access");
        return;
      }

      saveAuthSession({ accessToken, user });

      queryClient.setQueryData(["auth", "me"], {
        data: {
          user,
        },
      });

      toast.success("Welcome back");
      router.replace("/admin");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearAuthSession();
    queryClient.clear();
    router.replace("/admin/login");
  };
}