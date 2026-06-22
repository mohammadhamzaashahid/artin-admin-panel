"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addBookCoverImage,
  createBook,
  createBookAudioFile,
  deleteBook,
  deleteBookAudioFile,
  getBook,
  getBookAudioFile,
  listBookAudioFiles,
  listBookCoverImages,
  listBooks,
  publishBook,
  removeBookCoverImage,
  reorderBookAudioFiles,
  reorderBookCoverImages,
  unpublishBook,
  updateBook,
  updateBookAudioFile,
} from "@/lib/api/books.api";
import { getApiErrorMessage } from "@/lib/utils";

// ─── Books ────────────────────────────────────────────────────────────────────

export function useBooks(params = {}) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => listBooks(params),
    select: (res) => {
      const data = res?.data || {};
      return {
        books: data.books || data.items || data.records || data.data || [],
        pagination: data.pagination || data.meta || {
          page: params.page || 1,
          limit: params.limit || 20,
          totalPages: 1,
          total: 0,
        },
      };
    },
  });
}

export function useBook(bookId) {
  return useQuery({
    queryKey: ["books", bookId],
    queryFn: () => getBook(bookId),
    enabled: Boolean(bookId),
    select: (res) => res?.data?.book,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, payload }) => updateBook(bookId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId] });
      toast.success("Book updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function usePublishBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishBook,
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", bookId] });
      toast.success("Book published successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUnpublishBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unpublishBook,
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", bookId] });
      toast.success("Book unpublished successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ─── Cover Images ─────────────────────────────────────────────────────────────

export function useBookCoverImages(bookId) {
  return useQuery({
    queryKey: ["books", bookId, "cover-images"],
    queryFn: () => listBookCoverImages(bookId),
    enabled: Boolean(bookId),
    select: (res) => {
      const data = res?.data || {};
      return data.coverImages || data.items || data.data || [];
    },
  });
}

export function useAddBookCoverImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, payload }) => addBookCoverImage(bookId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "cover-images"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId] });
      toast.success("Cover image added");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRemoveBookCoverImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, coverImageId }) => removeBookCoverImage(bookId, coverImageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "cover-images"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId] });
      toast.success("Cover image removed");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useReorderBookCoverImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, items }) => reorderBookCoverImages(bookId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "cover-images"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ─── Audio Files ──────────────────────────────────────────────────────────────

export function useBookAudioFiles(bookId, params = {}) {
  return useQuery({
    queryKey: ["books", bookId, "audio-files", params],
    queryFn: () => listBookAudioFiles(bookId, params),
    enabled: Boolean(bookId),
    select: (res) => {
      const data = res?.data || {};
      return data.audioFiles || data.items || data.data || [];
    },
  });
}

export function useBookAudioFile(bookId, audioFileId) {
  return useQuery({
    queryKey: ["books", bookId, "audio-files", audioFileId],
    queryFn: () => getBookAudioFile(bookId, audioFileId),
    enabled: Boolean(bookId) && Boolean(audioFileId),
    select: (res) => res?.data?.audioFile,
  });
}

export function useCreateBookAudioFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, payload }) => createBookAudioFile(bookId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "audio-files"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId] });
      toast.success("Audio file added");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateBookAudioFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, audioFileId, payload }) =>
      updateBookAudioFile(bookId, audioFileId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "audio-files"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId] });
      toast.success("Audio file updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteBookAudioFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, audioFileId }) => deleteBookAudioFile(bookId, audioFileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "audio-files"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId] });
      toast.success("Audio file deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useReorderBookAudioFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, audioFiles }) => reorderBookAudioFiles(bookId, audioFiles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.bookId, "audio-files"] });
      toast.success("Audio files reordered");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
