/**
 * Code 39 Barcode Generator - Helper for generating vector Code 39 barcodes.
 */

// Encoding of Code 39 characters
// 1 = Wide element (black or white), 0 = Narrow element (black or white).
// Array alternates: [black-bar, white-space, black-bar, white-space, ...]
// Exactly 5 bars and 4 spaces = 9 elements. Three must be wide (1), six narrow (0).
export const CODE39_PATTERNS: Record<string, number[]> = {
  '1': [3, 1, 1, 3, 1, 1, 1, 1, 3],
  '2': [1, 1, 3, 3, 1, 1, 1, 1, 3],
  '3': [3, 1, 3, 3, 1, 1, 1, 1, 1],
  '4': [1, 1, 1, 3, 3, 1, 1, 1, 3],
  '5': [3, 1, 1, 3, 3, 1, 1, 1, 1],
  '6': [1, 1, 3, 3, 3, 1, 1, 1, 1],
  '7': [1, 1, 1, 3, 1, 1, 3, 1, 3],
  '8': [3, 1, 1, 3, 1, 1, 3, 1, 1],
  '9': [1, 1, 3, 3, 1, 1, 3, 1, 1],
  '0': [1, 1, 1, 3, 3, 1, 3, 1, 1],
  'A': [3, 1, 1, 1, 1, 3, 1, 1, 3],
  'B': [1, 1, 3, 1, 1, 3, 1, 1, 3],
  'C': [3, 1, 3, 1, 1, 3, 1, 1, 1],
  'D': [1, 1, 1, 1, 3, 3, 1, 1, 3],
  'E': [3, 1, 1, 1, 3, 3, 1, 1, 1],
  'F': [1, 1, 3, 1, 3, 3, 1, 1, 1],
  'G': [1, 1, 1, 1, 1, 3, 3, 1, 3],
  'H': [3, 1, 1, 1, 1, 3, 3, 1, 1],
  'I': [1, 1, 3, 1, 1, 3, 3, 1, 1],
  'J': [1, 1, 1, 1, 3, 3, 3, 1, 1],
  'K': [3, 1, 1, 1, 1, 1, 1, 3, 3],
  'L': [1, 1, 3, 1, 1, 1, 1, 3, 3],
  'M': [3, 1, 3, 1, 1, 1, 1, 3, 1],
  'N': [1, 1, 1, 1, 3, 1, 1, 3, 3],
  'O': [3, 1, 1, 1, 3, 1, 1, 3, 1],
  'P': [1, 1, 3, 1, 3, 1, 1, 3, 1],
  'Q': [1, 1, 1, 1, 1, 1, 3, 3, 3],
  'R': [3, 1, 1, 1, 1, 1, 3, 3, 1],
  'S': [1, 1, 3, 1, 1, 1, 3, 3, 1],
  'T': [1, 1, 1, 1, 3, 1, 3, 3, 1],
  'U': [3, 3, 1, 1, 1, 1, 1, 1, 3],
  'V': [1, 3, 3, 1, 1, 1, 1, 1, 3],
  'W': [3, 3, 3, 1, 1, 1, 1, 1, 1],
  'X': [1, 3, 1, 1, 3, 1, 1, 1, 3],
  'Y': [3, 3, 1, 1, 3, 1, 1, 1, 1],
  'Z': [1, 3, 3, 1, 3, 1, 1, 1, 1],
  '-': [1, 3, 1, 1, 1, 1, 3, 1, 3],
  '.': [3, 3, 1, 1, 1, 1, 3, 1, 1],
  ' ': [1, 3, 3, 1, 1, 1, 3, 1, 1],
  '*': [1, 3, 1, 1, 3, 1, 3, 1, 1], // Start/stop sentinel
  '$': [1, 3, 1, 3, 1, 3, 1, 1, 1],
  '/': [1, 3, 1, 3, 1, 1, 1, 3, 1],
  '+': [1, 3, 1, 1, 1, 3, 1, 3, 1],
  '%': [1, 1, 1, 3, 1, 3, 1, 3, 1]
};

/**
 * Filter text to match supported Code 39 character set,
 * convert to uppercase, and add '*' start/stop sentinels.
 */
export function sanitizeCode39Text(text: string): string {
  const upper = text.toUpperCase();
  let sanitized = '';
  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    if (char === '*') continue; // We preserve star ONLY at beginning & end
    if (CODE39_PATTERNS[char] !== undefined) {
      sanitized += char;
    }
  }
  return sanitized ? `*${sanitized}*` : '**';
}

export interface BarcodeRect {
  x: number;
  width: number;
  isBlack: boolean;
}

/**
 * Generates an list of bar coordinates for drawing Code 39
 */
export function generateCode39Bars(text: string): BarcodeRect[] {
  const sanitized = sanitizeCode39Text(text);
  const bars: BarcodeRect[] = [];
  let currentX = 0;

  // Narrow element size = 1, Wide element size = 2.5
  const NARROW = 1.2;
  const WIDE = 3.0;
  const GAP = 1.2; // Spacing between characters

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const sequence = CODE39_PATTERNS[char];
    if (!sequence) continue;

    for (let elIdx = 0; elIdx < sequence.length; elIdx++) {
      const isBlack = elIdx % 2 === 0;
      const sizeVal = sequence[elIdx]; 
      const width = sizeVal === 3 ? WIDE : NARROW;

      bars.push({
        x: currentX,
        width,
        isBlack
      });
      currentX += width;
    }

    // Add inter-character narrow gap
    bars.push({
      x: currentX,
      width: GAP,
      isBlack: false
    });
    currentX += GAP;
  }

  return bars;
}
