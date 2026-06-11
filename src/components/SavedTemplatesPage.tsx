import React, { useState, useMemo, useRef } from 'react';
import { TicketPreset, TicketItem, PrinterSettings } from '../types';
import { generateCode39Bars } from '../utils/barcode';
import { QRCode } from '../utils/qrcode';
import { 
  Printer, ArrowLeft, Search, FileText, Trash2, Edit3, 
  Share2, Check, Download, Upload, Plus, FileCode, Tag, Calendar,
  Sparkles, Layers, Settings, PlayCircle, Clipboard, Copy, RotateCcw, 
  Wand2, Scissors, ArrowRight, BookOpen, AlertCircle, PlusCircle
} from 'lucide-react';

interface PassBarcodeProps {
  value: string;
}

const PassBarcode: React.FC<PassBarcodeProps> = ({ value }) => {
  const codeVal = value || '123456';
  const barcodeBars = useMemo(() => generateCode39Bars(codeVal), [codeVal]);
  const totalWidth = useMemo(() => barcodeBars.reduce((sum, bar) => sum + bar.width, 0), [barcodeBars]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 select-none">
      <svg
        width="100%"
        height="28"
        viewBox={`0 0 ${totalWidth} 40`}
        preserveAspectRatio="none"
        className="w-[85%]"
      >
        <g fill="black">
          {barcodeBars.map((bar, barIdx) => {
            if (!bar.isBlack) return null;
            return <rect key={barIdx} x={bar.x} y="0" width={bar.width} height="40" />;
          })}
        </g>
      </svg>
      <span className="text-[7.5px] tracking-[0.25em] font-mono leading-none mt-1 text-stone-900">
        {codeVal.toUpperCase()}
      </span>
    </div>
  );
};

interface PassQRCodeProps {
  value: string;
}

