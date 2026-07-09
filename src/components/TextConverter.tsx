import React, { useState } from 'react';
import { FileText, Download, Copy, Check, FileDown, ArrowRightLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ConversionItem } from '../types';

interface TextConverterProps {
  onAddHistory: (item: Omit<ConversionItem, 'id' | 'timestamp'>) => void;
}

export function TextConverter({ onAddHistory }: TextConverterProps) {
  const [inputText, setInputText] = useState('# Sample Document Title\n\nThis is a sample document for conversion.\nYou can convert text between Markdown, HTML, JSON, Plain Text, and export directly to PDF.');
  const [inputFormat, setInputFormat] = useState('md');
  const [outputFormat, setOutputFormat] = useState('html');
  const [copied, setCopied] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState<{ url: string; name: string } | null>(null);

  const formats = [
    { id: 'txt', label: 'Plain Text (.txt)' },
    { id: 'md', label: 'Markdown (.md)' },
    { id: 'html', label: 'HTML (.html)' },
    { id: 'json', label: 'JSON (.json)' },
    { id: 'csv', label: 'CSV (.csv)' },
  ];

  const getConvertedText = () => {
    if (outputFormat === 'html') {
      return `<div>\n  <h1>Document</h1>\n  <p>${inputText.replace(/\n/g, '<br/>')}</p>\n</div>`;
    }
    if (outputFormat === 'json') {
      return JSON.stringify({ content: inputText, format: inputFormat, timestamp: new Date().toISOString() }, null, 2);
    }
    if (outputFormat === 'csv') {
      return `"Line","Content"\n"1","${inputText.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    }
    return inputText;
  };

  const convertedContent = getConvertedText();

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([convertedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_document.${outputFormat}`;
    link.click();

    onAddHistory({
      tool: 'text',
      toolName: 'Text Converter',
      fileName: `document.${inputFormat}`,
      fileSize: new Blob([inputText]).size,
      fromFormat: inputFormat,
      toFormat: outputFormat,
      status: 'success',
      downloadUrl: url,
      resultSize: blob.size
    });
  };

  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("OmniFile Document Export", 20, 20);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(inputText, 170);
    doc.text(splitText, 20, 35);

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    setPdfGenerated({
      url,
      name: 'exported_document.pdf'
    });

    onAddHistory({
      tool: 'text',
      toolName: 'Text to PDF',
      fileName: `document.${inputFormat}`,
      fileSize: new Blob([inputText]).size,
      fromFormat: inputFormat,
      toFormat: 'pdf',
      status: 'success',
      downloadUrl: url,
      resultSize: pdfBlob.size
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Text & Document Converter</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Convert notes and documents between TXT, Markdown, HTML, JSON, CSV, and export instantly to professional PDF.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Source Content
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to convert..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                <span>Converted Output</span>
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <div className="w-full h-72 block p-4 bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl text-sm font-mono overflow-y-auto whitespace-pre-wrap">
                {convertedContent}
              </div>
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-amber-600/30 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download .{outputFormat}</span>
            </button>
            <button
              onClick={handleGeneratePdf}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-sm border border-slate-700 transition-all flex items-center space-x-2"
            >
              <FileDown className="w-4 h-4 text-red-400" />
              <span>Export as PDF</span>
            </button>
          </div>

          {pdfGenerated && (
            <a
              href={pdfGenerated.url}
              download={pdfGenerated.name}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-2 animate-bounce"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Generated PDF</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
