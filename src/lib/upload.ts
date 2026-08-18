import { api, type ApiSuccess } from "@/lib/api";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export type UploadKind = "image" | "resume";

export function validateFile(file: File, kind: UploadKind): string | null {
  const isImage = kind === "image";
  const allowed = isImage ? IMAGE_TYPES : RESUME_TYPES;
  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_RESUME_BYTES;

  if (!allowed.includes(file.type)) {
    return isImage ? "Use a JPG, PNG or WEBP image" : "Use a PDF or DOC/DOCX file";
  }
  if (file.size > maxBytes) {
    return `File must be under ${Math.round(maxBytes / (1024 * 1024))} MB`;
  }
  return null;
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const { data } = await api.post<ApiSuccess<{ url: string; publicId: string }>>(
    "/uploads",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data.url;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
