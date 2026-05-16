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

export default function PriceFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSubmit,
  submitting = false,
}) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      priceType: "SUBSCRIPTION",
      amount: "",
      currency: "USD",
      billingInterval: "MONTH",
      isActive: true,
    },
  });

  const priceType = watch("priceType");

  useEffect(() => {
    if (open) {
      reset({
        priceType: initialData?.priceType || "SUBSCRIPTION",
        amount: initialData?.amount || "",
        currency: initialData?.currency || "USD",
        billingInterval: initialData?.billingInterval || "MONTH",
        isActive:
          initialData?.isActive === undefined ? true : Boolean(initialData.isActive),
      });
    }
  }, [open, initialData, reset]);

  const submitHandler = (values) => {
    onSubmit({
      priceType: values.priceType,
      amount: Number(values.amount),
      currency: values.currency?.trim()?.toUpperCase() || "USD",
      billingInterval:
        values.priceType === "ONE_TIME" ? null : values.billingInterval,
      isActive: Boolean(values.isActive),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle>
            {mode === "edit" ? "Edit Price" : "Create Price"}
          </SheetTitle>
          <SheetDescription>
            Configure one-time or subscription pricing for this course.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-5 px-5 py-5">
            <div className="space-y-2">
              <Label>Price Type</Label>
              <select
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
                disabled={submitting}
                {...register("priceType")}
              >
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="ONE_TIME">One-time</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="h-11 rounded-xl"
                placeholder="9.99"
                disabled={submitting}
                required
                {...register("amount")}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                className="h-11 rounded-xl uppercase"
                placeholder="USD"
                disabled={submitting}
                required
                {...register("currency")}
              />
            </div>

            {priceType !== "ONE_TIME" && (
              <div className="space-y-2">
                <Label>Billing Interval</Label>
                <select
                  className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
                  disabled={submitting}
                  {...register("billingInterval")}
                >
                  <option value="MONTH">Monthly</option>
                  <option value="YEAR">Yearly</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-3 rounded-2xl border bg-neutral-50 p-4 text-sm">
              <input type="checkbox" {...register("isActive")} />
              Active price
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
                {mode === "edit" ? "Update Price" : "Create Price"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}