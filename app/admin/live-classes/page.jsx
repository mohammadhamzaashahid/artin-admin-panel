"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, CalendarDays, Clock, Edit2, Eye, Plus, Search } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LiveClassFormDrawer from "@/components/admin/LiveClassFormDrawer";

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
  useArchiveLiveClass,
  useCreateLiveClass,
  useLiveClasses,
  useUpdateLiveClass,
} from "@/lib/hooks/useLiveClasses";
import { useCourses } from "@/lib/hooks/useCourses";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDateTime } from "@/lib/utils";

function extractLiveClassFromResponse(res) {
  return res?.data?.liveClass || res?.liveClass || res?.data || null;
}

export default function AdminLiveClassesPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);
  const [classToArchive, setClassToArchive] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({ page, limit: 20, search: debouncedSearch || undefined }),
    [page, debouncedSearch]
  );

  const liveClassesQuery = useLiveClasses(queryParams);
  const coursesQuery = useCourses({ page: 1, limit: 100 });

  const createMutation = useCreateLiveClass();
  const updateMutation = useUpdateLiveClass();
  const archiveMutation = useArchiveLiveClass();

  const liveClasses = liveClassesQuery.data?.liveClasses || [];
  const pagination = liveClassesQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const courses = coursesQuery.data?.courses || [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateDrawer = () => {
    setSelectedLiveClass(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (liveClass) => {
    setSelectedLiveClass(liveClass);
    setDrawerOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (selectedLiveClass?.id) {
      await updateMutation.mutateAsync({ liveClassId: selectedLiveClass.id, payload });
      setDrawerOpen(false);
      setSelectedLiveClass(null);
      return;
    }

    const res = await createMutation.mutateAsync(payload);
    const created = extractLiveClassFromResponse(res);
    setDrawerOpen(false);
    setSelectedLiveClass(null);

    if (created?.id) {
      router.push(`/admin/live-classes/${created.id}`);
    }
  };

  const handleArchive = async () => {
    if (!classToArchive?.id) return;
    await archiveMutation.mutateAsync(classToArchive.id);
    setClassToArchive(null);
  };

  return (
    <div>
      <PageHeader
        title="Live Classes"
        description="Create and manage paid live sessions. Add a price before publishing."
        action={
          <Button onClick={openCreateDrawer} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Live Class
          </Button>
        }
      />

      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <div className="border-b bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl pl-10"
                placeholder="Search live classes..."
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {pagination.total ?? liveClasses.length} records
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          {liveClassesQuery.isLoading ? (
            <LoadingState label="Loading live classes..." />
          ) : liveClassesQuery.isError ? (
            <ErrorState
              error={liveClassesQuery.error}
              onRetry={liveClassesQuery.refetch}
            />
          ) : liveClasses.length === 0 ? (
            <EmptyState
              title="No live classes yet"
              description="Create your first live class. After saving, you'll be taken to the setup page to add a price and banner."
              action={
                <Button onClick={openCreateDrawer} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Live Class
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="min-w-[280px] px-5">Class</TableHead>
                      <TableHead className="min-w-[180px]">Start</TableHead>
                      <TableHead className="min-w-[120px]">Duration</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[160px]">Course</TableHead>
                      <TableHead className="w-[160px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {liveClasses.map((liveClass) => (
                      <TableRow key={liveClass.id}>
                        <TableCell className="px-5">
                          <p className="font-medium">{liveClass.title}</p>
                          {liveClass.description && (
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {liveClass.description}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            {formatDateTime(liveClass.startDate)}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {liveClass.durationDays} day{liveClass.durationDays === 1 ? "" : "s"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <StatusBadge value={liveClass.status || "DRAFT"} />
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {liveClass.course?.title || "—"}
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
                              <Link href={`/admin/live-classes/${liveClass.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl"
                              title="Quick edit"
                              onClick={() => openEditDrawer(liveClass)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl text-destructive hover:text-destructive"
                              title="Archive"
                              onClick={() => setClassToArchive(liveClass)}
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

              <div className="space-y-3 p-3 sm:p-4 lg:hidden">
                {liveClasses.map((liveClass) => (
                  <div key={liveClass.id} className="rounded-2xl border bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold">
                          {liveClass.title}
                        </p>
                        {liveClass.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {liveClass.description}
                          </p>
                        )}
                      </div>
                      <StatusBadge value={liveClass.status || "DRAFT"} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDateTime(liveClass.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {liveClass.durationDays} day{liveClass.durationDays === 1 ? "" : "s"}
                      </span>
                      {liveClass.course?.title && (
                        <span>{liveClass.course.title}</span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button asChild variant="outline" className="h-9 rounded-xl px-2">
                        <Link href={`/admin/live-classes/${liveClass.id}`}>Setup</Link>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-9 rounded-xl px-2"
                        onClick={() => openEditDrawer(liveClass)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="h-9 rounded-xl px-2 text-destructive"
                        onClick={() => setClassToArchive(liveClass)}
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
                isFetching={liveClassesQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <LiveClassFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={selectedLiveClass ? "edit" : "create"}
        initialData={selectedLiveClass}
        courses={courses}
        submitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(classToArchive)}
        onOpenChange={(open) => {
          if (!open) setClassToArchive(null);
        }}
        title="Archive live class?"
        description="This will archive the selected live class and hide it from learners."
        confirmLabel="Archive"
        confirming={archiveMutation.isPending}
        onConfirm={handleArchive}
      />
    </div>
  );
}
