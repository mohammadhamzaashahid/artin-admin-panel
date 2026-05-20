"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  ImageIcon,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CourseFormDrawer from "@/components/admin/CourseFormDrawer";
import MediaUploadBox from "@/components/admin/MediaUploadBox";
import MediaAssetPreview from "@/components/admin/MediaAssetPreview";
import MediaAssetPicker from "@/components/admin/MediaAssetPicker";
import PriceFormDrawer from "@/components/admin/PriceFormDrawer";
import LectureFormDrawer from "@/components/admin/LectureFormDrawer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useCourse,
  useCoursePrices,
  useCreateCoursePrice,
  useDeleteCoursePrice,
  usePublishCourse,
  useUpdateCourse,
  useUpdateCoursePrice,
} from "@/lib/hooks/useCourses";
import { useCategories } from "@/lib/hooks/useCategories";
import { useTags } from "@/lib/hooks/useTags";
import {
  useArchiveLecture,
  useCourseLectures,
  useCreateLecture,
  useReorderLectures,
  useUpdateLecture,
} from "@/lib/hooks/useLectures";
import { useDeleteMedia } from "@/lib/hooks/useMedia";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function AdminCourseDetailPage() {
  const routeParams = useParams();
  const courseId = routeParams?.courseId;

  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false);
  const [priceDrawerOpen, setPriceDrawerOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [lectureDrawerOpen, setLectureDrawerOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureToArchive, setLectureToArchive] = useState(null);
  const [priceToDeactivate, setPriceToDeactivate] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [courseMediaPicker, setCourseMediaPicker] = useState(null);

  const courseQuery = useCourse(courseId);
  const pricesQuery = useCoursePrices(courseId);
  const lecturesQuery = useCourseLectures(courseId);
  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const tagsQuery = useTags({ page: 1, limit: 100 });

  const updateCourseMutation = useUpdateCourse();
  const publishCourseMutation = usePublishCourse();

  const createPriceMutation = useCreateCoursePrice();
  const updatePriceMutation = useUpdateCoursePrice();
  const deletePriceMutation = useDeleteCoursePrice();

  const createLectureMutation = useCreateLecture();
  const updateLectureMutation = useUpdateLecture();
  const archiveLectureMutation = useArchiveLecture();
  const reorderLecturesMutation = useReorderLectures();
  const deleteMediaMutation = useDeleteMedia();

  const course = courseQuery.data;
  const prices = pricesQuery.data || [];
  const lectures = useMemo(() => lecturesQuery.data || [], [lecturesQuery.data]);
  const categories = categoriesQuery.data?.categories || [];
  const tags = tagsQuery.data?.tags || [];

  const sortedLectures = useMemo(() => {
    return [...lectures].sort(
      (a, b) => Number(a.lectureOrder || 0) - Number(b.lectureOrder || 0)
    );
  }, [lectures]);

  const nextLectureOrder =
    sortedLectures.reduce(
      (maxOrder, lecture) => Math.max(maxOrder, Number(lecture.lectureOrder || 0)),
      0
    ) + 1;

  const hasBanner = Boolean(course?.bannerImageAssetId || course?.bannerImageAsset?.id);
  const hasThumbnail = Boolean(
    course?.thumbnailImageAssetId || course?.thumbnailImageAsset?.id
  );
  const hasPrice = prices.length > 0;
  const hasLecture = sortedLectures.length > 0;
  const canPublish = hasBanner && hasThumbnail && hasPrice && hasLecture;

  if (!courseId) {
    return <ErrorState error={{ message: "Missing course ID in route." }} />;
  }

  if (courseQuery.isLoading) {
    return <LoadingState label="Loading course setup..." />;
  }

  if (courseQuery.isError) {
    return (
      <ErrorState error={courseQuery.error} onRetry={courseQuery.refetch} />
    );
  }

  if (!course) {
    return (
      <ErrorState
        error={{ message: "Course was not found." }}
        onRetry={courseQuery.refetch}
      />
    );
  }

  const handleCourseUpdate = async (payload) => {
    await updateCourseMutation.mutateAsync({
      courseId,
      payload,
    });

    setCourseDrawerOpen(false);
  };

  const handleAttachImage = async (asset, target) => {
    const payload =
      target === "banner"
        ? { bannerImageAssetId: asset.id }
        : { thumbnailImageAssetId: asset.id };

    await updateCourseMutation.mutateAsync({
      courseId,
      payload,
    });
  };

  const handleSelectExistingCourseImage = async (asset) => {
    if (!courseMediaPicker?.target || !asset?.id) return;

    await handleAttachImage(asset, courseMediaPicker.target);
    setCourseMediaPicker(null);
  };

  const handlePriceSubmit = async (payload) => {
    if (selectedPrice?.id) {
      await updatePriceMutation.mutateAsync({
        priceId: selectedPrice.id,
        courseId,
        payload,
      });
    } else {
      await createPriceMutation.mutateAsync({
        courseId,
        payload,
      });
    }

    setSelectedPrice(null);
    setPriceDrawerOpen(false);
  };

  const handleLectureSubmit = async (payload) => {
    try {
      if (selectedLecture?.id) {
        await updateLectureMutation.mutateAsync({
          lectureId: selectedLecture.id,
          courseId,
          payload,
        });
      } else {
        await createLectureMutation.mutateAsync({
          courseId,
          payload,
        });
      }

      await lecturesQuery.refetch();

      setSelectedLecture(null);
      setLectureDrawerOpen(false);
    } catch (error) {
      console.error("Lecture save failed:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save lecture"
      );
    }
  };

  const handleReorderNormalize = async () => {
    if (sortedLectures.length === 0) return;

    const reordered = sortedLectures.map((lecture, index) => ({
      lectureId: lecture.id,
      lectureOrder: index + 1,
    }));

    await reorderLecturesMutation.mutateAsync({
      courseId,
      lectures: reordered,
    });
  };

  const handleArchiveLecture = async () => {
    if (!lectureToArchive?.id) return;

    await archiveLectureMutation.mutateAsync({
      lectureId: lectureToArchive.id,
      courseId,
    });

    setLectureToArchive(null);
  };

  const handleDeactivatePrice = async () => {
    if (!priceToDeactivate?.id) return;

    await deletePriceMutation.mutateAsync({
      priceId: priceToDeactivate.id,
      courseId,
    });

    setPriceToDeactivate(null);
  };

  const handleDeleteAttachedMedia = async () => {
    if (!mediaToDelete?.asset?.id) return;

    await deleteMediaMutation.mutateAsync(mediaToDelete.asset.id);
    await courseQuery.refetch();
    await lecturesQuery.refetch();
    setMediaToDelete(null);
  };

  const handlePublish = async () => {
    await publishCourseMutation.mutateAsync(courseId);
  };

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" className="rounded-xl px-0">
          <Link href="/admin/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to courses
          </Link>
        </Button>
      </div>

      <PageHeader
        title={course.title}
        description={course.subtitle || course.shortDescription || "Course setup"}
        action={
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              variant="outline"
              className="h-10 rounded-xl bg-white"
              onClick={() => setCourseDrawerOpen(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>

            <Button
              className="h-10 rounded-xl"
              disabled={publishCourseMutation.isPending}
              onClick={handlePublish}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <StatusBadge value={course.status || "DRAFT"} />
        <span>{course.category?.name || course.categoryName || "No category"}</span>
        <span className="hidden sm:inline" aria-hidden="true">·</span>
        <span className="hidden sm:inline">{formatDateTime(course.createdAt)}</span>
      </div>

      {!canPublish && (
        <Card className="mb-4 rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-900">Missing before publish</p>
            <div className="mt-3 grid gap-2 text-sm text-amber-900 sm:grid-cols-2 lg:grid-cols-4">
              <SetupItem done={hasBanner} label="Banner image" />
              <SetupItem done={hasThumbnail} label="Thumbnail image" />
              <SetupItem done={hasPrice} label="At least one price" />
              <SetupItem done={hasLecture} label="At least one lecture" />
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
            <TabsTrigger className="h-8 !flex-none rounded-xl px-4" value="lectures">
              Lectures
            </TabsTrigger>
            <TabsTrigger className="h-8 !flex-none rounded-xl px-4" value="overview">
              Overview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="media" className="min-w-0">
          <div className="grid min-w-0 gap-4 xl:grid-cols-2">
            <MediaUploadBox
              mediaKind="IMAGE"
              label="Upload course banner"
              description="Upload and attach the banner image."
              onUploaded={(asset) => handleAttachImage(asset, "banner")}
            />

            <MediaUploadBox
              mediaKind="IMAGE"
              label="Upload course thumbnail"
              description="Upload and attach the thumbnail image."
              onUploaded={(asset) => handleAttachImage(asset, "thumbnail")}
            />
          </div>

          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
            <CourseMediaPanel
              label="Banner"
              asset={course.bannerImageAsset}
              fallbackAssetId={course.bannerImageAssetId}
              onSelectExisting={() =>
                setCourseMediaPicker({
                  target: "banner",
                  label: "course banner",
                  selectedAssetId:
                    course.bannerImageAsset?.id || course.bannerImageAssetId,
                })
              }
              onDelete={(asset) => setMediaToDelete({ label: "banner image", asset })}
            />
            <CourseMediaPanel
              label="Thumbnail"
              asset={course.thumbnailImageAsset}
              fallbackAssetId={course.thumbnailImageAssetId}
              onSelectExisting={() =>
                setCourseMediaPicker({
                  target: "thumbnail",
                  label: "course thumbnail",
                  selectedAssetId:
                    course.thumbnailImageAsset?.id || course.thumbnailImageAssetId,
                })
              }
              onDelete={(asset) => setMediaToDelete({ label: "thumbnail image", asset })}
            />
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="min-w-0">
          <Card className="w-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Course Prices</p>
                <p className="text-sm text-muted-foreground">
                  Add at least one subscription or one-time price.
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
                New Price
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
                          <TableHead className="px-5">Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Interval</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {prices.map((price) => (
                          <TableRow key={price.id}>
                            <TableCell className="px-5 font-medium">
                              {price.priceType}
                            </TableCell>
                            <TableCell>
                              {price.currency} {price.amount}
                            </TableCell>
                            <TableCell>{price.billingInterval || "-"}</TableCell>
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
                      <div
                        key={price.id}
                        className="rounded-2xl border bg-white p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">
                              {price.priceType}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {price.currency} {price.amount}
                              {price.billingInterval
                                ? ` / ${price.billingInterval.toLowerCase()}`
                                : ""}
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

        <TabsContent value="lectures" className="min-w-0">
          <Card className="w-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Course Lectures</p>
                <p className="text-sm text-muted-foreground">
                  Create lectures and attach audio or video.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  variant="outline"
                  className="h-10 min-w-0 rounded-xl bg-white px-3"
                  disabled={
                    reorderLecturesMutation.isPending ||
                    sortedLectures.length === 0
                  }
                  onClick={handleReorderNormalize}
                >
                  Normalize
                </Button>

                <Button
                  className="h-10 min-w-0 rounded-xl px-3"
                  onClick={() => {
                    setSelectedLecture(null);
                    setLectureDrawerOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="truncate">New Lecture</span>
                </Button>
              </div>
            </div>

            <CardContent className="p-0">
              {lecturesQuery.isLoading ? (
                <LoadingState label="Loading lectures..." />
              ) : sortedLectures.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">
                  No lectures created yet.
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-neutral-50">
                          <TableHead className="w-[90px] px-5">Order</TableHead>
                          <TableHead className="min-w-[260px]">Lecture</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Preview</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Media</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {sortedLectures.map((lecture) => {
                          const hasMedia =
                            lecture.audioMediaAssetId ||
                            lecture.audioMediaAsset?.id ||
                            lecture.videoMediaAssetId ||
                            lecture.videoMediaAsset?.id;

                          return (
                            <TableRow key={lecture.id}>
                              <TableCell className="px-5">
                                {lecture.lectureOrder}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{lecture.title}</p>
                                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                  {lecture.description || "-"}
                                </p>
                              </TableCell>
                              <TableCell>
                                {formatDuration(lecture.durationSeconds)}
                              </TableCell>
                              <TableCell>
                                {lecture.isPreviewFree ? "Free" : "Locked"}
                              </TableCell>
                              <TableCell>
                                <StatusBadge value={lecture.status || "DRAFT"} />
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
                                  onClick={() => {
                                    setSelectedLecture(lecture);
                                    setLectureDrawerOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl text-destructive"
                                  onClick={() => setLectureToArchive(lecture)}
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
                    {sortedLectures.map((lecture) => {
                      const hasMedia =
                        lecture.audioMediaAssetId ||
                        lecture.audioMediaAsset?.id ||
                        lecture.videoMediaAssetId ||
                        lecture.videoMediaAsset?.id;

                      return (
                        <div
                          key={lecture.id}
                          className="rounded-2xl border bg-white p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Lecture {lecture.lectureOrder}
                              </p>
                              <p className="mt-1 line-clamp-2 text-sm font-semibold">
                                {lecture.title}
                              </p>
                            </div>
                            <StatusBadge value={lecture.status || "DRAFT"} />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{formatDuration(lecture.durationSeconds)}</span>
                            <span>
                              {lecture.isPreviewFree ? "Free preview" : "Locked"}
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
                              onClick={() => {
                                setSelectedLecture(lecture);
                                setLectureDrawerOpen(true);
                              }}
                            >
                              Edit / Upload
                            </Button>

                            <Button
                              variant="outline"
                              className="h-9 rounded-xl px-2 text-destructive"
                              onClick={() => setLectureToArchive(lecture)}
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

        <TabsContent value="overview" className="min-w-0">
          <Card className="w-full rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium">Short Description</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {course.shortDescription || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {course.description || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CourseFormDrawer
        open={courseDrawerOpen}
        onOpenChange={setCourseDrawerOpen}
        mode="edit"
        initialData={course}
        categories={categories}
        tags={tags}
        submitting={updateCourseMutation.isPending}
        onSubmit={handleCourseUpdate}
      />

      <PriceFormDrawer
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

      <LectureFormDrawer
        open={lectureDrawerOpen}
        onOpenChange={(open) => {
          setLectureDrawerOpen(open);
          if (!open) setSelectedLecture(null);
        }}
        mode={selectedLecture ? "edit" : "create"}
        initialData={selectedLecture}
        nextLectureOrder={nextLectureOrder}
        existingLectures={sortedLectures}
        submitting={createLectureMutation.isPending || updateLectureMutation.isPending}
        onSubmit={handleLectureSubmit}
        onMediaDeleted={() => {
          courseQuery.refetch();
          lecturesQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={Boolean(lectureToArchive)}
        onOpenChange={(open) => {
          if (!open) setLectureToArchive(null);
        }}
        title="Archive lecture?"
        description="This will archive the selected lecture."
        confirmLabel="Archive"
        confirming={archiveLectureMutation.isPending}
        onConfirm={handleArchiveLecture}
      />

      <ConfirmDialog
        open={Boolean(priceToDeactivate)}
        onOpenChange={(open) => {
          if (!open) setPriceToDeactivate(null);
        }}
        title="Deactivate price?"
        description="This will deactivate the selected price."
        confirmLabel="Deactivate"
        confirming={deletePriceMutation.isPending}
        onConfirm={handleDeactivatePrice}
      />

      <ConfirmDialog
        open={Boolean(mediaToDelete)}
        onOpenChange={(open) => {
          if (!open) setMediaToDelete(null);
        }}
        title="Remove and delete media?"
        description={`This will remove the ${mediaToDelete?.label || "media asset"} from this course or lecture, then delete it from Cloudflare R2.`}
        confirmLabel="Remove and delete"
        confirming={deleteMediaMutation.isPending}
        onConfirm={handleDeleteAttachedMedia}
      />

      <MediaAssetPicker
        open={Boolean(courseMediaPicker)}
        onOpenChange={(open) => {
          if (!open) setCourseMediaPicker(null);
        }}
        mediaKind="IMAGE"
        title={`Select ${courseMediaPicker?.label || "course image"}`}
        description="Reuse an image from the media library for this course."
        selectedAssetId={courseMediaPicker?.selectedAssetId}
        onSelect={handleSelectExistingCourseImage}
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

function CourseMediaPanel({
  label,
  asset,
  fallbackAssetId,
  onSelectExisting,
  onDelete,
}) {
  const hasAsset = Boolean(asset?.id || fallbackAssetId);

  return (
    <div className="min-w-0 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className={hasAsset ? "text-sm text-green-700" : "text-sm text-muted-foreground"}>
          {hasAsset ? "Attached" : "Not attached"}
        </span>
      </div>

      {asset?.id ? (
        <>
          <MediaAssetPreview asset={asset} compact showDetails />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={onSelectExisting}
            >
              Choose existing
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl text-destructive hover:text-destructive"
              onClick={() => onDelete(asset)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </>
      ) : fallbackAssetId ? (
        <>
          <div className="rounded-xl bg-neutral-50 p-3 text-xs text-muted-foreground">
            Media asset is attached but details are not loaded.
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-10 w-full rounded-xl"
            onClick={onSelectExisting}
          >
            Choose existing
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-muted-foreground">
            Upload a {label.toLowerCase()} image or choose one from the media library.
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-10 w-full rounded-xl"
            onClick={onSelectExisting}
          >
            Choose existing
          </Button>
        </>
      )}
    </div>
  );
}
