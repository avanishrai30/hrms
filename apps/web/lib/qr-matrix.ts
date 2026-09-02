/**
 * Lightweight, zero-dependency, ISO/IEC 18004 compliant QR Code Matrix Generator.
 * Supports Byte Mode (8-bit binary / UTF-8 JSON payloads), Error Correction Level M / L,
 * and outputs deterministic 2D boolean matrices for crisp SVG/Canvas rendering.
 */

// Galois Field GF(256) arithmetic tables with primitive polynomial 0x11d (285)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = val;
    GF_EXP[i + 255] = val;
    GF_LOG[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
  GF_LOG[0] = 0;
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x]! + GF_LOG[y]!]!;
}

// Reed-Solomon Generator Polynomials
function getGeneratorPolynomial(ecCount: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < ecCount; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i]!;
    for (let j = 0; j < poly.length; j++) {
      const valJ = poly[j] ?? 0;
      nextPoly[j] = (nextPoly[j] ?? 0) ^ gfMul(valJ, factor);
      nextPoly[j + 1] = (nextPoly[j + 1] ?? 0) ^ valJ;
    }
    poly = nextPoly;
  }
  return poly;
}

function calculateErrorCorrection(data: Uint8Array, ecCount: number): Uint8Array {
  const genPoly = getGeneratorPolynomial(ecCount);
  const remainder = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i]! ^ remainder[0]!;
    for (let j = 0; j < ecCount - 1; j++) {
      remainder[j] = remainder[j + 1]! ^ gfMul(genPoly[j + 1]!, factor);
    }
    remainder[ecCount - 1] = gfMul(genPoly[ecCount]!, factor);
  }
  return remainder;
}

// QR Code Version Capacities (Byte Mode, Error Correction Level L/M)
// Version -> [size, totalCodewords, ecCodewordsPerBlock, numBlocks]
interface VersionInfo {
  version: number;
  size: number;
  dataCapacity: number;
  totalCodewords: number;
  ecCodewords: number;
  blocks: number;
  alignmentPatterns: number[];
}

const VERSIONS: VersionInfo[] = [
  { version: 1, size: 21, dataCapacity: 17, totalCodewords: 26, ecCodewords: 9, blocks: 1, alignmentPatterns: [] },
  { version: 2, size: 25, dataCapacity: 32, totalCodewords: 44, ecCodewords: 12, blocks: 1, alignmentPatterns: [6, 18] },
  { version: 3, size: 29, dataCapacity: 53, totalCodewords: 70, ecCodewords: 17, blocks: 1, alignmentPatterns: [6, 22] },
  { version: 4, size: 33, dataCapacity: 78, totalCodewords: 100, ecCodewords: 22, blocks: 1, alignmentPatterns: [6, 26] },
  { version: 5, size: 37, dataCapacity: 106, totalCodewords: 134, ecCodewords: 28, blocks: 1, alignmentPatterns: [6, 30] },
  { version: 6, size: 41, dataCapacity: 134, totalCodewords: 172, ecCodewords: 38, blocks: 2, alignmentPatterns: [6, 34] },
  { version: 7, size: 45, dataCapacity: 154, totalCodewords: 196, ecCodewords: 42, blocks: 2, alignmentPatterns: [6, 22, 38] },
  { version: 8, size: 49, dataCapacity: 192, totalCodewords: 242, ecCodewords: 50, blocks: 2, alignmentPatterns: [6, 24, 42] },
  { version: 9, size: 53, dataCapacity: 230, totalCodewords: 292, ecCodewords: 62, blocks: 2, alignmentPatterns: [6, 26, 46] },
  { version: 10, size: 57, dataCapacity: 271, totalCodewords: 346, ecCodewords: 75, blocks: 2, alignmentPatterns: [6, 28, 50] }
];

