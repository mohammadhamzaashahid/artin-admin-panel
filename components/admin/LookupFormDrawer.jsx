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

export default function LookupFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  title,
  description,
  initialData,
  onSubmit,
  submitting = false,
  entityLabel = "Record",
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || "",
      });
    }
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    onSubmit({
      name: values.name?.trim(),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle className="text-xl">
            {title || (mode === "edit" ? `Edit ${entityLabel}` : `New ${entityLabel}`)}
          </SheetTitle>
          <SheetDescription>
            {description ||
              `Enter the ${entityLabel.toLowerCase()} name. Slug will be handled by backend.`}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 px-5 py-5">
            <div className="space-y-2">
              <Label>
                Name <span className="text-destructive">*</span>
              </Label>

              <Input
                className="h-11 rounded-xl"
                placeholder={`Enter ${entityLabel.toLowerCase()} name`}
                disabled={submitting}
                {...register("name", {
                  required: `${entityLabel} name is required`,
                  minLength: {
                    value: 2,
                    message: `${entityLabel} name must be at least 2 characters`,
                  },
                  maxLength: {
                    value: 100,
                    message: `${entityLabel} name must be less than 100 characters`,
                  },
                })}
              />

              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="rounded-2xl border bg-neutral-50 p-4">
              <p className="text-sm font-medium">Operational note</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This lookup will be used while creating or updating courses.
                Keep names clean and meaningful for admin users.
              </p>
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
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "edit" ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}