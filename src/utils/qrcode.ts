/**
 * QR Code Generator - Pure TypeScript implementation of QR Code Model 2.
 * Supports up to Version 10, perfect for small thermal printer URLs or text.
 */

export class QRByte {
  public mode: number = 4; // Byte mode (8-bit)
  constructor(public data: string) {}
  getLength() {
    return this.data.length;
  }
  write(buffer: QRBitBuffer) {
    for (let i = 0; i < this.data.length; i++) {
      buffer.put(this.data.charCodeAt(i), 8);
    }
  }
}

class QRBitBuffer {
  public buffer: number[] = [];
  public length: number = 0;

  get(index: number) {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

// Reed-Solomon Math and Polynomials
class QRMath {
  private static EXP_TABLE: number[] = new Array(256);
  private static LOG_TABLE: number[] = new Array(256);

  static init() {
    let x = 1;
    for (let i = 0; i < 256; i++) {
      QRMath.EXP_TABLE[i] = x;
      QRMath.LOG_TABLE[x] = i;
      x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
    }
  }

  static glog(n: number) {
    if (n < 1) throw new Error("glog(" + n + ")");
    return QRMath.LOG_TABLE[n];
  }

  static gexp(n: number) {
    while (n < 0) n += 255;
    while (n >= 255) n -= 255;
    return QRMath.EXP_TABLE[n];
  }
}
QRMath.init();

class QRPolynomial {
  public num: number[];
  constructor(num: number[], shift: number = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset++;
    }
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[offset + i];
    }
    for (let i = num.length - offset; i < this.num.length; i++) {
      this.num[i] = 0;
    }
  }

  get(index: number) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
      }
    }
    return new QRPolynomial(num);
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num).mod(e);
  }
}

// RS Error correction configurations per QR Version & Error Correction Level (using M / L etc)
// Version list up to v10. Key is (Version * 4 + ECL index)
const RS_ECC_PARAMS: Record<number, number[]> = {
  // format: [totalCodeWords, ecCodeWordsPerBlock, blockCount]
  // ECL Levels: L(0), M(1), Q(2), H(3)
  // v1
  4: [26, 7, 1],  // ECL L
  5: [26, 10, 1], // ECL M
  6: [26, 13, 1], // ECL Q
  7: [26, 17, 1], // ECL H
  // v2
  8: [44, 10, 1],
  9: [44, 16, 1],
  10: [44, 22, 1],
  11: [44, 28, 1],
  // v3
  12: [70, 15, 1],
  13: [70, 26, 1],
  14: [70, 18, 2],
  15: [70, 22, 2],
  // v4
  16: [100, 20, 1],
  17: [100, 16, 2],
  18: [100, 24, 2],
  19: [100, 16, 4],
  // v5
  20: [134, 26, 1],
  21: [134, 22, 2],
  22: [134, 18, 4],
  23: [134, 22, 4],
  // v6
  24: [172, 18, 2],
  25: [172, 16, 4],
  26: [172, 24, 4],
  27: [172, 28, 4],
  // v7
  28: [196, 20, 2],
  29: [196, 18, 5],
  30: [196, 18, 6],
  31: [196, 26, 5],
  // v8
  32: [242, 24, 2],
  33: [242, 22, 6],
  34: [242, 22, 6],
  35: [242, 26, 8],
  // v9
  36: [292, 30, 2],
  37: [292, 22, 8],
  38: [292, 20, 10],
  39: [292, 24, 12],
  // v10
  40: [346, 18, 4],
  41: [346, 26, 8],
  42: [346, 24, 12],
  43: [346, 28, 12],
};

export class QRCode {
  public modules: (boolean | null)[][] = [];
  public moduleCount: number = 0;
  private version: number = 1;
  private errorCorrectLevel: number = 1; // ECL: M

  constructor(public text: string) {
    // Dynamically choose version based on payload length
    const len = text.length;
    if (len < 14) this.version = 1;
    else if (len < 26) this.version = 2;
    else if (len < 42) this.version = 3;
    else if (len < 62) this.version = 4;
    else if (len < 84) this.version = 5;
    else if (len < 106) this.version = 6;
    else if (len < 122) this.version = 7;
    else if (len < 152) this.version = 8;
    else if (len < 180) this.version = 9;
    else this.version = 10;

    this.moduleCount = this.version * 4 + 17;
    this.make();
  }

