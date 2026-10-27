"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { uploadImages, validateImageFile, UploadedImage } from '@/lib/cloudinary';

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSize?: number; // default 5MB
  accept?: string[];
}

export function ImageUpload({
  onImagesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  accept = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrorMessage(null);

      if (images.length + acceptedFiles.length > maxFiles) {
        setErrorMessage(`Maximum ${maxFiles} images allowed per item submission.`);
        return;
      }

      // Pre-validate all files
      for (const file of acceptedFiles) {
        const error = validateImageFile(file);
        if (error) {
          setErrorMessage(error);
          return;
        }
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
      } catch (error: any) {
        setErrorMessage(error?.message || 'Failed to upload image. Please try again.');
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
    disabled: uploading || images.length >= maxFiles,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center space-x-2 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'}
            ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 py-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-gray-700">Uploading to Cloudinary... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-2">
              {isDragActive ? (
                <>
                  <Upload className="h-8 w-8 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">Drop images here...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop item photos here, or <span className="text-blue-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: JPG, PNG, WebP (Max {maxFiles} images, {maxSize / (1024 * 1024)}MB each)
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          {images.map((image, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-100">
              <img
                src={image.url}
                alt={`Uploaded photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors shadow"
                type="button"
                title="Remove photo"
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
