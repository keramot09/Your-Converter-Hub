import React, { useState } from 'react';
import { Mic, Upload, Sparkles, Download, RefreshCw, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { ConversionItem } from '../types';

interface SpeechTranscriptionProps {
  onAddHistory: (item: Omit<ConversionItem, 'id' | 'timestamp'>) => void;
}

export function SpeechTranscription({ onAddHistory }: SpeechTranscriptionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [engine, setEngine] = useState('whisper');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<{
    transcript: string;
    summary: string;
    language: string;
    wordCount: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const engines = [
    { id: 'whisper', label: 'OpenAI Whisper v3', desc: 'Highest accuracy for multilingual speech' },
    { id: 'google', label: 'Google Cloud Speech-to-Text', desc: 'Enterprise robust audio indexing' },
    { id: 'gemini', label: 'Gemini 2.5 Flash Audio Intelligence', desc: 'Advanced conversational context & summary' },
  ];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setTranscriptResult(null);
      setErrorMsg(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTranscriptResult(null);
      setErrorMsg(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("engine", engine);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transcribe audio.");
      }

      setTranscriptResult({
        transcript: data.transcript || "No transcript returned.",
        summary: data.summary || "Summary generated successfully.",
        language: data.language || "English",
        wordCount: data.wordCount || 0,
      });

      const blob = new Blob([data.transcript || ''], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      onAddHistory({
        tool: 'speech',
        toolName: 'AI Speech Transcription',
        fileName: file.name,
        fileSize: file.size,
        fromFormat: file.name.split('.').pop() || 'audio',
        toFormat: 'txt',
        status: 'success',
        downloadUrl: url,
        resultSize: blob.size
      });

    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during transcription.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTranscript = () => {
    if (!transcriptResult) return;
    const content = `--- OMNIFILE AI TRANSCRIPTION ---\nEngine: ${engine.toUpperCase()}\nLanguage: ${transcriptResult.language}\nWord Count: ${transcriptResult.wordCount}\n\nSUMMARY:\n${transcriptResult.summary}\n\nFULL TRANSCRIPT:\n${transcriptResult.transcript}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Mic className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Speech Extractor & Transcription</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Transcribe lectures, interviews, meetings, and podcasts into editable text using OpenAI Whisper, Google Cloud Speech, and Gemini AI.
            </p>
          </div>
        </div>

        {/* Engine Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-violet-500" />
            <span>Select Transcription Engine</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {engines.map((eng) => (
              <div
                key={eng.id}
                onClick={() => setEngine(eng.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  engine === eng.id
                    ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 shadow-md shadow-violet-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-violet-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{eng.label}</span>
                  {engine === eng.id && <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{eng.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative cursor-pointer"
        >
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Drag and drop audio or video file here for transcription'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports MP3, WAV, M4A, MP4, WEBM up to 50MB
              </p>
            </div>
            {file && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-medium">
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </span>
            )}
          </div>
        </div>

        {file && !isProcessing && !transcriptResult && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleTranscribe}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-600/30 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start AI Transcription</span>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="mt-8 p-8 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/80 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Transcribing audio with {engine.toUpperCase()}...</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Analyzing speech patterns, speaker cadence, and generating summary</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {transcriptResult && (
          <div className="mt-8 space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Transcription Completed</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Language: <span className="font-medium text-slate-700 dark:text-slate-300">{transcriptResult.language}</span> • Word Count: <span className="font-medium text-slate-700 dark:text-slate-300">{transcriptResult.wordCount}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={downloadTranscript}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-violet-600/30 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Transcript</span>
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Executive Summary
              </h5>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {transcriptResult.summary}
              </p>
            </div>

            {/* Full Transcript Box */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verbatim Transcript
              </h5>
              <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                {transcriptResult.transcript}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
