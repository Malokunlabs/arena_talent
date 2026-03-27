import { apiClient } from "./apiClient";
import { R2_PUBLIC_URL } from "@/lib/config";

export type MediaPrefix = "proofs" | "avatars";

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
    prefix: MediaPrefix
  ): Promise<PresignResponse> {
    return apiClient.post<PresignResponse>("/media/presign", {
      filename,
      contentType,
      prefix,
    });
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
    // Step 1: Presign
    const {
      url: presignedUrl,
      key,
      uploadHeaders,
    } = await mediaService.presign(file.name, file.type, prefix);

    // Step 2: Upload directly to R2 (using headers from backend if provided)
    await mediaService.uploadToR2(presignedUrl, file, uploadHeaders);

    // Return the public CDN URL
    return mediaService.getPublicUrl(key);
  },
};
