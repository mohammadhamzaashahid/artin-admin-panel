"use client";

import { BookOpen, FolderTree, ImageIcon, Tags } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your course platform operations."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Courses"
          value="Manage"
          description="Create, update and publish"
          icon={BookOpen}
        />
        <StatCard
          title="Lectures"
          value="Organize"
          description="Audio/video course content"
          icon={FolderTree}
        />
        <StatCard
          title="Media"
          value="Upload"
          description="Cloudflare R2 assets"
          icon={ImageIcon}
        />
        <StatCard
          title="Tags"
          value="Lookup"
          description="Course discovery"
          icon={Tags}
        />
      </div>

      {/* <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recommended admin flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border bg-neutral-50 p-4">
              <p className="font-medium text-foreground">1. Create lookups</p>
              <p className="mt-1">Create categories and tags first.</p>
            </div>

            <div className="rounded-2xl border bg-neutral-50 p-4">
              <p className="font-medium text-foreground">2. Create course</p>
              <p className="mt-1">Add title, descriptions, category and tags.</p>
            </div>

            <div className="rounded-2xl border bg-neutral-50 p-4">
              <p className="font-medium text-foreground">3. Upload media</p>
              <p className="mt-1">
                Upload banner images, thumbnails, audio and video directly to R2.
              </p>
            </div>

            <div className="rounded-2xl border bg-neutral-50 p-4">
              <p className="font-medium text-foreground">4. Attach lectures</p>
              <p className="mt-1">
                Create lectures, attach media asset IDs and publish when ready.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Frontend upload logic</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            The admin panel never sends large media files through your backend.
            It first asks the backend for a signed upload URL, uploads the file
            directly to Cloudflare R2, then calls complete-upload and attaches
            the returned media asset ID to a course or lecture.
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}