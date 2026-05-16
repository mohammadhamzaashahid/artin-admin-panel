import { api } from "@/lib/api/axios";

export async function listCourseLectures(courseId) {
  const res = await api.get(`/api/admin/courses/${courseId}/lectures`);
  return res.data;
}

export async function createLecture(courseId, payload) {
  const res = await api.post(`/api/admin/courses/${courseId}/lectures`, payload);
  return res.data;
}

export async function getLecture(lectureId) {
  const res = await api.get(`/api/admin/lectures/${lectureId}`);
  return res.data;
}

export async function updateLecture(lectureId, payload) {
  const res = await api.patch(`/api/admin/lectures/${lectureId}`, payload);
  return res.data;
}

export async function archiveLecture(lectureId) {
  const res = await api.delete(`/api/admin/lectures/${lectureId}`);
  return res.data;
}

export async function reorderLectures(courseId, lectures) {
  const res = await api.patch(`/api/admin/courses/${courseId}/lectures/reorder`, {
    lectures,
  });

  return res.data;
}