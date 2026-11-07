"use client";

import React from 'react';

export function LostAndFoundCanvas() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Architectural Geometric Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* 2. Concentric Orbit Circles (Minimalist Instrument) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-20">
        <div className="absolute inset-0 rounded-full border border-stone-600/40" />
        <div className="absolute inset-24 rounded-full border border-stone-600/30" />
        <div className="absolute inset-48 rounded-full border border-stone-600/20" />
        <div className="absolute inset-[48%] rounded-full bg-blue-500/20 animate-pulse-dot" />
      </div>

      {/* 3. Subtle Station Telemetry Cues */}
      <div className="absolute top-8 left-8 text-[11px] font-mono text-stone-500 hidden sm:block">
        PORTAL // ID-VERIFY-01
      </div>

      <div className="absolute bottom-8 right-8 text-[11px] font-mono text-stone-500 hidden sm:block">
        CRYPTOGRAPHIC CUSTODY · CAMPUS GROUND
      </div>
    </div>
  );
}
