"use client";

import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth";
import MobileNav from "@/components/admin/MobileNav";

export default function AdminHeader() {
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b bg-[#f7f7f5]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <MobileNav />

        <div className="hidden lg:block">
          <p className="text-sm font-medium">Admin Dashboard</p>
          <p className="text-xs text-muted-foreground">
            Manage courses, lectures, media and platform data.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">
              {user?.firstName || "Admin"} {user?.lastName || ""}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl bg-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}