"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  // Slice to "YYYY-MM-DDTHH:MM" for datetime-local input
  return new Date(isoString).toISOString().slice(0, 16);
}

function toISOString(datetimeLocalValue) {
  if (!datetimeLocalValue) return "";
  return new Date(datetimeLocalValue).toISOString();
}

export default function BatchFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSubmit,
  submitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
      numberOfSessions: "",
      fee: "",
      currency: "USD",
      description: "",
      status: "UPCOMING",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        startDate: toDatetimeLocalValue(initialData?.startDate),
        endDate: toDatetimeLocalValue(initialData?.endDate),
        numberOfSessions: initialData?.numberOfSessions || "",
        fee: initialData?.fee || "",
        currency: initialData?.currency || "USD",
        description: initialData?.description || "",
        status: initialData?.status || "UPCOMING",
        isActive: initialData?.isActive === undefined ? true : Boolean(initialData.isActive),
      });
    }
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    onSubmit({
      title: values.title?.trim() || null,
      startDate: toISOString(values.startDate),
      endDate: toISOString(values.endDate),
      numberOfSessions: Number(values.numberOfSessions),
      fee: Number(values.fee),
      currency: values.currency?.trim()?.toUpperCase() || "USD",
      description: values.description?.trim() || null,
      status: values.status,
      isActive: Boolean(values.isActive),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle>{mode === "edit" ? "Edit Batch" : "Add Batch"}</SheetTitle>
          <SheetDescription>
            Schedule the next batch of classes for this course.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-5 px-5 py-5">
            <div className="space-y-2">
              <Label>Batch Title <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                className="h-11 rounded-xl"
                placeholder="e.g. Spring Batch 2025"
                disabled={submitting}
                {...register("title")}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  className="h-12 w-full rounded-xl [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70"
                  disabled={submitting}
                  required
                  {...register("startDate", { required: "Start date is required" })}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>End Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  className="h-12 w-full rounded-xl [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70"
                  disabled={submitting}
                  required
                  {...register("endDate", { required: "End date is required" })}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Sessions <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  className="h-11 rounded-xl"
                  placeholder="e.g. 12"
                  disabled={submitting}
                  required
                  {...register("numberOfSessions", { required: "Required", min: { value: 1, message: "Must be at least 1" } })}
                />
                {errors.numberOfSessions && (
                  <p className="text-xs text-destructive">{errors.numberOfSessions.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fee <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-11 rounded-xl"
                  placeholder="0.00"
                  disabled={submitting}
                  required
                  {...register("fee", { required: "Required", min: { value: 0, message: "Cannot be negative" } })}
                />
                {errors.fee && (
                  <p className="text-xs text-destructive">{errors.fee.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                className="h-11 rounded-xl uppercase"
                placeholder="USD"
                maxLength={3}
                disabled={submitting}
                {...register("currency")}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
                disabled={submitting}
                {...register("status")}
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                className="min-h-[100px] rounded-xl"
                placeholder="Details about this batch — schedule, prerequisites, what's included…"
                disabled={submitting}
                {...register("description")}
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border bg-neutral-50 p-4 text-sm">
              <input type="checkbox" {...register("isActive")} />
              Active (visible to learners)
            </label>
          </div>

          <div className="sticky bottom-0 border-t bg-white px-5 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit" className="h-11 rounded-xl" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Update Batch" : "Add Batch"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
