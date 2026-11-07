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
    : 'Unknown date';

  return (
    <Link
      href={`/found-items/${item.id}`}
      className="group bg-white rounded-md border border-stone-200/80 hover:border-stone-400 overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Header */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={item.title}
            className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
            <ImageIcon className="w-8 h-8 mb-1 stroke-1" />
            <span className="text-xs">No visual provided</span>
          </div>
        )}

        {/* Category Label */}
        <span className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[11px] font-medium px-2 py-0.5 rounded">
          {item.category.replace('_', ' ')}
        </span>

        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
            <FoundItemStatusBadge status={item.status} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-stone-900 group-hover:text-blue-700 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.publicDescription || 'Cataloged campus property.'}
          </p>
        </div>

        {/* Meta Info */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center space-x-1 line-clamp-1 max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{item.foundLocation}</span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
