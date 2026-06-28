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
import { Separator } from "@/components/ui/separator";

function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().slice(0, 16);
}

function toISOString(datetimeLocalValue) {
  if (!datetimeLocalValue) return "";
  return new Date(datetimeLocalValue).toISOString();
}

export default function LiveClassFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  courses = [],
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
      slug: "",
      description: "",
      startDate: "",
      endDate: "",
      timeDuration: "",
      joiningLink: "",
      courseId: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        startDate: toDatetimeLocalValue(initialData?.startDate),
        endDate: toDatetimeLocalValue(initialData?.endDate),
        timeDuration: initialData?.timeDuration || "",
        joiningLink: initialData?.joiningLink || "",
        courseId: initialData?.courseId || initialData?.course?.id || "",
      });
    }
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    onSubmit({
      title: values.title.trim(),
      slug: values.slug?.trim() || undefined,
      description: values.description?.trim() || undefined,
      startDate: toISOString(values.startDate),
      endDate: toISOString(values.endDate),
      timeDuration: Number(values.timeDuration),
      joiningLink: values.joiningLink?.trim() || undefined,
      courseId: values.courseId || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:w-[70vw]! sm:max-w-5xl!"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold">
            {mode === "edit" ? "Edit Live Class" : "Create Live Class"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Fill in the class details below. Banner and materials are set up after saving."
              : "Update the class details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              {/* ── Basic info ── */}
              <section className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Basic Information
                </p>

                <div className="space-y-2">
                  <Label>
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    className="h-12 rounded-xl text-base"
                    placeholder="e.g. Advanced Portrait Painting"
                    disabled={submitting}
                    {...register("title", {
                      required: "Class title is required",
                      minLength: { value: 2, message: "Title must be at least 2 characters" },
                    })}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Slug{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      — auto-generated if left empty
                    </span>
                  </Label>
                  <Input
                    className="h-11 rounded-xl font-mono text-sm"
                    placeholder="advanced-portrait-painting"
                    disabled={submitting}
                    {...register("slug")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    className="min-h-32 rounded-xl text-sm leading-relaxed"
                    placeholder="What will participants learn? What level is this for? What should they prepare?"
                    disabled={submitting}
                    {...register("description")}
                  />
                </div>
              </section>

              <Separator />

              {/* ── Schedule ── */}
              <section className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Schedule
                </p>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>
                      Start Date &amp; Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      className="h-12 w-full rounded-xl text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
                      disabled={submitting}
                      required
                      {...register("startDate", { required: "Start date is required" })}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-destructive">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      End Date &amp; Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      className="h-12 w-full rounded-xl text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
                      disabled={submitting}
                      required
                      {...register("endDate", { required: "End date is required" })}
                    />
                    {errors.endDate && (
                      <p className="text-xs text-destructive">{errors.endDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Duration (minutes) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      className="h-12 rounded-xl"
                      placeholder="e.g. 90"
                      disabled={submitting}
                      {...register("timeDuration", {
                        required: "Duration is required",
                        min: { value: 1, message: "Must be at least 1 minute" },
                      })}
                    />
                    {errors.timeDuration && (
                      <p className="text-xs text-destructive">{errors.timeDuration.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Session length shown on the class detail page.
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* ── Access & Linking ── */}
              <section className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Access &amp; Linking
                </p>

                <div className="space-y-2">
                  <Label>
                    Joining Link{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      — optional, can be added later
                    </span>
                  </Label>
                  <Input
                    type="url"
                    className="h-11 rounded-xl"
                    placeholder="https://zoom.us/j/..."
                    disabled={submitting}
                    {...register("joiningLink")}
                  />
                  <p className="text-xs text-muted-foreground">
                    This link is only revealed to learners after a successful purchase.
                  </p>
                </div>

                {courses.length > 0 && (
                  <div className="space-y-2">
                    <Label>
                      Link to Course{" "}
                      <span className="text-muted-foreground text-xs font-normal">
                        — optional
                      </span>
                    </Label>
                    <select
                      className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      disabled={submitting}
                      {...register("courseId")}
                    >
                      <option value="">Standalone — not linked to a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Linking groups this class under the selected course on the public listing.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-6"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-11 rounded-xl px-8"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Update Class" : "Create Class"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
