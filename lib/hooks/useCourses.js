"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCourse,
  createCourse,
  createCourseBatch,
  createCoursePrice,
  deleteCourseBatch,
  deleteCoursePrice,
  getCourse,
  listCourseBatches,
  listCoursePrices,
  listCourses,
  publishCourse,
  updateCourse,
  updateCourseBatch,
  updateCoursePrice,
} from "@/lib/api/courses.api";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useCourses(params = {}) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => listCourses(params),
    select: (res) => {
      const data = res?.data || {};

      return {
        courses:
          data.courses ||
          data.items ||
          data.records ||
          data.data ||
          [],
        pagination:
          data.pagination ||
          data.meta ||
          {
            page: params.page || 1,
            limit: params.limit || 20,
            totalPages: 1,
            total: 0,
          },
      };
    },
  });
}

export function useCourse(courseId) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => getCourse(courseId),
    enabled: Boolean(courseId),
    select: (res) => res?.data?.course,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }) => updateCourse(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted permanently");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishCourse,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
      toast.success("Course published successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCoursePrices(courseId) {
  return useQuery({
    queryKey: ["courses", courseId, "prices"],
    queryFn: () => listCoursePrices(courseId),
    enabled: Boolean(courseId),
    select: (res) => {
      const data = res?.data || {};
      return data.prices || data.coursePrices || data.items || data.data || [];
    },
  });
}

export function useCreateCoursePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }) => createCoursePrice(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId, "prices"],
      });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] });
      toast.success("Price created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCoursePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceId, payload, courseId: _courseId }) =>
      updateCoursePrice(priceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId, "prices"],
      });
      toast.success("Price updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCoursePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceId }) => deleteCoursePrice(priceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId, "prices"],
      });
      toast.success("Price deactivated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCourseBatches(courseId) {
  return useQuery({
    queryKey: ["courses", courseId, "batches"],
    queryFn: () => listCourseBatches(courseId),
    enabled: Boolean(courseId),
    select: (res) => {
      const data = res?.data || {};
      return data.batches || data.items || data.data || [];
    },
  });
}

export function useCreateCourseBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }) => createCourseBatch(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId, "batches"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] });
      toast.success("Batch created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCourseBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, payload }) => updateCourseBatch(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId, "batches"] });
      toast.success("Batch updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCourseBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId }) => deleteCourseBatch(batchId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId, "batches"] });
      toast.success("Batch deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}