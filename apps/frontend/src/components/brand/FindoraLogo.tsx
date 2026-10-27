"use client";

import React, { useState } from 'react';

interface FindoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showBadge?: boolean;
  withTagline?: boolean;
  iconOnly?: boolean;
  iconType?: 'pin' | 'squircle';
  className?: string;
}

export function FindoraLogo({
  size = 'md',
  variant = 'light',
  showBadge = true,
  withTagline = false,
  iconOnly = false,
  iconType = 'pin',
  className = '',
}: FindoraLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Height configurations for responsive crisp rendering
  const heightClasses = {
    sm: 'h-7', // 28px
    md: 'h-9 sm:h-10', // 36px - 40px
    lg: 'h-12 sm:h-14', // 48px - 56px
    xl: 'h-16 sm:h-20', // 64px - 80px
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Determine which asset to load based on theme & options
  const isDark = variant === 'dark';

  let logoSrc: string;
  if (iconOnly) {
    logoSrc = iconType === 'squircle' ? '/app-icon.png' : '/logo-icon.png';
  } else if (isDark) {
    logoSrc = withTagline ? '/logo-dark.png' : '/logo-dark-compact.png';
  } else {
    logoSrc = withTagline ? '/logo.png' : '/logo-compact.png';
  }

  return (
    <div className={`inline-flex items-center space-x-2 select-none group ${className}`}>
      {iconOnly ? (
        <div className={`relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconSizes[size]}`}>
          <img
            src={logoSrc}
            alt="Findora Icon"
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>
      ) : (
        <div className="relative flex items-center space-x-2">
          {!imgError ? (
            <img
              src={logoSrc}
              alt="Findora"
              className={`${heightClasses[size]} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
              onError={() => setImgError(true)}
            />
          ) : (
            // Fallback in case of asset loading error
            <div className="flex items-center space-x-2">
              <img
                src="/logo-icon.png"
                alt="Findora"
                className={`${heightClasses[size]} w-auto object-contain`}
              />
              <span
                className={`font-black tracking-tight text-xl ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                FIND<span className="text-cyan-500">O</span>RA
              </span>
            </div>
          )}

          {showBadge && (
            <span className="text-[10px] bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ml-1 self-center">
              Campus
            </span>
          )}
        </div>
      )}
    </div>
  );
}
