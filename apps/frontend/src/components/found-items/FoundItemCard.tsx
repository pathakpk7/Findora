"use client";

import Link from 'next/link';
import { PublicFoundItem } from '@findora/types';
import { FoundItemStatusBadge } from './FoundItemStatusBadge';
import { MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

interface FoundItemCardProps {
  item: PublicFoundItem;
  showStatus?: boolean;
}

export function FoundItemCard({ item, showStatus = false }: FoundItemCardProps) {
  const mainImage = item.publicImages?.[0] || null;
  const formattedDate = item.foundDate
    ? new Date(item.foundDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown Date';

  return (
    <Link
      href={`/found-items/${item.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      {/* Image Header */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-10 h-10 mb-1" />
            <span className="text-xs">No image provided</span>
          </div>
        )}

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md">
          {item.category.replace('_', ' ')}
        </span>

        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-3 right-3">
            <FoundItemStatusBadge status={item.status} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {item.publicDescription}
          </p>
        </div>

        {/* Meta Info */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{item.foundLocation}</span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
