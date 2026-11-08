import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Save, 
  RotateCcw, 
  Download, 
  FileCode, 
  Check, 
  AlertCircle, 
  Copy, 
  Search, 
  Info,
  Sparkles,
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface CodeStudioProps {
  onNotify?: (message: string) => void;
}

export const CodeStudio: React.FC<CodeStudioProps> = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mobile programming keyboard helper symbols
  const mobileSymbols = ['{', '}', '(', ')', '[', ']', ';', ':', '=>', '"', "'", '<', '>', '/', '\\', '$', '&&', '||', '!', '?'];

  // Fetch available project files
  const loadFileList = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dev/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        if (data.files && data.files.length > 0 && !data.files.includes(selectedFile)) {
          setSelectedFile(data.files[0]);
        }
      }
    } catch (err: any) {
      console.warn('Could not list files:', err);
      // Fallback default list
      setFiles([
        'src/App.tsx',
        'src/components/ArcReactorCore.tsx',
        'src/components/ChatHistory.tsx',
        'src/components/Dashboard.tsx',
        'src/components/VoiceInputBar.tsx',
        'src/components/HeaderHUD.tsx',
        'src/hooks/useSpeechRecognition.ts',
        'src/hooks/useSpeechSynthesis.ts',
        'src/index.css',
        'server.ts',
        'package.json'
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load content of selected file
  const loadFileContent = async (filePath: string) => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const res = await fetch(`/api/dev/file?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content);
        setOriginalContent(data.content);
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Erreur lors de la lecture du fichier.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: "Impossible de contacter l'API locale." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFileList();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  // Insert symbol at cursor for Android soft keyboard convenience
  const handleInsertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = fileContent;
    const next = prev.substring(0, start) + symbol + prev.substring(end);

    setFileContent(next);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  // Save modified content
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setStatusMessage(null);
      const res = await fetch('/api/dev/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile,
          content: fileContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOriginalContent(fileContent);
        setStatusMessage({ type: 'success', text: `✓ ${selectedFile} sauvegardé avec succès !` });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Échec de sauvegarde.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Erreur réseau lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Export full project bundle in 1 click
  const handleExportFullProject = async () => {
    try {
      setStatusMessage({ type: 'info', text: 'Préparation du paquet de sauvegarde...' });
      const res = await fetch('/api/dev/export-bundle');
      if (res.ok) {
        const bundle = await res.json();
        const jsonStr = JSON.stringify(bundle, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `JARVIS_AI_PROJET_COMPLET_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setStatusMessage({ type: 'success', text: `✓ Projet complet exporté (${bundle.fileCount} fichiers) !` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: "Erreur lors de l'exportation." });
    }
  };

  const isModified = fileContent !== originalContent;
  const filteredFiles = files.filter(f => f.toLowerCase().includes(searchFilter.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Android & AI Studio Helper Card */}
      <div className="hud-panel p-3.5 sm:p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-blue-950/40 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-mono-hud text-xs sm:text-sm text-cyan-200 uppercase tracking-wider flex items-center gap-2">
              <span>ACCÈS ET MODIFICATION DU CODE SUR ANDROID</span>
              <span className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-300 font-sans">OPTIMISÉ MOBILE</span>
            </h3>
            <p className="text-xs text-slate-300 font-hud leading-relaxed">
              <strong className="text-cyan-300">Vous n'avez pas besoin de copier les fichiers manuellement !</strong>
              <br />
              1. <strong>Par conversation avec l'IA :</strong> Demandez simplement dans le chat de Google AI Studio ce que vous voulez changer (ex: <em>&laquo; Modifie la voix &raquo;</em>, <em>&laquo; Ajoute une option météo &raquo;</em>). L'agent AI Studio modifie directement les fichiers pour vous.
              <br />
              2. <strong>Directement ici sur votre téléphone :</strong> Vous pouvez ouvrir n'importe quel fichier ci-dessous, le modifier avec la barre de raccourcis Android et appuyer sur <strong>Sauvegarder</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Code Studio Interface */}
      <div className="hud-panel rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl flex flex-col">
        {/* Top Action Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
          {/* File Selector Dropdown (Touch-friendly on Android) */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full text-xs sm:text-sm py-1.5 px-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-200 focus:outline-none focus:border-cyan-300 font-mono"
            >
              {filteredFiles.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadFileContent(selectedFile)}
              title="Recharger le fichier"
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportFullProject}
              title="Exporter tout le projet en 1 fichier JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-mono-hud transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPORTER PROJET</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !isModified}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono-hud transition-all shadow-md ${
                isModified
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 animate-pulse'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'ENREGISTREMENT...' : 'SAUVEGARDER'}</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Buttons for Common Source Files */}
        <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
          <span className="text-slate-500 shrink-0 text-[10px] font-mono-hud">RACCOURCIS :</span>
          {['src/App.tsx', 'server.ts', 'src/components/ArcReactorCore.tsx', 'src/components/Dashboard.tsx', 'src/index.css'].map(
            (shortcut) => (
              <button
                key={shortcut}
                onClick={() => setSelectedFile(shortcut)}
                className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] transition-colors ${
                  selectedFile === shortcut
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {shortcut.split('/').pop()}
              </button>
            )
          )}
        </div>

        {/* Android Keyboard Accessory Toolbar: insert coding symbols with 1 tap! */}
        <div className="px-3 py-1.5 bg-slate-900/80 border-b border-cyan-500/20 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono-hud text-cyan-400/80 uppercase shrink-0 mr-1">
            SYMBOLES TACTILES :
          </span>
          {mobileSymbols.map((sym, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleInsertSymbol(sym)}
              className="shrink-0 px-2 py-1 rounded bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/50 text-cyan-200 font-mono text-xs active:scale-95 transition-all"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Status Alert Notification */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/60 border-red-500/40 text-red-300'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Code Editor Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            disabled={isLoading}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-[55vh] min-h-[350px] p-4 bg-[#020617] text-slate-200 font-mono text-xs sm:text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500/40 selection:bg-cyan-500/30 selection:text-cyan-200"
            placeholder={isLoading ? 'Chargement du fichier...' : 'Contenu du code...'}
          />

          {isModified && (
            <div className="absolute bottom-3 right-4 px-2 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono-hud backdrop-blur-md">
              Modifications non enregistrées
            </div>
          )}
        </div>

        {/* Editor Footer Telemetry */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>{selectedFile}</span>
          <span>{fileContent.length} caractères | {fileContent.split('\n').length} lignes</span>
        </div>
      </div>
    </div>
  );
};
