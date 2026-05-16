"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CourseFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  categories = [],
  tags = [],
  onSubmit,
  submitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      shortDescription: "",
      description: "",
      categoryId: "",
      tagIds: [],
    },
  });

  const selectedTagIds = useWatch({ control, name: "tagIds" }) || [];

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        shortDescription: initialData?.shortDescription || "",
        description: initialData?.description || "",
        categoryId: initialData?.categoryId || initialData?.category?.id || "",
        tagIds:
          initialData?.tagIds ||
          initialData?.tags?.map((tag) => tag.id) ||
          [],
      });
    }
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    onSubmit({
      title: values.title?.trim(),
      subtitle: values.subtitle?.trim() || undefined,
      shortDescription: values.shortDescription?.trim() || undefined,
      description: values.description?.trim() || undefined,
      categoryId: values.categoryId || undefined,
      tagIds: Array.isArray(values.tagIds) ? values.tagIds : [],
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle className="text-xl">
            {mode === "edit" ? "Edit Course" : "Create Course"}
          </SheetTitle>
          <SheetDescription>
            Add course details, category and tags. Media and prices are managed
            after saving the course.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 px-5 py-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  placeholder="Course title"
                  disabled={submitting}
                  {...register("title", {
                    required: "Course title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters",
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Subtitle</Label>
                <Input
                  className="h-11 rounded-xl"
                  placeholder="Short course subtitle"
                  disabled={submitting}
                  {...register("subtitle")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Short Description</Label>
                <Textarea
                  className="min-h-24 rounded-xl"
                  placeholder="Short course description"
                  disabled={submitting}
                  {...register("shortDescription")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  className="min-h-36 rounded-xl"
                  placeholder="Detailed course description"
                  disabled={submitting}
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={submitting}
                  {...register("categoryId")}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <select
                  multiple
                  className="min-h-28 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={submitting}
                  {...register("tagIds")}
                >
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Hold Cmd/Ctrl to select multiple tags. Selected:{" "}
                  {selectedTagIds.length}
                </p>
              </div>
            </div>
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

              <Button
                type="submit"
                className="h-11 rounded-xl"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
