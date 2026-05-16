import { api } from "@/lib/api/axios";

export async function listTags(params = {}) {
  const res = await api.get("/api/admin/tags", { params });
  return res.data;
}

export async function getTag(tagId) {
  const res = await api.get(`/api/admin/tags/${tagId}`);
  return res.data;
}

export async function createTag(payload) {
  const res = await api.post("/api/admin/tags", payload);
  return res.data;
}

export async function updateTag(tagId, payload) {
  const res = await api.patch(`/api/admin/tags/${tagId}`, payload);
  return res.data;
}

export async function deleteTag(tagId) {
  const res = await api.delete(`/api/admin/tags/${tagId}`);
  return res.data;
}