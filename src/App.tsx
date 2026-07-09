import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AudioConverter } from './components/AudioConverter';
import { VideoConverter } from './components/VideoConverter';
import { AudioExtractor } from './components/AudioExtractor';
import { ImageConverter } from './components/ImageConverter';
import { TextConverter } from './components/TextConverter';
import { PdfTools } from './components/PdfTools';
import { UnitConverter } from './components/UnitConverter';
import { SpeechTranscription } from './components/SpeechTranscription';
import { ConversionHistory } from './components/ConversionHistory';
import { ToolId, ConversionItem } from './types';

export default function App() {
  const [currentTool, setCurrentTool] = useState<ToolId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<ConversionItem[]>([]);

  const addHistoryItem = (item: Omit<ConversionItem, 'id' | 'timestamp'>) => {
    const newItem: ConversionItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Navbar
          currentTool={currentTool}
          onOpenSidebar={() => setSidebarOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {currentTool === 'dashboard' && (
            <Dashboard onSelectTool={setCurrentTool} history={history} />
          )}
          {currentTool === 'audio' && (
            <AudioConverter onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'video' && (
            <VideoConverter onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'audio-extractor' && (
            <AudioExtractor onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'image' && (
            <ImageConverter onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'text' && (
            <TextConverter onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'pdf' && (
            <PdfTools onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'unit' && (
            <UnitConverter />
          )}
          {currentTool === 'speech' && (
            <SpeechTranscription onAddHistory={addHistoryItem} />
          )}
          {currentTool === 'history' && (
            <ConversionHistory history={history} onClearHistory={clearHistory} />
          )}
        </main>
      </div>
    </div>
  );
}