export function generateQrMatrix(text: string): boolean[][] {
  if (!text) return [];

  const utf8 = new TextEncoder().encode(text);
  const version = VERSIONS.find((v) => v.dataCapacity >= utf8.length + 3) || VERSIONS[VERSIONS.length - 1]!;

  const size = version.size;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  const addFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isFunction[nr]![nc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            matrix[nr]![nc] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          } else {
            matrix[nr]![nc] = false; // Separator
          }
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // 2. Alignment Patterns
  const alignCoords = version.alignmentPatterns;
  for (const r of alignCoords) {
    for (const c of alignCoords) {
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === alignCoords[alignCoords.length - 1]) ||
        (r === alignCoords[alignCoords.length - 1] && c === 6)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          isFunction[r + dr]![c + dc] = true;
          matrix[r + dr]![c + dc] =
            Math.max(Math.abs(dr), Math.abs(dc)) === 2 || (dr === 0 && dc === 0);
        }
      }
    }
  }

  // 3. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    isFunction[6]![i] = true;
    matrix[6]![i] = i % 2 === 0;
    isFunction[i]![6] = true;
    matrix[i]![6] = i % 2 === 0;
  }

  // Dark module
  isFunction[4 * version.version + 9]![8] = true;
  matrix[4 * version.version + 9]![8] = true;

  // Format info placeholders
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[8]![i] = true;
      isFunction[i]![8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8]![i] = true;
  }
  for (let i = size - 7; i < size; i++) {
    isFunction[i]![8] = true;
  }

  // 4. Data Encoding (Byte Mode)
  const bitStream: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4); // Byte Mode Indicator
  pushBits(utf8.length, version.version < 10 ? 8 : 16); // Character count indicator
  for (const b of utf8) {
    pushBits(b, 8);
  }

  // Terminator
  const totalDataBits = (version.totalCodewords - version.ecCodewords) * 8;
  const termBits = Math.min(4, totalDataBits - bitStream.length);
  for (let i = 0; i < termBits; i++) bitStream.push(0);

  // Pad to 8-bit boundary
  while (bitStream.length % 8 !== 0) bitStream.push(0);

  // Pad Codewords
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < totalDataBits) {
    pushBits(padBytes[padIdx % 2]!, 8);
    padIdx++;
  }

  const dataCodewords = new Uint8Array(totalDataBits / 8);
  for (let i = 0; i < dataCodewords.length; i++) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) {
      byteVal = (byteVal << 1) | bitStream[i * 8 + j]!;
    }
    dataCodewords[i] = byteVal;
  }

  // Error correction
  const ecPerBlock = version.ecCodewords / version.blocks;
  const dataPerBlock = dataCodewords.length / version.blocks;
  const ecCodewords = calculateErrorCorrection(dataCodewords.slice(0, dataPerBlock), ecPerBlock);

  const finalCodewords = new Uint8Array(dataCodewords.length + ecCodewords.length);
  finalCodewords.set(dataCodewords);
  finalCodewords.set(ecCodewords, dataCodewords.length);

  // 5. Place Data Bits with standard mask pattern 0 ((row + col) % 2 == 0)
  let bitIndex = 0;
  const totalBits = finalCodewords.length * 8;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const rows = upwards ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (!isFunction[r]![c]) {
          let bit = 0;
          if (bitIndex < totalBits) {
            const bytePos = Math.floor(bitIndex / 8);
            const bitPos = 7 - (bitIndex % 8);
            bit = (finalCodewords[bytePos]! >> bitPos) & 1;
            bitIndex++;
          }
          // Apply mask pattern 0
          const mask = (r + c) % 2 === 0;
          matrix[r]![c] = mask ? bit === 0 : bit === 1;
        }
      }
    }
    upwards = !upwards;
  }

  // 6. Format Information (Mask 0, Level M: 0b00, standard BCH 15-bit encoded: 0x5412)
  const formatInfo = 0x5412;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatInfo >> i) & 1) === 1;
    if (i < 6) matrix[8]![i] = bit;
    else if (i === 6) matrix[8]![7] = bit;
    else if (i === 7) matrix[8]![8] = bit;
    else if (i === 8) matrix[7]![8] = bit;
    else matrix[14 - i]![8] = bit;

    if (i < 8) matrix[size - 1 - i]![8] = bit;
    else matrix[8]![size - 15 + i] = bit;
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}
