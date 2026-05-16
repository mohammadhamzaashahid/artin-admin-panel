import { api } from "@/lib/api/axios";

export async function listCourses(params = {}) {
  const res = await api.get("/api/admin/courses", { params });
  return res.data;
}

export async function getCourse(courseId) {
  const res = await api.get(`/api/admin/courses/${courseId}`);
  return res.data;
}

export async function createCourse(payload) {
  const res = await api.post("/api/admin/courses", payload);
  return res.data;
}

export async function updateCourse(courseId, payload) {
  const res = await api.patch(`/api/admin/courses/${courseId}`, payload);
  return res.data;
}

export async function archiveCourse(courseId) {
  const res = await api.delete(`/api/admin/courses/${courseId}`);
  return res.data;
}

export async function publishCourse(courseId) {
  const res = await api.patch(`/api/admin/courses/${courseId}/publish`);
  return res.data;
}

export async function createCoursePrice(courseId, payload) {
  const res = await api.post(`/api/admin/courses/${courseId}/prices`, payload);
  return res.data;
}

export async function listCoursePrices(courseId) {
  const res = await api.get(`/api/admin/courses/${courseId}/prices`);
  return res.data;
}

export async function updateCoursePrice(priceId, payload) {
  const res = await api.patch(`/api/admin/courses/prices/${priceId}`, payload);
  return res.data;
}

export async function deleteCoursePrice(priceId) {
  const res = await api.delete(`/api/admin/courses/prices/${priceId}`);
  return res.data;
}