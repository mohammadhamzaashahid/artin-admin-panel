"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import StatusBadge from "@/components/common/StatusBadge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { useCourses } from "@/lib/hooks/useCourses";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDateTime } from "@/lib/utils";

export default function AdminLecturesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 400);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch]
  );

  const coursesQuery = useCourses(params);

  const courses = coursesQuery.data?.courses || [];
  const pagination = coursesQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  return (
    <div>
      <PageHeader
        title="Lectures"
        description="Lectures are managed inside each course. Select a course to create lectures, upload audio/video, and assign media assets."
      />

      <Card className="overflow-hidden rounded-3xl border-0 shadow-sm">
        <div className="border-b bg-white p-4">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-xl pl-10"
              placeholder="Search course to manage lectures..."
            />
          </div>
        </div>

        <CardContent className="p-0">
          {coursesQuery.isLoading ? (
            <LoadingState label="Loading courses..." />
          ) : coursesQuery.isError ? (
            <ErrorState error={coursesQuery.error} onRetry={coursesQuery.refetch} />
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses found"
              description="Create a course first, then add lectures inside that course."
            />
          ) : (
            <>
              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-3xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold">
                          {course.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {course.subtitle || course.shortDescription || "-"}
                        </p>
                      </div>

                      <StatusBadge value={course.status || "DRAFT"} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-muted-foreground">Category</p>
                        <p className="mt-1 font-medium">
                          {course.category?.name || course.categoryName || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-muted-foreground">Created</p>
                        <p className="mt-1 font-medium">
                          {formatDateTime(course.createdAt)}
                        </p>
                      </div>
                    </div>

                    <Button asChild className="mt-4 h-10 w-full rounded-xl">
                      <Link href={`/admin/courses/${course.id}`}>
                        Manage Lectures
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                isFetching={coursesQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}