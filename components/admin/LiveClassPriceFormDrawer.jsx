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

export default function LiveClassPriceFormDrawer({
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
      amount: "",
      currency: "USD",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: initialData?.amount || "",
        currency: initialData?.currency || "USD",
        isActive: initialData?.isActive === undefined ? true : Boolean(initialData.isActive),
      });
    }
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    onSubmit({
      amount: Number(values.amount),
      currency: values.currency?.trim()?.toUpperCase() || "USD",
      isActive: Boolean(values.isActive),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle>{mode === "edit" ? "Edit Price" : "Add Price"}</SheetTitle>
          <SheetDescription>
            Live class prices are one-time payments. Learners purchase access once and
            keep it.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-5 px-5 py-5">
            <div className="space-y-2">
              <Label>
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                className="h-11 rounded-xl"
                placeholder="49.99"
                disabled={submitting}
                required
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 0.01, message: "Must be greater than 0" },
                })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
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

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-neutral-50 p-4 text-sm">
              <input type="checkbox" {...register("isActive")} className="h-4 w-4" />
              Active — visible to learners during checkout
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
                {mode === "edit" ? "Update Price" : "Add Price"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
