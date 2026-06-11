import React, { useState, useEffect } from 'react';
import { TicketItem, TicketItemType, PrinterSettings, FontVariant, PaperWidth, TicketPreset } from '../types';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Settings, Heading1, Heading2, 
  AlignJustify, Link, QrCode, AlignLeft, AlignCenter, AlignRight, 
  Maximize2, Type, MoveVertical, FileText, Split, GripVertical, Copy, Sparkles, RefreshCw,
  Code, FileJson, CheckCircle2, AlertTriangle, Gauge, Lightbulb, HelpCircle, ArrowUpRight,
  ChevronDown, ChevronUp, Pencil, Film, Plane, Coffee, Car, Library, Flag, Music
} from 'lucide-react';
import { PASS_PRESETS } from '../utils/presets';

interface TicketEditorProps {
  items: TicketItem[];
  settings: PrinterSettings;
  onUpdateItems: (items: TicketItem[]) => void;
  onUpdateSettings: (settings: PrinterSettings) => void;
  userTemplates: any[];
  onSaveTemplate: (name: string, description: string, category: 'transit' | 'event' | 'retail' | 'utility') => void;
  onDeleteTemplate: (id: string, e?: React.MouseEvent) => void;
  onApplyPreset: (preset: any) => void;
}

const SUGGESTIONS = {
  header: ["WELCOME", "THANK YOU", "ADMIT ONE", "STAR PASS", "OFFICIAL RECEIPT", "VOID IF SEVERED", "★ VIP GUEST ★", "SPECIAL RESERVES"],
  subheader: ["ACCESS CONFIRMED", "GUEST VOUCHER", "ADMISSION PERMIT", "INVOICE RETAIL", "RESERVATION ASSIGN", "ENTRY GRANTED"],
  text: ["Bring physical ticket to gate.", "No outside food allowed.", "Valid only on date of issue.", "Non-transferable voucher.", "Scan barcode for leaderboard."],
  keyValueLabel: ["DATE", "TIME", "GATE", "SEAT / ROW", "PRICE", "CART REF", "ORDER ID", "VALID UNTIL", "MEMBERSHIP"],
  keyValueValue: ["04-JUN-2026", "18:45 PM", "GATE 2", "A-12 / ROW 3", "$24.00", "CART-42", "TX-9921", "24 HOURS ONLY", "PLATINUM"],
};

const COMMON_VARIABLES = [
  { name: 'GUEST_NAME', label: 'Guest Name', desc: 'Emma Watson, James, etc.' },
  { name: 'SEAT_NO', label: 'Seat/Row/Room', desc: 'Row A - Seat 5, etc.' },
  { name: 'TICKET_CODE', label: 'Pass/Ticket ID', desc: 'EVT-2026-1001, etc.' },
  { name: 'DATE', label: 'Event Date/Time', desc: '08:30 PM, etc.' },
  { name: 'PRICE', label: 'Ticket Price/Cost', desc: '$40.00, etc.' },
];

const getPresetIcon = (id: string) => {
  switch (id) {
    case 'cinema-ticket':
      return <Film size={18} className="stroke-[1.8]" />;
    case 'boarding-pass':
      return <Plane size={18} className="stroke-[1.8]" />;
    case 'cafe-receipt':
      return <Coffee size={18} className="stroke-[1.8]" />;
    case 'parking-ticket':
      return <Car size={18} className="stroke-[1.8]" />;
    case 'museum-badge':
      return <Library size={18} className="stroke-[1.8]" />;
    case 'golf-course-pass':
      return <Flag size={18} className="stroke-[1.8]" />;
    case 'concert-ticket':
      return <Music size={18} className="stroke-[1.8]" />;
    default:
      return <Sparkles size={18} className="stroke-[1.8]" />;
  }
};

interface VariableInserterProps {
  currentValue: string;
  onUpdate: (val: string) => void;
  label?: string;
}