  private make() {
    const data = new QRByte(this.text);
    const buffer = new QRBitBuffer();
    
    // Mode indicator (4 = Byte)
    buffer.put(data.mode, 4);
    // Character count indicator
    const countBits = this.version < 10 ? 8 : 16;
    buffer.put(data.getLength(), countBits);
    data.write(buffer);

    const key = this.version * 4 + this.errorCorrectLevel;
    const params = RS_ECC_PARAMS[key] || RS_ECC_PARAMS[5]; // Fallback to v1 M
    const [totalCodeWords, ecCodeWordsPerBlock, blockCount] = params;
    const dataCodeWords = totalCodeWords - ecCodeWordsPerBlock * blockCount;

    // Pad buffer to reach maximum capacity for the current version
    const maxBits = dataCodeWords * 8;
    if (buffer.length + 4 <= maxBits) {
      buffer.put(0, 4); // Terminator
    }
    while (buffer.length % 8 !== 0) {
      buffer.putBit(false);
    }
    while (true) {
      if (buffer.length >= maxBits) break;
      buffer.put(0xec, 8);
      if (buffer.length >= maxBits) break;
      buffer.put(0x11, 8);
    }

    // Generate Rs ECC blocks
    const dcData = new Array<number>(dataCodeWords);
    for (let i = 0; i < dataCodeWords; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        if (buffer.get(i * 8 + j)) b |= 0x80 >>> j;
      }
      dcData[i] = b;
    }

    const ecBytes = new Array<number>(ecCodeWordsPerBlock * blockCount);
    const rsPoly = this.getErrorCorrectPolynomial(ecCodeWordsPerBlock);
    const splitSize = Math.floor(dataCodeWords / blockCount);

    for (let b = 0; b < blockCount; b++) {
      const start = b * splitSize;
      const blockLen = (b === blockCount - 1) ? dataCodeWords - start : splitSize;
      const blockDc = dcData.slice(start, start + blockLen);
      const dataPoly = new QRPolynomial(blockDc, ecCodeWordsPerBlock);
      const modPoly = dataPoly.mod(rsPoly);
      
      for (let i = 0; i < ecCodeWordsPerBlock; i++) {
        const idx = i * blockCount + b;
        const modIdx = i + modPoly.getLength() - ecCodeWordsPerBlock;
        ecBytes[idx] = (modIdx >= 0) ? modPoly.get(modIdx) : 0;
      }
    }

    // Interleave dcData and ecBytes
    const finalData: number[] = [];
    const splitSizeList = new Array(blockCount).fill(splitSize);
    splitSizeList[blockCount - 1] += dataCodeWords - (splitSize * blockCount);

    // DC Data interleaving
    const maxBlockLen = Math.max(...splitSizeList);
    for (let i = 0; i < maxBlockLen; i++) {
      for (let b = 0; b < blockCount; b++) {
        if (i < splitSizeList[b]) {
          const idx = b * splitSize + i;
          finalData.push(dcData[idx]);
        }
      }
    }

    // EC bytes are already interlaced correctly
    for (let i = 0; i < ecBytes.length; i++) {
      finalData.push(ecBytes[i]);
    }

    // Grid representation
    this.modules = [];
    for (let r = 0; r < this.moduleCount; r++) {
      this.modules.push(new Array(this.moduleCount).fill(null));
    }

