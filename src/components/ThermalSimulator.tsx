import React, { useMemo, useRef } from 'react';
import { TicketItem, PrinterSettings } from '../types';
import { generateCode39Bars } from '../utils/barcode';
import { QRCode } from '../utils/qrcode';
import { Printer, Scissors } from 'lucide-react';

interface BarcodeRendererProps {
  value: string;
  id: string;
  spacerStyle: React.CSSProperties;
}

const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({ value, id, spacerStyle }) => {
  const codeVal = value || '123456';
  const barcodeBars = useMemo(() => generateCode39Bars(codeVal), [codeVal]);
  const totalWidth = useMemo(() => barcodeBars.reduce((sum, bar) => sum + bar.width, 0), [barcodeBars]);

  return (
    <div
      id={`ticket-item-${id}`}
      style={spacerStyle}
      className="w-full flex flex-col items-center justify-center my-2"
    >
      <svg
        width="100%"
        height="44"
        viewBox={`0 0 ${totalWidth} 40`}
        preserveAspectRatio="none"
        className="w-[90%] md:w-[80%]"
      >
        <g fill="black">
          {barcodeBars.map((bar, barIdx) => {
            if (!bar.isBlack) return null;
            return (
              <rect
                key={barIdx}
                x={bar.x}
                y="0"
                width={bar.width}
                height="40"
              />
            );
          })}
        </g>
      </svg>
      <span className="text-[10px] tracking-[0.2em] font-mono leading-relaxed select-all">
        {codeVal.toUpperCase()}
      </span>
    </div>
  );
};

interface QRCodeRendererProps {
  value: string;
  id: string;
  spacerStyle: React.CSSProperties;
}

