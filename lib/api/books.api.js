import { api } from "@/lib/api/axios";

// ─── Books ────────────────────────────────────────────────────────────────────

export async function listBooks(params = {}) {
  const res = await api.get("/api/admin/books", { params });
  return res.data;
}

export async function getBook(bookId) {
  const res = await api.get(`/api/admin/books/${bookId}`);
  return res.data;
}

export async function createBook(payload) {
  const res = await api.post("/api/admin/books", payload);
  return res.data;
}

export async function updateBook(bookId, payload) {
  const res = await api.patch(`/api/admin/books/${bookId}`, payload);
  return res.data;
}

export async function publishBook(bookId) {
  const res = await api.post(`/api/admin/books/${bookId}/publish`);
  return res.data;
}

export async function unpublishBook(bookId) {
  const res = await api.post(`/api/admin/books/${bookId}/unpublish`);
  return res.data;
}

export async function deleteBook(bookId) {
  const res = await api.delete(`/api/admin/books/${bookId}`);
  return res.data;
}

// ─── Cover Images ─────────────────────────────────────────────────────────────

export async function listBookCoverImages(bookId) {
  const res = await api.get(`/api/admin/books/${bookId}/cover-images`);
  return res.data;
}

export async function addBookCoverImage(bookId, payload) {
  const res = await api.post(`/api/admin/books/${bookId}/cover-images`, payload);
  return res.data;
}

export async function removeBookCoverImage(bookId, coverImageId) {
  const res = await api.delete(`/api/admin/books/${bookId}/cover-images/${coverImageId}`);
  return res.data;
}

export async function reorderBookCoverImages(bookId, items) {
  const res = await api.post(`/api/admin/books/${bookId}/cover-images/reorder`, { items });
  return res.data;
}

// ─── Audio Files ──────────────────────────────────────────────────────────────

export async function listBookAudioFiles(bookId, params = {}) {
  const res = await api.get(`/api/admin/books/${bookId}/audio-files`, { params });
  return res.data;
}

export async function getBookAudioFile(bookId, audioFileId) {
  const res = await api.get(`/api/admin/books/${bookId}/audio-files/${audioFileId}`);
  return res.data;
}

export async function createBookAudioFile(bookId, payload) {
  const res = await api.post(`/api/admin/books/${bookId}/audio-files`, payload);
  return res.data;
}

export async function updateBookAudioFile(bookId, audioFileId, payload) {
  const res = await api.patch(`/api/admin/books/${bookId}/audio-files/${audioFileId}`, payload);
  return res.data;
}

export async function deleteBookAudioFile(bookId, audioFileId) {
  const res = await api.delete(`/api/admin/books/${bookId}/audio-files/${audioFileId}`);
  return res.data;
}

export async function reorderBookAudioFiles(bookId, audioFiles) {
  const res = await api.post(`/api/admin/books/${bookId}/audio-files/reorder`, { audioFiles });
  return res.data;
}
