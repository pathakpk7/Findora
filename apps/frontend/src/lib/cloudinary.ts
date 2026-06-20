import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImages(
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<UploadedImage[]> {
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
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload images');
  }
}

export async function deleteImages(publicIds: string[]): Promise<void> {
  try {
    await axios.delete(`${BACKEND_URL}/api/cloudinary/delete`, {
      data: { publicIds },
    });
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete images');
  }
}
