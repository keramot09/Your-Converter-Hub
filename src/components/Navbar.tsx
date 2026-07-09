import React from 'react';
import { Menu, Search, Sparkles, ShieldCheck } from 'lucide-react';
import { ToolId } from '../types';

interface NavbarProps {
  currentTool: ToolId;
  onOpenSidebar: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function Navbar({ currentTool, onOpenSidebar, searchTerm, setSearchTerm }: NavbarProps) {
  const toolTitles: Record<ToolId, string> = {
    dashboard: 'Dashboard Hub',
    audio: 'Audio Converter',
    video: 'Video Converter',
    'audio-extractor': 'Audio Extractor',
    image: 'Image Format Converter',
    text: 'Text & Document Converter',
    pdf: 'PDF Merger & Toolkit',
    unit: 'Unit Converter',
    speech: 'AI Speech Extractor & Transcription',
    history: 'Conversion History'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{toolTitles[currentTool]}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Secure client-side and server-assisted professional file processing suite
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools or formats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure & Private</span>
        </div>
      </div>
    </header>
  );
}