const PassQRCode: React.FC<PassQRCodeProps> = ({ value }) => {
  const qrVal = value || 'https://example.com';
  const qrInstance = useMemo(() => new QRCode(qrVal), [qrVal]);
  const scaleFactor = 3;
  const dim = qrInstance.moduleCount * scaleFactor;

  return (
    <div className="w-full flex flex-col items-center justify-center my-1.5 select-none font-sans">
      <div className="bg-white p-0.5 border border-stone-200 shadow-3xs">
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${qrInstance.moduleCount} ${qrInstance.moduleCount}`}
          className="w-[72px] h-[72px]"
          shapeRendering="crispEdges"
        >
          <g fill="black">
            {qrInstance.modules.map((row, rIdx) =>
              row.map((slot, cIdx) => {
                if (!slot) return null;
                return <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width="1" height="1" />;
              })
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

interface PassRendererProps {
  items: TicketItem[];
  settings: PrinterSettings;
}

const PassRenderer: React.FC<PassRendererProps> = ({ items, settings }) => {
  const getFontClass = () => {
    switch (settings.fontVariant) {
      case 'retro-draft':
        return 'font-mono uppercase tracking-wide leading-tight';
      case 'clean-mono':
        return 'font-mono tracking-tight leading-snug text-xs';
      case 'vintage-serif':
        return 'font-serif leading-relaxed text-xs';
      case 'modern-sans':
      default:
        return 'font-sans tracking-tight leading-normal text-xs';
    }
  };

  const getIntensityFilterStyle = () => {
    const scale = settings.intensity || 3;
    if (scale === 1) return { filter: 'contrast(0.7) opacity(0.7)' };
    if (scale === 2) return { filter: 'contrast(0.85) opacity(0.9)' };
    if (scale === 3) return { filter: 'contrast(1.0)' };
    if (scale === 4) return { filter: 'contrast(1.2) brightness(0.95)' };
    return { filter: 'contrast(1.4) brightness(0.9)' };
  };

  return (
    <div
      className={`mx-auto shrink-0 bg-white select-none relative transition-all text-stone-900 border border-stone-250/80 rounded-2xl ${
        settings.paperWidth === '58mm' ? 'w-[250px]' : 'w-[310px]'
      } ${settings.paperTexture ? 'bg-[radial-gradient(#f7f6f2_1px,transparent_1px)] bg-[size:10px_10px] bg-stone-50/95 shadow-md' : 'bg-white shadow-md'} `}
      style={{
        padding: settings.denseLayout ? '12px 14px' : '18px 22px',
        minHeight: '180px',
        ...getIntensityFilterStyle(),
      }}
    >
      {/* Top Torn-Paper Effect Row */}
      {settings.showCutLine && (
        <div className="absolute top-0 left-0 right-0 h-1 flex overflow-hidden">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 bg-stone-100 ltr rotate-45 shrink-0"
              style={{ marginTop: '-3px', marginRight: '0.5px' }}
            ></div>
          ))}
        </div>
      )}

      {/* Inner Content Layout Wrapper */}
      <div className={`flex flex-col text-stone-950 ${getFontClass()}`}>
        {items.map((item) => {
          const alignClass =
            item.align === 'center'
              ? 'text-center'
              : item.align === 'right'
              ? 'text-right'
              : 'text-left';

          const boldness = item.bold ? 'font-bold font-extrabold' : 'font-normal';
          const uppercase = settings.fontVariant === 'retro-draft' ? 'uppercase' : '';

          const spacerStyle = {
            marginBottom: item.spacingAfter !== undefined ? `${item.spacingAfter}px` : '3px',
          };

          switch (item.type) {
            case 'header':
              return (
                <div
                  key={item.id}
                  style={spacerStyle}
                  className={`w-full ${alignClass} ${boldness} ${uppercase} ${
                    item.doubleHeight ? 'text-lg scale-y-110 origin-center' : 'text-base'
                  } ${item.doubleWidth ? 'tracking-wider scale-x-105' : ''} tracking-tight font-black leading-none break-words my-0.5`}
                >
                  {item.text1 || 'HEADER TEXT'}
                </div>
              );

            case 'subheader':
              return (
                <div
                  key={item.id}
                  style={spacerStyle}
                  className={`w-full ${alignClass} font-semibold ${uppercase} uppercase tracking-wider text-[11px] border-b pb-0.5 border-stone-950/20`}
                >
                  {item.text1 || 'SUBHEADER LINE'}
                </div>
              );

            case 'text': {
              let sizeClass = 'text-[11px]';
              if (item.size === 'sm') sizeClass = 'text-[9px]';
              if (item.size === 'lg') sizeClass = 'text-xs';
              if (item.size === 'xl') sizeClass = 'text-sm';

              return (
                <p
                  key={item.id}
                  style={spacerStyle}
                  className={`${alignClass} ${boldness} ${sizeClass} break-words leading-tight`}
                >
                  {item.text1 || ''}
                </p>
              );
            }

            case 'keyvalue': {
              const renderKeyValueRow = () => {
                if (settings.dottedDividers) {
                  return (
                    <div
                      key={item.id}
                      style={spacerStyle}
                      className={`flex items-baseline w-full text-[11px] leading-none justify-between my-0.5 ${boldness}`}
                    >
                      <span className="shrink-0 pr-1">{item.text1}:</span>
                      <span className="grow border-b border-dotted border-stone-950/40 mx-1 h-0"></span>
                      <span className="shrink-0 pl-1 font-mono font-medium max-w-[48%] truncate text-right">
                        {item.text2 || ''}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={item.id}
                    style={spacerStyle}
                    className={`flex items-start w-full text-[11px] justify-between my-0.5 ${boldness}`}
                  >
                    <span className="text-stone-700 font-medium shrink-0 mr-1">{item.text1 || ''}</span>
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
                  key={item.id}
                  style={spacerStyle}
                  className={`grid grid-cols-3 gap-1 w-full text-[9px] py-0.5 justify-between ${boldness}`}
                >
                  <span className="truncate text-left">{item.text1 || ''}</span>
                  <span className="truncate text-center text-stone-900">{item.text2 || ''}</span>
                  <span className="truncate text-right font-semibold">{item.text3 || ''}</span>
                </div>
              );

            case 'divider':
              return (
                <div key={item.id} style={spacerStyle} className="py-0.5 w-full text-center leading-none">
                  <div className="w-full border-b border-solid border-stone-950"></div>
                </div>
              );

            case 'dotted':
              return (
                <div
                  key={item.id}
                  style={spacerStyle}
                  className="py-0.5 w-full text-center h-[1px] overflow-hidden leading-none select-none text-stone-950 font-bold font-mono tracking-widest text-[8px]"
                >
                  -------------------------------------------------
                </div>
              );

            case 'spacer':
              return (
                <div
                  key={item.id}
                  style={{ height: `${item.value ? parseInt(item.value, 10) / 1.3 : 8}px` }}
                />
              );

            case 'barcode':
              return <PassBarcode key={item.id} value={item.value || ''} />;

            case 'qrcode':
              return <PassQRCode key={item.id} value={item.value || ''} />;

            default:
              return null;
          }
        })}
      </div>

      {/* Bottom Torn-Paper Effect Row */}
      {settings.showCutLine && (
        <div className="absolute bottom-0 left-0 right-0 h-1 flex overflow-hidden">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 bg-stone-100 ltr rotate-45 shrink-0"
              style={{ marginBottom: '-3.5px', marginRight: '0.5px' }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

interface SavedTemplatesPageProps {
  userTemplates: TicketPreset[];
  onApplyTemplate: (preset: TicketPreset) => void;
  onDeleteTemplate: (id: string, e?: React.MouseEvent) => void;
  onUpdateTemplatesList: (templates: TicketPreset[]) => void;
  onAddBlankAndGo: () => void;
  onGoBack: () => void;
  getPresetIcon: (id: string) => React.ReactNode;
}

export const SavedTemplatesPage: React.FC<SavedTemplatesPageProps> = ({
  userTemplates,
  onApplyTemplate,
  onDeleteTemplate,
  onUpdateTemplatesList,
  onAddBlankAndGo,
  onGoBack,
  getPresetIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // JSON Import & Export workflow
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showImportArea, setShowImportArea] = useState(false);

  // Copied item feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing template meta inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<'transit' | 'event' | 'retail' | 'utility'>('utility');

  // ==========================================
  // REAL-TIME BATCH GENERATOR STATE & HELPERS
  // ==========================================
  const [activeGenTemplate, setActiveGenTemplate] = useState<TicketPreset | null>(null);
  const [genRows, setGenRows] = useState<Array<Record<string, string>>>([]);
  const [genVars, setGenVars] = useState<string[]>([]);
  const [quickPasteText, setQuickPasteText] = useState('');
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [seedCount, setSeedCount] = useState<number>(5);

  // Helper to detect dynamic placeholder keys like {{GUEST}} or {{SEAT}}
  const extractPlaceholders = (items: TicketItem[]): string[] => {
    if (!items) return [];
    const found = new Set<string>();
    const regex = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
    items.forEach(item => {
      [item.text1, item.text2, item.text3, item.value].forEach(str => {
        if (str) {
          let match;
          regex.lastIndex = 0;
          while ((match = regex.exec(str)) !== null) {
            found.add(match[1]);
          }
        }
      });
    });
    return Array.from(found);
  };

  const getSmartDefaultValue = (varName: string, index: number, category: string): string => {
    const vLower = varName.toLowerCase();
    
    if (vLower.includes('name') || vLower.includes('guest') || vLower.includes('passenger') || vLower.includes('attendee') || vLower.includes('client') || vLower.includes('customer') || vLower.includes('holder')) {
      const names = [
        'Emma Watson', 'James Carter', 'Sophia Vance', 'Liam Neeson', 
        'Olivia Rodrigo', 'Noah Schnapp', 'Zoe Kravitz', 'Lucas Hedges', 
        'Isabella Ross', 'Ethan Hunt', 'Mia Khalifa', 'Oliver Twist',
        'Amelia Earhart', 'David Beckham', 'Charlotte Bronte', 'Sophia Loren'
      ];
      return names[index % names.length];
    }
    
    if (vLower.includes('seat') || vLower.includes('room') || vLower.includes('compartment') || vLower.includes('row') || vLower.includes('unit') || vLower.includes('table')) {
      const letter = String.fromCharCode(65 + (index % 6)); // A-F
      const num = (index % 15) + 1;
      return `Row ${letter} - Seat ${num}`;
    }

    if (vLower.includes('code') || vLower.includes('id') || vLower.includes('ticket') || vLower.includes('barcode') || vLower.includes('qr') || vLower.includes('pass') || vLower.includes('ref')) {
      const prefix = category === 'transit' ? 'BRD' : category === 'event' ? 'EVT' : 'RTL';
      return `${prefix}-2026-${1000 + index + 1}`;
    }

    if (vLower.includes('time') || vLower.includes('date') || vLower.includes('hour') || vLower.includes('session')) {
      return index === 0 ? '08:30 PM' : index === 1 ? '09:00 PM' : '10:15 PM';
    }

    if (vLower.includes('price') || vLower.includes('total') || vLower.includes('amount') || vLower.includes('fare') || vLower.includes('cost')) {
      return `$${((index + 1) * 20).toFixed(2)}`;
    }

    if (vLower.includes('status') || vLower.includes('priority')) {
      return index % 3 === 0 ? 'VIP TICKET' : 'STANDARD';
    }

    return `Val #${index + 1}`;
  };

  const handleOpenGenerator = (template: TicketPreset) => {
    setActiveGenTemplate(template);
    
    let vars = extractPlaceholders(template.items);
    if (vars.length === 0) {
      vars = ['GUEST_NAME', 'SEAT_NO', 'TICKET_CODE'];
    }
    setGenVars(vars);

    const initialRows: Array<Record<string, string>> = [];
    for (let i = 0; i < 4; i++) {
      const row: Record<string, string> = {};
      vars.forEach(v => {
        row[v] = getSmartDefaultValue(v, i, template.category || 'event');
      });
      initialRows.push(row);
    }
    setGenRows(initialRows);
  };

  const templateHasPlaceholders = useMemo(() => {
    if (!activeGenTemplate) return false;
    const regex = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
    return activeGenTemplate.items.some(item => {
      return [item.text1, item.text2, item.text3, item.value].some(str => {
        if (!str) return false;
        regex.lastIndex = 0;
        return regex.test(str);
      });
    });
  }, [activeGenTemplate]);

  // Interpolation Engine
  const replacePlaceholders = (text: string | undefined, rowData: Record<string, string>): string => {
    if (!text) return '';
    let updated = text;
    Object.entries(rowData).forEach(([key, val]) => {
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'gi');
      updated = updated.replace(regex, val);
    });
    return updated;
  };

  const getInterpolatedItems = (baseItems: TicketItem[], rowData: Record<string, string>): TicketItem[] => {
    return baseItems.map(item => ({
      ...item,
      text1: item.text1 ? replacePlaceholders(item.text1, rowData) : undefined,
      text2: item.text2 ? replacePlaceholders(item.text2, rowData) : undefined,
      text3: item.text3 ? replacePlaceholders(item.text3, rowData) : undefined,
      value: item.value ? replacePlaceholders(item.value, rowData) : undefined,
    }));
  };

  const handleRowChange = (rowIndex: number, fieldName: string, newValue: string) => {
    const updated = [...genRows];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [fieldName]: newValue
    };
    setGenRows(updated);
  };

  const handleAddRow = () => {
    const newIdx = genRows.length;
    const newRow: Record<string, string> = {};
    genVars.forEach(v => {
      newRow[v] = getSmartDefaultValue(v, newIdx, activeGenTemplate?.category || 'event');
    });
    setGenRows([...genRows, newRow]);
  };

  const handleCloneRow = (rowIndex: number) => {
    const target = { ...genRows[rowIndex] };
    // adjust ticket ID if exists
    genVars.forEach(v => {
      if (v.toLowerCase().includes('id') || v.toLowerCase().includes('code')) {
        target[v] = target[v] + '-CL';
      }
    });
    const updated = [...genRows];
    updated.splice(rowIndex + 1, 0, target);
    setGenRows(updated);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const updated = genRows.filter((_, idx) => idx !== rowIndex);
    setGenRows(updated);
  };

  const handleSeedBatch = (count: number) => {
    const nextBatch: Array<Record<string, string>> = [];
    const currentLen = genRows.length;
    for (let i = 0; i < count; i++) {
      const row: Record<string, string> = {};
      genVars.forEach(v => {
        row[v] = getSmartDefaultValue(v, currentLen + i, activeGenTemplate?.category || 'event');
      });
      nextBatch.push(row);
    }
    setGenRows([...genRows, ...nextBatch]);
  };

  const handleQuickImportNames = () => {
    if (!quickPasteText.trim()) return;
    const lines = quickPasteText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const addedRows: Array<Record<string, string>> = [];
    
    lines.forEach((line, lineIdx) => {
      const row: Record<string, string> = {};
      const primaryVar = genVars[0] || 'GUEST_NAME';
      
      genVars.forEach(v => {
        if (v === primaryVar) {
          row[v] = line;
        } else {
          row[v] = getSmartDefaultValue(v, genRows.length + lineIdx, activeGenTemplate?.category || 'event');
        }
      });
      addedRows.push(row);
    });

    setGenRows([...genRows, ...addedRows]);
    setQuickPasteText('');
    setShowQuickPaste(false);
  };

  // Trigger copy JSON to clipboard
  const handleCopyJSON = (template: TicketPreset) => {
    try {
      const serialized = JSON.stringify({
        version: 'passgen-v2',
        name: template.name,
        description: template.description,
        category: template.category,
        items: template.items,
        settings: template.settings
      }, null, 2);
      
      navigator.clipboard.writeText(serialized);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      alert('Unable to copy JSON data to clipboard.');
    }
  };

  // Perform JSON Import validation
  const handleImportJSON = () => {
    setImportError(null);
    setImportSuccess(false);
    if (!importText.trim()) {
      setImportError('Please paste some JSON layout data first.');
      return;
    }

    try {
      const parsed = JSON.parse(importText);
      
      // Basic duck-typing checks
      if (!parsed.name || !Array.isArray(parsed.items)) {
        setImportError('Invalid template JSON format. Missing "name" string or "items" array.');
        return;
      }

      const newTemplate: TicketPreset = {
        id: `usr-tpl-${Date.now()}`,
        name: parsed.name,
        description: parsed.description || 'Imported receipt layout snapshot',
        category: parsed.category || 'utility',
        items: parsed.items,
        settings: parsed.settings || { width: '80mm', font: 'inter', highContrast: true, printDensity: 12 },
      };

      const updated = [newTemplate, ...userTemplates];
      onUpdateTemplatesList(updated);
      localStorage.setItem('thermal_user_templates_v2', JSON.stringify(updated));

      setImportText('');
      setImportSuccess(true);
      setShowImportArea(false);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err: any) {
      setImportError(`Failed to parse JSON: ${err.message || 'Syntax Error'}`);
    }
  };

  // Inline Meta Editor Trigger
  const startInlineEdit = (template: TicketPreset) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDesc(template.description || '');
    setEditCategory(template.category as any || 'utility');
  };

  // Save Inline Meta Editor Values
  const saveInlineMeta = (id: string) => {
    if (!editName.trim()) {
      alert('Template Name is required.');
      return;
    }

    const updated = userTemplates.map(tpl => {
      if (tpl.id === id) {
        return {
          ...tpl,
          name: editName,
          description: editDesc,
          category: editCategory
        };
      }
      return tpl;
    });

    onUpdateTemplatesList(updated);
    localStorage.setItem('thermal_user_templates_v2', JSON.stringify(updated));
    setEditingId(null);
  };

  // Filter conditions
  const filteredTemplates = userTemplates.filter(tpl => {
    const matchesSearch = 
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (activeGenTemplate) {
    const finalIntensity = activeGenTemplate.settings?.intensity || 3;
    const finalPaperWidth = activeGenTemplate.settings?.paperWidth || '80mm';
    const finalFontVariant = activeGenTemplate.settings?.fontVariant || 'modern-sans';
    const finalShowCutLine = activeGenTemplate.settings?.showCutLine !== false;
    const finalDottedDividers = activeGenTemplate.settings?.dottedDividers !== false;
    const finalDenseLayout = activeGenTemplate.settings?.denseLayout === true;
    const finalPaperTexture = activeGenTemplate.settings?.paperTexture !== false;

    const generatorSettings: PrinterSettings = {
      paperWidth: finalPaperWidth,
      fontVariant: finalFontVariant,
      intensity: finalIntensity,
      showCutLine: finalShowCutLine,
      dottedDividers: finalDottedDividers,
      denseLayout: finalDenseLayout,
      paperTexture: finalPaperTexture,
    };

    return (
      <div className="min-h-screen bg-stone-100/30 text-stone-900 flex flex-col font-sans" id="ticket-generator-workbench">
        {/* Dynamic header navigation */}
        <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-3xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveGenTemplate(null)}
                className="p-2 hover:bg-stone-150 text-stone-600 hover:text-stone-950 rounded-xl transition-all cursor-pointer border border-stone-200"
                title="Go back to Layouts"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} />
                    Dynamic Batch Generator
                  </span>
                  <span className="text-[9px] bg-stone-100 text-stone-550 border border-stone-200 rounded px-1.5 py-0.5 font-mono">
                    WIDTH: {finalPaperWidth}
                  </span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 font-mono capitalize">
                    {activeGenTemplate.category || 'event'}
                  </span>
                </div>
                <h1 className="text-sm font-black uppercase text-stone-950 tracking-tight">
                  Template: {activeGenTemplate.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  onApplyTemplate(activeGenTemplate);
                  setActiveGenTemplate(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 border border-stone-250 rounded-xl cursor-pointer transition-all"
              >
                <FileCode size={13} className="text-stone-500" />
                <span>Go to Workbench Editor</span>
              </button>
              
              <button
                onClick={() => window.print()}
                id="batch-print-all-passes-btn"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer transition-all shadow-sm"
              >
                <Printer size={13} />
                <span>Print All Passes ({genRows.length})</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDE PANEL: Controls, tables, seeders (7 cols on large screens) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Template warning card if lacking placeholders */}
            {!templateHasPlaceholders && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900" id="no-placeholders-warning">
                <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">No format key variables like {"{{GUEST_NAME}}"} detected in your canvas layout</p>
                  <p className="mt-1 text-amber-700/90 leading-relaxed">
                    This means your template displays static text only. By default, we pre-initialized standard keys like <code className="bg-amber-100 px-1 rounded text-[10px] font-mono font-bold">{"{{GUEST_NAME}}"}</code>, but changes in the rows won't replace anything.
                    <br/><br/>
                    <strong>How to make your template fully dynamic:</strong>
                    <br/>
                    1. Go back to the <strong className="text-stone-900">Workbench</strong>.
                    <br/>
                    2. Choose elements (like Name, Seat Row, Voucher Code) and update their text to contain variable tokens enclosed in double curly brackets, e.g. <code className="bg-amber-200/80 text-amber-950 px-1 py-0.5 rounded font-mono font-bold">{"{{GUEST_NAME}}"}</code> or <code className="bg-amber-200/85 text-amber-955 px-1 py-0.5 rounded font-mono font-bold">{"{{SEAT}}"}</code>.
                    <br/>
                    3. Return here, and those fields will automatically transform into dynamic real-time input boxes in this spreadsheet-grid!
                  </p>
                </div>
              </div>
            )}

            {/* Quick seeders and bulk utility command bank */}
            <div className="bg-white rounded-3xl border border-stone-200/85 p-6 flex flex-col gap-4 shadow-3xs" id="generator-utility-bank">
              <div className="flex items-center justify-between border-b border-stone-150 pb-3 font-sans">
                <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-emerald-600" />
                  <span>Interactive Batch Control Hub</span>
                </h3>
                <span className="font-mono text-xs font-bold text-stone-500">
                  {genRows.length} active passes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-stone-200/60 bg-stone-50/30 p-4 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">Fast Sample Seeding</span>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">Inject mock pass variables customized to your template category.</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleSeedBatch(5)}
                      className="grow py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-[10px] rounded-xl cursor-pointer transition-all uppercase tracking-wide border border-stone-200/40"
                    >
                      + 5 passes
                    </button>
                    <button
                      onClick={() => handleSeedBatch(10)}
                      className="grow py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-[10px] rounded-xl cursor-pointer transition-all uppercase tracking-wide border border-stone-200/40"
                    >
                      + 10 passes
                    </button>
                  </div>
                </div>

                <div className="border border-stone-200/60 bg-stone-50/30 p-4 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">List/CSV Paste Area</span>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">Paste a raw list of custom guest names to mass-generate layout passes in seconds.</p>
                  </div>
                  <button
                    onClick={() => setShowQuickPaste(true)}
                    className="w-full mt-1 py-2 px-3 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-[10px] border border-emerald-200/50 rounded-xl cursor-pointer transition-all uppercase tracking-wide flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={11} />
                    <span>Import Attendee List</span>
                  </button>
                </div>
              </div>

              {/* Quick List Importer Modal/Drawer */}
              {showQuickPaste && (
                <div className="bg-stone-900/40 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                  <div className="bg-white border border-stone-200 max-w-md w-full rounded-3xl p-6 shadow-2xl animate-enter">
                    <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-2 mb-1.5 flex-row">
                      <PlusCircle size={14} className="text-emerald-600" />
                      <span>Paste Attendee Names</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mb-4 leading-relaxed">
                      Enter each attendee name on a separate line below. We'll map them to your first dynamic variable and auto-seed seat/ticket increments.
                    </p>
                    <textarea
                      rows={6}
                      value={quickPasteText}
                      onChange={(e) => setQuickPasteText(e.target.value)}
                      placeholder={"Bruce Wayne\nClark Kent\nDiana Prince\nBarry Allen"}
                      className="w-full bg-stone-50 border border-stone-250 rounded-2xl p-4 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 h-40 text-stone-850"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setShowQuickPaste(false)}
                        className="px-3.5 py-2 text-xs text-stone-500 font-bold hover:text-stone-850"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleQuickImportNames}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase shadow-sm cursor-pointer"
                      >
                        Generate Group Passes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live table / list of Active Passes */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 flex-1 flex flex-col min-h-[450px] shadow-3xs hover:shadow-2xs transition-all" id="generator-passes-list">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-150 gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-stone-900 tracking-widest">
                    Real-time Spreadsheet Columns
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 leading-snug">Updates reflecting live in the simulated thermal receipts stream below.</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1 bg-stone-950 text-white hover:bg-stone-850 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer shadow-3xs transition-all"
                  >
                    <Plus size={11} />
                    <span>Add Row</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all passes in this batch?')) {
                        setGenRows([]);
                      }
                    }}
                    className="px-3 py-2 text-[10px] font-extrabold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-all uppercase"
                  >
                    Reset Grid
                  </button>
                </div>
              </div>

              {genRows.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto min-h-[200px]">
                  <Layers className="text-stone-300 stroke-[1] mb-3 animate-pulse" size={44} />
                  <span className="text-xs font-black text-stone-850 uppercase tracking-wide">No active passes</span>
                  <p className="text-[11px] text-stone-400 max-w-xs mt-2 leading-relaxed">
                    Insert layout items manually, paste guest names, or seed automatic rows to launch.
                  </p>
                  <button
                    onClick={() => handleSeedBatch(4)}
                    className="mt-5 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-[10px] rounded-xl tracking-wider transition-all uppercase border border-emerald-150 cursor-pointer text-center"
                  >
                    Generate Sample Batch
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[500px] mt-4 space-y-3.5 pr-2 scrollbar-thin">
                  {genRows.map((row, idx) => (
                    <div 
                      key={idx}
                      className="bg-stone-50/50 hover:bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                      id={`gpass-row-${idx}`}
                    >
                      {/* Pass badge labels */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-mono text-[11px] font-black text-emerald-700 shadow-3xs">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase text-stone-400">PASS #{(idx + 1).toString().padStart(3, '0')}</span>
                          <span className="text-xs font-black text-stone-850 font-mono tracking-tight max-w-[120px] truncate">
                            {row[genVars[0]] || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      {/* Discovered Inputs variables editable block */}
                      <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {genVars.map((v) => (
                          <div key={v} className="flex flex-col min-w-0">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider flex items-center gap-0.5 truncate">
                              <span className="text-emerald-600 font-extrabold">{"{"}</span>
                              <span>{v}</span>
                              <span className="text-emerald-600 font-extrabold">{"}"}</span>
                            </label>
                            <input
                              type="text"
                              value={row[v] || ''}
                              onChange={(e) => handleRowChange(idx, v, e.target.value)}
                              className="mt-0.5 w-full bg-white border border-stone-250 rounded-lg py-1 px-2 text-xs font-bold text-stone-850 focus:outline-none focus:border-stone-400 focus:bg-stone-50/30 font-mono"
                              placeholder={`Enter ${v}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Item row level utilities */}
                      <div className="flex items-center gap-1 shrink-0 justify-end">
                        <button
                          onClick={() => handleCloneRow(idx)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 bg-white border border-stone-200 rounded-lg hover:shadow-3xs transition-all cursor-pointer bg-white/100"
                          title="Clone Pass Data (Repeat Ticket)"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(idx)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                          title="Remove Pass"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Help / Tips */}
            <div className="bg-stone-55/65 border border-stone-150 rounded-2xl p-4 flex gap-2 text-stone-500 leading-relaxed text-[11px] bg-stone-50/80">
              <BookOpen size={15} className="shrink-0 text-stone-400 mt-0.5" />
              <div>
                <strong className="text-stone-700 uppercase block mb-1 font-sans">Pass Generator Protocol</strong>
                We parse matching text inside your template components and swap them with the rows above. Barcode numeric fields and QR link items fully support dynamic text substitutions so you can embed dynamic ticketing codes!
              </div>
            </div>
          </section>

          {/* RIGHT SIDE PANEL: Real-time Virtual Previews stream (5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-stone-900 border border-stone-850 rounded-[32px] p-5 text-stone-300 sticky top-24 shadow-2xl flex flex-col h-[750px]" id="live-ticket-feed-panel">
              <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 mb-4 shrink-0 font-sans">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest font-mono">
                    REAL-TIME PASSES FEED
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-black bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-950">
                  {genRows.length} TICKETS
                </span>
              </div>

              {/* Scrollable feed inside printer chassis style container */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent space-y-8 pb-4">
                {genRows.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
                    <Printer className="text-stone-750 stroke-[1] mb-3 animate-pulse" size={32} />
                    <span className="text-xs font-mono tracking-wider">WAITING EXCLUSIVELY FOR TICKETS...</span>
                    <p className="text-[10px] text-stone-500 mt-1 max-w-[180px]">
                      Add some attendee passes to feed the live thermal simulator queue.
                    </p>
                  </div>
                ) : (
                  genRows.map((row, idx) => {
                    const interpolatedItems = getInterpolatedItems(activeGenTemplate.items, row);
                    
                    return (
                      <div 
                        key={idx}
                        className="flex flex-col items-center relative animate-enter"
                        id={`simulator-pass-strip-${idx}`}
                      >
                        {/* Feed connector tape indicator */}
                        <div className="relative text-[8.5px] font-mono font-bold tracking-widest text-stone-500 uppercase py-1 bg-[#151413] border-y border-[#232221] rounded px-3 mb-2 w-full max-w-[270px] text-center shadow-inner flex items-center justify-between select-none">
                          <span className="opacity-40">FEED</span>
                          <span className="text-emerald-500/80 font-black">PASS #{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="opacity-40">TICKET</span>
                        </div>

                        {/* High-fidelity Pass representation */}
                        <div className="relative">
                          {/* Inner preview card tag */}
                          <div className="absolute top-2 right-4 z-10 bg-stone-900/40 text-stone-200 text-[8px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                            PASS-{idx + 1}
                          </div>
                          
                          <PassRenderer
                            items={interpolatedItems}
                            settings={generatorSettings}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chassis virtual bottom strip */}
              <div className="mt-3 pt-3 border-t border-stone-800 shrink-0 flex items-center justify-between text-[10px] text-stone-500 font-mono tracking-wide select-none">
                <span>VIRTUAL SPOOL STREAM</span>
                <span className="text-emerald-500 font-bold uppercase animate-pulse">● FEED READY</span>
              </div>
            </div>
          </section>
        </main>

        {/* Dynamic bulk PDF compile background surface for standard web printing */}
        <div id="batch-print-surface" className="hidden">
          {genRows.map((row, idx) => {
            const interpolatedItems = getInterpolatedItems(activeGenTemplate.items, row);
            return (
              <div 
                key={idx} 
                className="batch-printed-ticket p-6 bg-white flex flex-col items-center justify-center relative border border-b border-dashed border-stone-300"
                style={{ breakAfter: 'page', alignSelf: 'center' }}
              >
                <PassRenderer
                  items={interpolatedItems}
                  settings={generatorSettings}
                />
              </div>
            );
          })}
        </div>

        {/* Printing stylesheet additions */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #ticket-generator-workbench, #ticket-generator-workbench * {
              display: none !important;
            }
            #root-layout, #root-layout * {
              display: none !important;
            }
            #batch-print-surface {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              visibility: visible !important;
              position: absolute !important;
              left: 4mm !important;
              top: 4mm !important;
              width: 100% !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            #batch-print-surface * {
              visibility: visible !important;
            }
            .batch-printed-ticket {
              display: block !important;
              page-break-after: always !important;
              break-after: page !important;
              margin-bottom: 8mm !important;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/40 text-stone-900 flex flex-col font-sans" id="saved-templates-page">
      {/* 1. Header Area with back link */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-3xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="p-2 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-xl transition-all cursor-pointer border border-stone-100"
              title="Go back to Home"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                <Printer size={15} />
              </div>
              <span className="text-base font-black tracking-tight text-stone-950 uppercase">Saved Layouts</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportArea(!showImportArea)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 border border-stone-200 rounded-xl cursor-pointer transition-all"
            >
              <Upload size={13} />
              <span>Import JSON</span>
            </button>
            <button
              onClick={onAddBlankAndGo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-stone-950 hover:bg-stone-850 rounded-xl cursor-pointer transition-all shadow-3xs"
            >
              <Plus size={13} />
              <span>Build New Blank</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Intro Hero banner */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-3xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-stone-950">
              Saved Templates Directory
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              Manage your high-contrast layout presets, custom receipt structures, and hardware benchmarks. Everything is cached in your browser's local safety environment.
            </p>
          </div>
          <div className="flex gap-4 scroll-mt-2 font-mono shrink-0">
            <div className="bg-stone-50 border border-stone-150 p-3 rounded-2xl min-w-[100px] text-center">
              <span className="text-xs text-stone-400 font-bold block uppercase tracking-wider">Total Stored</span>
              <span className="text-xl font-black text-stone-800">{userTemplates.length}</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl min-w-[100px] text-center">
              <span className="text-xs text-emerald-600/80 font-bold block uppercase tracking-wider">Storage Sync</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 mt-1 rounded inline-block">LOCAL ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 3. JSON Import area / drawer */}
        {showImportArea && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 animate-enter" id="json-import-drawer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-stone-900 flex items-center gap-2">
                <FileCode size={15} className="text-emerald-600" />
                <span>Import Layout Snapshot JSON</span>
              </span>
              <button 
                onClick={() => setShowImportArea(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Paste the serialized template object configuration code below. You can obtain this code by clicking export share icons on any saved layoutcard.
            </p>
            <textarea
              rows={4}
              placeholder='{ "name": "Classic Movie ticket", "items": [...], "settings": {...} }'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 font-mono text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-4 h-32"
            />
            {importError && (
              <p className="text-xs text-rose-600 font-bold mb-4">{importError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setImportText('')} 
                className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-800"
              >
                Clear
              </button>
              <button 
                onClick={handleImportJSON} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-3xs"
              >
                Confirm Import
              </button>
            </div>
          </div>
        )}

        {importSuccess && (
          <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 text-emerald-800 text-xs font-bold animate-enter">
            ✓ Excellent! Your template layout has been compiled and added to your personal library successfully.
          </div>
        )}

        {/* 4. Filter & Search Controls */}
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4 flex flex-col md:flex-row items-center justify-between gap-4" id="gallery-controls-card">
          {/* Custom Search field */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
            <input
              type="text"
              placeholder="Search by template name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filtering buttons chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Layouts' },
              { id: 'transit', label: 'Transit' },
              { id: 'event', label: 'Events' },
              { id: 'retail', label: 'RetailPOS' },
              { id: 'utility', label: 'Utility' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-stone-950 text-white shadow-3xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Saved Templates Grid Library */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
            <FileText size={48} className="text-stone-300 mb-4 stroke-[1]" />
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-tight">No saved matches found</h3>
            <p className="text-xs text-stone-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== 'all' 
                ? "Try widening your search terms or checking different categories above to locate your template layout." 
                : "You don't have any templates saved. Open the workbench, build a luxurious thermal pass, and save snapshot!"}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={onAddBlankAndGo}
                className="mt-6 px-4 py-2.5 bg-stone-950 text-white text-xs font-bold rounded-xl hover:bg-stone-850 uppercase transition-all shadow-3xs"
              >
                Create Blank Canvas
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="templates-grid-feed">
            {filteredTemplates.map((template) => {
              const isEditing = editingId === template.id;
              
              return (
                <div
                  key={template.id}
                  className="bg-white border border-stone-200 rounded-[2rem] p-6 hover:border-stone-400 hover:shadow-xs transition-all relative flex flex-col justify-between group"
                >
                  {/* Category Banner or status bar */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] font-bold tracking-wider uppercase bg-stone-100 px-2 py-0.5 rounded-md ${
                      template.category === 'transit' ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' :
                      template.category === 'event' ? 'text-purple-600 bg-purple-50 border border-purple-100' :
                      template.category === 'retail' ? 'text-amber-700 bg-amber-50 border border-amber-100' :
                      'text-emerald-700 bg-emerald-50 border border-emerald-100'
                    }`}>
                      {template.category || 'Custom'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyJSON(template)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 bg-stone-50 border border-stone-150 rounded-lg transition-all"
                        title="Copy Config JSON"
                      >
                        {copiedId === template.id ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
                      </button>
                      <button
                        onClick={() => startInlineEdit(template)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 bg-stone-50 border border-stone-150 rounded-lg transition-all"
                        title="Edit Template Description"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={(e) => onDeleteTemplate(template.id, e)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 bg-rose-50/50 border border-rose-100 rounded-lg transition-all"
                        title="Delete Layout"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Template Meta Editing / Info Block */}
                  {isEditing ? (
                    <div className="flex flex-col gap-3 py-2 border-y border-stone-100/80 my-2" id={`inline-edit-form-${template.id}`}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs font-bold text-stone-900 border border-stone-250 p-2 rounded-xl"
                        placeholder="Template Name"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full text-[11px] text-stone-600 border border-stone-250 p-2 rounded-xl"
                        placeholder="Description text"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="w-full text-[11px] text-stone-700 border border-stone-250 p-2 rounded-xl bg-white"
                      >
                        <option value="transit">Transit / Boarding</option>
                        <option value="event">Event Admission</option>
                        <option value="retail">Retail Receipt</option>
                        <option value="utility">Utility Label</option>
                      </select>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-[10px] text-stone-500 font-bold hover:text-stone-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveInlineMeta(template.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-[14px] font-black uppercase text-stone-900 line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                        {template.description || "Personal layout configuration snapshot."}
                      </p>
                    </div>
                  )}

                  {/* Layout Statistics inside visual panel */}
                  <div className="bg-stone-50 border border-stone-150 p-3.5 rounded-2xl my-4 space-y-1 bg-stone-50/60 text-[10px]/tight font-mono text-stone-500">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 font-sans text-[9px] uppercase font-bold text-stone-400">
                        <Tag size={10} /> WIDTH
                      </span>
                      <span className="font-extrabold text-stone-700"> {template.settings?.width || '80mm'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 font-sans text-[9px] uppercase font-bold text-stone-400">
                        <FileText size={10} /> ROWS / SECTIONS
                      </span>
                      <span className="font-extrabold text-stone-700">{template.items ? template.items.length : '0'} lines</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 font-sans text-[9px] uppercase font-bold text-stone-400">
                        <Calendar size={10} /> TYPE
                      </span>
                      <span className="font-extrabold text-stone-700 capitalize">{template.category || 'General'}</span>
                    </div>
                  </div>

                  {/* Trigger load buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                    <button
                      onClick={() => onApplyTemplate(template)}
                      className="flex-1 py-2 px-3 bg-stone-150 hover:bg-stone-200 text-stone-850 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all duration-205 flex items-center justify-center gap-1 cursor-pointer border border-stone-200/50"
                    >
                      <ArrowLeft size={11} className="rotate-180 text-stone-500" />
                      <span>Workbench</span>
                    </button>
                    <button
                      onClick={() => handleOpenGenerator(template)}
                      className="flex-1 py-2 px-3 bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all duration-205 flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <Sparkles size={11} />
                      <span>Generator</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Soft Footer Credits */}
      <footer className="mt-20 border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-400 font-medium">
        <p className="mb-1">PassGen Templates Studio • Crafted dynamically with premium React parameters.</p>
        <p className="text-[10px] text-stone-300">Layout JSON syntax is compatible with direct Esc/POS receipt compilation.</p>
      </footer>
    </div>
  );
};
