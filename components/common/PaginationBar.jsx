"use client";

import { Button } from "@/components/ui/button";

export default function PaginationBar({
  page,
  totalPages,
  onPageChange,
  isFetching,
}) {
  const safeTotalPages = totalPages || 1;

  return (
    <div className="flex flex-col gap-3 border-t bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{safeTotalPages}</span>
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          className="rounded-xl"
          disabled={page >= safeTotalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}