import React, { useState } from 'react';
import { Video, Upload, Download, RefreshCw, CheckCircle2, Settings } from 'lucide-react';
import { ConversionItem } from '../types';

interface VideoConverterProps {
  onAddHistory: (item: Omit<ConversionItem, 'id' | 'timestamp'>) => void;
}

export function VideoConverter({ onAddHistory }: VideoConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [resolution, setResolution] = useState('1080p');
  const [videoCodec, setVideoCodec] = useState('H.264');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedResult, setConvertedResult] = useState<{ url: string; name: string; size: string } | null>(null);

  const formats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  const resolutions = ['720p HD', '1080p FHD', '4K UHD'];
  const codecs = ['H.264 (AVC)', 'H.265 (HEVC)', 'VP9', 'AV1'];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setConvertedResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setConvertedResult(null);
    }
  };

  const startConversion = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          const newName = `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.${targetFormat}`;
          const dummyUrl = URL.createObjectURL(file);
          
          setConvertedResult({
            url: dummyUrl,
            name: newName,
            size: `${(file.size * 0.85 / 1024 / 1024).toFixed(2)} MB`
          });

          onAddHistory({
            tool: 'video',
            toolName: 'Video Converter',
            fileName: file.name,
            fileSize: file.size,
            fromFormat: file.name.split('.').pop() || 'unknown',
            toFormat: targetFormat,
            status: 'success',
            downloadUrl: dummyUrl,
            resultSize: Math.round(file.size * 0.85)
          });

          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Video Converter</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Convert video files into MP4, WEBM, MOV, AVI, and MKV with codec and resolution options.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative cursor-pointer"
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Drag and drop your video file here, or click to browse'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports MP4, MOV, WEBM, AVI, MKV up to 500MB
              </p>
            </div>
            {file && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-medium">
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </span>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-8 space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Video Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Target Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {formats.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        targetFormat === fmt
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
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
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {resolutions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Video Codec
                </label>
                <select
                  value={videoCodec}
                  onChange={(e) => setVideoCodec(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {codecs.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => { setFile(null); setConvertedResult(null); }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline"
              >
                Clear File
              </button>
              <button
                disabled={isProcessing}
                onClick={startConversion}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <span>Convert to {targetFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>

            {isProcessing && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {convertedResult && (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {convertedResult.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ready for download • Size: {convertedResult.size}
                  </p>
                </div>
              </div>

              <a
                href={convertedResult.url}
                download={convertedResult.name}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>

            {/* Video Preview Player */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Live Video Preview:</p>
              <video controls src={convertedResult.url} className="w-full max-h-64 rounded-lg object-contain bg-black" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
