import React from 'react';
import { TicketPreset } from '../types';
import { PASS_PRESETS } from '../utils/presets';
import { 
  Printer, Sparkles, ArrowRight, Layers, FileText, CheckCircle2, 
  Settings, Scissors, QrCode, Monitor, ChevronRight, Zap, Trash2
} from 'lucide-react';

interface LandingPageProps {
  onStartBlank: () => void;
  onApplyPreset: (preset: TicketPreset) => void;
  getPresetIcon: (id: string) => React.ReactNode;
  userTemplates: TicketPreset[];
  onDeleteTemplate: (id: string, e: React.MouseEvent) => void;
  onViewTemplates: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBlank,
  onApplyPreset,
  getPresetIcon,
  userTemplates,
  onDeleteTemplate,
  onViewTemplates,
}) => {
  return (
    <div className="min-h-screen bg-stone-100/40 text-stone-900 flex flex-col font-sans" id="landing-container">
      {/* 1. Header Hero Panel */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-950 text-white rounded-xl flex items-center justify-center">
              <Printer size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-stone-950 uppercase">PassGen</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onViewTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-transparent rounded-xl transition-all cursor-pointer"
            >
              <span>Saved Layouts ({userTemplates.length})</span>
            </button>
            <button
              onClick={onStartBlank}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-stone-850 hover:bg-stone-50 border border-stone-200 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <span>Open Workbench</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column info copywriting */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-200/50 text-stone-800 rounded-full text-[10px] font-bold tracking-wider uppercase border border-stone-200">
            <Zap size={11} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span>Pure Vector Thermal ticket Designer</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 uppercase tracking-tight leading-[0.95]">
            NO INK.<br />
            JUST PHYSICS &amp;<br />
            <span className="text-stone-500">EXQUISITE CODE.</span>
          </h1>

          <p className="text-sm md:text-base text-stone-500 max-w-lg leading-relaxed font-normal">
            Design beautiful high-contrast vouchers, passes, tickets, and luxury labels. 
            Built specifically to compile into sharp vector graphics optimized for thermal cash registers &amp; mobile printers.
          </p>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onStartBlank}
              className="w-full sm:w-auto px-7 py-3.5 bg-stone-950 text-white hover:bg-stone-850 font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Build Blank Ticket</span>
              <ArrowRight size={14} />
            </button>
            <a
              href="#templates-section"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-stone-800 hover:bg-stone-50 border border-stone-200/80 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all text-center"
            >
              Browse Scenarios
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 w-full border-t border-stone-200">
            <div>
              <span className="text-lg font-black text-stone-900 block leading-none">58 &amp; 80MM</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1 block">Supported Widths</span>
            </div>
            <div>
              <span className="text-lg font-black text-stone-900 block leading-none">DRAG &amp; DROP</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1 block">Live Row Editor</span>
            </div>
            <div>
              <span className="text-lg font-black text-stone-900 block leading-none">NO APP REQUIRED</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1 block">Direct Web Print</span>
            </div>
          </div>
        </div>

        {/* Right column: Beautiful CSS isometric/stacked tickets layout to set standard designer environment vibe */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Static abstract geometric "ticket paper feed" graphic */}
          <div className="w-full max-w-[320px] bg-white border border-stone-200/90 rounded-[2rem] p-6 shadow-sm relative overflow-hidden transform hover:-rotate-1 transition-all duration-300">
            {/* Visual ticket notch */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-stone-100 border border-stone-200/80"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-stone-100 border border-stone-200/80"></div>

            <div className="flex flex-col items-center text-center">
              <span className="font-mono text-[9px] tracking-[0.2em] text-stone-400 font-bold uppercase">[ PASSGEN THERMAL FEED ]</span>
              <div className="w-12 h-1 bg-stone-200 my-4 rounded"></div>
              
              <span className="text-xs font-black uppercase text-stone-800 tracking-wider">BOARDING TICKET</span>
              <span className="text-[9px] font-mono text-stone-400 mt-0.5">GATE 3B - STANDING</span>

              {/* Decorative dotted separator */}
              <div className="w-full border-t border-dashed border-stone-200/80 my-4"></div>

              <div className="w-full flex items-center justify-between text-left mb-2">
                <div>
                  <span className="text-[8px] font-mono text-stone-400 block uppercase">PASSENGER NAME</span>
                  <span className="text-[11px] font-black text-stone-800 uppercase">JAY BHOSLAY</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-stone-400 block uppercase">FLIGHT STATUS</span>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase">CONFIRMED</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-left mb-4">
                <div>
                  <span className="text-[8px] font-mono text-stone-400 block uppercase">DESTINATION</span>
                  <span className="text-[11px] font-black text-stone-850">MUNICH (MUC)</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-stone-400 block uppercase">BOARD TIME</span>
                  <span className="text-[11px] font-bold text-stone-800">18:45 UTC</span>
                </div>
              </div>

              {/* Vector Barcode preview simulation */}
              <div className="w-full bg-stone-50 border border-stone-100 p-2.5 rounded-xl flex flex-col items-center gap-1.5">
                <div className="flex gap-1 justify-center items-center w-full h-8 px-2 overflow-hidden">
                  <div className="w-1 h-full bg-stone-900"></div>
                  <div className="w-2 h-full bg-stone-900"></div>
                  <div className="w-0.5 h-full bg-stone-900"></div>
                  <div className="w-1.5 h-full bg-stone-900"></div>
                  <div className="w-1 h-full bg-stone-900"></div>
                  <div className="w-0.5 h-full bg-stone-900"></div>
                  <div className="w-2 h-full bg-stone-900"></div>
                  <div className="w-1 h-full bg-stone-900"></div>
                  <div className="w-0.5 h-full bg-stone-900"></div>
                  <div className="w-1.5 h-full bg-stone-900"></div>
                  <div className="w-2 h-full bg-stone-900"></div>
                </div>
                <span className="font-mono text-[8px] tracking-widest text-stone-500">MUC-BOARD-9982</span>
              </div>
            </div>
          </div>

          {/* Decorative printer tear line strip */}
          <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-1.5 bg-amber-500 text-stone-950 p-2.5 px-4 rounded-full font-bold text-[10px] uppercase shadow-lg border border-amber-600/20 z-10">
            <Scissors size={12} />
            <span>Interactive Cut Preview</span>
          </div>
        </div>
      </section>

      {/* 4. Quick Benefit Cards Grid */}
      <section className="bg-white py-14 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center text-stone-800 mb-2">
              <Layers size={18} />
            </div>
            <h3 className="text-xs font-black uppercase text-stone-900">Custom Layers</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Organize subheaders, column tables, spacers, and barcodes in a dynamic vector stack.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-800 mb-2">
              <QrCode size={18} />
            </div>
            <h3 className="text-xs font-black uppercase text-indigo-950">Dynamic Vector QRs</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Embed custom website links or verification tickets as high-resolution instant barcode arrays.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-800 mb-2">
              <Monitor size={18} />
            </div>
            <h3 className="text-xs font-black uppercase text-emerald-950">POS Simulator</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Test your paper textures and margins using our real-time simulated virtual thermal ticket roll.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-800 mb-2">
              <Settings size={18} />
            </div>
            <h3 className="text-xs font-black uppercase text-amber-950">Adjustable Heat</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Configure print darkness burn intensities directly inside the application prior to export.
            </p>
          </div>
        </div>
      </section>

      {/* 4.5 Personal Templates Section (Dynamic) */}
      {userTemplates && userTemplates.length > 0 && (
        <section className="bg-stone-50 py-16 border-b border-stone-200" id="user-templates-section">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Your Personal Studio Lib
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-stone-950 mt-3">
                  Your Saved Templates
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-md leading-relaxed">
                  These templates are stored locally in your browser. Load them back instantly to compile and run your receipts.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={onViewTemplates}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-3xs"
                >
                  View Detailed Gallery &amp; Imports
                </button>
                <span className="text-xs font-bold text-stone-500 font-mono bg-stone-100 p-2 rounded-xl">
                  {userTemplates.length} templates saved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onApplyPreset(template)}
                  className="flex flex-col items-start p-5 bg-white border border-stone-200 rounded-3xl hover:border-emerald-600 hover:shadow-xs text-left cursor-pointer transition-all duration-200 group text-stone-900 relative"
                >
                  <button
                    onClick={(e) => onDeleteTemplate(template.id, e)}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all z-10 cursor-pointer"
                    title="Delete saved template"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-950 group-hover:text-white group-hover:border-emerald-950 transition-all mb-4 shadow-3xs">
                    {getPresetIcon(template.id) || <FileText size={18} />}
                  </div>

                  <div className="flex items-center justify-between w-full pr-8">
                    <span className="text-[13px] font-bold text-stone-900 group-hover:text-stone-950 truncate">
                      {template.name}
                    </span>
                    <ChevronRight size={14} className="text-stone-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-1 font-bold tracking-wider uppercase bg-emerald-50 rounded-md px-1.5 py-0.5">
                    {template.category || 'custom'}
                  </span>
                  <p className="text-[11px] text-stone-500 font-normal mt-2 leading-relaxed line-clamp-2">
                    {template.description || "Personal template snapshot"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Scenarios & Templates Library section */}
      <section className="max-w-6xl mx-auto px-6 py-16" id="templates-section">
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full">
            Templates Library
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-stone-950 mt-3">
            Choose a Ticket Scenario to Instantly Edit
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
            Every business scenario requires specific sizes, barcodes, or grids. Load any template to customize immediately in our interactive workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PASS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="flex flex-col items-start p-5 bg-white border border-stone-200 rounded-3xl hover:border-stone-400 hover:shadow-xs text-left cursor-pointer transition-all duration-200 group text-stone-900"
            >
              <div className="w-10 h-10 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center text-stone-600 group-hover:bg-stone-950 group-hover:text-white group-hover:border-stone-950 transition-all mb-4 shadow-3xs">
                {getPresetIcon(preset.id)}
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-[13px] font-bold text-stone-900 group-hover:text-stone-950">
                  {preset.name}
                </span>
                <ChevronRight size={14} className="text-stone-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 font-bold tracking-wider uppercase bg-stone-100 rounded-md px-1.5 py-0.5">
                {preset.category}
              </span>
              <p className="text-[11px] text-stone-500 font-normal mt-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Footer component */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-400 font-medium">
        <p className="mb-1">PassGen • Dynamic vector layout tool for direct thermal systems.</p>
        <p className="text-[10px] text-stone-300">All browser functions remain 100% client-side and secure.</p>
      </footer>
    </div>
  );
};
