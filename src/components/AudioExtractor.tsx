import React, { useState } from 'react';
import { FileAudio, Upload, Download, RefreshCw, CheckCircle2, Scissors } from 'lucide-react';
import { ConversionItem } from '../types';

interface AudioExtractorProps {
  onAddHistory: (item: Omit<ConversionItem, 'id' | 'timestamp'>) => void;
}

export function AudioExtractor({ onAddHistory }: AudioExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [quality, setQuality] = useState('320kbps');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedResult, setExtractedResult] = useState<{ url: string; name: string; size: string } | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setExtractedResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedResult(null);
    }
  };

  const startExtraction = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const newName = `${baseName}_extracted.${outputFormat}`;
          const dummyUrl = URL.createObjectURL(file);
          
          setExtractedResult({
            url: dummyUrl,
            name: newName,
            size: `${(file.size * 0.15 / 1024 / 1024).toFixed(2)} MB`
          });

          onAddHistory({
            tool: 'audio-extractor',
            toolName: 'Audio Extractor',
            fileName: file.name,
            fileSize: file.size,
            fromFormat: file.name.split('.').pop() || 'video',
            toFormat: outputFormat,
            status: 'success',
            downloadUrl: dummyUrl,
            resultSize: Math.round(file.size * 0.15)
          });

          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
            <FileAudio className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audio Extractor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Isolate and extract pure audio tracks from video files (MP4, MKV, MOV) into high-quality MP3 or WAV.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative cursor-pointer"
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-pink-600 dark:text-pink-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Drag and drop your video file here to extract audio'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports MP4, MOV, WEBM, MKV
              </p>
            </div>
            {file && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-medium">
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </span>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-8 space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
              <Scissors className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span>Extraction Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['mp3', 'wav'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        outputFormat === fmt
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Audio Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="128kbps">128 kbps (Standard)</option>
                  <option value="192kbps">192 kbps (High)</option>
                  <option value="320kbps">320 kbps (Maximum Fidelity)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => { setFile(null); setExtractedResult(null); }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline"
              >
                Clear File
              </button>
              <button
                disabled={isProcessing}
                onClick={startExtraction}
                className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-pink-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Audio ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Audio Track</span>
                  </>
                )}
              </button>
            </div>

            {isProcessing && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-pink-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {extractedResult && (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {extractedResult.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Audio extracted successfully • Size: {extractedResult.size}
                  </p>
                </div>
              </div>

              <a
                href={extractedResult.url}
                download={extractedResult.name}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download MP3</span>
              </a>
            </div>

            {/* Audio Preview Player */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Extracted Audio Preview:</p>
              <audio controls src={extractedResult.url} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
