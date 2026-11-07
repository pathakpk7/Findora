"use client";

import React, { useState } from 'react';

interface FindoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  withTagline?: boolean;
  iconOnly?: boolean;
  iconType?: 'pin' | 'squircle';
  className?: string;
}

export function FindoraLogo({
  size = 'md',
  variant = 'light',
  withTagline = false,
  iconOnly = false,
  iconType = 'pin',
  className = '',
}: FindoraLogoProps) {
  const [imgError, setImgError] = useState(false);

  const heightClasses = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

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
    <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
      {iconOnly ? (
        <div className={`relative flex-shrink-0 transition-opacity duration-200 hover:opacity-90 ${iconSizes[size]}`}>
          <img
            src={logoSrc}
            alt="Findora"
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="relative flex items-center space-x-2">
          {!imgError ? (
            <img
              src={logoSrc}
              alt="Findora"
              className={`${heightClasses[size]} w-auto object-contain transition-opacity duration-200 hover:opacity-90`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center space-x-2">
              <img
                src="/logo-icon.png"
                alt="Findora"
                className={`${heightClasses[size]} w-auto object-contain`}
              />
              <span
                className={`font-semibold tracking-tight text-xl ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                FIND<span className="text-blue-600">O</span>RA
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
