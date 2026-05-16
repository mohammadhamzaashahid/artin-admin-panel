"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderTree,
  Home,
  ImageIcon,
  Layers3,
  Tags,
  Users,
  FileAudio
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Lectures",
    href: "/admin/lectures",
    icon: FileAudio,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: Tags,
  },
  {
    label: "Media Library",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-5">
          <Link href="/admin" className="block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <Layers3 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-base font-semibold tracking-tight">
                  Artin Admin
                </p>
                <p className="text-xs text-muted-foreground">
                  Course platform
                </p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-neutral-100 hover:text-neutral-950"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="text-sm font-medium">Admin mode</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Manage content carefully. Published courses become visible to
              users.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}