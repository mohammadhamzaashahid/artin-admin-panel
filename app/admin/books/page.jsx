"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, BookOpen, Edit2, Eye, Plus, Search } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import BookFormDrawer from "@/components/admin/BookFormDrawer";

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
  useBooks,
  useCreateBook,
  useDeleteBook,
  useUpdateBook,
} from "@/lib/hooks/useBooks";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDateTime } from "@/lib/utils";

function extractBookFromResponse(res) {
  return res?.data?.book || res?.book || res?.data || null;
}

export default function AdminBooksPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch]
  );

  const booksQuery = useBooks(queryParams);
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();

  const books = booksQuery.data?.books || [];
  const pagination = booksQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateDrawer = () => {
    setSelectedBook(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (book) => {
    setSelectedBook(book);
    setDrawerOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (selectedBook?.id) {
      await updateMutation.mutateAsync({ bookId: selectedBook.id, payload });
      setDrawerOpen(false);
      setSelectedBook(null);
      return;
    }

    const res = await createMutation.mutateAsync(payload);
    const createdBook = extractBookFromResponse(res);

    setDrawerOpen(false);
    setSelectedBook(null);

    if (createdBook?.id) {
      router.push(`/admin/books/${createdBook.id}`);
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete?.id) return;
    await deleteMutation.mutateAsync(bookToDelete.id);
    setBookToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Books"
        description="Create and manage books, cover images, audio tracks and orders."
        action={
          <Button onClick={openCreateDrawer} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Book
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
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl pl-10"
                placeholder="Search books..."
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {pagination.total || books.length} records
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          {booksQuery.isLoading ? (
            <LoadingState label="Loading books..." />
          ) : booksQuery.isError ? (
            <ErrorState
              error={booksQuery.error}
              onRetry={booksQuery.refetch}
            />
          ) : books.length === 0 ? (
            <EmptyState
              title="No books found"
              description="Create your first book. The app will open the book setup page automatically."
              action={
                <Button onClick={openCreateDrawer} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Book
                </Button>
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="min-w-[280px] px-5">Book</TableHead>
                      <TableHead className="min-w-[120px]">Price</TableHead>
                      <TableHead className="min-w-[130px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Created</TableHead>
                      <TableHead className="w-[190px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="px-5">
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {book.slug || "-"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm">
                          {book.price != null
                            ? `${book.price} ${book.currency || "USD"}`
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <StatusBadge value={book.status || "DRAFT"} />
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(book.createdAt)}
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
                              <Link href={`/admin/books/${book.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl"
                              title="Quick edit"
                              onClick={() => openEditDrawer(book)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl text-destructive hover:text-destructive"
                              title="Delete"
                              onClick={() => setBookToDelete(book)}
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
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="rounded-2xl border bg-white p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold">
                          {book.title}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {book.slug || "-"}
                        </p>
                      </div>
                      <StatusBadge value={book.status || "DRAFT"} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {book.price != null
                          ? `${book.price} ${book.currency || "AED"}`
                          : "No price"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateTime(book.createdAt)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="h-9 rounded-xl px-2"
                      >
                        <Link href={`/admin/books/${book.id}`}>Setup</Link>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-9 rounded-xl px-2"
                        onClick={() => openEditDrawer(book)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="h-9 rounded-xl px-2 text-destructive"
                        onClick={() => setBookToDelete(book)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                isFetching={booksQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <BookFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={selectedBook ? "edit" : "create"}
        initialData={selectedBook}
        submitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(bookToDelete)}
        onOpenChange={(open) => {
          if (!open) setBookToDelete(null);
        }}
        title="Delete book?"
        description={`"${bookToDelete?.title}" will be soft-deleted and removed from the public listing.`}
        confirmLabel="Delete"
        confirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
