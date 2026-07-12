import { api } from "@/lib/api/axios";

export async function listLiveClassVideos(liveClassId) {
  const res = await api.get(`/api/admin/live-classes/${liveClassId}/videos`);
  return res.data;
}

export async function createLiveClassVideo(liveClassId, payload) {
  const res = await api.post(`/api/admin/live-classes/${liveClassId}/videos`, payload);
  return res.data;
}

export async function getLiveClassVideo(videoId) {
  const res = await api.get(`/api/admin/live-classes/videos/${videoId}`);
  return res.data;
}

export async function updateLiveClassVideo(videoId, payload) {
  const res = await api.patch(`/api/admin/live-classes/videos/${videoId}`, payload);
  return res.data;
}

export async function archiveLiveClassVideo(videoId) {
  const res = await api.delete(`/api/admin/live-classes/videos/${videoId}`);
  return res.data;
}

export async function reorderLiveClassVideos(liveClassId, videos) {
  const res = await api.patch(`/api/admin/live-classes/${liveClassId}/videos/reorder`, {
    videos,
  });

  return res.data;
}