    this.setupPositionFinders();
    this.setupTimingPatterns();
    this.setupAlignmentPatterns();
    this.setupFormatInfo();
    this.mapData(finalData);
  }

  private getErrorCorrectPolynomial(numEcc: number): QRPolynomial {
    let a = new QRPolynomial([1]);
    for (let i = 0; i < numEcc; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)]));
    }
    return a;
  }

  private setupPositionFinders() {
    // Top-left, Top-right, Bottom-left finder patterns
    const positions = [
      [0, 0],
      [this.moduleCount - 7, 0],
      [0, this.moduleCount - 7],
    ];

    for (const [r, c] of positions) {
      for (let i = -1; i <= 7; i++) {
        for (let j = -1; j <= 7; j++) {
          const row = r + i;
          const col = c + j;
          if (row >= 0 && row < this.moduleCount && col >= 0 && col < this.moduleCount) {
            if (i >= 0 && i <= 6 && (j === 0 || j === 6 || i === 0 || i === 6) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
              this.modules[row][col] = true;
            } else {
              this.modules[row][col] = false;
            }
          }
        }
      }
    }
  }

  private setupTimingPatterns() {
    for (let i = 8; i < this.moduleCount - 8; i++) {
      if (this.modules[6][i] === null) this.modules[6][i] = (i % 2 === 0);
      if (this.modules[i][6] === null) this.modules[i][6] = (i % 2 === 0);
    }
  }

  private setupAlignmentPatterns() {
    if (this.version <= 1) return;
    const centers: Record<number, number[]> = {
      2: [6, 18],
      3: [6, 22],
      4: [6, 26],
      5: [6, 30],
      6: [6, 34],
      7: [6, 22, 38],
      8: [6, 24, 42],
      9: [6, 26, 46],
      10: [6, 28, 50],
    };

    const pos = centers[this.version];
    if (!pos) return;

    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const r = pos[i];
        const c = pos[j];
        if (this.modules[r][c] !== null) continue;
        for (let rOffset = -2; rOffset <= 2; rOffset++) {
          for (let cOffset = -2; cOffset <= 2; cOffset++) {
            const isBorder = Math.max(Math.abs(rOffset), Math.abs(cOffset)) === 2;
            const isCenter = rOffset === 0 && cOffset === 0;
            if (isBorder || isCenter) {
              this.modules[r + rOffset][c + cOffset] = true;
            } else {
              this.modules[r + rOffset][c + cOffset] = false;
            }
          }
        }
      }
    }
  }

  private setupFormatInfo() {
    // ECL: M (01 in binary), Mask: 000. Under XOR it generates format info bits
    const formatInfo = 0x5b41; // High precalculated compliance code (01000 + ECC bits)
    for (let i = 0; i < 15; i++) {
      const bit = ((formatInfo >>> i) & 1) === 1;
      // First placement
      let r, c;
      if (i < 6) { r = i; c = 8; }
      else if (i < 8) { r = i + 1; c = 8; }
      else if (i === 8) { r = 7; c = 8; }
      else if (i === 9) { r = 8; c = 7; }
      else { r = 8; c = 14 - i; }
      this.modules[r][c] = bit;

      // Second placement
      if (i < 8) { r = 8; c = this.moduleCount - i - 1; }
      else { r = this.moduleCount - 15 + i; c = 8; }
      this.modules[r][c] = bit;
    }
    // Fixed Dark module
    this.modules[this.moduleCount - 8][8] = true;
  }

  private mapData(data: number[]) {
    let r = this.moduleCount - 1;
    let c = this.moduleCount - 1;
    let dir = -1;
    let dataIdx = 0;
    let bitIdx = 7;

    while (c > 0) {
      if (c === 6) c--; // Skip timing pattern column
      for (let i = 0; i < this.moduleCount; i++) {
        const currRow = dir < 0 ? r - i : i;
        for (let colOffset = 0; colOffset < 2; colOffset++) {
          const currCol = c - colOffset;
          if (this.modules[currRow][currCol] === null) {
            let bit = false;
            if (dataIdx < data.length) {
              bit = ((data[dataIdx] >>> bitIdx) & 1) === 1;
            }
            // Basic Mask 0 application ( (row + col) % 2 === 0 )
            if ((currRow + currCol) % 2 === 0) {
              bit = !bit;
            }
            this.modules[currRow][currCol] = bit;
            bitIdx--;
            if (bitIdx < 0) {
              dataIdx++;
              bitIdx = 7;
            }
          }
        }
      }
      dir = -dir;
      c -= 2;
    }
  }
}
