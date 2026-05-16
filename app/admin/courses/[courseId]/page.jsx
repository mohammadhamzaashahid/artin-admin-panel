"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  FileAudio,
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

  const course = courseQuery.data;
  const prices = pricesQuery.data || [];
  const lectures = lecturesQuery.data || [];
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
        description="Complete this setup flow: media, pricing, lectures, then publish."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="h-11 rounded-xl bg-white"
              onClick={() => setCourseDrawerOpen(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Details
            </Button>

            <Button
              className="h-11 rounded-xl"
              disabled={publishCourseMutation.isPending}
              onClick={handlePublish}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        }
      />

      {!canPublish && (
        <Card className="mb-5 rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-5">
            <p className="font-semibold text-amber-900">Course setup is not complete yet</p>
            <div className="mt-3 grid gap-2 text-sm text-amber-900 sm:grid-cols-2 lg:grid-cols-4">
              <SetupItem done={hasBanner} label="Banner image" />
              <SetupItem done={hasThumbnail} label="Thumbnail image" />
              <SetupItem done={hasPrice} label="At least one price" />
              <SetupItem done={hasLecture} label="At least one lecture" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-2">
              <StatusBadge value={course.status || "DRAFT"} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="mt-2 font-semibold">
              {course.category?.name || course.categoryName || "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="mt-2 font-semibold">
              {formatDateTime(course.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="media" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm md:w-auto md:inline-grid md:grid-cols-4">
          <TabsTrigger className="rounded-xl" value="media">
            1. Media
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="pricing">
            2. Pricing
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="lectures">
            3. Lectures
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="overview">
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="media">
          <div className="grid gap-4 xl:grid-cols-2">
            <MediaUploadBox
              mediaKind="IMAGE"
              label="Upload course banner"
              description="Step 1: upload the banner image. It will be sent directly to R2 and attached to this course."
              onUploaded={(asset) => handleAttachImage(asset, "banner")}
            />

            <MediaUploadBox
              mediaKind="IMAGE"
              label="Upload course thumbnail"
              description="Step 2: upload the thumbnail image. It will be sent directly to R2 and attached to this course."
              onUploaded={(asset) => handleAttachImage(asset, "thumbnail")}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <AssetCard
              title="Current Banner Asset"
              value={course.bannerImageAssetId || course.bannerImageAsset?.id}
            />
            <AssetCard
              title="Current Thumbnail Asset"
              value={course.thumbnailImageAssetId || course.thumbnailImageAsset?.id}
            />
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="overflow-hidden rounded-3xl border-0 shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Course Prices</p>
                <p className="text-sm text-muted-foreground">
                  Step 3: add at least one subscription or one-time price.
                </p>
              </div>

              <Button
                className="h-10 rounded-xl"
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
                <div className="overflow-x-auto">
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lectures">
          <Card className="overflow-hidden rounded-3xl border-0 shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Course Lectures</p>
                <p className="text-sm text-muted-foreground">
                  Step 4: create lectures. Inside each lecture, upload audio/video and save.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl bg-white"
                  disabled={
                    reorderLecturesMutation.isPending ||
                    sortedLectures.length === 0
                  }
                  onClick={handleReorderNormalize}
                >
                  Normalize Order
                </Button>

                <Button
                  className="h-10 rounded-xl"
                  onClick={() => {
                    setSelectedLecture(null);
                    setLectureDrawerOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Lecture
                </Button>
              </div>
            </div>

            <CardContent className="p-0">
              {lecturesQuery.isLoading ? (
                <LoadingState label="Loading lectures..." />
              ) : sortedLectures.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">
                  No lectures created yet. Create a lecture and upload its audio/video in the drawer.
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

                  <div className="space-y-3 p-4 lg:hidden">
                    {sortedLectures.map((lecture) => (
                      <div
                        key={lecture.id}
                        className="rounded-2xl border bg-white p-4"
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

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-muted-foreground">Duration</p>
                            <p className="mt-1 font-medium">
                              {formatDuration(lecture.durationSeconds)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-muted-foreground">Access</p>
                            <p className="mt-1 font-medium">
                              {lecture.isPreviewFree ? "Free" : "Locked"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => {
                              setSelectedLecture(lecture);
                              setLectureDrawerOpen(true);
                            }}
                          >
                            Edit / Upload
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-xl text-destructive"
                            onClick={() => setLectureToArchive(lecture)}
                          >
                            Archive
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

        <TabsContent value="overview">
          <Card className="rounded-3xl border-0 shadow-sm">
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
    </div>
  );
}

function SetupItem({ done, label }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2">
      <CheckCircle2
        className={done ? "h-4 w-4 text-green-700" : "h-4 w-4 text-amber-700"}
      />
      <span>{label}</span>
    </div>
  );
}

function AssetCard({ title, value }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="break-all rounded-2xl bg-neutral-50 p-4 text-xs text-muted-foreground">
          {value || "Not attached yet"}
        </p>
      </CardContent>
    </Card>
  );
}
