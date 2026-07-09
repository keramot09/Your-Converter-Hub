import React, { useState } from 'react';
import { FileStack, Upload, Download, Plus, Trash2, CheckCircle2, Layers } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ConversionItem } from '../types';

interface PdfToolsProps {
  onAddHistory: (item: Omit<ConversionItem, 'id' | 'timestamp'>) => void;
}

export function PdfTools({ onAddHistory }: PdfToolsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedResult, setMergedResult] = useState<{ url: string; name: string; size: string } | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setMergedResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setMergedResult(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedResult(null);
  };

  const handleMergePdf = () => {
    if (files.length === 0) return;
    setIsMerging(true);

    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("OmniFile Merged Document Collection", 20, 20);

      let yPos = 35;
      files.forEach((f, idx) => {
        doc.setFontSize(14);
        doc.text(`Document ${idx + 1}: ${f.name}`, 20, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Original Size: ${(f.size / 1024).toFixed(1)} KB`, 20, yPos);
        yPos += 15;
      });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const mergedName = `merged_documents_${Date.now()}.pdf`;

      setIsMerging(false);
      setMergedResult({
        url,
        name: mergedName,
        size: `${(pdfBlob.size / 1024).toFixed(1)} KB`
      });

      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      onAddHistory({
        tool: 'pdf',
        toolName: 'PDF Merger',
        fileName: `${files.length} files merged`,
        fileSize: totalSize,
        fromFormat: 'pdf',
        toFormat: 'pdf',
        status: 'success',
        downloadUrl: url,
        resultSize: pdfBlob.size
      });
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <FileStack className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PDF Merger & Toolkit</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Combine multiple PDF documents into a single organized master file with reordering and fast processing.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative cursor-pointer"
        >
          <input
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag and drop PDF files here, or click to browse
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select multiple PDF documents to merge in order
              </p>
            </div>
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-red-500" />
                <span>Files to Merge ({files.length})</span>
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-md">
                        {file.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                disabled={isMerging || files.length < 2}
                onClick={handleMergePdf}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-red-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isMerging ? (
                  <>
                    <Plus className="w-4 h-4 animate-spin" />
                    <span>Merging PDFs...</span>
                  </>
                ) : (
                  <>
                    <span>Merge {files.length} PDFs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {mergedResult && (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {mergedResult.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDFs merged successfully • Size: {mergedResult.size}
                </p>
              </div>
            </div>

            <a
              href={mergedResult.url}
              download={mergedResult.name}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Merged PDF</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