const VariableInserter: React.FC<VariableInserterProps> = ({ currentValue, onUpdate, label = 'Insert Variable Token' }) => {
  const [customVar, setCustomVar] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const insertToken = (token: string) => {
    const addition = `{{${token}}}`;
    const newVal = currentValue ? `${currentValue} ${addition}` : addition;
    onUpdate(newVal);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVar.trim()) return;
    const formatted = customVar.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    insertToken(formatted);
    setCustomVar('');
    setShowCustom(false);
  };

  return (
    <div className="mt-1.5 p-2 bg-emerald-50/40 border border-emerald-100/50 rounded-xl flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider select-none">
        <span className="flex items-center gap-1 text-emerald-800">
          <Sparkles size={10} className="fill-emerald-100/60 text-emerald-600" />
          {label}
        </span>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-stone-500 hover:text-emerald-700 font-extrabold transition uppercase"
        >
          {showCustom ? '× Cancel' : '+ custom placeholder'}
        </button>
      </div>

      {!showCustom ? (
        <div className="flex flex-wrap gap-1">
          {COMMON_VARIABLES.map((v) => (
            <button
              key={v.name}
              type="button"
              onClick={() => insertToken(v.name)}
              className="px-2 py-0.5 text-[9.5px] font-mono font-black text-emerald-700 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-100/80 rounded-lg cursor-pointer transition-all flex items-center shadow-3xs"
              title={`${v.label}: ${v.desc}`}
            >
              {"{{"}
              <span className="font-sans font-bold uppercase tracking-wide mx-0.5">{v.name}</span>
              {"}}"}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleAddCustom} className="flex items-center gap-1.5 mt-0.5 animate-enter">
          <input
            type="text"
            value={customVar}
            onChange={(e) => setCustomVar(e.target.value)}
            placeholder="e.g. DISCOUNT_CODE"
            className="px-2 py-1 text-[10px] bg-white border border-emerald-300 rounded-lg font-mono text-stone-800 grow focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-black"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 text-[9.5px] font-extrabold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition uppercase shadow-3xs cursor-pointer"
          >
            Insert
          </button>
        </form>
      )}
    </div>
  );
};

export const TicketEditor: React.FC<TicketEditorProps> = ({
  items,
  settings,
  onUpdateItems,
  onUpdateSettings,
  userTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  onApplyPreset,
}) => {
  const [designerMode, setDesignerMode] = useState<'simple' | 'pro'>('simple');
  const [activeTab, setActiveTab] = useState<'rows' | 'settings' | 'library' | 'pro'>('rows');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Switch tab safely when designer tier mode switches
  useEffect(() => {
    if (designerMode === 'simple' && activeTab === 'pro') {
      setActiveTab('rows');
    }
  }, [designerMode, activeTab]);

  // Sync state items list into JSON text area when not focused
  useEffect(() => {
    if (document.activeElement?.id !== 'raw-json-textarea-field') {
      try {
        setJsonText(JSON.stringify(items, null, 2));
      } catch (err) {
        // Safe fallback
      }
    }
  }, [items]);

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        onUpdateItems(parsed);
        setJsonError(null);
      } else {
        setJsonError('Layout blueprint Schema must be a valid array of modules.');
      }
    } catch (e: any) {
      setJsonError(`JSON Syntax Error: ${e.message}`);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Cannot format. JSON Syntax Error: ${e.message}`);
    }
  };

  // Function to inject pre-designed logical section recipes
  const handleInjectRecipe = (recipeType: 'brand-header' | 'transit-details' | 'fast-checkout' | 'coupon-footer') => {
    const timestamp = Date.now();
    let newItems: TicketItem[] = [];

    switch (recipeType) {
      case 'brand-header':
        newItems = [
          { id: `rec-${timestamp}-0`, type: 'dotted', spacingAfter: 8 },
          { id: `rec-${timestamp}-1`, type: 'header', text1: '★ DEEP COFFEE LAB ★', align: 'center', bold: true, spacingAfter: 4 },
          { id: `rec-${timestamp}-2`, type: 'subheader', text1: 'INNOVATION ROASTERS & BREW CO.', spacingAfter: 8 },
          { id: `rec-${timestamp}-3`, type: 'divider', spacingAfter: 8 },
        ];
        break;
      case 'transit-details':
        newItems = [
          { id: `rec-${timestamp}-0`, type: 'keyvalue', text1: 'ROUTE REGION', text2: 'EAST LINE EXPRESS', spacingAfter: 4 },
          { id: `rec-${timestamp}-1`, type: 'keyvalue', text1: 'DEPARTURE TIME', text2: '18:45 PM', spacingAfter: 4 },
          { id: `rec-${timestamp}-2`, type: 'keyvalue', text1: 'ASSIGNED GUEST', text2: '{{GUEST_NAME}}', spacingAfter: 4 },
          { id: `rec-${timestamp}-3`, type: 'columns', text1: 'GATE 04', text2: 'SEAT {{SEAT_NO}}', text3: 'CLASS A', spacingAfter: 8 },
        ];
        break;
      case 'fast-checkout':
        newItems = [
          { id: `rec-${timestamp}-0`, type: 'dotted', spacingAfter: 12 },
          { id: `rec-${timestamp}-1`, type: 'subheader', text1: 'SECURITY SCAN PASS', spacingAfter: 4 },
          { id: `rec-${timestamp}-2`, type: 'barcode', value: '{{TICKET_CODE}}', align: 'center', spacingAfter: 8 },
          { id: `rec-${timestamp}-3`, type: 'text', text1: 'Valid only on date of issue. Present physical voucher to terminal scanner.', size: 'sm', align: 'center', spacingAfter: 12 },
        ];
        break;
      case 'coupon-footer':
        newItems = [
          { id: `rec-${timestamp}-0`, type: 'divider', spacingAfter: 12 },
          { id: `rec-${timestamp}-1`, type: 'header', text1: '15% NEXT PURCHASE', align: 'center', bold: true, spacingAfter: 4 },
          { id: `rec-${timestamp}-2`, type: 'qrcode', value: 'https://ais.studio/loyalty-redeem', align: 'center', spacingAfter: 6 },
          { id: `rec-${timestamp}-3`, type: 'text', text1: 'Scan code above to claim points or register. Promo code: TX-9921.', size: 'sm', align: 'center', spacingAfter: 12 },
        ];
        break;
    }

    onUpdateItems([...items, ...newItems]);
  };

  // Drag & drop reactive state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Template Form State
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveCategory, setSaveCategory] = useState<'transit' | 'event' | 'retail' | 'utility'>('utility');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drag & drop state managers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...items];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    
    onUpdateItems(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Move items within array index safely
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onUpdateItems(updated);
  };

  // Duplicate layout module
  const duplicateItem = (item: TicketItem) => {
    const id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cloned = { ...JSON.parse(JSON.stringify(item)), id };
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex !== -1) {
      const updated = [...items];
      updated.splice(currentIndex + 1, 0, cloned);
      onUpdateItems(updated);
    } else {
      onUpdateItems([...items, cloned]);
    }
  };

  // Reset or clear all items
  const clearLayout = () => {
    if (confirmClear) {
      onUpdateItems([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => {
        setConfirmClear(false);
      }, 4000);
    }
  };

  const deleteItem = (id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  // Generic item property update handler
  const updateItemProp = (id: string, field: keyof TicketItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  // Add items of a specific element type
  const addItem = (type: TicketItemType) => {
    const id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let newItem: TicketItem = {
      id,
      type,
      spacingAfter: 4,
    };

    // Standard initial fields depending on item category
    switch (type) {
      case 'header':
        newItem = { ...newItem, text1: 'NEW SECTION TITLE', align: 'center', bold: true };
        break;
      case 'subheader':
        newItem = { ...newItem, text1: 'SUBTITLE / ACCESS CODE' };
        break;
      case 'text':
        newItem = { ...newItem, text1: 'Sample ticket details, rules, or disclaimer terms.', align: 'left', size: 'sm' };
        break;
      case 'keyvalue':
        newItem = { ...newItem, text1: 'DATE', text2: '2026-06-04' };
        break;
      case 'columns':
        newItem = { ...newItem, text1: 'Col 1', text2: 'Col 2', text3: 'Col 3' };
        break;
      case 'barcode':
        newItem = { ...newItem, value: 'BARCODE123', align: 'center' };
        break;
      case 'qrcode':
        newItem = { ...newItem, value: 'https://example.com', align: 'center' };
        break;
      case 'spacer':
        newItem = { ...newItem, value: '16' };
        break;
      default:
        break;
    }

    onUpdateItems([...items, newItem]);
    setExpandedItemId(id);
  };

  const getIconForType = (type: TicketItemType) => {
    switch (type) {
      case 'header': return <Heading1 size={14} className="text-amber-600" />;
      case 'subheader': return <Heading2 size={14} className="text-indigo-600" />;
      case 'text': return <Type size={14} className="text-emerald-600" />;
      case 'keyvalue': return <AlignJustify size={14} className="text-sky-600" />;
      case 'columns': return <Split size={14} className="text-fuchsia-600" />;
      case 'barcode': return <MoveVertical size={14} className="text-neutral-700" />;
      case 'qrcode': return <QrCode size={14} className="text-neutral-700" />;
      case 'dotted': return <span className="font-mono text-[9px] text-orange-500 font-extrabold">---</span>;
      case 'divider': return <span className="font-mono text-[9px] text-stone-800 font-extrabold">━━━</span>;
      case 'spacer': return <Maximize2 size={14} className="text-rose-500" />;
    }
  };

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  return (
    <div className="flex flex-col gap-6" id="designer-editor-root">
      {/* 1. Designer Utility Tier Selector Switcher */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold flex items-center gap-1.5 mb-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-md w-fit">
            <Sparkles size={11} className="fill-emerald-400" /> Platform Experience Dual-utility
          </span>
          <h3 className="text-sm font-black text-white tracking-tight uppercase">Designer Utility Tier</h3>
          <p className="text-[10.5px] text-stone-400 mt-1">
            Toggle tools between a clean drag-and-drop workspace or an advanced programmable pro console.
          </p>
        </div>
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
          {[
            { id: 'simple' as const, label: '🌱 Simple Mode', desc: 'No-code, simplified styling' },
            { id: 'pro' as const, label: '🛠️ Pro Mode', desc: 'Advanced controls, live blueprint checklists, and raw JSON editor' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setDesignerMode(mode.id);
                if (mode.id === 'simple') {
                  setActiveTab('rows');
                }
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                designerMode === mode.id
                  ? 'bg-emerald-600 text-white shadow font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
              title={mode.desc}
            >
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Structured Tabbed Controls Workspace Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col">
        {/* Modern Tabs Header Bar */}
        <div className="flex flex-col sm:flex-row border-b border-stone-200 bg-stone-50/50 p-1.5 gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('rows')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase rounded-xl transition-all grow justify-center cursor-pointer ${
              activeTab === 'rows'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/60 font-black'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/40'
            }`}
          >
            <FileText size={14} className="text-emerald-600" />
            <span>Layout Rows</span>
            <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ml-1">
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase rounded-xl transition-all grow justify-center cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/60 font-black'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/40'
            }`}
          >
            <Settings size={14} className="text-sky-600" />
            <span>Printer Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase rounded-xl transition-all grow justify-center cursor-pointer ${
              activeTab === 'library'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/60 font-black'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/40'
            }`}
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Design Library</span>
            {userTemplates.length > 0 && (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-1">
                {userTemplates.length}
              </span>
            )}
          </button>

          {designerMode === 'pro' && (
            <button
              type="button"
              onClick={() => setActiveTab('pro')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase rounded-xl transition-all grow justify-center cursor-pointer border relative ${
                activeTab === 'pro'
                  ? 'bg-stone-950 text-emerald-400 shadow-xs border-stone-950 font-black'
                  : 'text-stone-500 hover:text-stone-850 hover:bg-stone-100/40 border-dashed border-stone-300'
              }`}
            >
              <Code size={14} className={activeTab === 'pro' ? 'text-emerald-400 animate-pulse' : 'text-emerald-600'} />
              <span>Coder Tools</span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1 py-0.5 rounded-md font-mono scale-90 ml-1 font-black">
                PRO ACTIVE
              </span>
            </button>
          )}
        </div>

        {/* Dynamic Tab Body Frame */}
        <div className="p-6">
          
          {/* TAB 1: WORKBENCH ROWS */}
          {activeTab === 'rows' && (
            <div className="flex flex-col gap-6">
              
              {/* Insert design components organized by logical categorization */}
              <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/60 shadow-3xs">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-3.5 select-none">
                  + Snap Insert Quick Design Component Rows
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col gap-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700">🔤 Primary Text</span>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { type: 'header', label: 'Header Section Title', icon: <Heading1 size={11} /> },
                        { type: 'subheader', label: 'Subtitle Label Tag', icon: <Heading2 size={11} /> },
                        { type: 'text', label: 'Body Paragraph Text', icon: <Type size={11} /> },
                      ].map((btn) => (
                        <button
                          key={btn.type}
                          type="button"
                          id={`add-btn-${btn.type}`}
                          onClick={() => addItem(btn.type as any)}
                          className="flex items-center gap-2 text-left bg-stone-50 hover:bg-amber-50/40 hover:border-amber-300 border border-stone-200/60 p-2 rounded-lg text-xs font-bold transition-all text-stone-700 hover:text-stone-900 cursor-pointer active:scale-98 shadow-3xs"
                        >
                          <span className="text-amber-600">{btn.icon}</span>
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col gap-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-sky-700">📊 Columns & Tables</span>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { type: 'keyvalue', label: 'Standard Key-Value Row', icon: <AlignJustify size={11} /> },
                        { type: 'columns', label: '3-Column Data Grid', icon: <Split size={11} /> },
                      ].map((btn) => (
                        <button
                          key={btn.type}
                          type="button"
                          id={`add-btn-${btn.type}`}
                          onClick={() => addItem(btn.type as any)}
                          className="flex items-center gap-2 text-left bg-stone-50 hover:bg-sky-50/35 hover:border-sky-300 border border-stone-200/60 p-2 rounded-lg text-xs font-bold transition-all text-stone-700 hover:text-stone-900 cursor-pointer active:scale-98 shadow-3xs"
                        >
                          <span className="text-sky-600">{btn.icon}</span>
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col gap-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-pink-700">🔍 Separators & Scans</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { type: 'dotted', label: '--- Dotted Line' },
                        { type: 'divider', label: '━━━ Solid Line' },
                        { type: 'spacer', label: '+ Blank Gap' },
                        { type: 'barcode', label: 'Barcode' },
                        { type: 'qrcode', label: 'QR Vector' },
                      ].map((btn) => (
                        <button
                          key={btn.type}
                          type="button"
                          id={`add-btn-${btn.type}`}
                          onClick={() => addItem(btn.type as any)}
                          className="flex items-center justify-center text-center bg-stone-50 hover:bg-pink-50/40 hover:border-pink-300 border border-stone-200/60 p-1.5 rounded-lg text-[10px] font-extrabold tracking-tight transition-all text-stone-700 hover:text-stone-900 cursor-pointer active:scale-98 shadow-3xs"
                        >
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout builder list and dynamic accordion elements */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Live Dynamic Workbench</span>
                    <span className="text-[10px] bg-stone-100 px-2.5 py-0.5 border border-stone-200/65 text-stone-600 font-bold rounded-lg">{items.length} segments</span>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <button
                      type="button"
                      onClick={() => setExpandAll(!expandAll)}
                      className="text-[10px] uppercase font-black px-2.5 py-1 text-stone-500 border border-stone-200/80 bg-stone-50 hover:bg-stone-100 hover:text-stone-800 rounded-lg cursor-pointer transition-colors shadow-3xs"
                    >
                      {expandAll ? "Collapse All Cards" : "Expand All Cards"}
                    </button>
                    <button
                      type="button"
                      onClick={clearLayout}
                      className={`text-[10px] uppercase font-black rounded-lg px-2.5 py-1 transition-all cursor-pointer border shadow-3xs ${
                        confirmClear 
                          ? 'text-white bg-rose-600 border-rose-700 animate-pulse' 
                          : 'text-rose-605 hover:bg-rose-50 border-stone-200 bg-rose-50/30'
                      }`}
                    >
                      {confirmClear ? 'Confirm Wipe!' : 'Wipe Layout'}
                    </button>
                  </div>
                </div>

                {/* Vertical Workbench item loop */}
                <div className="flex flex-col gap-3.5 min-h-[160px] max-h-[640px] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="border border-dashed border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-stone-50/45">
                      <Sparkles size={24} className="text-stone-300 mb-2.5 animate-pulse" />
                      <span className="text-xs font-black text-stone-850 uppercase tracking-widest">No layout rows present</span>
                      <span className="text-[10px] text-stone-400 mt-1 max-w-[280px]">
                        Choose any component row above to begin laying out vectors.
                      </span>
                    </div>
                  ) : (
                    items.map((item, index) => {
                      const isDragged = index === draggedIndex;
                      const isDragOver = index === dragOverIndex;
                      const isExpanded = expandAll || expandedItemId === item.id;

                      // Renders descriptive summary text values for closed rows
                      const renderPreviewValue = () => {
                        switch (item.type) {
                          case 'header':
                            return <span className="font-bold text-stone-900 tracking-tight text-xs uppercase">{"★★ " + (item.text1 || 'Welcome Title') + " ★★"}</span>;
                          case 'subheader':
                            return <span className="font-bold text-indigo-700 text-[11px] uppercase tracking-wide">{item.text1 || 'Subtitle label'}</span>;
                          case 'text':
                            return <span className="text-stone-500 italic text-[11px] truncate max-w-[180px] sm:max-w-[320px]">{item.text1 || 'Disclaimer statement...'}</span>;
                          case 'keyvalue':
                            return (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-stone-800 font-bold">{item.text1 || 'KEY'}</span>
                                <span className="text-stone-350 font-mono">➡</span>
                                <span className="text-stone-600 font-mono font-medium">{item.text2 || 'Value'}</span>
                              </div>
                            );
                          case 'columns':
                            return (
                              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/40 select-none">
                                {`[${item.text1 || ''}]   [${item.text2 || ''}]   [${item.text3 || ''}]`}
                              </span>
                            );
                          case 'barcode':
                            return <span className="text-[10px] font-mono text-stone-650 uppercase bg-stone-100 border border-stone-200/50 px-1.5 py-0.5 rounded">█║▌ {item.value || '123'}</span>;
                          case 'qrcode':
                            return <span className="text-[10px] font-mono text-stone-650 uppercase bg-stone-100 border border-stone-200/50 px-1.5 py-0.5 rounded">⛶ QR Code Payload</span>;
                          case 'dotted':
                            return <span className="font-mono text-xs text-orange-500 tracking-wide select-none">---------------- Dotted separator</span>;
                          case 'divider':
                            return <span className="font-mono text-xs text-stone-800 font-bold select-none">━━━━━━━ Solid line divider</span>;
                          case 'spacer':
                            return <span className="text-[10.5px] font-bold text-rose-500">Spacer blank gap: {item.value || '12'}px</span>;
                          default:
                            return null;
                        }
                      };

                      return (
                        <div
                          key={item.id}
                          id={`editor-item-card-${item.id}`}
                          className={`border-2 rounded-2xl bg-white transition-all flex flex-col relative overflow-hidden ${
                            isDragged ? 'opacity-30 border-dashed border-stone-400 scale-[0.98] bg-stone-50' : 
                            isDragOver ? 'border-amber-500 scale-[1.01] shadow-md bg-amber-50/10' : 'border-stone-200/70 hover:border-stone-350 shadow-3xs'
                          }`}
                        >
                          {/* Item Top Bar Summary (Always visible) */}
                          <div className="flex items-center justify-between p-3.5 bg-stone-50 border-b border-stone-100 select-none">
                            <div className="flex items-center gap-1.5 grow min-w-0">
                              {/* Grab grip handle for HTML drag drop */}
                              <div 
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                title="Drag to reorder rows"
                                className="cursor-grab active:cursor-grabbing p-1.5 text-stone-400 hover:text-stone-850 hover:bg-stone-200/60 rounded"
                              >
                                <GripVertical size={14} />
                              </div>

                              {/* Tiny Badge depending on category */}
                              <div className="p-1 px-1.5 bg-white border border-stone-200/60 rounded-lg flex items-center gap-1 shrink-0 shadow-3xs">
                                {getIconForType(item.type)}
                                <span className="text-[8.5px] font-black text-stone-750 uppercase tracking-widest leading-none">
                                  {item.type}
                                </span>
                              </div>

                              {/* Output summary */}
                              <div className="truncate px-2 shrink grow min-w-0">
                                {renderPreviewValue()}
                              </div>
                            </div>

                            {/* Actions menu */}
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Reorder helpers */}
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveItem(index, 'up')}
                                className="p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-20 hover:border hover:border-stone-200 rounded-md cursor-pointer transition-colors"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={index === items.length - 1}
                                onClick={() => moveItem(index, 'down')}
                                className="p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-20 hover:border hover:border-stone-200 rounded-md cursor-pointer transition-colors"
                              >
                                <ArrowDown size={11} />
                              </button>
                              <span className="w-px h-3.5 bg-stone-200 mx-1"></span>

                              {/* Accordion Edit toggle */}
                              <button
                                type="button"
                                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                className={`p-1.5 px-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                  isExpanded 
                                    ? 'bg-stone-900 border-stone-950 text-white font-black' 
                                    : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200 hover:text-stone-900 shadow-3xs'
                                }`}
                              >
                                <Pencil size={10} />
                                <span className="text-[8.5px] uppercase font-black">{isExpanded ? 'Hide' : 'Configure'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => duplicateItem(item)}
                                className="p-1.5 rounded-lg text-stone-500 border border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900 cursor-pointer shadow-3xs"
                                title="Duplicate row module"
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 rounded-lg text-rose-600 border border-stone-200 bg-white hover:bg-rose-50 hover:border-rose-200 cursor-pointer shadow-3xs"
                                title="Delete row module"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded custom form for configuring fields */}
                          {isExpanded && (
                            <div className="p-4 bg-white border-t border-stone-100 animate-enter" id={`expanded-options-${item.id}`}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                {/* 1. SINGLE LABEL FIELDS */}
                                {(item.type === 'header' || item.type === 'subheader' || item.type === 'text') && (
                                  <div className="col-span-2 flex flex-col gap-1.5">
                                    <span className="text-[9.5px] font-bold text-stone-500 uppercase">Edit Text Output Value</span>
                                    <input
                                      type="text"
                                      value={item.text1 || ''}
                                      onChange={(e) => updateItemProp(item.id, 'text1', e.target.value)}
                                      className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 font-medium text-stone-800"
                                    />
                                    {/* Content suggestion chips */}
                                    <div className="flex flex-wrap gap-1 mt-1 select-none">
                                      {SUGGESTIONS[item.type as 'header' | 'subheader' | 'text']?.map((txt) => (
                                        <button
                                          key={txt}
                                          type="button"
                                          onClick={() => updateItemProp(item.id, 'text1', txt)}
                                          className="text-[9px] font-bold bg-stone-100 text-stone-500 hover:bg-stone-900 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
                                        >
                                          {txt}
                                        </button>
                                      ))}
                                    </div>
                                    <VariableInserter currentValue={item.text1 || ''} onUpdate={(val) => updateItemProp(item.id, 'text1', val)} />
                                  </div>
                                )}

                                {/* 2. KEY VALUE BLOCKS */}
                                {item.type === 'keyvalue' && (
                                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50/50 p-3.5 rounded-xl border border-stone-200 shadow-3xs">
                                    <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-stone-200/60 shadow-3xs">
                                      <span className="text-[9.5px] font-bold text-stone-500 uppercase font-mono">Key Label</span>
                                      <input
                                        type="text"
                                        value={item.text1 || ''}
                                        onChange={(e) => updateItemProp(item.id, 'text1', e.target.value)}
                                        className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none font-medium text-stone-800"
                                      />
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {SUGGESTIONS.keyValueLabel.slice(0, 4).map((txt) => (
                                          <button
                                            key={txt}
                                            type="button"
                                            onClick={() => updateItemProp(item.id, 'text1', txt)}
                                            className="text-[9px] font-bold bg-stone-50 hover:bg-stone-900 hover:text-white text-stone-500 px-1.5 py-0.5 rounded transition-colors"
                                          >
                                            {txt}
                                          </button>
                                        ))}
                                      </div>
                                      <VariableInserter currentValue={item.text1 || ''} onUpdate={(val) => updateItemProp(item.id, 'text1', val)} label="Insert Label Variable" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-stone-200/60 shadow-3xs">
                                      <span className="text-[9.5px] font-bold text-stone-500 uppercase font-mono">Value label</span>
                                      <input
                                        type="text"
                                        value={item.text2 || ''}
                                        onChange={(e) => updateItemProp(item.id, 'text2', e.target.value)}
                                        className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none font-semibold text-stone-800"
                                      />
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {SUGGESTIONS.keyValueValue.slice(0, 4).map((txt) => (
                                          <button
                                            key={txt}
                                            type="button"
                                            onClick={() => updateItemProp(item.id, 'text2', txt)}
                                            className="text-[9px] font-bold bg-stone-50 hover:bg-stone-900 hover:text-white text-stone-500 px-1.5 py-0.5 rounded transition-colors"
                                          >
                                            {txt}
                                          </button>
                                        ))}
                                      </div>
                                      <VariableInserter currentValue={item.text2 || ''} onUpdate={(val) => updateItemProp(item.id, 'text2', val)} label="Insert Value Variable" />
                                    </div>
                                  </div>
                                )}

                                {/* 3. COLUMNS ROW */}
                                {item.type === 'columns' && (
                                  <div className="col-span-2 flex flex-col gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                    {[
                                      { field: 'text1' as const, label: 'Column 1 (Left)' },
                                      { field: 'text2' as const, label: 'Column 2 (Center)' },
                                      { field: 'text3' as const, label: 'Column 3 (Right)' },
                                    ].map((col) => (
                                      <div key={col.field} className="flex flex-col gap-1.5 bg-white p-2.5 rounded-xl border border-stone-200/40">
                                        <span className="text-[9px] font-black text-stone-500 uppercase tracking-wider">{col.label}</span>
                                        <input
                                          type="text"
                                          value={item[col.field] || ''}
                                          onChange={(e) => updateItemProp(item.id, col.field, e.target.value)}
                                          className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none font-semibold text-stone-800"
                                        />
                                        <VariableInserter currentValue={item[col.field] || ''} onUpdate={(val) => updateItemProp(item.id, col.field, val)} label="Column Variable" />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* 4. BARCODE CODE */}
                                {item.type === 'barcode' && (
                                  <div className="col-span-2 flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-stone-500 uppercase font-mono">Barcode Value (Code39 Alphanumeric)</span>
                                    <input
                                      type="text"
                                      value={item.value || ''}
                                      onChange={(e) => updateItemProp(item.id, 'value', e.target.value)}
                                      className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none font-mono uppercase font-bold tracking-wider"
                                    />
                                    <VariableInserter currentValue={item.value || ''} onUpdate={(val) => updateItemProp(item.id, 'value', val)} label="Insert Code Variable" />
                                  </div>
                                )}

                                {/* 5. QR CODE LINK */}
                                {item.type === 'qrcode' && (
                                  <div className="col-span-2 flex flex-col gap-1.5 font-mono">
                                    <span className="text-[10px] font-bold text-stone-500 uppercase font-sans">QR Payload Link / Coupon URL</span>
                                    <input
                                      type="text"
                                      value={item.value || ''}
                                      onChange={(e) => updateItemProp(item.id, 'value', e.target.value)}
                                      className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
                                    />
                                    <VariableInserter currentValue={item.value || ''} onUpdate={(val) => updateItemProp(item.id, 'value', val)} label="Insert QR Variable" />
                                  </div>
                                )}

                                {/* 6. SPACER DEPTH */}
                                {item.type === 'spacer' && (
                                  <div className="col-span-2 flex flex-col gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase select-none">
                                      <span>Spacer Blank Padding Height</span>
                                      <span className="font-bold text-stone-850 font-mono">{item.value || '12'}px</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="4"
                                      max="80"
                                      step="2"
                                      value={parseInt(item.value || '12', 10)}
                                      onChange={(e) => updateItemProp(item.id, 'value', e.target.value)}
                                      className="w-full h-1 bg-stone-200 accent-stone-800 rounded-lg cursor-pointer"
                                    />
                                  </div>
                                )}

                                {/* Styling adjustments ONLY and display options inside Pro Mode */}
                                {designerMode === 'pro' && (item.type === 'header' || item.type === 'text' || item.type === 'keyvalue') && (
                                  <div className="col-span-2 flex flex-wrap items-center gap-4 mt-2 pt-3 border-t border-stone-105">
                                    {/* Size Select for standard tags */}
                                    {item.type === 'text' && (
                                      <div className="flex flex-col gap-1 bg-stone-50 p-2 rounded-xl border border-stone-200">
                                        <span className="text-[8.5px] font-black text-stone-400 uppercase select-none">Size Factor</span>
                                        <div className="flex gap-0.5 bg-stone-200/50 p-0.5 rounded-lg select-none">
                                          {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                                            <button
                                              key={sz}
                                              type="button"
                                              onClick={() => updateItemProp(item.id, 'size', sz)}
                                              className={`px-2 py-0.5 text-[9px] font-black uppercase rounded cursor-pointer ${
                                                (item.size || 'md') === sz ? 'bg-white text-stone-900 shadow-3xs' : 'text-stone-400 hover:text-stone-800'
                                              }`}
                                            >
                                              {sz}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Left/Center/Right Align for titles and bodies */}
                                    {(item.type === 'header' || item.type === 'text') && (
                                      <div className="flex flex-col gap-1 bg-stone-50 p-2 rounded-xl border border-stone-200">
                                        <span className="text-[8.5px] font-black text-stone-400 uppercase select-none">Alignment</span>
                                        <div className="flex gap-0.5 bg-stone-200/50 p-0.5 rounded-lg select-none">
                                          {([
                                            { align: 'left', icon: <AlignLeft size={10} /> },
                                            { align: 'center', icon: <AlignCenter size={10} /> },
                                            { align: 'right', icon: <AlignRight size={10} /> },
                                          ] as const).map(({ align, icon }) => (
                                            <button
                                              key={align}
                                              type="button"
                                              title={`Align ${align}`}
                                              onClick={() => updateItemProp(item.id, 'align', align)}
                                              className={`p-1 select-none rounded cursor-pointer ${
                                                (item.align || 'left') === align ? 'bg-white text-stone-900 shadow-3xs' : 'text-stone-400 hover:text-stone-800'
                                              }`}
                                            >
                                              {icon}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Bold modifiers and double height/weight toggles */}
                                    <div className="flex flex-col gap-1 bg-stone-50 p-2 rounded-xl border border-stone-200">
                                      <span className="text-[8.5px] font-black text-stone-400 uppercase select-none">Double Sizing Modifiers</span>
                                      <div className="flex items-center gap-3 p-1 select-none font-bold">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-stone-600 uppercase select-none">
                                          <input
                                            type="checkbox"
                                            checked={item.bold || false}
                                            onChange={(e) => updateItemProp(item.id, 'bold', e.target.checked)}
                                            className="rounded border-stone-300 w-3 h-3 text-stone-900 accent-stone-700"
                                          />
                                          <span>Bold</span>
                                        </label>

                                        {item.type === 'header' && (
                                          <>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-stone-600 uppercase select-none">
                                              <input
                                                type="checkbox"
                                                checked={item.doubleHeight || false}
                                                onChange={(e) => updateItemProp(item.id, 'doubleHeight', e.target.checked)}
                                                className="rounded border-stone-300 w-3 h-3 text-stone-900 accent-stone-700"
                                              />
                                              <span>2xH</span>
                                            </label>

                                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-stone-600 uppercase select-none">
                                              <input
                                                type="checkbox"
                                                checked={item.doubleWidth || false}
                                                onChange={(e) => updateItemProp(item.id, 'doubleWidth', e.target.checked)}
                                                className="rounded border-stone-300 w-3 h-3 text-stone-900 accent-stone-700"
                                              />
                                              <span>2xW</span>
                                            </label>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Row margin details adjuster ONLY for Pro users */}
                                {designerMode === 'pro' && (
                                  <div className="col-span-2 flex items-center justify-between border-t border-stone-100 pt-3 mt-1">
                                    <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-wider">Feed spacing margin below segment row</span>
                                    <div className="flex items-center gap-1 bg-stone-100 p-0.5 border border-stone-200/50 rounded-lg">
                                      {[0, 2, 4, 8, 12, 16].map((spacing) => (
                                        <button
                                          key={spacing}
                                          type="button"
                                          onClick={() => updateItemProp(item.id, 'spacingAfter', spacing)}
                                          className={`px-3 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                                            (item.spacingAfter ?? 4) === spacing ? 'bg-stone-900 text-white shadow-3xs font-mono font-black' : 'text-stone-550 hover:text-stone-900'
                                          }`}
                                        >
                                          {spacing}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINTER CONFIG SETUP */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter" id="printer-settings-container">
              {/* Width choice and font variant dropdown */}
              <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-4 shadow-3xs">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block mb-1">
                  📐 Dimension & Typeface Controls
                </span>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-stone-550 uppercase">Roll Width Configuration</label>
                  <p className="text-[10px] text-stone-405 leading-normal">Sets the page diameter bounding box for the thermal ticket.</p>
                  <div className="grid grid-cols-2 gap-1.5 bg-stone-100 p-1 rounded-xl mt-1 select-none border border-stone-200">
                    {(['58mm', '80mm'] as PaperWidth[]).map((w) => (
                      <button
                        key={w}
                        type="button"
                        id={`width-selector-${w}`}
                        onClick={() => onUpdateSettings({ ...settings, paperWidth: w })}
                        className={`py-2 text-xs font-black rounded-lg text-center cursor-pointer transition-all ${
                          settings.paperWidth === w
                            ? 'bg-white text-stone-900 shadow-2xs'
                            : 'text-stone-500 hover:text-stone-850'
                        }`}
                      >
                        {w} Form factor
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-black text-stone-550 uppercase">Fixed Typographic Font Variant</label>
                  <select
                    value={settings.fontVariant}
                    onChange={(e) => onUpdateSettings({ ...settings, fontVariant: e.target.value as FontVariant })}
                    className="p-2 py-2.5 text-xs bg-white border border-stone-200 rounded-xl font-medium text-stone-800 cursor-pointer block focus:outline-none"
                  >
                    <option value="retro-draft">Retro Draft (Classic Dot-Matrix Caps)</option>
                    <option value="clean-mono">Clean Tabular Mono (Perfect columns aligned)</option>
                    <option value="vintage-serif">Vintage Luxury Serif face</option>
                    <option value="modern-sans">Modern Minimal Sans-serif face</option>
                  </select>
                </div>
              </div>

              {/* Thermal density intensity and toggle settings */}
              <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-4 shadow-3xs">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block mb-1">
                  🔥 Thermal Intensity Controls
                </span>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center select-none font-bold">
                    <label className="text-[10px] font-black text-stone-550 uppercase">Print density Burn heat</label>
                    <span className="text-xs font-mono font-black text-stone-900">Heat {settings.intensity} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={settings.intensity}
                    onChange={(e) => onUpdateSettings({ ...settings, intensity: parseInt(e.target.value, 10) })}
                    className="w-full h-1 bg-stone-200 rounded-lg accent-stone-800 cursor-pointer"
                  />
                  <span className="text-[9.5px] text-stone-450 leading-tight">Controls monochrome high black contrast scaling. Raise value if prints appear weak or faded physically.</span>
                </div>

                <div className="flex flex-col gap-2.5 pt-2 mb-1 border-t border-stone-200/50 animate-enter">
                  {[
                    { key: 'dottedDividers' as const, label: 'Dotted Key-Value Link Connectors', desc: 'Embeds dots connecting list titles with data columns' },
                    { key: 'showCutLine' as const, label: 'Render Tear-Away Guidelines', desc: 'Adds scissor guides showing roll division limits' },
                    { key: 'paperTexture' as const, label: 'Simulate Faded Paper Noise Grains', desc: 'Renders organic thermal paper patterns on screen' },
                    { key: 'denseLayout' as const, label: 'Compact Margins Padding', desc: 'Saves paper by compressing vertically' },
                  ].map((chk) => (
                    <label key={chk.key} className="flex items-start gap-2.5 cursor-pointer select-none py-0.5">
                      <input
                        type="checkbox"
                        checked={settings[chk.key]}
                        onChange={(e) => onUpdateSettings({ ...settings, [chk.key]: e.target.checked })}
                        className="rounded border-stone-300 w-3.5 h-3.5 text-stone-900 accent-stone-800 mt-0.5"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-stone-755">{chk.label}</span>
                        <span className="text-[9px] text-stone-400 mt-0.5">{chk.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESIGN snapshots library */}
          {activeTab === 'library' && (
            <div className="flex flex-col gap-6 animate-enter" id="design-library-container">
              {/* Presets/Scenarios on the top */}
              <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/90 shadow-3xs flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-stone-850 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                    <span>Preset Ticket Scenarios</span>
                  </h3>
                  <p className="text-[10px] text-stone-450 mt-1">Load fully configured vector layouts and simulated ticket receipts instantly.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PASS_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 bg-white hover:bg-stone-50/50 border rounded-xl border-stone-200/80 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-3xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-stone-100 text-stone-600 rounded-lg shrink-0 flex items-center justify-center">
                          {getPresetIcon(preset.id)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-stone-800 truncate block uppercase leading-tight">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-stone-400 mt-1 capitalize font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-stone-300 rounded-full inline-block"></span>
                            {preset.category}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyPreset(preset)}
                        className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/60 hover:bg-amber-600 hover:border-amber-600 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer shrink-0 transition-all active:scale-[0.98]"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-150 pb-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-stone-850 tracking-wider">Saved Layout Snapshots Shelf</h3>
                  <p className="text-[10px] text-stone-450 mt-1">Saves layout snapshots on your local computer.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="px-4 py-2 font-black uppercase text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-605 hover:text-white border border-emerald-200 rounded-xl cursor-pointer transition-all shadow-3xs"
                >
                  {showSaveForm ? 'Cancel Form ▴' : 'Save As Snapshot ▾'}
                </button>
              </div>

              {/* Snapshot compose forms */}
              {showSaveForm && (
                <div className="p-5 bg-stone-50 border border-stone-205 rounded-2xl flex flex-col gap-3.5 animate-enter shadow-3xs" id="save-snapshot-form">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-800 block">Snapshot profile details</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 select-none">
                      <label className="text-[8.5px] font-bold text-stone-400 uppercase">Snapshot Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Cinema Vibe A-12"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-extrabold uppercase text-stone-800"
                        maxLength={35}
                      />
                    </div>
                    <div className="flex flex-col gap-1 select-none">
                      <label className="text-[8.5px] font-bold text-stone-400 uppercase">Category</label>
                      <select
                        value={saveCategory}
                        onChange={(e) => setSaveCategory(e.target.value as any)}
                        className="p-1 px-[10px] py-1.5 text-xs bg-white border border-stone-205 rounded-lg focus:outline-none font-semibold text-stone-800"
                      >
                        <option value="transit">Transit Ticket / Pass</option>
                        <option value="event">Admission Voucher Card</option>
                        <option value="retail">Retail Receipt Slip</option>
                        <option value="utility">Utility label tag</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8.5px] font-bold text-stone-404 uppercase">Short description</label>
                    <input
                      type="text"
                      placeholder="e.g. Cinema ticket snapshot containing access code grids and dynamic QR scanner code"
                      value={saveDesc}
                      onChange={(e) => setSaveDesc(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-800 font-medium"
                      maxLength={80}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-stone-200/40 select-none">
                    {saveSuccess ? (
                      <span className="text-emerald-600 font-bold text-[10px] animate-pulse">✓ Saved profile in bookshelf!</span>
                    ) : (
                      <span className="text-[9.5px] text-stone-450">Saved locally in local storage persistence.</span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!saveName.trim()) {
                          alert('Please provide a layout template name first.');
                          return;
                        }
                        onSaveTemplate(saveName, saveDesc, saveCategory);
                        setSaveName('');
                        setSaveDesc('');
                        setSaveSuccess(true);
                        setTimeout(() => {
                          setSaveSuccess(false);
                          setShowSaveForm(false);
                        }, 2000);
                      }}
                      className="px-4.5 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold rounded-lg text-[10px] uppercase cursor-pointer"
                    >
                      Save Now
                    </button>
                  </div>
                </div>
              )}

              {/* User saved template elements */}
              {userTemplates.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-stone-505">No custom templates logged</span>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-[325px]">Assembled an amazing layout? Preserving it as a custom template will log it here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="custom-saved-templates-card">
                  {userTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-4 bg-stone-55 hover:bg-white border rounded-2xl hover:border-emerald-400 border-stone-200/80 transition-all flex justify-between items-start"
                    >
                      <div className="flex flex-col gap-1 grow min-w-0 pr-3">
                        <span className="text-xs font-black text-stone-800 truncate uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          {tpl.name}
                        </span>
                        <span className="text-[9.5px] bg-stone-200 text-stone-600 uppercase font-mono tracking-wider px-1.5 py-0.5 rounded mt-1 w-fit select-none">
                          {tpl.category} template
                        </span>
                        {tpl.description && <span className="text-[10px] text-stone-450 mt-1.5 italic line-clamp-2 leading-normal">{tpl.description}</span>}
                      </div>

                      <div className="flex gap-2 shrink-0 select-none">
                        <button
                          type="button"
                          onClick={() => onApplyPreset(tpl)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-100 rounded-lg text-[10px] uppercase font-black transition-all cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={(e) => onDeleteTemplate(tpl.id, e)}
                          className="p-1 px-[7px] text-rose-500 hover:bg-rose-50 border border-transparent rounded-lg hover:border-rose-100 transition-all cursor-pointer"
                          title="Delete layout Snapshot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DEVELOPER raw CODER UTILITIES */}
          {activeTab === 'pro' && designerMode === 'pro' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-enter" id="experience-utility-sidebar">
              
              {/* Raw JSON console editing blocks */}
              <div className="bg-stone-900 border border-stone-850 text-stone-100 rounded-3xl p-5 shadow-lg flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-850 shrink-0">
                  <div className="flex items-center gap-2 select-none">
                    <FileJson size={17} className="text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono">Blueprint JSON Editor</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-[9px] font-black uppercase text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2 py-1 border border-stone-700 rounded transition-all cursor-pointer"
                  >
                    Format schema
                  </button>
                </div>

                <div className="relative flex-1 flex flex-col min-h-0 bg-stone-950 rounded-xl border border-stone-850 p-2 font-mono text-[11px]">
                  <textarea
                    id="raw-json-textarea-field"
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="flex-1 w-full h-full bg-transparent resize-none outline-none overflow-y-auto leading-relaxed text-emerald-300 font-mono tracking-wide p-1 focus:text-white"
                    spellCheck="false"
                  />
                </div>

                {/* Status messages validation panel */}
                <div className="mt-3.5 shrink-0 select-none">
                  {jsonError ? (
                    <div className="p-2.5 bg-rose-950/40 border border-rose-905 text-rose-300 text-[10px] rounded-xl flex items-start gap-1.5 animate-pulse">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5 text-rose-400" />
                      <span className="font-mono break-all leading-tight">{jsonError}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-[9.5px] rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                      <span>✓ Valid blueprint JSON compilation success</span>
                    </div>
                  )}
                </div>

                {/* Console actions */}
                <div className="grid grid-cols-2 gap-2 mt-3.5 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(jsonText);
                      alert('Saved RAW JSON blueprint snap copied to clipboard!');
                    }}
                    className="px-3 py-2 text-center text-[10px] font-bold uppercase bg-stone-800 over:bg-stone-700 text-stone-200 hover:text-white rounded-xl border border-stone-750 cursor-pointer shadow-3xs"
                  >
                    Copy JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Wipe elements and start fresh?')) {
                        onUpdateItems([]);
                      }
                    }}
                    className="px-3 py-2 text-center text-[10px] font-bold uppercase bg-rose-950/40 hover:bg-rose-900/40 text-rose-350 rounded-xl border border-rose-900/45 cursor-pointer shadow-3xs"
                  >
                    Wipe Schema
                  </button>
                </div>
              </div>

              {/* Checklist Audits & Recipe injections combo panel */}
              <div className="flex flex-col gap-4">
                
                {/* audit report checklists */}
                <div className="bg-stone-50/50 border border-stone-200 p-5 rounded-3xl flex flex-col gap-3 shadow-3xs">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-stone-200">
                    <Gauge size={15} className="text-indigo-650" />
                    <span className="text-[10px] font-black uppercase text-stone-800 tracking-wider">Design Audit Assistant Report</span>
                  </div>

                  <div className="flex flex-col gap-3 select-none">
                    {/* Checklists rows headers */}
                    {[
                      {
                        pass: items.some(i => i.type === 'header'),
                        title: 'Corporate branding stamp set',
                        passTip: 'Heading banner detected at the base or header.',
                        failTip: 'Highly recommended: Add Header Title row to print details.',
                      },
                      {
                        pass: items.some(i => i.type === 'barcode' || i.type === 'qrcode'),
                        title: 'Interactive scanner elements',
                        passTip: 'Scannable barcode or QR code layout row deployed.',
                        failTip: 'Thermal tickets usually contain barcodes for fast gate scanner checks.',
                      },
                      {
                        pass: items.some(i => i.type === 'text' && (i.size === 'sm' || i.align === 'center')),
                        title: 'Terms disclaimer fine-prints',
                        passTip: 'Footer rules disclaimer has been written and defined.',
                        failTip: 'Consider inserting small text rows detailing return/admission terms.',
                      },
                      {
                        pass: items.length <= 11,
                        title: 'Receipt height budget footprint',
                        passTip: 'Eco-friendly ticket height roll space allocation.',
                        failTip: 'Very long receipt! Minimize spacer gaps or static dividers.',
                      }
                    ].map((row, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2 select-none">
                        {row.pass ? (
                          <span className="text-emerald-705 bg-emerald-50 p-0.5 rounded-full mt-0.5 shrink-0 flex items-center justify-center">
                            <CheckCircle2 size={11} className="text-emerald-700" />
                          </span>
                        ) : (
                          <span className="text-stone-400 bg-stone-100 p-0.5 rounded-full mt-0.5 shrink-0 flex items-center justify-center">
                            <HelpCircle size={11} />
                          </span>
                        )}
                        <div className="flex flex-col leading-tight grow min-w-0">
                          <span className="text-[11px] font-bold text-stone-850">{row.title}</span>
                          <span className="text-[9.5px] text-stone-400 mt-1 leading-normal">
                            {row.pass ? row.passTip : row.failTip}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Combo block layout recipe injector */}
                <div className="bg-stone-50/50 border border-stone-205 p-5 rounded-3xl flex flex-col gap-3 shadow-3xs">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb size={15} className="text-amber-500 fill-amber-100 animate-pulse animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-stone-805 tracking-wider">Multi-component block Recipes</span>
                  </div>

                  <span className="text-[9.5px] text-stone-400 leading-relaxed block leading-normal select-none">
                    Append precompiled ready-to-run receipt modules with single-tap insertions:
                  </span>

                  <div className="flex flex-col gap-2.5">
                    {[
                      { icon: '☕', recipe: 'brand-header' as const, label: 'Deep Coffee branding Stamp', subText: 'Header title + Subheading + dotted division separators' },
                      { icon: '🎫', recipe: 'transit-details' as const, label: 'Standard Ticket booking details table', subText: 'Insert fields variables: GUEST_NAME, SEAT_NO, GATE' },
                      { icon: '📊', recipe: 'fast-checkout' as const, label: 'Scannable Checkout Code39 Footer', subText: 'Dotted dividers + Pass TICKET_CODE barcode' },
                      { icon: '🎁', recipe: 'coupon-footer' as const, label: 'Voucher Discount QR loyalty block', subText: 'Solid line + redeem QR + terms fine-disclaimers' },
                    ].map((row) => (
                      <button
                        key={row.recipe}
                        type="button"
                        onClick={() => handleInjectRecipe(row.recipe)}
                        className="flex items-center justify-between p-2.5 text-left bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-3xs"
                      >
                        <div className="flex flex-col pr-1 select-none grow min-w-0">
                          <span className="text-[10.5px] font-bold text-stone-850 group-hover:text-emerald-850 truncate leading-none">
                            {row.icon} {row.label}
                          </span>
                          <span className="text-[9px] text-stone-400 mt-1.5 truncate leading-tight">{row.subText}</span>
                        </div>
                        <ArrowUpRight size={12} className="text-stone-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
