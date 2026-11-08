import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Search, 
  Bot, 
  User, 
  Mic, 
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  onReplayVoice: (text: string) => void;
  onClearHistory: () => void;
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  onReplayVoice,
  onClearHistory,
  onSelectPrompt,
  isLoading,
  isSpeaking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleString('fr-FR')}] ${
            m.role === 'user' ? 'UTILISATEUR' : 'J.A.R.V.I.S.'
          }:\n${m.text}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_transmission_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter((m) =>
    m.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultSuggestions = [
    "Rapport de statut complet",
    "Donne-moi l'heure et la météo",
    "Résous 25 * 14 + racine de 144",
    "Une citation inspirante en français",
    "Explique l'informatique quantique",
    "Protocole de défense et sécurité",
  ];

  return (
    <div className="flex flex-col h-full bg-[#030712]/70 rounded-2xl border border-cyan-500/20 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Terminal Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-900/60 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="font-mono-hud text-xs sm:text-sm tracking-wider text-cyan-200 uppercase">
            JOURNAL DES TRANSMISSIONS ({filteredMessages.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2 py-1 text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-24 sm:w-36 transition-all"
            />
          </div>

          {/* Export Action */}
          {messages.length > 0 && (
            <button
              onClick={handleExport}
              title="Exporter la transcription"
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clear Action */}
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Effacer l'historique"
              className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/50 hover:border-red-400 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)] sm:max-h-[500px]">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Bot className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
            <h3 className="font-mono-hud text-sm text-cyan-200 uppercase tracking-wider">
              SYSTÈMES J.A.R.V.I.S. EN LIGNE
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 font-hud leading-relaxed">
              Bonjour Monsieur. Tous mes protocoles neuronaux sont synchronisés. Utilisez le microphone ou le terminal pour me donner vos instructions.
            </p>

            {/* Quick Suggestions Chips */}
            <div className="mt-5 w-full max-w-md">
              <span className="text-[11px] font-mono-hud text-cyan-400/80 uppercase tracking-widest block mb-2">
                COMMANDES RAPIDES :
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {defaultSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt(prompt)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 text-cyan-300 text-xs font-hud transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUser = msg.role === 'user';
            const formattedTime = new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                {/* Meta details header */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono-hud mb-1 px-1">
                  {isUser ? (
                    <>
                      <span>{formattedTime}</span>
                      <span className="text-cyan-400 font-medium">UTILISATEUR</span>
                      {msg.isVoiceInput && (
                        <span title="Saisie vocale" className="inline-flex items-center text-cyan-400">
                          <Mic className="w-2.5 h-2.5 ml-0.5" />
                        </span>
                      )}
                      <User className="w-3 h-3 text-cyan-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-300 font-medium tracking-wider">J.A.R.V.I.S.</span>
                      <span>{formattedTime}</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/70 border border-cyan-400/40 text-cyan-50 rounded-br-none'
                      : 'bg-slate-900/90 border border-cyan-500/25 text-slate-200 rounded-bl-none shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  }`}
                >
                  {/* Clean text display with proper whitespace */}
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {/* Message Action Bar (Copy & Replay speech for JARVIS messages) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                    <span className="text-[10px] font-mono-hud text-slate-500">
                      ID: {msg.id.slice(0, 6)}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isUser && (
                        <button
                          onClick={() => onReplayVoice(msg.text)}
                          title="Faire lire ou répéter cette réponse par la voix de JARVIS"
                          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30 transition-all active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-[10px] font-mono-hud uppercase">RÉPÉTER LA VOIX</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        title="Copier le texte"
                        className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator when Gemini is thinking */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono-hud mb-1">
              <Bot className="w-3 h-3 text-cyan-400" />
              <span>J.A.R.V.I.S. (CALCUL EN COURS...)</span>
            </div>
            <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-slate-900/90 border border-sky-400/50 text-cyan-300 flex items-center gap-3 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
              <span className="text-xs font-hud tracking-wide">
                Génération de la réponse neuronale...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
