
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TranslationMode, SpeechProvider, WordFilter, TranslationEntry, AppSettings, LocalModel } from './types';
import { translateText } from './services/geminiService';
import AudioSourceSelector from './components/AudioSourceSelector';

const App: React.FC = () => {
  // --- States ---
  const [settings, setSettings] = useState<AppSettings>({
    translationMode: TranslationMode.DUAL,
    provider: SpeechProvider.WEB_SPEECH,
    filters: [],
    audioDeviceId: '',
    isJapaneseEnabled: true,
    fontSize: 28,
    animeStyle: true,
    localPath: 'C:/Users/Streamer/Documents/TranslateAI/Models',
    useGPU: true,
  });

  const [localModels, setLocalModels] = useState<LocalModel[]>([
    { id: 'wh-tiny', name: 'Whisper Tiny', size: '75MB', status: 'installed', progress: 100, description: 'Fastest, lower accuracy.' },
    { id: 'wh-base', name: 'Whisper Base', size: '145MB', status: 'idle', progress: 0, description: 'Good balance for streaming.' },
    { id: 'wh-small', name: 'Whisper Small', size: '480MB', status: 'idle', progress: 0, description: 'High accuracy, requires GPU.' },
    { id: 'wh-medium', name: 'Whisper Medium', size: '1.5GB', status: 'idle', progress: 0, description: 'Professional grade accuracy.' }
  ]);

  const [history, setHistory] = useState<TranslationEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'models' | 'settings'>('stream');
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  
  // Performance Mocks
  const [stats, setStats] = useState({ cpu: 12, gpu: 45, ram: 1.2 });

  const recognitionRef = useRef<any>(null);

  // --- Logic: Local Downloads Simulation ---
  const handleDownload = (id: string) => {
    setLocalModels(prev => prev.map(m => {
      if (m.id === id) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setLocalModels(current => current.map(currM => 
            currM.id === id ? { ...currM, status: 'downloading', progress: Math.min(progress, 100) } : currM
          ));
          if (progress >= 100) {
            clearInterval(interval);
            setLocalModels(current => current.map(currM => 
              currM.id === id ? { ...currM, status: 'installed', progress: 100 } : currM
            ));
          }
        }, 200);
        return { ...m, status: 'downloading', progress: 0 };
      }
      return m;
    }));
  };

  // --- Logic: Translation ---
  const handleTranscription = useCallback(async (transcript: string) => {
    const mode = settings.isJapaneseEnabled ? TranslationMode.DUAL : TranslationMode.ENGLISH;
    const result = await translateText(transcript, mode);
    
    let en = "";
    let jp = "";
    if (mode === TranslationMode.DUAL) {
      try {
        const parsed = JSON.parse(result || '{}');
        en = parsed.en || "";
        jp = parsed.jp || "";
      } catch (e) { en = result || ""; }
    } else { en = result || ""; }

    const newEntry: TranslationEntry = {
      id: Math.random().toString(36).substr(2, 9),
      original: transcript,
      english: en,
      japanese: jp,
      timestamp: Date.now()
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 15));
  }, [settings.isJapaneseEnabled]);

  // Speech Setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = 'es-ES';
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleTranscription(transcript);
    };
  }, [handleTranscription]);

  // Overlay View
  if (isOverlayMode) {
    return (
      <div className="h-screen w-screen bg-transparent p-12 flex flex-col justify-end">
        <button onClick={() => setIsOverlayMode(false)} className="fixed top-4 right-4 text-white/20 hover:text-white">Exit Overlay (ESC)</button>
        <div className="space-y-4">
          {history.slice(0, 2).reverse().map(entry => (
            <div key={entry.id} className="animate-in slide-in-from-left-8 duration-300">
              <div className={`${settings.animeStyle ? 'anime-text' : ''} text-white leading-tight`}>
                <p className="font-bold uppercase tracking-tighter" style={{ fontSize: `${settings.fontSize * 1.5}px` }}>{entry.english}</p>
                {entry.japanese && <p className="opacity-90 font-medium" style={{ fontSize: `${settings.fontSize}px` }}>{entry.japanese}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-32px)] overflow-hidden bg-[#020617]">
      {/* Sidebar - Pro Navigation */}
      <nav className="w-20 glass-sidebar border-r border-white/5 flex flex-col items-center py-8 gap-8">
        <div className={`cursor-pointer w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeTab === 'stream' ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-white'}`} onClick={() => setActiveTab('stream')}>
          <i className="fas fa-satellite-dish text-xl"></i>
        </div>
        <div className={`cursor-pointer w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeTab === 'models' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-slate-500 hover:text-white'}`} onClick={() => setActiveTab('models')}>
          <i className="fas fa-brain text-xl"></i>
        </div>
        <div className={`cursor-pointer w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-slate-700' : 'text-slate-500 hover:text-white'}`} onClick={() => setActiveTab('settings')}>
          <i className="fas fa-cog text-xl"></i>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 border-t border-white/5 pt-6 w-full">
          <div className="text-[10px] font-bold text-slate-500 transform -rotate-90 origin-center whitespace-nowrap">CPU: {stats.cpu}%</div>
          <div className="w-1.5 h-12 bg-slate-800 rounded-full overflow-hidden">
             <div className="bg-green-500 w-full" style={{ height: `${stats.cpu}%` }}></div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#070b19]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">
              {activeTab === 'stream' && 'Broadcast Stream'}
              {activeTab === 'models' && 'Local Model Manager'}
              {activeTab === 'settings' && 'System Configuration'}
            </h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isRecording ? '• On Air' : 'Standby'}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setIsOverlayMode(true)} className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 text-sm font-semibold transition-all">
              <i className="fas fa-eye mr-2"></i> OBS Overlay
            </button>
            <button 
              onClick={() => {
                if (isRecording) recognitionRef.current.stop();
                else recognitionRef.current.start();
                setIsRecording(!isRecording);
              }}
              className={`px-8 py-2 rounded-xl font-bold text-sm shadow-xl transition-all transform active:scale-95 ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {isRecording ? 'STOP SESSION' : 'START TRANSLATING'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#0a0f25] relative">
          <div className="scanline absolute inset-0 pointer-events-none opacity-[0.03]"></div>

          {activeTab === 'stream' && (
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-8 flex flex-col-reverse gap-6">
                {history.length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-slate-600">
                    <i className="fas fa-microphone-slash text-4xl mb-4"></i>
                    <p>Waiting for voice input...</p>
                  </div>
                )}
                {history.map((entry, idx) => (
                  <div key={entry.id} className={`p-8 rounded-3xl border transition-all duration-500 glow-card ${idx === 0 ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-40 scale-[0.98]'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-mono text-[10px] text-slate-500">SESSION_LOG_{entry.id.toUpperCase()}</span>
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-400/10 rounded">RT_ENGINE_V3</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold mt-1 shrink-0">SOURCE</span>
                        <p className="text-slate-400 italic font-light">{entry.original}</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-bold mt-2 shrink-0">ENGLISH</span>
                        <h3 className={`text-2xl font-bold tracking-tight leading-none ${settings.animeStyle ? 'anime-text' : ''}`} style={{ fontSize: `${settings.fontSize}px` }}>{entry.english}</h3>
                      </div>
                      {entry.japanese && (
                        <div className="flex gap-4 items-start pt-4 border-t border-white/5">
                          <span className="bg-pink-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1 shrink-0">JAPANESE</span>
                          <h4 className="text-lg font-bold text-pink-200/80">{entry.japanese}</h4>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="col-span-4 space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Live Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end"><span className="text-sm">VRAM Usage</span><span className="text-blue-400 font-mono text-xs">2.4 GB / 8 GB</span></div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[30%]"></div></div>
                    <div className="flex justify-between items-end"><span className="text-sm">Inference Latency</span><span className="text-green-400 font-mono text-xs">14ms</span></div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="bg-green-500 h-full w-[10%]"></div></div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-white/5">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Quick Modifiers</h4>
                   <div className="flex flex-col gap-3">
                      <button onClick={() => setSettings(s => ({...s, animeStyle: !s.animeStyle}))} className={`w-full p-3 rounded-lg text-xs font-bold flex justify-between items-center transition-all ${settings.animeStyle ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                        ANIME STYLE {settings.animeStyle ? 'ON' : 'OFF'}
                        <i className={`fas ${settings.animeStyle ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      </button>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Display Scale</span>
                        <input type="range" min="16" max="64" value={settings.fontSize} onChange={e => setSettings(s => ({...s, fontSize: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="grid grid-cols-2 gap-6">
              {localModels.map(model => (
                <div key={model.id} className="p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-blue-500/40 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{model.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{model.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-mono text-slate-400">{model.size}</span>
                  </div>
                  
                  {model.status === 'idle' && (
                    <button onClick={() => handleDownload(model.id)} className="w-full mt-6 py-3 rounded-xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white font-bold transition-all flex items-center justify-center gap-2">
                      <i className="fas fa-download"></i> INSTALL TO LOCAL
                    </button>
                  )}
                  {model.status === 'downloading' && (
                    <div className="mt-6">
                      <div className="flex justify-between text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest">
                        <span>Downloading components...</span>
                        <span>{model.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${model.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                  {model.status === 'installed' && (
                    <div className="mt-6 flex gap-2">
                      <div className="flex-1 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold flex items-center justify-center gap-2 cursor-default">
                        <i className="fas fa-check-circle"></i> INSTALLED
                      </div>
                      <button className="px-5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-10">
              <section className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <i className="fas fa-folder-open text-blue-500"></i> Local Storage Paths
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Models & Inference Directory</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={settings.localPath} className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 font-mono" />
                      <button className="px-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-white/5">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
                        <i className="fas fa-bolt"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Hardware Acceleration</p>
                        <p className="text-[10px] text-slate-500">Use NVIDIA CUDA if available</p>
                      </div>
                    </div>
                    <button onClick={() => setSettings(s => ({...s, useGPU: !s.useGPU}))} className={`w-14 h-7 rounded-full transition-all relative ${settings.useGPU ? 'bg-blue-600' : 'bg-slate-800'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.useGPU ? 'left-8' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-6 border-t border-white/5">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Audio Calibration</h3>
                 <AudioSourceSelector selectedId={settings.audioDeviceId} onSelect={id => setSettings(s => ({...s, audioDeviceId: id}))} />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
