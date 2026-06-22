"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Search, ShoppingBag } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { useBookOrders, useUpdateBookOrderStatus } from "@/lib/hooks/useBookOrders";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cn, formatDateTime } from "@/lib/utils";

const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_COLORS = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-800",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-800",
  SHIPPED: "border-purple-200 bg-purple-50 text-purple-800",
  DELIVERED: "border-green-200 bg-green-50 text-green-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

const NEXT_STATUS = {
  PENDING: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const NEXT_STATUS_LABEL = {
  PROCESSING: "Process",
  SHIPPED: "Mark Shipped",
  DELIVERED: "Mark Delivered",
};

export default function AdminBookOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [nextStatus, setNextStatus] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
    }),
    [page, debouncedSearch, statusFilter]
  );

  const ordersQuery = useBookOrders(queryParams);
  const updateStatusMutation = useUpdateBookOrderStatus();

  const orders = ordersQuery.data?.orders || [];
  const pagination = ordersQuery.data?.pagination || {};
  const totalPages = pagination.totalPages || pagination.pages || 1;

  const handleStatusAdvance = (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setOrderToUpdate(order);
    setNextStatus(next);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!orderToUpdate?.id || !nextStatus) return;
    await updateStatusMutation.mutateAsync({
      orderId: orderToUpdate.id,
      payload: { status: nextStatus },
    });
    setOrderToUpdate(null);
    setNextStatus(null);
  };

  const handleCancelOrder = (order) => {
    setOrderToUpdate(order);
    setNextStatus("CANCELLED");
  };

  return (
    <div>
      <PageHeader
        title="Book Orders"
        description="Manage all book orders, update delivery status and track fulfilment."
        action={
          <Button asChild variant="outline" className="h-11 rounded-xl bg-white">
            <Link href="/admin/books">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Books
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <div className="border-b bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 rounded-xl pl-10"
                  placeholder="Search orders..."
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-muted-foreground">
              {pagination.total || orders.length} records
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          {ordersQuery.isLoading ? (
            <LoadingState label="Loading orders..." />
          ) : ordersQuery.isError ? (
            <ErrorState
              error={ordersQuery.error}
              onRetry={ordersQuery.refetch}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description="Book orders will appear here once customers place them."
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="min-w-[220px] px-5">Customer</TableHead>
                      <TableHead className="min-w-[200px]">Book</TableHead>
                      <TableHead className="min-w-[60px]">Qty</TableHead>
                      <TableHead className="min-w-[160px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Placed</TableHead>
                      <TableHead className="w-[220px] text-right pr-5">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="px-5">
                          <div>
                            <p className="font-medium">{order.deliveryName}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {order.deliveryEmail}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="line-clamp-1 text-sm">
                            {order.book?.title || "—"}
                          </p>
                        </TableCell>

                        <TableCell className="text-sm">{order.quantity}x</TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full px-3 py-1 text-xs",
                              STATUS_COLORS[order.status] || ""
                            )}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </TableCell>

                        <TableCell className="pr-5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl"
                              title="View details"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {NEXT_STATUS[order.status] && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-xl text-xs"
                                onClick={() => handleStatusAdvance(order)}
                                disabled={updateStatusMutation.isPending}
                              >
                                {NEXT_STATUS_LABEL[NEXT_STATUS[order.status]]}
                              </Button>
                            )}

                            {(order.status === "PENDING" ||
                              order.status === "PROCESSING") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-xl text-xs text-destructive hover:text-destructive"
                                onClick={() => handleCancelOrder(order)}
                                disabled={updateStatusMutation.isPending}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 p-3 sm:p-4 lg:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border bg-white p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {order.deliveryName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.deliveryEmail}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1 text-xs",
                          STATUS_COLORS[order.status] || ""
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{order.book?.title || "Book"}</span>
                      <span aria-hidden="true">·</span>
                      <span>Qty: {order.quantity}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateTime(order.createdAt)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl text-xs"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>

                      {NEXT_STATUS[order.status] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl text-xs"
                          onClick={() => handleStatusAdvance(order)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {NEXT_STATUS_LABEL[NEXT_STATUS[order.status]]}
                        </Button>
                      )}

                      {(order.status === "PENDING" ||
                        order.status === "PROCESSING") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl text-xs text-destructive"
                          onClick={() => handleCancelOrder(order)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                isFetching={ordersQuery.isFetching}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Order Detail Sheet ───────────────────────────────────────────── */}
      <Sheet
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <SheetContent
          side="right"
          className="flex h-dvh w-screen flex-col gap-0 overflow-hidden p-0 !max-w-none sm:w-[92vw] lg:w-[600px]"
        >
          <SheetHeader className="shrink-0 border-b bg-white px-4 py-4 text-left sm:px-6">
            <SheetTitle className="text-xl font-semibold tracking-tight">
              Order Details
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {selectedOrder?.book?.title || "Book order"}
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f7f5] px-4 py-4 sm:px-6">
              <div className="space-y-4">
                <section className="rounded-2xl border bg-white p-4 sm:p-5">
                  <h3 className="mb-3 font-semibold">Status</h3>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm",
                        STATUS_COLORS[selectedOrder.status] || ""
                      )}
                    >
                      {selectedOrder.status}
                    </Badge>
                    {selectedOrder.processedAt && (
                      <span className="text-xs text-muted-foreground">
                        Processed: {formatDateTime(selectedOrder.processedAt)}
                      </span>
                    )}
                  </div>

                  {(selectedOrder.status === "PENDING" ||
                    selectedOrder.status === "PROCESSING") && (
                    <div className="mt-4 flex gap-2">
                      {NEXT_STATUS[selectedOrder.status] && (
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleStatusAdvance(selectedOrder)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {NEXT_STATUS_LABEL[NEXT_STATUS[selectedOrder.status]]}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive"
                        onClick={() => handleCancelOrder(selectedOrder)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border bg-white p-4 sm:p-5">
                  <h3 className="mb-3 font-semibold">Book</h3>
                  <dl className="space-y-2 text-sm">
                    <DetailRow label="Title" value={selectedOrder.book?.title} />
                    <DetailRow label="Quantity" value={`${selectedOrder.quantity}x`} />
                  </dl>
                </section>

                <section className="rounded-2xl border bg-white p-4 sm:p-5">
                  <h3 className="mb-3 font-semibold">Delivery Details</h3>
                  <dl className="space-y-2 text-sm">
                    <DetailRow label="Name" value={selectedOrder.deliveryName} />
                    <DetailRow label="Email" value={selectedOrder.deliveryEmail} />
                    <DetailRow label="Phone" value={selectedOrder.deliveryPhone} />
                    <DetailRow label="Address" value={selectedOrder.deliveryAddress} />
                    <DetailRow label="City" value={selectedOrder.deliveryCity} />
                    {selectedOrder.deliveryState && (
                      <DetailRow label="State" value={selectedOrder.deliveryState} />
                    )}
                    {selectedOrder.deliveryPostalCode && (
                      <DetailRow label="Postal Code" value={selectedOrder.deliveryPostalCode} />
                    )}
                    <DetailRow label="Country" value={selectedOrder.deliveryCountry} />
                    {selectedOrder.deliveryNotes && (
                      <DetailRow label="Notes" value={selectedOrder.deliveryNotes} />
                    )}
                  </dl>
                </section>

                <section className="rounded-2xl border bg-white p-4 sm:p-5">
                  <h3 className="mb-3 font-semibold">Order Meta</h3>
                  <dl className="space-y-2 text-sm">
                    <DetailRow label="Order ID" value={selectedOrder.id} mono />
                    <DetailRow
                      label="Placed"
                      value={formatDateTime(selectedOrder.createdAt)}
                    />
                    {selectedOrder.shippedAt && (
                      <DetailRow
                        label="Shipped"
                        value={formatDateTime(selectedOrder.shippedAt)}
                      />
                    )}
                    {selectedOrder.deliveredAt && (
                      <DetailRow
                        label="Delivered"
                        value={formatDateTime(selectedOrder.deliveredAt)}
                      />
                    )}
                    {selectedOrder.adminNotes && (
                      <DetailRow label="Admin notes" value={selectedOrder.adminNotes} />
                    )}
                  </dl>
                </section>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Status Update Confirm ────────────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(orderToUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setOrderToUpdate(null);
            setNextStatus(null);
          }
        }}
        title={
          nextStatus === "CANCELLED"
            ? "Cancel order?"
            : `Update status to ${nextStatus}?`
        }
        description={
          nextStatus === "PROCESSING"
            ? "The customer will receive an email and gain access to audio files."
            : nextStatus === "SHIPPED"
              ? "The customer will receive a shipping notification email."
              : nextStatus === "DELIVERED"
                ? "The order will be marked as delivered."
                : nextStatus === "CANCELLED"
                  ? "This order will be cancelled. The customer will be notified."
                  : "Update the order status."
        }
        confirmLabel={
          nextStatus === "CANCELLED"
            ? "Cancel order"
            : `Set to ${nextStatus}`
        }
        confirming={updateStatusMutation.isPending}
        onConfirm={handleConfirmStatusUpdate}
      />
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-right break-all", mono && "font-mono text-xs")}>
        {value}
      </dd>
    </div>
  );
}
