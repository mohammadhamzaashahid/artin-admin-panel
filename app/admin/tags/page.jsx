"use client";

import { useMemo, useState } from "react";
import { Edit2, Plus, Search, Tags } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import LookupFormDrawer from "@/components/admin/LookupFormDrawer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import {
  useCreateTag,
  useTags,
  useUpdateTag,
} from "@/lib/hooks/useTags";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDateTime } from "@/lib/utils";

export default function AdminTagsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch]
  );

  const tagsQuery = useTags(queryParams);
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();

  const tags = tagsQuery.data?.tags || [];
  const pagination = tagsQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateDrawer = () => {
    setSelectedTag(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (tag) => {
    setSelectedTag(tag);
    setDrawerOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (selectedTag?.id) {
      await updateMutation.mutateAsync({
        tagId: selectedTag.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setDrawerOpen(false);
    setSelectedTag(null);
  };

  return (
    <div>
      <PageHeader
        title="Tags"
        description="Manage course tags used for filtering, discovery and admin organization."
        action={
          <Button onClick={openCreateDrawer} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Tag
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
                placeholder="Search tags..."
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tags className="h-4 w-4" />
              <span>{pagination.total || tags.length} records</span>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {tagsQuery.isLoading ? (
            <LoadingState label="Loading tags..." />
          ) : tagsQuery.isError ? (
            <ErrorState error={tagsQuery.error} onRetry={tagsQuery.refetch} />
          ) : tags.length === 0 ? (
            <EmptyState
              title="No tags found"
              description="Create your first tag to use it while creating courses."
              action={
                <Button onClick={openCreateDrawer} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Tag
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="min-w-[240px] px-5">
                        Name
                      </TableHead>
                      <TableHead className="min-w-[220px]">Slug</TableHead>
                      <TableHead className="min-w-[160px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Created</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="px-5 font-medium">
                          {tag.name}
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {tag.slug || "-"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700"
                          >
                            Active
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(tag.createdAt)}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => openEditDrawer(tag)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="rounded-2xl border bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {tag.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {tag.slug || "-"}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-xl"
                        onClick={() => openEditDrawer(tag)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700"
                      >
                        Active
                      </Badge>

                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(tag.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                isFetching={tagsQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <LookupFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={selectedTag ? "edit" : "create"}
        entityLabel="Tag"
        initialData={selectedTag}
        submitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}