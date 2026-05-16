"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { hasAdminSession } from "@/lib/auth/require-admin";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import LoadingState from "@/components/common/LoadingState";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const isLoginPage = pathname === "/admin/login";

  const hasSession = mounted ? hasAdminSession() : false;

  const { isLoading } = useCurrentUser();

  useEffect(() => {
    if (mounted && !isLoginPage && !hasAdminSession()) {
      router.replace("/admin/login");
    }
  }, [router, isLoginPage, mounted]);

  if (isLoginPage) {
    return children;
  }

  if (!mounted || !hasSession || isLoading) {
    return <LoadingState label="Preparing admin panel..." fullScreen />;
  }

  return <AdminShell>{children}</AdminShell>;
}
