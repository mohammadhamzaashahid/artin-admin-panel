"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderTree,
  Home,
  ImageIcon,
  Layers3,
  Menu,
  Tags,
  FileAudio,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  {
    label: "Lectures",
    href: "/admin/lectures",
    icon: FileAudio,
  },
  { label: "Tags", href: "/admin/tags", icon: Tags },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
//   { label: "Users", href: "/admin/users", icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-xl bg-white lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>

        <div className="border-b px-5 py-5">
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
        </div>

        <nav className="space-y-1 px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-neutral-950 text-white"
                    : "text-muted-foreground hover:bg-neutral-100 hover:text-neutral-950"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
