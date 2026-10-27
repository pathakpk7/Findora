import axios from 'axios';
import { BASE_URL } from './api';

const BACKEND_URL = BASE_URL;

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Pre-upload local file validation
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file format (${file.type || 'unknown'}). Only JPG, PNG, and WebP images are allowed.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
  }
  return null;
}

/**
 * Upload multiple image files through authenticated backend proxy endpoint
 */
export async function uploadImages(
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<UploadedImage[]> {
  if (!files || files.length === 0) {
    return [];
  }

  if (files.length > 5) {
    throw new Error('Maximum 5 images allowed per upload.');
  }

  // Pre-validate all files
  for (const file of files) {
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/cloudinary/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(progress);
          }
        },
      },
    );

    return response.data.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to upload images to Cloudinary';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
}

/**
 * Delete image assets from Cloudinary with backend authorization check
 */
export async function deleteImages(publicIds: string[]): Promise<void> {
  if (!publicIds || publicIds.length === 0) return;

  try {
    await axios.delete(`${BACKEND_URL}/api/cloudinary/delete`, {
      headers: {
        ...getAuthHeaders(),
      },
      data: { publicIds },
    });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete images';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
}
