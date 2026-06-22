"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  CheckCircle2,
  FileAudio,
  Loader2,
  Lock,
  Save,
  Trash2,
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
import MediaAssetPreview from "@/components/admin/MediaAssetPreview";
import MediaAssetPicker from "@/components/admin/MediaAssetPicker";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useDeleteMedia } from "@/lib/hooks/useMedia";
import { cn, formatDuration } from "@/lib/utils";

export default function BookAudioFileFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  nextAudioOrder = 1,
  onSubmit,
  onMediaDeleted,
  submitting = false,
}) {
  const [uploadedAudioAsset, setUploadedAudioAsset] = useState(/** @type {Record<string,any>|null} */ (null));
  const [mediaToDelete, setMediaToDelete] = useState(/** @type {Record<string,any>|null} */ (null));
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const deleteMediaMutation = useDeleteMedia();

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
      audioOrder: nextAudioOrder,
      isPreviewFree: false,
      status: "DRAFT",
      audioMediaAssetId: "",
      durationSeconds: "",
    },
  });

  const status = useWatch({ control, name: "status" });
  const isPreviewFree = useWatch({ control, name: "isPreviewFree" });
  const durationSeconds = useWatch({ control, name: "durationSeconds" });
  const audioMediaAssetId = useWatch({ control, name: "audioMediaAssetId" });

  const audioAsset =
    uploadedAudioAsset?.id === audioMediaAssetId
      ? uploadedAudioAsset
      : initialData?.audioMediaAsset?.id === audioMediaAssetId
        ? initialData.audioMediaAsset
        : audioMediaAssetId
          ? { id: audioMediaAssetId, mediaKind: "AUDIO" }
          : null;

  useEffect(() => {
    if (!open) return;

    const audioId =
      initialData?.audioMediaAssetId || initialData?.audioMediaAsset?.id || "";

    reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      audioOrder: initialData?.audioOrder || nextAudioOrder,
      isPreviewFree: Boolean(initialData?.isPreviewFree),
      status: initialData?.status || "DRAFT",
      audioMediaAssetId: audioId,
      durationSeconds: initialData?.durationSeconds || "",
    });

    setUploadedAudioAsset(null);
  }, [open, initialData, nextAudioOrder, reset]);

  const submitHandler = (values) => {
    const payload = {
      title: values.title?.trim(),
      description: values.description?.trim() || undefined,
      isPreviewFree: Boolean(values.isPreviewFree),
      status: values.status || "DRAFT",
      audioMediaAssetId: values.audioMediaAssetId || undefined,
      durationSeconds: values.durationSeconds
        ? Number(values.durationSeconds)
        : undefined,
    };

    if (mode === "edit") {
      payload.audioOrder = Number(values.audioOrder || 1);
    }

    onSubmit(payload);
  };

  const handleAudioUploaded = (asset) => {
    setUploadedAudioAsset(asset);
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

  const handleSelectExisting = (asset) => {
    if (!asset?.id) return;
    setUploadedAudioAsset(asset);
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
    setMediaPickerOpen(false);
  };

  const handleDeleteMedia = async () => {
    if (!mediaToDelete?.id) return;
    await deleteMediaMutation.mutateAsync(mediaToDelete.id);
    setValue("audioMediaAssetId", "", { shouldDirty: true, shouldValidate: true });
    setUploadedAudioAsset(null);
    setMediaToDelete(null);
    onMediaDeleted?.();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            "flex h-dvh w-screen flex-col gap-0 overflow-hidden p-0 !max-w-none",
            "sm:w-[92vw]",
            "lg:w-[720px]",
            "xl:w-[880px]",
          )}
        >
          <SheetHeader className="shrink-0 border-b bg-white px-4 py-4 text-left sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                  <FileAudio className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {mode === "edit" ? "Edit Audio File" : "Add Audio File"}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                    Attach audio and configure access settings.
                  </SheetDescription>
                </div>
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
                    audioMediaAssetId
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {audioMediaAssetId ? "Audio attached" : "No audio"}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f7f5] px-4 py-4 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-4">
                <section className="rounded-2xl border bg-white shadow-sm">
                  <div className="border-b px-4 py-4 sm:px-5">
                    <h3 className="text-base font-semibold">Track Details</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Title, order, status and access control.
                    </p>
                  </div>

                  <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-12">
                    <div className="space-y-2 sm:col-span-2 lg:col-span-8">
                      <Label>
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className="h-11 rounded-xl bg-white text-base"
                        placeholder="Example: Chapter 1 — Introduction"
                        disabled={submitting}
                        {...register("title", {
                          required: "Audio file title is required",
                          minLength: {
                            value: 2,
                            message: "Title must be at least 2 characters",
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
                      <Label>Order</Label>
                      <Input
                        type="number"
                        min="1"
                        className="h-11 rounded-xl bg-white text-base"
                        disabled={submitting || mode === "create"}
                        {...register("audioOrder")}
                      />
                      {mode === "create" ? (
                        <p className="text-xs text-muted-foreground">
                          Assigned automatically.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Duplicate orders not allowed.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-3 lg:col-span-12">
                      <Label>Description</Label>
                      <Textarea
                        className="min-h-24 rounded-xl bg-white text-base leading-7"
                        placeholder="Brief description of this audio track..."
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
                      <Label>Duration (seconds)</Label>
                      <Input
                        type="number"
                        min="0"
                        className="h-11 rounded-xl bg-white text-base"
                        placeholder="300"
                        disabled={submitting}
                        {...register("durationSeconds")}
                      />
                      {durationSeconds ? (
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(durationSeconds)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Auto-filled from uploaded audio.
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
                          Free preview
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Enable for sample/preview tracks.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="border-b px-4 py-4 sm:px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                          <FileAudio className="h-5 w-5 text-neutral-700" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold">Audio File</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Upload or choose an existing audio asset.
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1.5 text-xs",
                          audioMediaAssetId
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        {audioMediaAssetId ? "Attached" : "Missing"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <MediaUploadBox
                      mediaKind="AUDIO"
                      label="Upload audio file"
                      description="MP3, WAV or AAC."
                      requireDuration
                      onUploaded={handleAudioUploaded}
                      disabled={submitting}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full rounded-xl bg-white"
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      Choose existing
                    </Button>

                    {audioMediaAssetId && (
                      <div className="space-y-3 rounded-xl bg-neutral-50 p-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Attached to audio file
                        </div>

                        <MediaAssetPreview asset={audioAsset} compact showDetails />

                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full rounded-xl bg-white text-destructive hover:text-destructive"
                          onClick={() => setMediaToDelete(audioAsset)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove and delete
                        </Button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t bg-white px-4 py-3 sm:px-6">
              <div className="mx-auto flex max-w-3xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
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
                  {mode === "edit" ? "Update Track" : "Save Track"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(mediaToDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setMediaToDelete(null);
        }}
        title="Remove and delete audio?"
        description="This will detach the audio file and delete it from storage."
        confirmLabel="Remove and delete"
        confirming={deleteMediaMutation.isPending}
        onConfirm={handleDeleteMedia}
      />

      <MediaAssetPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        mediaKind="AUDIO"
        title="Select audio asset"
        description="Reuse an uploaded audio asset. Save the track to persist the selection."
        selectedAssetId={audioMediaAssetId}
        onSelect={handleSelectExisting}
      />
    </>
  );
}
