"use client";

import { useMemo, useState } from "react";
import { Edit2, FolderTree, Plus, Search } from "lucide-react";

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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/lib/hooks/useCategories";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDateTime } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch]
  );

  const categoriesQuery = useCategories(queryParams);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const categories = categoriesQuery.data?.categories || [];
  const pagination = categoriesQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateDrawer = () => {
    setSelectedCategory(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (category) => {
    setSelectedCategory(category);
    setDrawerOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (selectedCategory?.id) {
      await updateMutation.mutateAsync({
        categoryId: selectedCategory.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setDrawerOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage course category lookups used while creating and organizing courses."
        action={
          <Button onClick={openCreateDrawer} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Category
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
                placeholder="Search categories..."
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderTree className="h-4 w-4" />
              <span>{pagination.total || categories.length} records</span>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {categoriesQuery.isLoading ? (
            <LoadingState label="Loading categories..." />
          ) : categoriesQuery.isError ? (
            <ErrorState
              error={categoriesQuery.error}
              onRetry={categoriesQuery.refetch}
            />
          ) : categories.length === 0 ? (
            <EmptyState
              title="No categories found"
              description="Create your first category to use it in course creation."
              action={
                <Button onClick={openCreateDrawer} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Category
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
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="px-5 font-medium">
                          {category.name}
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {category.slug || "-"}
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
                          {formatDateTime(category.createdAt)}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => openEditDrawer(category)}
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
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-2xl border bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {category.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {category.slug || "-"}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-xl"
                        onClick={() => openEditDrawer(category)}
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
                        {formatDateTime(category.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                isFetching={categoriesQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <LookupFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={selectedCategory ? "edit" : "create"}
        entityLabel="Category"
        initialData={selectedCategory}
        submitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}