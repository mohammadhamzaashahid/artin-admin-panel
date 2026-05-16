"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Edit2, Eye, Plus, Search } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CourseFormDrawer from "@/components/admin/CourseFormDrawer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useArchiveCourse,
  useCourses,
  useCreateCourse,
  useUpdateCourse,
} from "@/lib/hooks/useCourses";
import { useCategories } from "@/lib/hooks/useCategories";
import { useTags } from "@/lib/hooks/useTags";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDateTime } from "@/lib/utils";

function extractCourseFromResponse(res) {
  return (
    res?.data?.course ||
    res?.course ||
    res?.data ||
    null
  );
}

export default function AdminCoursesPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToArchive, setCourseToArchive] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch]
  );

  const coursesQuery = useCourses(queryParams);
  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const tagsQuery = useTags({ page: 1, limit: 100 });

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const archiveMutation = useArchiveCourse();

  const courses = coursesQuery.data?.courses || [];
  const pagination = coursesQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const categories = categoriesQuery.data?.categories || [];
  const tags = tagsQuery.data?.tags || [];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateDrawer = () => {
    setSelectedCourse(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (course) => {
    setSelectedCourse(course);
    setDrawerOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (selectedCourse?.id) {
      await updateMutation.mutateAsync({
        courseId: selectedCourse.id,
        payload,
      });

      setDrawerOpen(false);
      setSelectedCourse(null);
      return;
    }

    const res = await createMutation.mutateAsync(payload);
    const createdCourse = extractCourseFromResponse(res);

    setDrawerOpen(false);
    setSelectedCourse(null);

    if (createdCourse?.id) {
      router.push(`/admin/courses/${createdCourse.id}`);
    }
  };

  const handleArchive = async () => {
    if (!courseToArchive?.id) return;

    await archiveMutation.mutateAsync(courseToArchive.id);
    setCourseToArchive(null);
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Create a course first. After creation, you will be taken to its setup page where you can upload media, add pricing, add lectures and publish."
        action={
          <Button onClick={openCreateDrawer} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        }
      />

      <Card className="overflow-hidden rounded-3xl border-0 shadow-sm">
        <div className="border-b bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl pl-10"
                placeholder="Search courses..."
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {pagination.total || courses.length} records
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          {coursesQuery.isLoading ? (
            <LoadingState label="Loading courses..." />
          ) : coursesQuery.isError ? (
            <ErrorState
              error={coursesQuery.error}
              onRetry={coursesQuery.refetch}
            />
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses found"
              description="Create your first course. Then the app will open the course setup page automatically."
              action={
                <Button onClick={openCreateDrawer} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Course
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="min-w-[280px] px-5">
                        Course
                      </TableHead>
                      <TableHead className="min-w-[160px]">
                        Category
                      </TableHead>
                      <TableHead className="min-w-[130px]">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[180px]">
                        Created
                      </TableHead>
                      <TableHead className="w-[190px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="px-5">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {course.subtitle ||
                                course.shortDescription ||
                                course.slug ||
                                "-"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {course.category?.name || course.categoryName || "-"}
                        </TableCell>

                        <TableCell>
                          <StatusBadge value={course.status || "DRAFT"} />
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(course.createdAt)}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="rounded-xl"
                              title="Open setup"
                            >
                              <Link href={`/admin/courses/${course.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl"
                              title="Quick edit"
                              onClick={() => openEditDrawer(course)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl text-destructive hover:text-destructive"
                              title="Archive"
                              onClick={() => setCourseToArchive(course)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 p-4 lg:hidden">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
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

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button asChild variant="outline" className="rounded-xl">
                        <Link href={`/admin/courses/${course.id}`}>Setup</Link>
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => openEditDrawer(course)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl text-destructive"
                        onClick={() => setCourseToArchive(course)}
                      >
                        Archive
                      </Button>
                    </div>
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

      <CourseFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={selectedCourse ? "edit" : "create"}
        initialData={selectedCourse}
        categories={categories}
        tags={tags}
        submitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(courseToArchive)}
        onOpenChange={(open) => {
          if (!open) setCourseToArchive(null);
        }}
        title="Archive course?"
        description="This will archive the selected course."
        confirmLabel="Archive"
        confirming={archiveMutation.isPending}
        onConfirm={handleArchive}
      />
    </div>
  );
}