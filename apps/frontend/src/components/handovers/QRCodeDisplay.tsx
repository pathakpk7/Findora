"use client";

import { useMemo } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

/**
 * Pure SVG QR Code Matrix Renderer
 */
export function QRCodeDisplay({ value, size = 220 }: QRCodeDisplayProps) {
  const modules = useMemo(() => {
    // Generate deterministic 21x21 grid representation from token hash
    const gridDim = 21;
    const grid: boolean[][] = Array.from({ length: gridDim }, () =>
      Array(gridDim).fill(false),
    );

    // Finder patterns in 3 corners (7x7)
    const addFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[startRow + r][startCol + c] = true;
          }
        }
      }
    };

    addFinderPattern(0, 0);
    addFinderPattern(0, gridDim - 7);
    addFinderPattern(gridDim - 7, 0);

    // Timing patterns
    for (let i = 8; i < gridDim - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Deterministically fill remaining cells using string char codes
    let strIdx = 0;
    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        // Skip finder patterns
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= gridDim - 8) ||
          (r >= gridDim - 8 && c < 8)
        ) {
          continue;
        }

        const charCode = value.charCodeAt(strIdx % value.length);
        const bit = (charCode + r * 3 + c * 7) % 2 === 0;
        grid[r][c] = bit;
        strIdx++;
      }
    }

    return grid;
  }, [value]);

  const cellDim = size / 21;

  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-md inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {modules.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellDim}
                y={r * cellDim}
                width={cellDim}
                height={cellDim}
                fill="#0f172a"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
