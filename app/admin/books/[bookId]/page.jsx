"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  FileAudio,
  GripVertical,
  ImageIcon,
  Lock,
  Plus,
  Rocket,
  ShoppingBag,
  Trash2,
  Unlock,
  XCircle,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import BookFormDrawer from "@/components/admin/BookFormDrawer";
import BookAudioFileFormDrawer from "@/components/admin/BookAudioFileFormDrawer";
import MediaUploadBox from "@/components/admin/MediaUploadBox";
import MediaAssetPreview from "@/components/admin/MediaAssetPreview";
import MediaAssetPicker from "@/components/admin/MediaAssetPicker";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useAddBookCoverImage,
  useBook,
  useBookAudioFiles,
  useBookCoverImages,
  useCreateBookAudioFile,
  useDeleteBook,
  useDeleteBookAudioFile,
  usePublishBook,
  useRemoveBookCoverImage,
  useReorderBookAudioFiles,
  useUnpublishBook,
  useUpdateBook,
  useUpdateBookAudioFile,
} from "@/lib/hooks/useBooks";
import { useBookOrders, useUpdateBookOrderStatus } from "@/lib/hooks/useBookOrders";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";

function SetupItem({ done, label }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-amber-600" />
      )}
      <span className={done ? "text-green-800" : ""}>{label}</span>
    </div>
  );
}

const ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_COLORS = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-800",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-800",
  SHIPPED: "border-purple-200 bg-purple-50 text-purple-800",
  DELIVERED: "border-green-200 bg-green-50 text-green-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

