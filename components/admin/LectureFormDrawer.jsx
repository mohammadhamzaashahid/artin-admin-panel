"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CheckCircle2,
  FileAudio,
  FileVideo,
  Hash,
  Loader2,
  Lock,
  PlayCircle,
  Save,
  UploadCloud,
  Unlock,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import MediaUploadBox from "@/components/admin/MediaUploadBox";
import { cn, formatDuration } from "@/lib/utils";

export default function LectureFormDrawer({
  open,

  onOpenChange,
  mode = "create",
  initialData,
  nextLectureOrder = 1,
  existingLectures = [],

  onSubmit,
  submitting = false,
}) {
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      lectureOrder: nextLectureOrder,
      isPreviewFree: false,
      status: "DRAFT",
      audioMediaAssetId: "",
      videoMediaAssetId: "",
      durationSeconds: "",
    },
  });

  const status = watch("status");
  const isPreviewFree = watch("isPreviewFree");
  const durationSeconds = watch("durationSeconds");
  const audioMediaAssetId = watch("audioMediaAssetId");
  const videoMediaAssetId = watch("videoMediaAssetId");

  const hasAudio = Boolean(audioMediaAssetId);
  const hasVideo = Boolean(videoMediaAssetId);
  const hasAnyMedia = hasAudio || hasVideo;

  useEffect(() => {
    if (!open) return;

    const audioId =
      initialData?.audioMediaAssetId || initialData?.audioMediaAsset?.id || "";

    const videoId =
      initialData?.videoMediaAssetId || initialData?.videoMediaAsset?.id || "";

    reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      lectureOrder: initialData?.lectureOrder || nextLectureOrder,
      isPreviewFree: Boolean(initialData?.isPreviewFree),
      status: initialData?.status || "DRAFT",
      audioMediaAssetId: audioId,
      videoMediaAssetId: videoId,
      durationSeconds: initialData?.durationSeconds || "",
    });

    setUploadedAudio(initialData?.audioMediaAsset || null);
    setUploadedVideo(initialData?.videoMediaAsset || null);
  }, [open, initialData, nextLectureOrder, reset]);

  const submitHandler = (values) => {
    const payload = {
      title: values.title?.trim(),
      description: values.description?.trim() || undefined,
      isPreviewFree: Boolean(values.isPreviewFree),
      status: values.status || "DRAFT",
      audioMediaAssetId: values.audioMediaAssetId || undefined,
      videoMediaAssetId: values.videoMediaAssetId || undefined,
      durationSeconds: values.durationSeconds
        ? Number(values.durationSeconds)
        : undefined,
    };

    if (mode === "edit") {
      payload.lectureOrder = Number(values.lectureOrder || 1);
    }

    onSubmit(payload);
  };

  const handleAudioUploaded = (asset) => {
    setUploadedAudio(asset);

    setValue("audioMediaAssetId", asset.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (asset.durationSeconds) {
      setValue("durationSeconds", asset.durationSeconds, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleVideoUploaded = (asset) => {
    setUploadedVideo(asset);

    setValue("videoMediaAssetId", asset.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (asset.durationSeconds) {
      setValue("durationSeconds", asset.durationSeconds, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex h-dvh w-screen flex-col gap-0 overflow-hidden p-0 !max-w-none",
          "sm:w-[94vw]",
          "lg:w-[86vw]",
          "xl:w-[1180px]",
          "2xl:w-[1280px]",
        )}
      >
        <SheetHeader className="shrink-0 border-b bg-white px-5 py-5 text-left sm:px-7 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <SheetTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {mode === "edit" ? "Edit Lecture" : "Create Lecture"}
              </SheetTitle>

              <SheetDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Add lecture details, upload audio or video to Cloudflare R2,
                then save the lecture with the generated media asset ID.
              </SheetDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="rounded-full bg-neutral-50 px-3 py-1.5 text-xs"
              >
                {status || "DRAFT"}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs",
                  hasAnyMedia
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {hasAnyMedia ? "Media attached" : "Media missing"}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f7f5] px-5 py-5 sm:px-7 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">
              {existingLectures.length > 0 && (
                <section className="rounded-[1.75rem] border bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-base font-semibold">
                        Existing Lectures in This Course
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Review the current lectures before adding or editing
                        this lecture.
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="w-fit rounded-full px-3 py-1.5"
                    >
                      Next order: #{nextLectureOrder}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {existingLectures.map((lecture) => (
                      <div
                        key={lecture.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
                          initialData?.id === lecture.id
                            ? "border-blue-200 bg-blue-50"
                            : "bg-neutral-50",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            #{lecture.lectureOrder} — {lecture.title}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {lecture.status || "DRAFT"}
                            {lecture.isPreviewFree ? " · Free preview" : ""}
                          </p>
                        </div>

                        <div className="shrink-0 text-xs text-muted-foreground">
                          {lecture.durationSeconds
                            ? formatDuration(lecture.durationSeconds)
                            : "No duration"}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section className="rounded-[1.75rem] border bg-white shadow-sm">
                <div className="border-b px-5 py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
                      <PlayCircle className="h-5 w-5 text-neutral-700" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Lecture Details</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Enter the lecture information. Media can be uploaded in
                        the next section.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-12">
                  <div className="space-y-2 lg:col-span-8">
                    <Label>
                      Lecture Title <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      className="h-12 rounded-2xl bg-white text-base"
                      placeholder="Example: Introduction to the course"
                      disabled={submitting}
                      {...register("title", {
                        required: "Lecture title is required",
                        minLength: {
                          value: 3,
                          message:
                            "Lecture title must be at least 3 characters",
                        },
                      })}
                    />

                    {errors.title && (
                      <p className="text-xs text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Lecture Order</Label>

                    <Input
                      type="number"
                      min="1"
                      className="h-12 rounded-2xl bg-white text-base"
                      disabled={submitting || mode === "create"}
                      {...register("lectureOrder")}
                    />

                    {mode === "create" ? (
                      <p className="text-xs text-muted-foreground">
                        Order will be assigned automatically when the lecture is
                        saved.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Change carefully. Duplicate lecture orders are not
                        allowed.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-12">
                    <Label>Description</Label>

                    <Textarea
                      className="min-h-36 rounded-2xl bg-white text-base leading-7"
                      placeholder="Describe what this lecture covers..."
                      disabled={submitting}
                      {...register("description")}
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Status</Label>

                    <select
                      className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      disabled={submitting}
                      {...register("status")}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Duration Seconds</Label>

                    <Input
                      type="number"
                      min="0"
                      className="h-12 rounded-2xl bg-white text-base"
                      placeholder="Example: 300"
                      disabled={submitting}
                      {...register("durationSeconds")}
                    />

                    {durationSeconds ? (
                      <p className="text-xs text-muted-foreground">
                        Display duration: {formatDuration(durationSeconds)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Optional. It can also come from uploaded media metadata.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Access</Label>

                    <label className="flex h-12 cursor-pointer items-center gap-3 rounded-2xl border bg-neutral-50 px-4 text-sm transition hover:bg-neutral-100">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        disabled={submitting}
                        {...register("isPreviewFree")}
                      />

                      <span className="flex items-center gap-2">
                        {isPreviewFree ? (
                          <Unlock className="h-4 w-4 text-green-700" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        Free preview lecture
                      </span>
                    </label>

                    <p className="text-xs text-muted-foreground">
                      Enable only for preview/sample lessons.
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <MediaAssetSection
                  title="Audio Upload"
                  description="Upload the lecture audio file. For audio-first courses this is usually required."
                  icon={FileAudio}
                  assetId={audioMediaAssetId}
                  uploadedAsset={uploadedAudio}
                >
                  <MediaUploadBox
                    mediaKind="AUDIO"
                    label="Upload audio file"
                    description="Supported formats include MP3, WAV and AAC."
                    requireDuration
                    onUploaded={handleAudioUploaded}
                    disabled={submitting}
                  />
                </MediaAssetSection>

                <MediaAssetSection
                  title="Video Upload"
                  description="Optional video file for this lecture when the lesson has video content."
                  icon={FileVideo}
                  assetId={videoMediaAssetId}
                  uploadedAsset={uploadedVideo}
                >
                  <MediaUploadBox
                    mediaKind="VIDEO"
                    label="Upload video file"
                    description="Supported formats include MP4, WebM and MOV."
                    requireDuration
                    onUploaded={handleVideoUploaded}
                    disabled={submitting}
                  />
                </MediaAssetSection>
              </section>

              <section className="rounded-[1.75rem] border bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
                    <UploadCloud className="h-5 w-5 text-neutral-700" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Upload and assignment flow
                    </p>
                    <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
                      First upload the file. After upload, the media asset ID
                      appears below the upload section. Then click Save Lecture
                      to attach that asset to this lecture.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-5 py-4 sm:px-7 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl px-7"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-11 rounded-2xl px-7"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {mode === "edit" ? "Update Lecture" : "Save Lecture"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function MediaAssetSection({
  title,
  description,
  icon: Icon,
  assetId,
  uploadedAsset,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border bg-white shadow-sm">
      <div className="border-b px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
              <Icon className="h-5 w-5 text-neutral-700" />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs",
              assetId
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-700",
            )}
          >
            {assetId ? "Attached" : "Missing"}
          </Badge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {children}

        <div className="rounded-2xl bg-neutral-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Attached Media Asset ID</p>
          </div>

          <p className="break-all rounded-xl border bg-white p-3 text-xs text-muted-foreground">
            {assetId || "No media asset attached yet"}
          </p>

          {assetId && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready to save with lecture
            </div>
          )}

          {uploadedAsset?.originalFileName && (
            <p className="mt-3 text-xs text-muted-foreground">
              File: {uploadedAsset.originalFileName}
            </p>
          )}

          {uploadedAsset?.fileName && !uploadedAsset?.originalFileName && (
            <p className="mt-3 text-xs text-muted-foreground">
              File: {uploadedAsset.fileName}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
