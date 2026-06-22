"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, Loader2, Save } from "lucide-react";

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

export default function BookFormDrawer({
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
      slug: "",
      description: "",
      price: "",
      currency: "USD",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price ?? "",
      currency: initialData?.currency || "AED",
    });
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    const payload = {
      title: values.title?.trim(),
      description: values.description?.trim() || undefined,
      price: values.price !== "" ? Number(values.price) : 0,
      currency: values.currency?.trim() || "AED",
    };

    if (values.slug?.trim()) {
      payload.slug = values.slug.trim();
    }

    onSubmit(payload);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-dvh w-screen flex-col gap-0 overflow-hidden p-0 !max-w-none sm:w-[92vw] lg:w-[640px] xl:w-[720px]"
      >
        <SheetHeader className="shrink-0 border-b bg-white px-4 py-4 text-left sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
              <BookOpen className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <SheetTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                {mode === "edit" ? "Edit Book" : "Create Book"}
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                {mode === "edit"
                  ? "Update book details, slug and pricing."
                  : "Fill in the details to create a new book."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f7f5] px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-4">
              <section className="rounded-2xl border bg-white shadow-sm">
                <div className="border-b px-4 py-4 sm:px-5">
                  <h3 className="text-base font-semibold">Book Details</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Title, slug, description and pricing.
                  </p>
                </div>

                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-12">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-12">
                    <Label>
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="h-11 rounded-xl bg-white text-base"
                      placeholder="Example: The Art of Thinking Clearly"
                      disabled={submitting}
                      {...register("title", {
                        required: "Book title is required",
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

                  <div className="space-y-2 sm:col-span-2 lg:col-span-12">
                    <Label>Slug</Label>
                    <Input
                      className="h-11 rounded-xl bg-white text-base font-mono"
                      placeholder="auto-generated-from-title"
                      disabled={submitting}
                      {...register("slug", {
                        pattern: {
                          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                          message: "Slug must be lowercase, hyphen-separated",
                        },
                      })}
                    />
                    {errors.slug ? (
                      <p className="text-xs text-destructive">
                        {errors.slug.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Leave blank to auto-generate from title.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-8">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-11 rounded-xl bg-white text-base"
                      placeholder="0.00"
                      disabled={submitting}
                      {...register("price", {
                        min: {
                          value: 0,
                          message: "Price must be 0 or greater",
                        },
                      })}
                    />
                    {errors.price ? (
                      <p className="text-xs text-destructive">
                        {errors.price.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Set 0 for free.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label>Currency</Label>
                    <select
                      className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      disabled={submitting}
                      {...register("currency")}
                    >
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-12">
                    <Label>Description</Label>
                    <Textarea
                      className="min-h-36 rounded-xl bg-white text-base leading-7"
                      placeholder="Describe what this book is about..."
                      disabled={submitting}
                      {...register("description")}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-2xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
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
                {mode === "edit" ? "Update Book" : "Create Book"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
