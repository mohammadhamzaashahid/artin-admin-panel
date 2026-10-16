import { api } from "@/lib/api/axios";

// When the OS has no MIME type registered for an extension the browser reports
// File.type as "" and sends application/octet-stream. Re-wrap the file (the
// bytes are referenced, not copied) so the request carries the right type.
function withMimeType(file, mimeType) {
  const hasUsefulType = file.type && file.type !== "application/octet-stream";
  if (hasUsefulType || !mimeType || mimeType === "application/octet-stream") {
    return file;
  }

  return new File([file], file.name, {
    type: mimeType,
    lastModified: file.lastModified,
  });
}

export async function uploadMedia({ file, mediaKind, mimeType, durationSeconds, onProgress }) {
  const formData = new FormData();
  formData.append("file", withMimeType(file, mimeType));
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
  mimeType,
  durationSeconds,
  onProgress,
}) {
  const res = await uploadMedia({ file, mediaKind, mimeType, durationSeconds, onProgress });
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
