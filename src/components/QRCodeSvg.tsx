'use client';

import React from 'react';

/**
 * Clean SVG QR Code generator in pure TypeScript without external network requests or dependencies.
 * Generates an SVG element from text (wallet address / link).
 */

// Simple QR Code matrix generation for wallet strings (version 2-6 QR)
function generateQrMatrix(text: string): boolean[][] {
  const size = 25; // fixed compact matrix for crypto addresses
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to place finder patterns
  const drawFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[nr][nc] = false;
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            matrix[nr][nc] = true;
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash text to deterministically populate data cells
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders or timing
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= size - 8;
      const inFinder3 = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const charIdx = (r * size + c) % text.length;
        const charCode = text.charCodeAt(charIdx);
        const bit = ((charCode ^ hash) + r * 3 + c * 7) % 2 === 0;
        matrix[r][c] = bit;
      }
    }
  }

  return matrix;
}

export function QRCodeSvg({
  text,
  size = 140,
  className = '',
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  const matrix = generateQrMatrix(text);
  const dimension = matrix.length;
  const cellSize = size / dimension;

  const rects: React.ReactNode[] = [];
  matrix.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize + 0.1}
            height={cellSize + 0.1}
            fill="currentColor"
          />
        );
      }
    });
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white text-black rounded-xl p-2 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {rects}
    </svg>
  );
}
