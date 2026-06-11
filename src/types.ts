export type TicketItemType =
  | 'header'
  | 'subheader'
  | 'text'
  | 'columns'
  | 'keyvalue'
  | 'divider'
  | 'dotted'
  | 'barcode'
  | 'qrcode'
  | 'spacer';

export interface TicketItem {
  id: string;
  type: TicketItemType;
  text1?: string; // main label, single text, column 1, header, subheader
  text2?: string; // column 2, key-value value
  text3?: string; // column 3
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  doubleHeight?: boolean;
  doubleWidth?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  spacingAfter?: number; // spacing in pixels
  value?: string; // storage for barcode codes, QR codes, or spacer height
}

export type PaperWidth = '58mm' | '80mm';

export type FontVariant = 'retro-draft' | 'modern-sans' | 'clean-mono' | 'vintage-serif';

export interface PrinterSettings {
  paperWidth: PaperWidth;
  fontVariant: FontVariant;
  intensity: number; // 1-5 (simulates print heat/darkness)
  showCutLine: boolean;
  dottedDividers: boolean;
  denseLayout: boolean;
  paperTexture: boolean;
}

export interface TicketPreset {
  id: string;
  name: string;
  description: string;
  category: 'transit' | 'event' | 'retail' | 'utility';
  items: TicketItem[];
  settings: Partial<PrinterSettings>;
}
