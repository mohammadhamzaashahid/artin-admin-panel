"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  ImageIcon,
  Plus,
  Rocket,
  Trash2,
  EyeOff,
  FileText,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LiveClassFormDrawer from "@/components/admin/LiveClassFormDrawer";
import LiveClassPriceFormDrawer from "@/components/admin/LiveClassPriceFormDrawer";
import LiveClassVideoFormDrawer from "@/components/admin/LiveClassVideoFormDrawer";
import MediaUploadBox from "@/components/admin/MediaUploadBox";
import MediaAssetPreview from "@/components/admin/MediaAssetPreview";
import MediaAssetPicker from "@/components/admin/MediaAssetPicker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useCreateLiveClassPrice,
  useDeleteLiveClassPrice,
  useLiveClass,
  useLiveClassPrices,
  usePublishLiveClass,
  useUnpublishLiveClass,
  useUpdateLiveClass,
  useUpdateLiveClassPrice,
} from "@/lib/hooks/useLiveClasses";
import {
  useArchiveLiveClassVideo,
  useCreateLiveClassVideo,
  useLiveClassVideos,
  useReorderLiveClassVideos,
  useUpdateLiveClassVideo,
} from "@/lib/hooks/useLiveClassVideos";
import { useCourses } from "@/lib/hooks/useCourses";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function AdminLiveClassDetailPage() {
  const routeParams = useParams();
  const liveClassId = routeParams?.liveClassId;

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [priceDrawerOpen, setPriceDrawerOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [priceToDeactivate, setPriceToDeactivate] = useState(null);
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [materialPickerOpen, setMaterialPickerOpen] = useState(false);
  const [materialToRemove, setMaterialToRemove] = useState(null);
  const [videoDrawerOpen, setVideoDrawerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoToArchive, setVideoToArchive] = useState(null);

  const liveClassQuery = useLiveClass(liveClassId);
  const pricesQuery = useLiveClassPrices(liveClassId);
  const videosQuery = useLiveClassVideos(liveClassId);
  const coursesQuery = useCourses({ page: 1, limit: 100 });

  const updateMutation = useUpdateLiveClass();
  const publishMutation = usePublishLiveClass();
  const unpublishMutation = useUnpublishLiveClass();
  const createPriceMutation = useCreateLiveClassPrice();
  const updatePriceMutation = useUpdateLiveClassPrice();
  const deletePriceMutation = useDeleteLiveClassPrice();
  const createVideoMutation = useCreateLiveClassVideo();
  const updateVideoMutation = useUpdateLiveClassVideo();
  const archiveVideoMutation = useArchiveLiveClassVideo();
  const reorderVideosMutation = useReorderLiveClassVideos();

  const liveClass = liveClassQuery.data;
  const prices = pricesQuery.data || [];
  const videos = useMemo(() => videosQuery.data || [], [videosQuery.data]);
  const courses = coursesQuery.data?.courses || [];

  const sortedVideos = useMemo(() => {
    return [...videos].sort(
      (a, b) => Number(a.videoOrder || 0) - Number(b.videoOrder || 0)
    );
  }, [videos]);

  const nextVideoOrder =
    sortedVideos.reduce(
      (maxOrder, video) => Math.max(maxOrder, Number(video.videoOrder || 0)),
      0
    ) + 1;

  const hasBanner = Boolean(
    liveClass?.bannerImageAssetId || liveClass?.bannerImageAsset?.id
  );
  const hasPrice = prices.some((p) => p.isActive);
  const isPublished = liveClass?.status === "PUBLISHED";
  const canPublish = hasBanner && hasPrice;

  if (!liveClassId) {
    return <ErrorState error={{ message: "Missing live class ID in route." }} />;
  }

  if (liveClassQuery.isLoading) {
    return <LoadingState label="Loading live class setup..." />;
  }

  if (liveClassQuery.isError) {
    return (
      <ErrorState error={liveClassQuery.error} onRetry={liveClassQuery.refetch} />
    );
  }

  if (!liveClass) {
    return (
      <ErrorState
        error={{ message: "Live class was not found." }}
        onRetry={liveClassQuery.refetch}
      />
    );
  }

  const handleUpdate = async (payload) => {
    await updateMutation.mutateAsync({ liveClassId, payload });
    setEditDrawerOpen(false);
  };

  const handleAttachBanner = async (asset) => {
    await updateMutation.mutateAsync({
      liveClassId,
      payload: { bannerImageAssetId: asset.id },
    });
    setBannerPickerOpen(false);
  };

  const handleRemoveBanner = async () => {
    await updateMutation.mutateAsync({
      liveClassId,
      payload: { bannerImageAssetId: null },
    });
  };

  const handleAddMaterial = async (asset) => {
    const currentIds = (liveClass?.materials || [])
      .map((m) => m.mediaAsset?.id || m.mediaAssetId)
      .filter(Boolean);

    await updateMutation.mutateAsync({
      liveClassId,
      payload: { materialAssetIds: [...currentIds, asset.id] },
    });
    setMaterialPickerOpen(false);
  };

  const handleRemoveMaterial = async () => {
    if (!materialToRemove) return;

    const currentIds = (liveClass?.materials || [])
      .map((m) => m.mediaAsset?.id || m.mediaAssetId)
      .filter(Boolean);

    const removeId =
      materialToRemove.mediaAsset?.id || materialToRemove.mediaAssetId;

    await updateMutation.mutateAsync({
      liveClassId,
      payload: { materialAssetIds: currentIds.filter((id) => id !== removeId) },
    });
    setMaterialToRemove(null);
  };

  const handlePriceSubmit = async (payload) => {
    if (selectedPrice?.id) {
      await updatePriceMutation.mutateAsync({
        priceId: selectedPrice.id,
        liveClassId,
        payload,
      });
    } else {
      await createPriceMutation.mutateAsync({ liveClassId, payload });
    }
    setSelectedPrice(null);
    setPriceDrawerOpen(false);
  };

  const handleDeactivatePrice = async () => {
    if (!priceToDeactivate?.id) return;
    await deletePriceMutation.mutateAsync({
      priceId: priceToDeactivate.id,
      liveClassId,
    });
    setPriceToDeactivate(null);
  };

  const handleVideoSubmit = async (payload) => {
    if (selectedVideo?.id) {
      await updateVideoMutation.mutateAsync({
        videoId: selectedVideo.id,
        liveClassId,
        payload,
      });
    } else {
      await createVideoMutation.mutateAsync({ liveClassId, payload });
    }
    setSelectedVideo(null);
    setVideoDrawerOpen(false);
  };

  const handleMoveVideoUp = async (video, index) => {
    if (index === 0) return;
    const reordered = [...sortedVideos];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];
    await reorderVideosMutation.mutateAsync({
      liveClassId,
      videos: reordered.map((v, i) => ({ videoId: v.id, videoOrder: i + 1 })),
    });
  };

  const handleMoveVideoDown = async (video, index) => {
    if (index === sortedVideos.length - 1) return;
    const reordered = [...sortedVideos];
    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];
    await reorderVideosMutation.mutateAsync({
      liveClassId,
      videos: reordered.map((v, i) => ({ videoId: v.id, videoOrder: i + 1 })),
    });
  };

  const handleArchiveVideo = async () => {
    if (!videoToArchive?.id) return;
    await archiveVideoMutation.mutateAsync({
      videoId: videoToArchive.id,
      liveClassId,
    });
    setVideoToArchive(null);
  };

  const handlePublish = async () => {
    await publishMutation.mutateAsync(liveClassId);
  };

  const handleUnpublish = async () => {
    await unpublishMutation.mutateAsync(liveClassId);
  };

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" className="rounded-xl px-0">
          <Link href="/admin/live-classes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to live classes
          </Link>
        </Button>
      </div>

      <PageHeader
        title={liveClass.title}
        description={liveClass.description || "Live class setup"}
        action={
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              variant="outline"
              className="h-10 rounded-xl bg-white"
              onClick={() => setEditDrawerOpen(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>

            {isPublished ? (
              <Button
                variant="outline"
                className="h-10 rounded-xl bg-white"
                disabled={unpublishMutation.isPending}
                onClick={handleUnpublish}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </Button>
            ) : (
              <Button
                className="h-10 rounded-xl"
                disabled={publishMutation.isPending}
                onClick={handlePublish}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <StatusBadge value={liveClass.status || "DRAFT"} />
        {liveClass.course?.title && <span>{liveClass.course.title}</span>}
        <span className="hidden sm:inline" aria-hidden="true">·</span>
        <span className="hidden sm:inline">{formatDateTime(liveClass.startDate)}</span>
      </div>

      {!canPublish && !isPublished && (
        <Card className="mb-4 rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-900">
              Complete before publishing
            </p>
            <div className="mt-3 grid gap-2 text-sm text-amber-900 sm:grid-cols-2">
              <SetupItem done={hasBanner} label="Banner image" />
              <SetupItem done={hasPrice} label="At least one active price" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="media" className="flex min-w-0 flex-col gap-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="flex !h-10 w-max min-w-full justify-start rounded-2xl bg-white p-1 shadow-sm sm:min-w-0">
            <TabsTrigger className="h-8 !flex-none rounded-xl px-4" value="media">
              Media
            </TabsTrigger>
            <TabsTrigger className="h-8 !flex-none rounded-xl px-4" value="pricing">
              Pricing
            </TabsTrigger>
            <TabsTrigger className="h-8 !flex-none rounded-xl px-4" value="videos">
              Videos
            </TabsTrigger>
            <TabsTrigger className="h-8 !flex-none rounded-xl px-4" value="overview">
              Overview
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Media tab ── */}
        <TabsContent value="media" className="min-w-0 space-y-6">
          {/* Banner */}
          <div>
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <MediaUploadBox
                mediaKind="IMAGE"
                label="Upload banner image"
                description="Upload and attach the class banner."
                onUploaded={handleAttachBanner}
              />

              <div className="min-w-0 rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    Banner
                  </span>
                  <span
                    className={
                      hasBanner
                        ? "text-sm text-green-700"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {hasBanner ? "Attached" : "Not attached"}
                  </span>
                </div>

                {liveClass.bannerImageAsset?.id ? (
                  <>
                    <MediaAssetPreview
                      asset={liveClass.bannerImageAsset}
                      compact
                      showDetails
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => setBannerPickerOpen(true)}
                      >
                        Choose existing
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl text-destructive hover:text-destructive"
                        disabled={updateMutation.isPending}
                        onClick={handleRemoveBanner}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl bg-neutral-50 p-4 text-sm text-muted-foreground">
                      Upload a banner image above or choose one from the media
                      library.
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 h-10 w-full rounded-xl"
                      onClick={() => setBannerPickerOpen(true)}
                    >
                      Choose existing
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Preparatory Materials */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Preparatory Materials</p>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Attach PDFs, documents, or files that registered learners receive before
              the class.
            </p>

            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <MediaUploadBox
                mediaKind="DOCUMENT"
                label="Upload material"
                description="PDF, Word (.docx), or plain text — max 50 MB."
                onUploaded={handleAddMaterial}
              />

              <div className="flex flex-col justify-center rounded-2xl border bg-white p-4">
                <p className="text-sm font-medium">Choose from library</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pick an already-uploaded document from the media library.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 h-10 rounded-xl"
                  onClick={() => setMaterialPickerOpen(true)}
                >
                  Choose existing
                </Button>
              </div>
            </div>

            {(liveClass.materials || []).length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(liveClass.materials || []).map((material, index) => (
                  <div
                    key={material.id}
                    className="min-w-0 rounded-2xl border bg-white p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Material {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-xl text-destructive hover:text-destructive"
                        disabled={updateMutation.isPending}
                        onClick={() => setMaterialToRemove(material)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {material.mediaAsset ? (
                      <>
                        <MediaAssetPreview asset={material.mediaAsset} compact />
                        <p className="mt-2 truncate text-xs text-muted-foreground">
                          {material.mediaAsset.originalFilename || "Document"}
                        </p>
                      </>
                    ) : (
                      <div className="rounded-xl bg-neutral-50 p-3 text-xs text-muted-foreground">
                        Asset details not loaded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed bg-neutral-50 p-5 text-center text-sm text-muted-foreground">
                No preparatory materials attached yet.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Pricing tab ── */}
        <TabsContent value="pricing" className="min-w-0">
          <Card className="w-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Live Class Prices</p>
                <p className="text-sm text-muted-foreground">
                  Add at least one active price before publishing.
                </p>
              </div>

              <Button
                className="h-10 w-full rounded-xl sm:w-auto"
                onClick={() => {
                  setSelectedPrice(null);
                  setPriceDrawerOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Price
              </Button>
            </div>

            <CardContent className="p-0">
              {pricesQuery.isLoading ? (
                <LoadingState label="Loading prices..." />
              ) : prices.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">
                  No prices created yet. Add a price before publishing.
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-neutral-50">
                          <TableHead className="px-5">Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {prices.map((price) => (
                          <TableRow key={price.id}>
                            <TableCell className="px-5 font-medium">
                              {price.amount}
                            </TableCell>
                            <TableCell>{price.currency}</TableCell>
                            <TableCell>
                              <StatusBadge
                                value={price.isActive ? "ACTIVE" : "INACTIVE"}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl"
                                onClick={() => {
                                  setSelectedPrice(price);
                                  setPriceDrawerOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-destructive"
                                onClick={() => setPriceToDeactivate(price)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-3 p-3 sm:p-4 md:hidden">
                    {prices.map((price) => (
                      <div key={price.id} className="rounded-2xl border bg-white p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">
                              {price.currency} {price.amount}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              One-time payment
                            </p>
                          </div>
                          <StatusBadge
                            value={price.isActive ? "ACTIVE" : "INACTIVE"}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl px-2"
                            onClick={() => {
                              setSelectedPrice(price);
                              setPriceDrawerOpen(true);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            className="h-9 rounded-xl px-2 text-destructive"
                            onClick={() => setPriceToDeactivate(price)}
                          >
                            Deactivate
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

        {/* ── Videos tab ── */}
        <TabsContent value="videos" className="min-w-0">
          <Card className="w-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Live Class Videos</p>
                <p className="text-sm text-muted-foreground">
                  Upload recordings. Learners can only play them after payment,
                  unless marked as a free preview.
                </p>
              </div>

              <Button
                className="h-10 w-full rounded-xl sm:w-auto"
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoDrawerOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Video
              </Button>
            </div>

            <CardContent className="p-0">
              {videosQuery.isLoading ? (
                <LoadingState label="Loading videos..." />
              ) : sortedVideos.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">
                  No videos uploaded yet.
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-neutral-50">
                          <TableHead className="w-[90px] px-5">Order</TableHead>
                          <TableHead className="min-w-[260px]">Video</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Preview</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Media</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {sortedVideos.map((video, index) => {
                          const hasMedia =
                            video.videoMediaAssetId || video.videoMediaAsset?.id;

                          return (
                            <TableRow key={video.id}>
                              <TableCell className="px-5">
                                {video.videoOrder}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{video.title}</p>
                                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                  {video.description || "-"}
                                </p>
                              </TableCell>
                              <TableCell>
                                {formatDuration(video.durationSeconds)}
                              </TableCell>
                              <TableCell>
                                {video.isPreviewFree ? "Free" : "Locked"}
                              </TableCell>
                              <TableCell>
                                <StatusBadge value={video.status || "DRAFT"} />
                              </TableCell>
                              <TableCell>
                                <span className={hasMedia ? "text-green-700" : "text-destructive"}>
                                  {hasMedia ? "Attached" : "Missing"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl"
                                  disabled={index === 0 || reorderVideosMutation.isPending}
                                  onClick={() => handleMoveVideoUp(video, index)}
                                  title="Move up"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl"
                                  disabled={
                                    index === sortedVideos.length - 1 ||
                                    reorderVideosMutation.isPending
                                  }
                                  onClick={() => handleMoveVideoDown(video, index)}
                                  title="Move down"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl"
                                  onClick={() => {
                                    setSelectedVideo(video);
                                    setVideoDrawerOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl text-destructive"
                                  onClick={() => setVideoToArchive(video)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-3 p-3 sm:p-4 lg:hidden">
                    {sortedVideos.map((video, index) => {
                      const hasMedia =
                        video.videoMediaAssetId || video.videoMediaAsset?.id;

                      return (
                        <div
                          key={video.id}
                          className="rounded-2xl border bg-white p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Video {video.videoOrder}
                              </p>
                              <p className="mt-1 line-clamp-2 text-sm font-semibold">
                                {video.title}
                              </p>
                            </div>
                            <StatusBadge value={video.status || "DRAFT"} />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{formatDuration(video.durationSeconds)}</span>
                            <span>
                              {video.isPreviewFree ? "Free preview" : "Locked"}
                            </span>
                            <span
                              className={
                                hasMedia ? "text-green-700" : "text-destructive"
                              }
                            >
                              {hasMedia ? "Media attached" : "Media missing"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="h-9 rounded-xl px-2"
                              disabled={index === 0 || reorderVideosMutation.isPending}
                              onClick={() => handleMoveVideoUp(video, index)}
                            >
                              <ChevronUp className="mr-1 h-4 w-4" />
                              Move up
                            </Button>

                            <Button
                              variant="outline"
                              className="h-9 rounded-xl px-2"
                              disabled={
                                index === sortedVideos.length - 1 ||
                                reorderVideosMutation.isPending
                              }
                              onClick={() => handleMoveVideoDown(video, index)}
                            >
                              <ChevronDown className="mr-1 h-4 w-4" />
                              Move down
                            </Button>

                            <Button
                              variant="outline"
                              className="h-9 rounded-xl px-2"
                              onClick={() => {
                                setSelectedVideo(video);
                                setVideoDrawerOpen(true);
                              }}
                            >
                              Edit / Upload
                            </Button>

                            <Button
                              variant="outline"
                              className="h-9 rounded-xl px-2 text-destructive"
                              onClick={() => setVideoToArchive(video)}
                            >
                              Archive
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Overview tab ── */}
        <TabsContent value="overview" className="min-w-0">
          <Card className="w-full rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <OverviewRow label="Title" value={liveClass.title} />
              <OverviewRow label="Slug" value={liveClass.slug} mono />
              <OverviewRow
                label="Description"
                value={liveClass.description}
                multiline
              />
              <OverviewRow
                label="Start"
                value={formatDateTime(liveClass.startDate)}
              />
              <OverviewRow label="End" value={formatDateTime(liveClass.endDate)} />
              <OverviewRow
                label="Duration"
                value={
                  liveClass.durationDays
                    ? `${liveClass.durationDays} day${liveClass.durationDays === 1 ? "" : "s"}`
                    : undefined
                }
              />
              <OverviewRow
                label="Joining Link"
                value={liveClass.joiningLink || "Not set"}
                mono={Boolean(liveClass.joiningLink)}
              />
              <OverviewRow
                label="Linked Course"
                value={liveClass.course?.title || "Standalone"}
              />
              <OverviewRow
                label="Published At"
                value={formatDateTime(liveClass.publishedAt)}
              />
              <OverviewRow
                label="Created"
                value={formatDateTime(liveClass.createdAt)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Drawers & dialogs ── */}
      <LiveClassFormDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        mode="edit"
        initialData={liveClass}
        courses={courses}
        submitting={updateMutation.isPending}
        onSubmit={handleUpdate}
      />

      <LiveClassPriceFormDrawer
        open={priceDrawerOpen}
        onOpenChange={(open) => {
          setPriceDrawerOpen(open);
          if (!open) setSelectedPrice(null);
        }}
        mode={selectedPrice ? "edit" : "create"}
        initialData={selectedPrice}
        submitting={createPriceMutation.isPending || updatePriceMutation.isPending}
        onSubmit={handlePriceSubmit}
      />

      <ConfirmDialog
        open={Boolean(priceToDeactivate)}
        onOpenChange={(open) => {
          if (!open) setPriceToDeactivate(null);
        }}
        title="Deactivate price?"
        description="This price will be marked inactive and will no longer be offered at checkout."
        confirmLabel="Deactivate"
        confirming={deletePriceMutation.isPending}
        onConfirm={handleDeactivatePrice}
      />

      <ConfirmDialog
        open={Boolean(materialToRemove)}
        onOpenChange={(open) => {
          if (!open) setMaterialToRemove(null);
        }}
        title="Remove material?"
        description="This will detach the material from this live class."
        confirmLabel="Remove"
        confirming={updateMutation.isPending}
        onConfirm={handleRemoveMaterial}
      />

      <LiveClassVideoFormDrawer
        open={videoDrawerOpen}
        onOpenChange={(open) => {
          setVideoDrawerOpen(open);
          if (!open) setSelectedVideo(null);
        }}
        mode={selectedVideo ? "edit" : "create"}
        initialData={selectedVideo}
        nextVideoOrder={nextVideoOrder}
        existingVideos={sortedVideos}
        submitting={createVideoMutation.isPending || updateVideoMutation.isPending}
        onSubmit={handleVideoSubmit}
        onMediaDeleted={() => {
          videosQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={Boolean(videoToArchive)}
        onOpenChange={(open) => {
          if (!open) setVideoToArchive(null);
        }}
        title="Archive video?"
        description="This will archive the selected video and remove learner access to it."
        confirmLabel="Archive"
        confirming={archiveVideoMutation.isPending}
        onConfirm={handleArchiveVideo}
      />

      <MediaAssetPicker
        open={bannerPickerOpen}
        onOpenChange={setBannerPickerOpen}
        mediaKind="IMAGE"
        title="Select banner image"
        description="Choose an uploaded image to use as the class banner."
        selectedAssetId={
          liveClass.bannerImageAsset?.id || liveClass.bannerImageAssetId
        }
        onSelect={handleAttachBanner}
      />

      <MediaAssetPicker
        open={materialPickerOpen}
        onOpenChange={setMaterialPickerOpen}
        mediaKind="DOCUMENT"
        title="Select preparatory material"
        description="Choose an uploaded document to add as a class material."
        onSelect={handleAddMaterial}
      />
    </div>
  );
}

function SetupItem({ done, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2">
      <CheckCircle2
        className={done ? "h-4 w-4 text-green-700" : "h-4 w-4 text-amber-700"}
      />
      <span>{label}</span>
    </div>
  );
}

function OverviewRow({ label, value, mono = false, multiline = false }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p
        className={[
          "mt-1 text-sm text-muted-foreground",
          mono ? "font-mono" : "",
          multiline ? "whitespace-pre-wrap leading-7" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value || "—"}
      </p>
    </div>
  );
}
