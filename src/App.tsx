import React, { useState, useEffect } from 'react';
import { TicketItem, PrinterSettings, TicketPreset } from './types';
import { PASS_PRESETS } from './utils/presets';
import { ThermalSimulator } from './components/ThermalSimulator';
import { TicketEditor } from './components/TicketEditor';
import { LandingPage } from './components/LandingPage';
import { SavedTemplatesPage } from './components/SavedTemplatesPage';
import { 
  Printer, 
  Sparkles, 
  HelpCircle, 
  Info, 
  Laptop,
  Film,
  Plane,
  Coffee,
  Car,
  Library,
  Flag,
  Music,
  Home
} from 'lucide-react';

const STORAGE_KEYS = {
  ITEMS: 'thermal_pass_items_v1',
  SETTINGS: 'thermal_pass_settings_v1',
};

// Map preset ID to appropriate Lucide icon
const getPresetIcon = (id: string) => {
  switch (id) {
    case 'cinema-ticket':
      return <Film size={20} className="stroke-[1.8]" />;
    case 'boarding-pass':
      return <Plane size={20} className="stroke-[1.8]" />;
    case 'cafe-receipt':
      return <Coffee size={20} className="stroke-[1.8]" />;
    case 'parking-ticket':
      return <Car size={20} className="stroke-[1.8]" />;
    case 'museum-badge':
      return <Library size={20} className="stroke-[1.8]" />;
    case 'golf-course-pass':
      return <Flag size={20} className="stroke-[1.8]" />;
    case 'concert-ticket':
      return <Music size={20} className="stroke-[1.8]" />;
    default:
      return <Sparkles size={20} className="stroke-[1.8]" />;
  }
};

// Default setup fallback (Retro Cinema Ticket)
const DEFAULT_PRESET = PASS_PRESETS[0];

