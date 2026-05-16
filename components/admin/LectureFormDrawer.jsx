"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  CheckCircle2,
  FileAudio,
  FileVideo,
  Loader2,
  Lock,
  PlayCircle,
  Save,
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
  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const status = useWatch({ control, name: "status" });
  const isPreviewFree = useWatch({ control, name: "isPreviewFree" });
  const durationSeconds = useWatch({ control, name: "durationSeconds" });
  const audioMediaAssetId = useWatch({ control, name: "audioMediaAssetId" });
  const videoMediaAssetId = useWatch({ control, name: "videoMediaAssetId" });

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
          "sm:w-[92vw]",
          "lg:w-[760px]",
          "xl:w-[920px]",
        )}
      >
        <SheetHeader className="shrink-0 border-b bg-white px-4 py-4 text-left sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <SheetTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                {mode === "edit" ? "Edit Lecture" : "Create Lecture"}
              </SheetTitle>

              <SheetDescription className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Add details and attach audio or video.
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
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f7f5] px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-5xl space-y-4">
              {existingLectures.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{existingLectures.length} lectures in course</span>
                  <span aria-hidden="true">·</span>
                  <span>Next order #{nextLectureOrder}</span>
                </div>
              )}

              <section className="rounded-2xl border bg-white shadow-sm">
                <div className="border-b px-4 py-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                      <PlayCircle className="h-5 w-5 text-neutral-700" />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold">Lecture Details</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Title, order, status and access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-12">
                  <div className="space-y-2 lg:col-span-8">
                    <Label>
                      Lecture Title <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      className="h-11 rounded-xl bg-white text-base"
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
                      className="h-11 rounded-xl bg-white text-base"
                      disabled={submitting || mode === "create"}
                      {...register("lectureOrder")}
                    />

                    {mode === "create" ? (
                      <p className="text-xs text-muted-foreground">
                        Assigned automatically when saved.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Duplicate orders are not allowed.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-12">
                    <Label>Description</Label>

                    <Textarea
                      className="min-h-28 rounded-xl bg-white text-base leading-7"
                      placeholder="Describe what this lecture covers..."
                      disabled={submitting}
                      {...register("description")}
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Status</Label>

                    <select
                      className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
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
                      className="h-11 rounded-xl bg-white text-base"
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
                        Optional; media metadata can fill this.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Access</Label>

                    <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border bg-neutral-50 px-3 text-sm transition hover:bg-neutral-100">
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

              <section className="grid gap-4 xl:grid-cols-2">
                <MediaAssetSection
                  title="Audio Upload"
                  description="Attach audio for this lecture."
                  icon={FileAudio}
                  assetId={audioMediaAssetId}
                >
                  <MediaUploadBox
                    mediaKind="AUDIO"
                    label="Upload audio file"
                    description="MP3, WAV or AAC."
                    requireDuration
                    onUploaded={handleAudioUploaded}
                    disabled={submitting}
                  />
                </MediaAssetSection>

                <MediaAssetSection
                  title="Video Upload"
                  description="Attach video when needed."
                  icon={FileVideo}
                  assetId={videoMediaAssetId}
                >
                  <MediaUploadBox
                    mediaKind="VIDEO"
                    label="Upload video file"
                    description="MP4, WebM or MOV."
                    requireDuration
                    onUploaded={handleVideoUploaded}
                    disabled={submitting}
                  />
                </MediaAssetSection>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl px-6"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-10 rounded-xl px-6"
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
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
              <Icon className="h-5 w-5 text-neutral-700" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
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

      <div className="space-y-4 p-4 sm:p-5">
        {children}

        {assetId && (
          <div className="rounded-xl bg-neutral-50 p-3 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Attached to lecture
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
