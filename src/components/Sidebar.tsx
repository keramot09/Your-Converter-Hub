import React from 'react';
import { 
  LayoutDashboard, 
  Music, 
  Video, 
  FileAudio, 
  Image as ImageIcon, 
  FileText, 
  FileStack, 
  Ruler, 
  Mic, 
  History,
  Sparkles,
  Zap
} from 'lucide-react';
import { ToolId } from '../types';

interface SidebarProps {
  currentTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ currentTool, onSelectTool, isOpen, setIsOpen }: SidebarProps) {
  const menuItems: { id: ToolId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Hub', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'audio', label: 'Audio Converter', icon: <Music className="w-5 h-5" />, badge: 'MP3/WAV/FLAC' },
    { id: 'video', label: 'Video Converter', icon: <Video className="w-5 h-5" />, badge: 'MP4/MKV' },
    { id: 'audio-extractor', label: 'Audio Extractor', icon: <FileAudio className="w-5 h-5" />, badge: 'Video → MP3' },
    { id: 'image', label: 'Image Converter', icon: <ImageIcon className="w-5 h-5" />, badge: 'PNG/WEBP/AVIF' },
    { id: 'text', label: 'Text & Doc Converter', icon: <FileText className="w-5 h-5" />, badge: 'TXT/MD/JSON' },
    { id: 'pdf', label: 'PDF Merger & Tools', icon: <FileStack className="w-5 h-5" />, badge: 'Merge/Split' },
    { id: 'unit', label: 'Unit Converter', icon: <Ruler className="w-5 h-5" />, badge: 'Weight/Temp' },
    { id: 'speech', label: 'AI Speech Extractor', icon: <Mic className="w-5 h-5" />, badge: 'Whisper/Gemini' },
    { id: 'history', label: 'Conversion History', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                OmniFile Suite
              </h1>
              <p className="text-xs text-slate-400 font-mono">Professional Converter</p>
            </div>
          </div>
        </div>

        {/* Navigation menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Conversion Tools
          </div>
          {menuItems.map((item) => {
            const isActive = currentTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTool(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="p-4 m-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-medium mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Transcription Ready</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Powered by Whisper, Google Cloud Speech, and Gemini AI models.
          </p>
        </div>
      </aside>
    </>
  );
}
