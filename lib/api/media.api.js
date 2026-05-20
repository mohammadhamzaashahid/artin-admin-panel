import axios from "axios";
import { api } from "@/lib/api/axios";

export async function createUploadUrl(payload) {
  const res = await api.post("/api/admin/media/create-upload-url", payload);
  return res.data;
}

export async function uploadFileToSignedUrl({
  uploadUrl,
  file,
  mimeType,
  onProgress,
}) {
  const res = await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": mimeType || file.type || "application/octet-stream",
    },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onProgress?.(percent);
    },
  });

  return res;
}

export async function completeUpload(payload) {
  const res = await api.post("/api/admin/media/complete-upload", payload);
  return res.data;
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

export async function uploadAdminMedia({
  file,
  mediaKind,
  mimeType,
  durationSeconds,
  onProgress,
}) {
  const finalMimeType = mimeType || file.type || "application/octet-stream";

  const createRes = await createUploadUrl({
    mediaKind,
    fileName: file.name,
    mimeType: finalMimeType,
    fileSizeBytes: file.size,
    durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
  });

  const mediaAsset = createRes?.data?.mediaAsset;
  const uploadUrl = createRes?.data?.upload?.url;

  if (!mediaAsset?.id || !uploadUrl) {
    throw new Error("Upload URL response is invalid");
  }

  await uploadFileToSignedUrl({
    uploadUrl,
    file,
    mimeType: finalMimeType,
    onProgress,
  });

  const completeRes = await completeUpload({
    mediaAssetId: mediaAsset.id,
    durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
  });

  return completeRes?.data?.mediaAsset || mediaAsset;
}
