import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Download, RefreshCw, CheckCircle2, Sliders } from 'lucide-react';
import { ConversionItem } from '../types';

interface ImageConverterProps {
  onAddHistory: (item: Omit<ConversionItem, 'id' | 'timestamp'>) => void;
}

export function ImageConverter({ onAddHistory }: ImageConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedResult, setConvertedResult] = useState<{ url: string; name: string; size: string } | null>(null);

  const formats = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp'];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setConvertedResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setConvertedResult(null);
    }
  };

  const handleConvert = () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = Math.round(img.width * (scale / 100));
      const height = Math.round(img.height * (scale / 100));
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        let mime = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
        if (targetFormat === 'bmp') mime = 'image/bmp';
        if (targetFormat === 'gif') mime = 'image/gif';

        const dataUrl = canvas.toDataURL(mime, quality / 100);
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newName = `${baseName}_converted.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;

        setTimeout(() => {
          setIsProcessing(false);
          setConvertedResult({
            url: dataUrl,
            name: newName,
            size: `${(Math.round(dataUrl.length * 0.75) / 1024).toFixed(1)} KB`
          });

          onAddHistory({
            tool: 'image',
            toolName: 'Image Converter',
            fileName: file.name,
            fileSize: file.size,
            fromFormat: file.name.split('.').pop() || 'img',
            toFormat: targetFormat,
            status: 'success',
            downloadUrl: dataUrl,
            resultSize: Math.round(dataUrl.length * 0.75)
          });
        }, 600);
      } else {
        setIsProcessing(false);
      }
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Image Format Converter</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Convert images instantly between PNG, JPEG, WEBP, AVIF, GIF, and BMP with canvas resizing and compression.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Drag and drop your image file here, or click to browse'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PNG, JPEG, WEBP, AVIF, GIF, BMP
              </p>
            </div>
            {previewUrl && (
              <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-8 space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
              <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Conversion & Optimization Settings</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Target Format
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {formats.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        targetFormat === fmt
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    <span>Quality ({quality}%)</span>
                    <span>For JPEG/WEBP/AVIF</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    <span>Scale / Resize ({scale}%)</span>
                    <span>Dimensions</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => { setFile(null); setPreviewUrl(null); setConvertedResult(null); }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline"
              >
                Clear Image
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConvert}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Converting Image...</span>
                  </>
                ) : (
                  <>
                    <span>Convert to {targetFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
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
                <span>Download Image</span>
              </a>
            </div>

            {/* Image Preview Box */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 self-start">Converted Image Preview:</p>
              <img src={convertedResult.url} alt="Converted Result" className="max-h-56 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
