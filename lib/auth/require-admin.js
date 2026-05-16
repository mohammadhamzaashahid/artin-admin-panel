"use client";

import { getAccessToken, getStoredUser, isAdminRole } from "@/lib/auth/auth-store";

export function hasAdminSession() {
  const token = getAccessToken();
  const user = getStoredUser();

  return Boolean(token && user && isAdminRole(user.role));
}