export default function AdminBookDetailPage() {
  const routeParams = useParams();
  const bookId = routeParams?.bookId;

  const [bookDrawerOpen, setBookDrawerOpen] = useState(false);
  const [audioDrawerOpen, setAudioDrawerOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioToDelete, setAudioToDelete] = useState(null);
  const [coverToRemove, setCoverToRemove] = useState(null);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [nextOrderStatus, setNextOrderStatus] = useState(null);

  const bookQuery = useBook(bookId);
  const coverImagesQuery = useBookCoverImages(bookId);
  const audioFilesQuery = useBookAudioFiles(bookId);
  const ordersQuery = useBookOrders({ bookId, limit: 50 });

  const updateBookMutation = useUpdateBook();
  const publishBookMutation = usePublishBook();
  const unpublishBookMutation = useUnpublishBook();
  const deleteBookMutation = useDeleteBook();

  const addCoverMutation = useAddBookCoverImage();
  const removeCoverMutation = useRemoveBookCoverImage();

  const createAudioMutation = useCreateBookAudioFile();
  const updateAudioMutation = useUpdateBookAudioFile();
  const deleteAudioMutation = useDeleteBookAudioFile();
  const reorderAudioMutation = useReorderBookAudioFiles();

  const updateOrderStatusMutation = useUpdateBookOrderStatus();

  const book = bookQuery.data;
  const coverImages = useMemo(
    () =>
      [...(coverImagesQuery.data || [])].sort(
        (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0)
      ),
    [coverImagesQuery.data]
  );
  const audioFiles = useMemo(
    () =>
      [...(audioFilesQuery.data || [])].sort(
        (a, b) => Number(a.audioOrder ?? 0) - Number(b.audioOrder ?? 0)
      ),
    [audioFilesQuery.data]
  );
  const orders = ordersQuery.data?.orders || [];

  const nextAudioOrder =
    audioFiles.reduce(
      (max, af) => Math.max(max, Number(af.audioOrder || 0)),
      0
    ) + 1;

  const hasCoverImage = coverImages.length > 0;
  const hasAudioFile = audioFiles.length > 0;
  const canPublish = hasCoverImage && hasAudioFile;

  if (!bookId) {
    return <ErrorState error={{ message: "Missing book ID in route." }} />;
  }

  if (bookQuery.isLoading) {
    return <LoadingState label="Loading book setup..." />;
  }

  if (bookQuery.isError) {
    return <ErrorState error={bookQuery.error} onRetry={bookQuery.refetch} />;
  }

  if (!book) {
    return (
      <ErrorState
        error={{ message: "Book was not found." }}
        onRetry={bookQuery.refetch}
      />
    );
  }

  const handleBookUpdate = async (payload) => {
    await updateBookMutation.mutateAsync({ bookId, payload });
    setBookDrawerOpen(false);
  };

  const handlePublish = async () => {
    await publishBookMutation.mutateAsync(bookId);
  };

  const handleUnpublish = async () => {
    await unpublishBookMutation.mutateAsync(bookId);
  };

  const handleAddCoverFromUpload = async (asset) => {
    await addCoverMutation.mutateAsync({
      bookId,
      payload: { mediaAssetId: asset.id, displayOrder: coverImages.length },
    });
  };

  const handleAddCoverFromPicker = async (asset) => {
    if (!asset?.id) return;
    await addCoverMutation.mutateAsync({
      bookId,
      payload: { mediaAssetId: asset.id, displayOrder: coverImages.length },
    });
    setCoverPickerOpen(false);
  };

  const handleRemoveCover = async () => {
    if (!coverToRemove?.id) return;
    await removeCoverMutation.mutateAsync({
      bookId,
      coverImageId: coverToRemove.id,
    });
    setCoverToRemove(null);
  };

  const openCreateAudioDrawer = () => {
    setSelectedAudio(null);
    setAudioDrawerOpen(true);
  };

  const openEditAudioDrawer = (audioFile) => {
    setSelectedAudio(audioFile);
    setAudioDrawerOpen(true);
  };

  const handleAudioSubmit = async (payload) => {
    if (selectedAudio?.id) {
      await updateAudioMutation.mutateAsync({
        bookId,
        audioFileId: selectedAudio.id,
        payload,
      });
    } else {
      await createAudioMutation.mutateAsync({ bookId, payload });
    }
    setSelectedAudio(null);
    setAudioDrawerOpen(false);
  };

  const handleDeleteAudio = async () => {
    if (!audioToDelete?.id) return;
    await deleteAudioMutation.mutateAsync({
      bookId,
      audioFileId: audioToDelete.id,
    });
    setAudioToDelete(null);
  };

  const handleMoveAudioUp = async (audioFile, index) => {
    if (index === 0) return;
    const reordered = [...audioFiles];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];
    await reorderAudioMutation.mutateAsync({
      bookId,
      audioFiles: reordered.map((af, i) => ({
        audioFileId: af.id,
        audioOrder: i + 1,
      })),
    });
  };

  const handleMoveAudioDown = async (audioFile, index) => {
    if (index === audioFiles.length - 1) return;
    const reordered = [...audioFiles];
    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];
    await reorderAudioMutation.mutateAsync({
      bookId,
      audioFiles: reordered.map((af, i) => ({
        audioFileId: af.id,
        audioOrder: i + 1,
      })),
    });
  };

  const handleUpdateOrderStatus = async () => {
    if (!orderToUpdate?.id || !nextOrderStatus) return;
    await updateOrderStatusMutation.mutateAsync({
      orderId: orderToUpdate.id,
      payload: { status: nextOrderStatus },
    });
    setOrderToUpdate(null);
    setNextOrderStatus(null);
  };

  const isAudioSubmitting =
    createAudioMutation.isPending || updateAudioMutation.isPending;

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" className="rounded-xl px-0">
          <Link href="/admin/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to books
          </Link>
        </Button>
      </div>

      <PageHeader
        title={book.title}
        description={book.description ? book.description.slice(0, 100) : "Book setup"}
        action={
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              variant="outline"
              className="h-10 rounded-xl bg-white"
              onClick={() => setBookDrawerOpen(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>

            {book.status === "PUBLISHED" ? (
              <Button
                variant="outline"
                className="h-10 rounded-xl bg-white"
                disabled={unpublishBookMutation.isPending}
                onClick={handleUnpublish}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </Button>
            ) : (
              <Button
                className="h-10 rounded-xl"
                disabled={publishBookMutation.isPending || !canPublish}
                onClick={handlePublish}
                title={!canPublish ? "Add cover image and audio files first" : undefined}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <StatusBadge value={book.status || "DRAFT"} />
        {book.price != null && (
          <span>
            {book.price} {book.currency || "USD"}
          </span>
        )}
        <span className="hidden sm:inline" aria-hidden="true">·</span>
        <span className="hidden sm:inline">{formatDateTime(book.createdAt)}</span>
      </div>

      {!canPublish && book.status !== "PUBLISHED" && (
        <Card className="mb-4 rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-900">
              Required before publishing
            </p>
            <div className="mt-3 grid gap-2 text-sm text-amber-900 sm:grid-cols-2">
              <SetupItem done={hasCoverImage} label="At least one cover image" />
              <SetupItem done={hasAudioFile} label="At least one audio track" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="cover-images" className="flex-col">
        <TabsList className="mb-4 h-auto w-full rounded-2xl bg-white p-1.5 shadow-sm">
          <TabsTrigger value="cover-images" className="min-w-0 rounded-xl">
            <ImageIcon className="mr-1 h-4 w-4 shrink-0 sm:mr-1.5" />
            <span className="truncate sm:hidden">Covers</span>
            <span className="hidden truncate sm:inline">Cover Images</span>
            {hasCoverImage && (
              <Badge variant="secondary" className="ml-1.5 shrink-0 rounded-full sm:ml-2">
                {coverImages.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="audio-files" className="min-w-0 rounded-xl">
            <FileAudio className="mr-1 h-4 w-4 shrink-0 sm:mr-1.5" />
            <span className="truncate sm:hidden">Audio</span>
            <span className="hidden truncate sm:inline">Audio Tracks</span>
            {hasAudioFile && (
              <Badge variant="secondary" className="ml-1.5 shrink-0 rounded-full sm:ml-2">
                {audioFiles.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="orders" className="min-w-0 rounded-xl">
            <ShoppingBag className="mr-1 h-4 w-4 shrink-0 sm:mr-1.5" />
            <span className="truncate">Orders</span>
            {orders.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 shrink-0 rounded-full sm:ml-2">
                {orders.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="overview" className="min-w-0 rounded-xl">
            <BookOpen className="mr-1 h-4 w-4 shrink-0 sm:mr-1.5" />
            <span className="truncate">Overview</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── Cover Images Tab ──────────────────────────────────────────────── */}
        <TabsContent value="cover-images">
          <div className="space-y-4">
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="border-b bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Cover Images</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload and manage cover images for this book.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl bg-white"
                    onClick={() => setCoverPickerOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Choose existing
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 sm:p-5">
                <MediaUploadBox
                  mediaKind="IMAGE"
                  label="Upload cover image"
                  description="JPG, PNG or WebP. Recommended: 800×1200px."
                  onUploaded={handleAddCoverFromUpload}
                  disabled={addCoverMutation.isPending}
                />
              </CardContent>
            </Card>

            {coverImagesQuery.isLoading ? (
              <LoadingState label="Loading cover images..." />
            ) : coverImages.length === 0 ? (
              <EmptyState
                title="No cover images"
                description="Upload or choose an image above."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {coverImages.map((cover, index) => (
                  <div
                    key={cover.id}
                    className="group overflow-hidden rounded-2xl border bg-white shadow-sm"
                  >
                    <div className="relative aspect-3/4 bg-neutral-100">
                      {cover.mediaAsset?.url ? (
                        <img
                          src={cover.mediaAsset.url}
                          alt={`Cover ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-destructive hover:text-destructive"
                        onClick={() => setCoverToRemove(cover)}
                        disabled={removeCoverMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Audio Files Tab ───────────────────────────────────────────────── */}
        <TabsContent value="audio-files">
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="border-b bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Audio Tracks</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage audio content for this book. Drag to reorder.
                  </p>
                </div>
                <Button
                  className="h-9 rounded-xl"
                  onClick={openCreateAudioDrawer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Track
                </Button>
              </div>
            </div>

            <CardContent className="p-0">
              {audioFilesQuery.isLoading ? (
                <LoadingState label="Loading audio tracks..." />
              ) : audioFiles.length === 0 ? (
                <EmptyState
                  title="No audio tracks"
                  description="Add the first audio track for this book."
                  action={
                    <Button
                      className="rounded-xl"
                      onClick={openCreateAudioDrawer}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Track
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-neutral-50">
                          <TableHead className="w-10 pl-5">#</TableHead>
                          <TableHead className="min-w-60">Track</TableHead>
                          <TableHead className="min-w-25">Duration</TableHead>
                          <TableHead className="min-w-25">Access</TableHead>
                          <TableHead className="min-w-30">Status</TableHead>
                          <TableHead className="w-40 text-right pr-5">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {audioFiles.map((af, index) => (
                          <TableRow key={af.id}>
                            <TableCell className="pl-5 text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{af.title}</p>
                                {af.description && (
                                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                    {af.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {af.durationSeconds
                                ? formatDuration(af.durationSeconds)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {af.isPreviewFree ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                  <Unlock className="h-3 w-3" />
                                  Free
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  Paid
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge value={af.status || "DRAFT"} />
                            </TableCell>
                            <TableCell className="pr-5 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl"
                                  disabled={
                                    index === 0 || reorderAudioMutation.isPending
                                  }
                                  onClick={() => handleMoveAudioUp(af, index)}
                                  title="Move up"
                                >
                                  <GripVertical className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl"
                                  onClick={() => openEditAudioDrawer(af)}
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl text-destructive hover:text-destructive"
                                  onClick={() => setAudioToDelete(af)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-3 p-3 sm:p-4 lg:hidden">
                    {audioFiles.map((af, index) => (
                      <div
                        key={af.id}
                        className="rounded-2xl border bg-white p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{af.title}</p>
                            {af.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                {af.description}
                              </p>
                            )}
                          </div>
                          <StatusBadge value={af.status || "DRAFT"} />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Track #{index + 1}</span>
                          {af.durationSeconds && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{formatDuration(af.durationSeconds)}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>
                            {af.isPreviewFree ? "Free preview" : "Paid only"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl"
                            onClick={() => openEditAudioDrawer(af)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl text-destructive"
                            onClick={() => setAudioToDelete(af)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Orders Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="orders">
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="border-b bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Book Orders</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Orders placed for this book. Update status to grant audio access.
                  </p>
                </div>
                <Button asChild variant="outline" className="h-9 rounded-xl bg-white">
                  <Link href="/admin/orders/books">View all orders</Link>
                </Button>
              </div>
            </div>

            <CardContent className="p-0">
              {ordersQuery.isLoading ? (
                <LoadingState label="Loading orders..." />
              ) : orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Orders for this book will appear here."
                />
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-neutral-50">
                          <TableHead className="min-w-50 px-5">Customer</TableHead>
                          <TableHead className="min-w-30">Qty</TableHead>
                          <TableHead className="min-w-40">Status</TableHead>
                          <TableHead className="min-w-45">Placed</TableHead>
                          <TableHead className="w-40 text-right pr-5">
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
                            <TableCell className="text-sm">
                              {order.quantity}x
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full px-3 py-1 text-xs",
                                  ORDER_STATUS_COLORS[order.status] || ""
                                )}
                              >
                                {ORDER_STATUS_LABELS[order.status] || order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(order.createdAt)}
                            </TableCell>
                            <TableCell className="pr-5 text-right">
                              <div className="flex justify-end gap-1">
                                {order.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-xl text-xs"
                                    onClick={() => {
                                      setOrderToUpdate(order);
                                      setNextOrderStatus("PROCESSING");
                                    }}
                                  >
                                    Process
                                  </Button>
                                )}
                                {order.status === "PROCESSING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-xl text-xs"
                                    onClick={() => {
                                      setOrderToUpdate(order);
                                      setNextOrderStatus("SHIPPED");
                                    }}
                                  >
                                    Mark Shipped
                                  </Button>
                                )}
                                {order.status === "SHIPPED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-xl text-xs"
                                    onClick={() => {
                                      setOrderToUpdate(order);
                                      setNextOrderStatus("DELIVERED");
                                    }}
                                  >
                                    Mark Delivered
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
                              ORDER_STATUS_COLORS[order.status] || ""
                            )}
                          >
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Qty: {order.quantity}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDateTime(order.createdAt)}</span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {order.status === "PENDING" && (
                            <Button
                              variant="outline"
                              className="h-9 flex-1 rounded-xl text-xs"
                              onClick={() => {
                                setOrderToUpdate(order);
                                setNextOrderStatus("PROCESSING");
                              }}
                            >
                              Process
                            </Button>
                          )}
                          {order.status === "PROCESSING" && (
                            <Button
                              variant="outline"
                              className="h-9 flex-1 rounded-xl text-xs"
                              onClick={() => {
                                setOrderToUpdate(order);
                                setNextOrderStatus("SHIPPED");
                              }}
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === "SHIPPED" && (
                            <Button
                              variant="outline"
                              className="h-9 flex-1 rounded-xl text-xs"
                              onClick={() => {
                                setOrderToUpdate(order);
                                setNextOrderStatus("DELIVERED");
                              }}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Overview Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border-0 shadow-sm">
              <div className="border-b p-4 sm:p-5">
                <h3 className="font-semibold">Book Info</h3>
              </div>
              <CardContent className="p-4 sm:p-5">
                <dl className="space-y-3 text-sm">
                  <OverviewRow label="Title" value={book.title} />
                  <OverviewRow label="Slug" value={book.slug} mono />
                  <OverviewRow
                    label="Price"
                    value={
                      book.price != null
                        ? `${book.price} ${book.currency || "USD"}`
                        : "—"
                    }
                  />
                  <OverviewRow label="Status" value={<StatusBadge value={book.status || "DRAFT"} />} />
                  <OverviewRow label="Cover images" value={coverImages.length} />
                  <OverviewRow label="Audio tracks" value={audioFiles.length} />
                  <OverviewRow label="Orders" value={orders.length} />
                  <OverviewRow label="Created" value={formatDateTime(book.createdAt)} />
                  <OverviewRow label="Updated" value={formatDateTime(book.updatedAt)} />
                </dl>
              </CardContent>
            </Card>

            {book.description && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <div className="border-b p-4 sm:p-5">
                  <h3 className="font-semibold">Description</h3>
                </div>
                <CardContent className="p-4 sm:p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Drawers & Dialogs ─────────────────────────────────────────────── */}

      <BookFormDrawer
        open={bookDrawerOpen}
        onOpenChange={setBookDrawerOpen}
        mode="edit"
        initialData={book}
        submitting={updateBookMutation.isPending}
        onSubmit={handleBookUpdate}
      />

      <BookAudioFileFormDrawer
        open={audioDrawerOpen}
        onOpenChange={setAudioDrawerOpen}
        mode={selectedAudio ? "edit" : "create"}
        initialData={selectedAudio}
        nextAudioOrder={nextAudioOrder}
        submitting={isAudioSubmitting}
        onSubmit={handleAudioSubmit}
        onMediaDeleted={() => audioFilesQuery.refetch()}
      />

      <MediaAssetPicker
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        mediaKind="IMAGE"
        title="Select cover image"
        description="Pick an existing image asset to add as a cover."
        onSelect={handleAddCoverFromPicker}
      />

      <ConfirmDialog
        open={Boolean(coverToRemove)}
        onOpenChange={(open) => {
          if (!open) setCoverToRemove(null);
        }}
        title="Remove cover image?"
        description="This will remove the cover image from this book."
        confirmLabel="Remove"
        confirming={removeCoverMutation.isPending}
        onConfirm={handleRemoveCover}
      />

      <ConfirmDialog
        open={Boolean(audioToDelete)}
        onOpenChange={(open) => {
          if (!open) setAudioToDelete(null);
        }}
        title="Delete audio track?"
        description={`"${audioToDelete?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        confirming={deleteAudioMutation.isPending}
        onConfirm={handleDeleteAudio}
      />

      <ConfirmDialog
        open={Boolean(orderToUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setOrderToUpdate(null);
            setNextOrderStatus(null);
          }
        }}
        title={`Update order to ${ORDER_STATUS_LABELS[nextOrderStatus] || nextOrderStatus}?`}
        description={
          nextOrderStatus === "PROCESSING"
            ? "This will mark the order as being processed. The customer will receive an email and gain audio access."
            : nextOrderStatus === "SHIPPED"
              ? "This will mark the order as shipped. An email notification will be sent to the customer."
              : nextOrderStatus === "DELIVERED"
                ? "This will mark the order as delivered. The customer already has audio access."
                : "Update the order status."
        }
        confirmLabel={`Set to ${ORDER_STATUS_LABELS[nextOrderStatus] || nextOrderStatus}`}
        confirming={updateOrderStatusMutation.isPending}
        onConfirm={handleUpdateOrderStatus}
      />
    </div>
  );
}

function OverviewRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right",
          mono && "font-mono text-xs",
          !value && "text-muted-foreground"
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
