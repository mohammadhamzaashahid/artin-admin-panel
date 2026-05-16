"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveCourse,
  createCourse,
  createCoursePrice,
  deleteCoursePrice,
  getCourse,
  listCoursePrices,
  listCourses,
  publishCourse,
  updateCourse,
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

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course archived successfully");
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
    mutationFn: ({ priceId, payload, courseId }) =>
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