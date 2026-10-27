"use client";

import React from 'react';
import { Sparkles, Search, CheckCircle2 } from 'lucide-react';

export type MascotState = 'idle' | 'text-focused' | 'password-hidden' | 'password-revealed' | 'success';

interface HideAndSeekMascotProps {
  state: MascotState;
  activeFieldLabel?: string;
}

export function HideAndSeekMascot({ state, activeFieldLabel }: HideAndSeekMascotProps) {
  const isCoveringEyes = state === 'password-hidden';
  const isPeeking = state === 'password-revealed';
  const isCelebrating = state === 'success';
  const isSearching = state === 'text-focused';

  // Dynamic speech bubble caption
  const getSpeechCaption = () => {
    if (isCelebrating) {
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        text: 'Account Verified! Welcome to Campus!',
        bg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200',
      };
    }
    if (isCoveringEyes) {
      return {
        icon: <span className="text-xs">🙈</span>,
        text: 'Hide & Seek! No peeking at your password!',
        bg: 'bg-indigo-500/20 border-indigo-400/30 text-indigo-200',
      };
    }
    if (isPeeking) {
      return {
        icon: <span className="text-xs">👀</span>,
        text: 'Peek-a-boo! I see your password characters!',
        bg: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-200',
      };
    }
    if (isSearching) {
      return {
        icon: <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />,
        text: `Looking up ${activeFieldLabel || 'details'}...`,
        bg: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
      };
    }
    return {
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />,
      text: 'Findy the Campus Detective is standing by!',
      bg: 'bg-white/10 border-white/15 text-slate-300',
    };
  };

  const caption = getSpeechCaption();

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Dynamic Interactive Speech Bubble */}
      <div
        className={`mb-2 px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all duration-300 flex items-center space-x-2 shadow-lg ${caption.bg}`}
      >
        {caption.icon}
        <span className="font-semibold tracking-wide">{caption.text}</span>
      </div>

      {/* Interactive Mascot SVG */}
      <div className="relative w-32 h-28 flex items-center justify-center">
        {/* Glow halo under mascot */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
            isCelebrating
              ? 'bg-emerald-500/30 scale-125'
              : isCoveringEyes
              ? 'bg-indigo-600/25 scale-100'
              : isPeeking
              ? 'bg-cyan-500/25 scale-110'
              : 'bg-blue-600/20 scale-95'
          }`}
        />

        <svg
          viewBox="0 0 160 140"
          className="w-full h-full overflow-visible transition-transform duration-300 hover:scale-105"
        >
          {/* Shadows */}
          <ellipse cx="80" cy="132" rx="42" ry="7" fill="rgba(0,0,0,0.3)" />

          {/* Ears */}
          <polygon
            points="46,45 32,18 60,32"
            fill="#3B82F6"
            stroke="#1D4ED8"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="50,42 40,26 58,35"
            fill="#93C5FD"
          />

          <polygon
            points="114,45 128,18 100,32"
            fill="#3B82F6"
            stroke="#1D4ED8"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="110,42 120,26 102,35"
            fill="#93C5FD"
          />

          {/* Head Base */}
          <rect
            x="36"
            y="30"
            width="88"
            height="80"
            rx="36"
            fill="url(#mascotGrad)"
            stroke="#1E40AF"
            strokeWidth="3"
          />

          {/* Detective Cap */}
          <path
            d="M 38 42 C 38 20, 122 20, 122 42 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          {/* Cap Visor */}
          <path
            d="M 30 43 Q 80 34 130 43 Q 80 50 30 43 Z"
            fill="#334155"
            stroke="#0F172A"
            strokeWidth="2"
          />
          {/* Cap Badge */}
          <circle cx="80" cy="28" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <path d="M 80 25 L 81 29 L 78 27 L 82 27 L 79 29 Z" fill="#78350F" />

          {/* Face Cheeks */}
          <circle cx="52" cy="78" r="7" fill="#F472B6" opacity="0.45" />
          <circle cx="108" cy="78" r="7" fill="#F472B6" opacity="0.45" />

          {/* Cute Snout */}
          <ellipse cx="80" cy="76" rx="14" ry="10" fill="#DBEAFE" />
          <polygon points="76,73 84,73 80,78" fill="#1E293B" />
          {/* Mouth */}
          <path
            d={isCelebrating ? "M 74 80 Q 80 87 86 80" : "M 75 79 Q 80 83 85 79"}
            fill="none"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* ============================================================== */}
          {/* EYES LAYER                                                     */}
          {/* ============================================================== */}
          <g className="transition-all duration-300">
            {/* Left Eye */}
            <circle cx="58" cy="62" r="10" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="2" />
            <circle
              cx={isSearching ? "56" : "58"}
              cy={isSearching ? "64" : "62"}
              r="5.5"
              fill="#0F172A"
              className="transition-all duration-200"
            />
            {/* Left eye light glint */}
            <circle cx="56" cy="60" r="2" fill="#FFFFFF" />

            {/* Right Eye */}
            {isPeeking ? (
              // Playful Winking Right Eye
              <path
                d="M 96 63 Q 102 58 108 63"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ) : (
              // Normal Open Eye
              <>
                <circle cx="102" cy="62" r="10" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="2" />
                <circle
                  cx={isSearching ? "100" : "102"}
                  cy={isSearching ? "64" : "62"}
                  r="5.5"
                  fill="#0F172A"
                  className="transition-all duration-200"
                />
                <circle cx="100" cy="60" r="2" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* ============================================================== */}
          {/* PAWS (HANDS) FOR HIDE & SEEK INTERACTION                       */}
          {/* ============================================================== */}

          {/* Left Paw */}
          <g
            className="transition-all duration-300 ease-out"
            style={{
              transform: isCelebrating
                ? 'translate(0px, -46px) rotate(-24deg)'
                : isCoveringEyes
                ? 'translate(10px, -34px) rotate(10deg)'
                : isPeeking
                ? 'translate(10px, -34px) rotate(10deg)' // covers left eye, peeks with right
                : 'translate(0px, 0px)',
              transformOrigin: '48px 105px',
            }}
          >
            <ellipse
              cx="48"
              cy="105"
              rx="13"
              ry="11"
              fill="#60A5FA"
              stroke="#1D4ED8"
              strokeWidth="2.5"
            />
            {/* Paw pads */}
            <circle cx="48" cy="104" r="3" fill="#DBEAFE" />
            <circle cx="43" cy="101" r="1.5" fill="#DBEAFE" />
            <circle cx="48" cy="99" r="1.5" fill="#DBEAFE" />
            <circle cx="53" cy="101" r="1.5" fill="#DBEAFE" />
          </g>

          {/* Right Paw */}
          <g
            className="transition-all duration-300 ease-out"
            style={{
              transform: isCelebrating
                ? 'translate(0px, -46px) rotate(24deg)'
                : isCoveringEyes
                ? 'translate(-10px, -34px) rotate(-10deg)'
                : isPeeking
                ? 'translate(0px, 6px) rotate(15deg)' // lowered paw so right eye peeks!
                : 'translate(0px, 0px)',
              transformOrigin: '112px 105px',
            }}
          >
            <ellipse
              cx="112"
              cy="105"
              rx="13"
              ry="11"
              fill="#60A5FA"
              stroke="#1D4ED8"
              strokeWidth="2.5"
            />
            {/* Paw pads */}
            <circle cx="112" cy="104" r="3" fill="#DBEAFE" />
            <circle cx="107" cy="101" r="1.5" fill="#DBEAFE" />
            <circle cx="112" cy="99" r="1.5" fill="#DBEAFE" />
            <circle cx="117" cy="101" r="1.5" fill="#DBEAFE" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="mascotGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
