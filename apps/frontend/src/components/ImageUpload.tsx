'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImages } from '@/lib/cloudinary';

interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string[];
}

export function ImageUpload({
  onImagesChange,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} images allowed`);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const uploadedImages = await uploadImages(acceptedFiles, (progress: number) => {
          setUploadProgress(progress);
        });

        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        onImagesChange(newImages);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload images');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [images, maxFiles, onImagesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: uploading,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {isDragActive ? (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-sm text-gray-600">Drop the images here...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Max {maxFiles} images, {maxSize / 1024 / 1024}MB each
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
