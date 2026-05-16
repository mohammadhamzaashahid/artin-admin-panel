import { api } from "@/lib/api/axios";

export async function listUsers(params = {}) {
  const res = await api.get("/api/admin/users", { params });
  return res.data;
}

export async function getUser(userId) {
  const res = await api.get(`/api/admin/users/${userId}`);
  return res.data;
}

export async function createUser(payload) {
  const res = await api.post("/api/admin/users", payload);
  return res.data;
}

export async function updateUser(userId, payload) {
  const res = await api.patch(`/api/admin/users/${userId}`, payload);
  return res.data;
}

export async function resetUserPassword(userId, payload) {
  const res = await api.patch(`/api/admin/users/${userId}/reset-password`, payload);
  return res.data;
}

export async function deactivateUser(userId) {
  const res = await api.delete(`/api/admin/users/${userId}`);
  return res.data;
}