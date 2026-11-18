import { apiClient } from "./apiClient";
import { R2_PUBLIC_URL } from "@/lib/config";

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 50;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export function validateMediaFileSize(file: File): string | null {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
  if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE_BYTES) {
    return `"${file.name}" is ${sizeMb}MB. Images must be ${MAX_IMAGE_SIZE_MB}MB or less.`;
  }
  if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE_BYTES) {
    return `"${file.name}" is ${sizeMb}MB. Videos must be ${MAX_VIDEO_SIZE_MB}MB or less.`;
  }
  return null;
}

export type MediaPrefix =
  | "proofs"
  | "avatars"
  | "covers"
  | "cvs"
  | "badge-applications";

interface PresignResponse {
  url: string;
  key: string;
  uploadHeaders?: Record<string, string>;
}

export const mediaService = {
  /**
   * Step 1: Request a presigned upload URL from the backend.
   */
  async presign(
    filename: string,
    contentType: string,
    prefix: MediaPrefix,
    fileSize?: number,
  ): Promise<PresignResponse> {
    return apiClient.post<PresignResponse>(
      "/media/presign",
      {
        filename,
        contentType,
        prefix,
        ...(fileSize !== undefined ? { fileSize } : {}),
      },
      { quiet: true },
    );
  },

  /**
   * Step 2: Upload the file directly to R2 using the presigned URL.
   * Uses uploadHeaders from the presign response if provided, otherwise falls back to file.type.
   * Bypasses apiClient — no auth header needed for direct R2 uploads.
   */
  async uploadToR2(
    presignedUrl: string,
    file: File,
    uploadHeaders?: Record<string, string>
  ): Promise<void> {
    const headers = uploadHeaders ?? { "Content-Type": file.type };
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers,
      body: file,
    });

    if (!response.ok) {
      throw new Error(`R2 upload failed with status ${response.status}`);
    }
  },

  /**
   * Step 2 (with progress): Upload the file directly to R2 via XMLHttpRequest
   * so the UI can display live upload percentage progress.
   */
  uploadToR2WithProgress(
    presignedUrl: string,
    file: File,
    uploadHeaders?: Record<string, string>,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl, true);

      const headers = uploadHeaders ?? { "Content-Type": file.type };
      Object.entries(headers).forEach(([k, v]) => {
        xhr.setRequestHeader(k, v);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.min(
            99,
            Math.max(1, Math.round((event.loaded / event.total) * 100))
          );
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve();
        } else {
          reject(new Error(`R2 upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error while uploading file"));
      };

      xhr.send(file);
    });
  },

  /**
   * Build the public CDN URL from the R2 object key.
   */
  getPublicUrl(key: string): string {
    const base = R2_PUBLIC_URL.replace(/\/$/, "");
    return `${base}/${key}`;
  },

  /**
   * Convenience: run all 3 steps and return the final public URL.
   */
  async upload(file: File, prefix: MediaPrefix): Promise<string> {
    const sizeError = validateMediaFileSize(file);
    if (sizeError) {
      throw new Error(sizeError);
    }

    // Step 1: Presign
    const {
      url: presignedUrl,
      key,
      uploadHeaders,
    } = await mediaService.presign(file.name, file.type, prefix, file.size);

    // Step 2: Upload directly to R2 (using headers from backend if provided)
    await mediaService.uploadToR2(presignedUrl, file, uploadHeaders);

    // Return the public CDN URL
    return mediaService.getPublicUrl(key);
  },

  /**
   * Upload with live progress callback (0..100).
   */
  async uploadWithProgress(
    file: File,
    prefix: MediaPrefix,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const sizeError = validateMediaFileSize(file);
    if (sizeError) {
      throw new Error(sizeError);
    }

    onProgress?.(5);
    const {
      url: presignedUrl,
      key,
      uploadHeaders,
    } = await mediaService.presign(file.name, file.type, prefix, file.size);

    await mediaService.uploadToR2WithProgress(
      presignedUrl,
      file,
      uploadHeaders,
      onProgress
    );

    return mediaService.getPublicUrl(key);
  },
};
