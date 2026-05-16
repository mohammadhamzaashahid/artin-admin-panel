import { api } from "@/lib/api/axios";

export async function loginAdmin(payload) {
  const res = await api.post("/api/auth/login", payload);
  return res.data;
}

export async function getMe() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

export async function changePassword(payload) {
  const res = await api.post("/api/auth/change-password", payload);
  return res.data;
}