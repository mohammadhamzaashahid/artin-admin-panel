import { api } from "@/lib/api/axios";

export async function uploadMedia({ file, mediaKind, durationSeconds, onProgress }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mediaKind", mediaKind);

  if (durationSeconds != null) {
    formData.append("durationSeconds", String(durationSeconds));
  }

  const res = await api.post("/api/admin/media/upload", formData, {
    // Let axios set the correct multipart/form-data boundary automatically
    headers: { "Content-Type": "multipart/form-data" },
    // No hard timeout — large video uploads can take many minutes
    timeout: 0,
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onProgress?.(percent);
    },
  });

  return res.data;
}

export async function uploadAdminMedia({
  file,
  mediaKind,
  mimeType: _mimeType, // kept for API compatibility, server derives it from the file
  durationSeconds,
  onProgress,
}) {
  const res = await uploadMedia({ file, mediaKind, durationSeconds, onProgress });
  return res?.data?.mediaAsset;
}

export async function listMedia(params = {}) {
  const res = await api.get("/api/admin/media", { params });
  return res.data;
}

export async function getMedia(mediaAssetId) {
  const res = await api.get(`/api/admin/media/${mediaAssetId}`);
  return res.data;
}

export async function getMediaPreviewUrl(mediaAssetId) {
  const res = await api.get(`/api/admin/media/${mediaAssetId}/preview-url`);
  return res.data;
}

export async function deleteMedia(mediaAssetId) {
  const res = await api.delete(`/api/admin/media/${mediaAssetId}`);
  return res.data;
}
