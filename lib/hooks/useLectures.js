"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveLecture,
  createLecture,
  getLecture,
  listCourseLectures,
  reorderLectures,
  updateLecture,
} from "@/lib/api/lectures.api";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useCourseLectures(courseId) {
  return useQuery({
    queryKey: ["courses", courseId, "lectures"],
    queryFn: () => listCourseLectures(courseId),
    enabled: Boolean(courseId),
    select: (res) => {
      const data = res?.data || {};
      return data.lectures || data.items || data.records || data.data || [];
    },
  });
}

export function useLecture(lectureId) {
  return useQuery({
    queryKey: ["lectures", lectureId],
    queryFn: () => getLecture(lectureId),
    enabled: Boolean(lectureId),
    select: (res) => res?.data?.lecture,
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }) => createLecture(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId, "lectures"],
      });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] });
      toast.success("Lecture created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lectureId, payload }) => updateLecture(lectureId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lectures", variables.lectureId] });

      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ["courses", variables.courseId, "lectures"],
        });
      }

      toast.success("Lecture updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useArchiveLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lectureId }) => archiveLecture(lectureId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId, "lectures"],
      });
      toast.success("Lecture archived successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useReorderLectures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lectures }) => reorderLectures(courseId, lectures),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId, "lectures"],
      });
      toast.success("Lectures reordered successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}