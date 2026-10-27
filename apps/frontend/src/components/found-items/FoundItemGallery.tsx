"use client";

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface FoundItemGalleryProps {
  images?: string[];
  title: string;
}

export function FoundItemGallery({ images = [], title }: FoundItemGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-200">
        <ImageIcon className="w-16 h-16 mb-2" />
        <span className="text-sm font-medium">No image provided by finder</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-3">
      {/* Main Image View */}
      <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails list if multiple images exist */}
      {images.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                index === selectedIndex
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
