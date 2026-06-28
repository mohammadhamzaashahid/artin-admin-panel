import { api } from "@/lib/api/axios";

export async function listLiveClasses(params = {}) {
  const res = await api.get("/api/admin/live-classes", { params });
  return res.data;
}

export async function getLiveClass(liveClassId) {
  const res = await api.get(`/api/admin/live-classes/${liveClassId}`);
  return res.data;
}

export async function createLiveClass(payload) {
  const res = await api.post("/api/admin/live-classes", payload);
  return res.data;
}

export async function updateLiveClass(liveClassId, payload) {
  const res = await api.patch(`/api/admin/live-classes/${liveClassId}`, payload);
  return res.data;
}

export async function archiveLiveClass(liveClassId) {
  const res = await api.delete(`/api/admin/live-classes/${liveClassId}`);
  return res.data;
}

export async function publishLiveClass(liveClassId) {
  const res = await api.patch(`/api/admin/live-classes/${liveClassId}/publish`);
  return res.data;
}

export async function unpublishLiveClass(liveClassId) {
  const res = await api.patch(`/api/admin/live-classes/${liveClassId}/unpublish`);
  return res.data;
}

export async function listLiveClassPrices(liveClassId) {
  const res = await api.get(`/api/admin/live-classes/${liveClassId}/prices`);
  return res.data;
}

export async function createLiveClassPrice(liveClassId, payload) {
  const res = await api.post(`/api/admin/live-classes/${liveClassId}/prices`, payload);
  return res.data;
}

export async function updateLiveClassPrice(priceId, payload) {
  const res = await api.patch(`/api/admin/live-classes/prices/${priceId}`, payload);
  return res.data;
}

export async function deleteLiveClassPrice(priceId) {
  const res = await api.delete(`/api/admin/live-classes/prices/${priceId}`);
  return res.data;
}