export default function App() {
  const [items, setItems] = useState<TicketItem[]>([]);
  const [settings, setSettings] = useState<PrinterSettings>({
    paperWidth: '80mm',
    fontVariant: 'retro-draft',
    intensity: 4,
    showCutLine: true,
    dottedDividers: true,
    denseLayout: false,
    paperTexture: true,
  });

  const [faqOpen, setFaqOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'workbench' | 'saved-templates'>('landing');

  // Custom User Saved Templates list
  const [userTemplates, setUserTemplates] = useState<TicketPreset[]>([]);

  // Load user templates on mount
  useEffect(() => {
    const saved = localStorage.getItem('thermal_user_templates_v2');
    if (saved) {
      try {
        setUserTemplates(JSON.parse(saved));
      } catch (e) {
        setUserTemplates([]);
      }
    }
  }, []);

  // Save current items & settings state as a custom template
  const handleSaveTemplate = (name: string, description: string, category: 'transit' | 'event' | 'retail' | 'utility') => {
    const newTemplate: TicketPreset = {
      id: `usr-tpl-${Date.now()}`,
      name,
      description,
      category,
      items: JSON.parse(JSON.stringify(items)),
      settings: JSON.parse(JSON.stringify(settings)),
    };
    const updated = [newTemplate, ...userTemplates];
    setUserTemplates(updated);
    localStorage.setItem('thermal_user_templates_v2', JSON.stringify(updated));
  };

  // Delete a saved template
  const handleDeleteTemplate = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (window.confirm('Are you sure you want to delete this custom template?')) {
      const updated = userTemplates.filter(t => t.id !== id);
      setUserTemplates(updated);
      localStorage.setItem('thermal_user_templates_v2', JSON.stringify(updated));
    }
  };

  // Apply a scenario preset
  const handleApplyPreset = (preset: TicketPreset) => {
    setItems(JSON.parse(JSON.stringify(preset.items)));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(preset.items));
    if (preset.settings) {
      const updated = {
        ...settings,
        ...preset.settings,
      };
      setSettings(updated);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    setCurrentView('workbench');
  };

  // Hydrate states from local storage upon initial boot
  useEffect(() => {
    const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        setItems(JSON.parse(JSON.stringify(DEFAULT_PRESET.items)));
      }
    } else {
      setItems(JSON.parse(JSON.stringify(DEFAULT_PRESET.items)));
    }

    if (savedSettings) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) {
        // use default
      }
    } else if (DEFAULT_PRESET.settings) {
      setSettings((prev) => ({ ...prev, ...DEFAULT_PRESET.settings }));
    }
  }, []);

  // Write changes back to localStorage
  const handleUpdateItems = (newItems: TicketItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(newItems));
  };

  const handleUpdateSettings = (newSettings: PrinterSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  };

  return (
    <div className="min-h-screen bg-stone-100/45 text-stone-900 selection:bg-stone-900 selection:text-white" id="root-layout">
      {currentView === 'landing' && (
        <LandingPage
          onStartBlank={() => setCurrentView('workbench')}
          onApplyPreset={handleApplyPreset}
          getPresetIcon={getPresetIcon}
          userTemplates={userTemplates}
          onDeleteTemplate={handleDeleteTemplate}
          onViewTemplates={() => setCurrentView('saved-templates')}
        />
      )}

      {currentView === 'saved-templates' && (
        <SavedTemplatesPage
          userTemplates={userTemplates}
          onApplyTemplate={(tpl) => {
            handleApplyPreset(tpl);
            setCurrentView('workbench');
          }}
          onDeleteTemplate={handleDeleteTemplate}
          onUpdateTemplatesList={(tpls) => {
            setUserTemplates(tpls);
          }}
          onAddBlankAndGo={() => {
            setItems([]);
            localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
            setCurrentView('workbench');
          }}
          onGoBack={() => setCurrentView('landing')}
          getPresetIcon={getPresetIcon}
        />
      )}

      {currentView === 'workbench' && (
        <>
          {/* 1. Header Navigation Guard */}
          <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-950 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <Printer size={22} className="stroke-[2]" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-stone-950 uppercase">PassGen</h1>
                  <p className="text-xs font-medium text-stone-500">Vector pass, ticket & coupon designer for thermal receipt printers</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 border border-stone-200/40 cursor-pointer transition-all"
                  id="back-to-home-btn"
                >
                  <Home size={14} />
                  <span>Home Landing</span>
                </button>
                <button
                  onClick={() => setCurrentView('saved-templates')}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 cursor-pointer transition-all"
                  id="view-saved-btn"
                >
                  <Library size={13} />
                  <span>Your Saved Studio ({userTemplates.length})</span>
                </button>
                <button
                  id="faq-toggle-button"
                  onClick={() => setFaqOpen(!faqOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/40 cursor-pointer transition-all"
                >
                  <HelpCircle size={14} />
                  <span>Printer Setup Guide</span>
                </button>
              </div>
            </div>
          </header>

          {/* 2. Interactive Page Banner Instructions */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Dynamic FAQ Setup Panel info block */}
            {faqOpen && (
              <div className="mb-8 p-6 bg-white border border-stone-200 rounded-3xl animate-enter" id="guide-info-box">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="text-stone-700 animate-pulse" size={18} />
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-tight">Thermal Printer Web Config Guide</h3>
                  </div>
                  <button
                    onClick={() => setFaqOpen(false)}
                    className="text-xs font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600 font-normal leading-relaxed">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <h4 className="font-bold text-stone-800 mb-2 uppercase">1. Machine Settings</h4>
                    <p>
                      Connect your 58mm or 80mm POS USB/Bluetooth printer. Set the default paper width in your computer's OS Control Panel to match your physical paper (common values: 58mm x Receipt, 80mm x Roll).
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <h4 className="font-bold text-stone-800 mb-2 uppercase">2. Print Dialog Tweaks</h4>
                    <p>
                      In the system browser print dialog, select your thermal printer, set the scale to <span className="font-semibold text-stone-950">100%</span>, and <span className="font-semibold text-stone-950">Uncheck "Headers & Footers"</span> to avoid unwanted URL margins.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <h4 className="font-bold text-stone-800 mb-2 uppercase">3. High-Contrast Output</h4>
                    <p>
                      Thermal printers apply heat to black-reactive paper. This app renders pure-monochrome SVGs with vector sharpness. Increase the contrast "Print Density" slider if the physically printed output is too light.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Main Design Grid Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Panel: Pass Components Editor (7 columns on desktop) */}
              <section className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1" id="workspace-controls-column">
                <TicketEditor
                  items={items}
                  settings={settings}
                  onUpdateItems={handleUpdateItems}
                  onUpdateSettings={handleUpdateSettings}
                  userTemplates={userTemplates}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onApplyPreset={handleApplyPreset}
                />
              </section>

              {/* Right Panel: Live Desk Simulator (5 columns on desktop) */}
              <section className="lg:col-span-5 flex flex-col items-center order-1 lg:order-2 sticky top-24" id="workspace-simulator-column">
                <div className="w-full bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
                  <div className="flex items-center gap-1 text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 justify-between w-full">
                    <span>Real-Time Feed Preview</span>
                    <span className="flex items-center gap-1 text-emerald-600 lowercase bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                      <Laptop size={10} />
                      POS WYSIWYG
                    </span>
                  </div>
                  <ThermalSimulator
                    items={items}
                    settings={settings}
                  />
                </div>
              </section>
            </div>
          </main>

          {/* 4. Soft Footer Credits */}
          <footer className="mt-20 py-8 border-t border-stone-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-xs text-stone-400 font-medium">
                Thermal Pass Creator • Crafted with vectors suited for direct black-and-white thermal thermal POS heads.
              </p>
              <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-stone-500 font-medium">
                <span>Esc/POS standard vectors</span>
                <span>•</span>
                <span>No ink needed</span>
                <span>•</span>
                <span>Instant native web printing</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