const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({ value, id, spacerStyle }) => {
  const qrVal = value || 'https://example.com';
  const qrInstance = useMemo(() => new QRCode(qrVal), [qrVal]);
  const scaleFactor = 4;
  const dim = qrInstance.moduleCount * scaleFactor;

  return (
    <div
      id={`ticket-item-${id}`}
      style={spacerStyle}
      className="w-full flex flex-col items-center justify-center my-3"
    >
      <div className="bg-white p-1 border border-stone-200 shadow-xs">
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${qrInstance.moduleCount} ${qrInstance.moduleCount}`}
          className="w-[120px] h-[120px]"
          shapeRendering="crispEdges"
        >
          <g fill="black">
            {qrInstance.modules.map((row, rIdx) =>
              row.map((slot, cIdx) => {
                if (!slot) return null;
                return (
                  <rect
                    key={`${rIdx}-${cIdx}`}
                    x={cIdx}
                    y={rIdx}
                    width="1"
                    height="1"
                  />
                );
              })
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

interface ThermalSimulatorProps {
  items: TicketItem[];
  settings: PrinterSettings;
  onQuickUpdateItem?: (id: string, text1: string, text2?: string) => void;
}

export const ThermalSimulator: React.FC<ThermalSimulatorProps> = ({
  items,
  settings,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Apply selected font family variables to match fontVariant settings.
  const getFontClass = () => {
    switch (settings.fontVariant) {
      case 'retro-draft':
        return 'font-mono uppercase tracking-wide leading-tight';
      case 'clean-mono':
        return 'font-mono tracking-tight leading-snug';
      case 'vintage-serif':
        return 'font-serif leading-relaxed';
      case 'modern-sans':
      default:
        return 'font-sans tracking-tight leading-normal';
    }
  };

  // Convert print-heat density scale (1 to 5) to custom contrast black filters.
  const getIntensityFilterStyle = () => {
    const scale = settings.intensity; // 1 to 5
    // Simulates thermal heat bleeding or light printing
    if (scale === 1) return { filter: 'contrast(0.7) opacity(0.7)' };
    if (scale === 2) return { filter: 'contrast(0.85) opacity(0.9)' };
    if (scale === 3) return { filter: 'contrast(1.0)' }; // clean black
    if (scale === 4) return { filter: 'contrast(1.2) brightness(0.95)' }; // slight ink bleeds
    return { filter: 'contrast(1.4) brightness(0.9)' }; // high heat bleeding (thick bars)
  };

  // Trigger system printing targeting our highly styled raw ticket DOM.
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full h-full relative" id="thermal-simulator-container">
      {/* Simulation HUD Controls */}
      <div className="flex flex-wrap items-center justify-between w-full gap-3 p-4 border bg-stone-50 border-stone-200/80 rounded-2xl mb-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-medium text-stone-700">Printer Simulator Online</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-stone-200/80 rounded text-xs font-mono font-medium text-stone-600">
            {settings.paperWidth}
          </div>
          <div className="px-2 py-0.5 bg-stone-200/80 rounded text-xs font-mono font-medium text-stone-600">
            {settings.fontVariant.replace('-', ' ')}
          </div>
        </div>

        <button
          onClick={handlePrint}
          id="system-print-badge"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-stone-900 border border-stone-800 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 cursor-pointer shadow-sm transition-all"
        >
          <Printer size={16} />
          <span>Print Pass</span>
        </button>
      </div>

      {/* Printer Body Frame Simulation */}
      <div className="relative w-full max-w-[450px] bg-[#1e1d1a] border-4 border-[#2c2b29] rounded-3xl p-6 pb-2 border-b-[16px] shadow-2xl overflow-hidden mb-8 transition-all">
        {/* Status indicator LEDs */}
        <div className="absolute top-2 right-6 flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
          <div className="w-2 h-2 rounded-full bg-[#1e1d1a]"></div>
        </div>
        <div className="absolute top-2 left-6 text-[10px] font-mono font-bold text-stone-500 tracking-wider">
          THERMAL PRINTER
        </div>

        {/* Paper feeder mouth */}
        <div className="w-full h-4 bg-stone-950 border-y border-stone-800 rounded-sm relative shadow-inner overflow-hidden mb-1 flex items-center justify-between px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600/80 animate-pulse"></div>
          <div className="h-0.5 w-[70%] bg-stone-900 leading-none"></div>
          <div className="w-12 h-1 bg-amber-500/20"></div>
        </div>

        {/* Paper Spool Exit Animation wrapper */}
        <div className="relative pt-2 max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
          {/* Printable Ticket Area */}
          <div
            ref={printAreaRef}
            id="printable-thermal-ticket"
            className={`mx-auto shrink-0 bg-white select-none relative transition-all ${
              settings.paperWidth === '58mm' ? 'w-[290px]' : 'w-[370px]'
            } ${settings.paperTexture ? 'bg-[radial-gradient(#f7f6f2_1px,transparent_1px)] bg-[size:10px_10px] bg-stone-50/95 shadow-md border-x border-stone-200/80' : 'bg-white shadow-md border-x border-stone-200'} `}
            style={{
              padding: settings.denseLayout ? '16px 20px' : '28px 32px',
              minHeight: '260px',
              ...getIntensityFilterStyle(),
            }}
          >
            {/* Top Torn-Paper Effect Row */}
            {settings.showCutLine && (
              <div className="absolute top-0 left-0 right-0 h-1 flex overflow-hidden">
                {Array.from({ length: 40 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-2 h-2 bg-[#1e1d1a] ltr rotate-45 shrink-0"
                    style={{ marginTop: '-4px', marginRight: '0.5px' }}
                  ></div>
                ))}
              </div>
            )}

            {/* Inner Content Layout Wrapper */}
            <div className={`flex flex-col text-stone-950 ${getFontClass()}`}>
              {items.map((item, index) => {
                const alignClass =
                  item.align === 'center'
                    ? 'text-center'
                    : item.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                const boldness = item.bold ? 'font-bold font-extrabold' : 'font-normal';
                const uppercase = settings.fontVariant === 'retro-draft' ? 'uppercase' : '';

                // Spacing After custom height
                const spacerStyle = {
                  marginBottom: item.spacingAfter !== undefined ? `${item.spacingAfter}px` : '4px',
                };

                switch (item.type) {
                  case 'header':
                    return (
                      <div
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={spacerStyle}
                        className={`w-full ${alignClass} ${boldness} ${uppercase} ${
                          item.doubleHeight ? 'text-2xl scale-y-125 origin-center' : 'text-xl'
                        } ${item.doubleWidth ? 'tracking-wider scale-x-110' : ''} tracking-tight font-black leading-none break-words my-1`}
                      >
                        {item.text1 || 'HEADER TEXT'}
                      </div>
                    );

                  case 'subheader':
                    return (
                      <div
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={spacerStyle}
                        className={`w-full ${alignClass} font-semibold ${uppercase} uppercase tracking-wider text-sm border-b pb-0.5 border-stone-950/20`}
                      >
                        {item.text1 || 'SUBHEADER LINE'}
                      </div>
                    );

                  case 'text': {
                    let sizeClass = 'text-sm';
                    if (item.size === 'sm') sizeClass = 'text-xs';
                    if (item.size === 'lg') sizeClass = 'text-base';
                    if (item.size === 'xl') sizeClass = 'text-lg';

                    return (
                      <p
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={spacerStyle}
                        className={`${alignClass} ${boldness} ${sizeClass} break-words leading-tight`}
                      >
                        {item.text1 || ''}
                      </p>
                    );
                  }

                  case 'keyvalue': {
                    // Fill keyvalue gap with vintage receipt dots if dottedDividers setting is active
                    const renderKeyValueRow = () => {
                      if (settings.dottedDividers) {
                        return (
                          <div
                            id={`ticket-item-${item.id}`}
                            key={item.id}
                            style={spacerStyle}
                            className={`flex items-baseline w-full text-sm leading-none justify-between my-0.5 ${boldness}`}
                          >
                            <span className="shrink-0 pr-1 select-all">{item.text1}:</span>
                            <span className="grow border-b border-dotted border-stone-950/40 mx-2 h-0"></span>
                            <span className="shrink-0 pl-1 font-mono font-medium max-w-[50%] truncate text-right">
                              {item.text2 || ''}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div
                          id={`ticket-item-${item.id}`}
                          key={item.id}
                          style={spacerStyle}
                          className={`flex items-start w-full text-sm justify-between my-0.5 ${boldness}`}
                        >
                          <span className="text-stone-700 font-medium shrink-0 mr-2">{item.text1 || ''}</span>
                          <span className="text-stone-950 font-semibold text-right break-all">
                            {item.text2 || ''}
                          </span>
                        </div>
                      );
                    };
                    return renderKeyValueRow();
                  }

                  case 'columns':
                    return (
                      <div
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={spacerStyle}
                        className={`grid grid-cols-3 gap-1.5 w-full text-xs py-0.5 justify-between ${boldness}`}
                      >
                        <span className="truncate text-left">{item.text1 || ''}</span>
                        <span className="truncate text-center text-stone-900">{item.text2 || ''}</span>
                        <span className="truncate text-right font-semibold">{item.text3 || ''}</span>
                      </div>
                    );

                  case 'divider':
                    return (
                      <div
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={spacerStyle}
                        className="py-1 w-full text-center leading-none"
                      >
                        <div className="w-full border-b-[2px] border-solid border-stone-950"></div>
                      </div>
                    );

                  case 'dotted':
                    return (
                      <div
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={spacerStyle}
                        className="py-1 w-full text-center h-[2px] overflow-hidden leading-none select-none text-stone-950 font-bold font-mono tracking-widest"
                      >
                        -------------------------------------------------
                      </div>
                    );

                  case 'spacer':
                    return (
                      <div
                        id={`ticket-item-${item.id}`}
                        key={item.id}
                        style={{ height: `${item.value ? parseInt(item.value, 10) : 12}px` }}
                      />
                    );

                  case 'barcode':
                    return (
                      <BarcodeRenderer
                        key={item.id}
                        id={item.id}
                        value={item.value || ''}
                        spacerStyle={spacerStyle}
                      />
                    );

                  case 'qrcode':
                    return (
                      <QRCodeRenderer
                        key={item.id}
                        id={item.id}
                        value={item.value || ''}
                        spacerStyle={spacerStyle}
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>

            {/* Bottom Torn-Paper Effect Row */}
            {settings.showCutLine && (
              <div className="absolute bottom-0 left-0 right-0 h-1 flex overflow-hidden">
                {Array.from({ length: 40 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-2 h-2 bg-[#1e1d1a] ltr rotate-45 shrink-0"
                    style={{ marginBottom: '-4px', marginRight: '0.5px' }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Paper tearing guide visual widget */}
        <div className="flex items-center justify-center gap-1.5 py-2 mt-2 select-none">
          <Scissors size={14} className="text-stone-500 animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-stone-500 tracking-wider">
            TEAR TO DETACH PASS
          </span>
        </div>
      </div>

      {/* Embedded CSS rules for browser native printing customization */}
      <style>{`
        @media print {
          /* Hide non-print structures */
          body * {
            visibility: hidden;
          }
          /* Frame the specific target ticket node and place it top-left with no offsets */
          #printable-thermal-ticket, #printable-thermal-ticket * {
            visibility: visible;
          }
          #printable-thermal-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${settings.paperWidth === '58mm' ? '58mm' : '80mm'} !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            margin: 0 !important;
            padding: ${settings.denseLayout ? '6mm 6mm' : '8mm 10mm'} !important;
            filter: contrast(1.5) !important; /* Forces pitch-dark black & white on paper */
          }
          @page {
            size: auto;
            margin: 0mm; /* Disables standard headers/footers */
          }
        }
      `}</style>
    </div>
  );
};
