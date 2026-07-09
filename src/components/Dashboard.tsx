import React from 'react';
import { 
  Music, 
  Video, 
  FileAudio, 
  Image as ImageIcon, 
  FileText, 
  FileStack, 
  Ruler, 
  Mic, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';
import { ToolId, ConversionItem } from '../types';

interface DashboardProps {
  onSelectTool: (tool: ToolId) => void;
  history: ConversionItem[];
}

export function Dashboard({ onSelectTool, history }: DashboardProps) {
  const tools = [
    {
      id: 'audio' as ToolId,
      title: 'Audio Converter',
      description: 'Convert between MP3, WAV, OPUS, FLAC, AAC, and OGG formats with customized bitrates.',
      icon: <Music className="w-6 h-6 text-indigo-500" />,
      color: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20 hover:border-indigo-500/40',
      badge: '6 Formats'
    },
    {
      id: 'video' as ToolId,
      title: 'Video Converter',
      description: 'Transform video files into MP4, WEBM, MOV, AVI, and MKV with high fidelity retention.',
      icon: <Video className="w-6 h-6 text-purple-500" />,
      color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40',
      badge: 'HD / 4K'
    },
    {
      id: 'audio-extractor' as ToolId,
      title: 'Audio Extractor',
      description: 'Quickly extract pure audio tracks from MP4, MOV, or WEBM video files and save as MP3.',
      icon: <FileAudio className="w-6 h-6 text-pink-500" />,
      color: 'from-pink-500/15 to-rose-500/10 border-pink-500/20 hover:border-pink-500/40',
      badge: 'Fast Extraction'
    },
    {
      id: 'image' as ToolId,
      title: 'Image Format Converter',
      description: 'Convert images between PNG, JPEG, WEBP, AVIF, GIF, and BMP with quality & resize controls.',
      icon: <ImageIcon className="w-6 h-6 text-emerald-500" />,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40',
      badge: 'Instant Canvas'
    },
    {
      id: 'text' as ToolId,
      title: 'Text & Document Converter',
      description: 'Convert documents between TXT, Markdown, HTML, JSON, CSV, and export cleanly to PDF.',
      icon: <FileText className="w-6 h-6 text-amber-500" />,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40',
      badge: 'Multi-Format'
    },
    {
      id: 'pdf' as ToolId,
      title: 'PDF Merger & Toolkit',
      description: 'Combine multiple PDF documents into a single organized file or split pages securely.',
      icon: <FileStack className="w-6 h-6 text-red-500" />,
      color: 'from-red-500/10 to-rose-500/10 border-red-500/20 hover:border-red-500/40',
      badge: 'Batch Merge'
    },
    {
      id: 'unit' as ToolId,
      title: 'Unit Converter',
      description: 'Perform precise calculations across weight, length, temperature, data storage, and speed.',
      icon: <Ruler className="w-6 h-6 text-cyan-500" />,
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40',
      badge: 'Instant Math'
    },
    {
      id: 'speech' as ToolId,
      title: 'AI Speech Extractor & Transcription',
      description: 'Transcribe speech from audio/video using OpenAI Whisper, Google Cloud Speech, & Gemini models.',
      icon: <Mic className="w-6 h-6 text-violet-500" />,
      color: 'from-violet-500/10 to-indigo-500/10 border-violet-500/20 hover:border-violet-500/40',
      badge: 'AI Powered'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>All-in-One Professional File Processing Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Convert, Extract, and Transform Any File Instantly
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A comprehensive web platform equipped with client-side FFmpeg-grade media conversion, image resizing, document compilation, unit calculations, and AI speech transcription.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onSelectTool('audio')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <span>Explore Audio Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTool('speech')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center space-x-2"
            >
              <Mic className="w-4 h-4 text-violet-400" />
              <span>AI Speech Transcription</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">8+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Dedicated Tools</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Secure & Private</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">Client + AI</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Fast Processing</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{history.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Conversions Done</div>
          </div>
        </div>
      </div>

      {/* Grid of Tools */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            All Conversion Modules
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Select a tool to begin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`
                group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800
                hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between
                bg-gradient-to-b ${tool.color}
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                    {tool.badge}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {tool.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
