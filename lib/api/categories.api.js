import { api } from "@/lib/api/axios";

export async function listCategories(params = {}) {
  const res = await api.get("/api/admin/categories", { params });
  return res.data;
}

export async function getCategory(categoryId) {
  const res = await api.get(`/api/admin/categories/${categoryId}`);
  return res.data;
}

export async function createCategory(payload) {
  const res = await api.post("/api/admin/categories", payload);
  return res.data;
}

export async function updateCategory(categoryId, payload) {
  const res = await api.patch(`/api/admin/categories/${categoryId}`, payload);
  return res.data;
}

export async function deleteCategory(categoryId) {
  const res = await api.delete(`/api/admin/categories/${categoryId}`);
  return res.data;
}