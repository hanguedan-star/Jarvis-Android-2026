import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, StopCircle } from 'lucide-react';
import { JarvisState } from '../types';

interface VoiceInputBarProps {
  onSendMessage: (text: string, isVoice?: boolean) => void;
  onToggleListen: () => void;
  isListening: boolean;
  state: JarvisState;
  transcript: string;
  onStopSpeech: () => void;
  isSpeaking: boolean;
  quickPrompts?: string[];
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSendMessage,
  onToggleListen,
  isListening,
  state,
  transcript,
  onStopSpeech,
  isSpeaking,
  quickPrompts = ["Rapport de statut", "Que peux-tu faire ?", "Heure et météo", "Conseil du jour"],
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, false);
    setInputText('');
  };

  return (
    <div className="w-full bg-[#030712]/95 backdrop-blur-xl border-t border-cyan-500/25 p-3 sm:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Suggestion Pills on top of the bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] font-mono-hud text-cyan-500/80 uppercase shrink-0 pl-1">
            ACCÈS RAPIDE :
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(prompt, false)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-hud hover:bg-cyan-950/40 transition-all active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Live voice transcript banner if listening */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs animate-pulse">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono-hud text-[11px] text-cyan-400 uppercase">
                Écoute vocale :
              </span>
              <span className="truncate italic">
                {transcript || "En attente de votre voix en français..."}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleListen}
              className="ml-2 text-xs font-mono-hud text-red-400 hover:text-red-300 shrink-0"
            >
              ARRÊTER
            </button>
          </div>
        )}

        {/* Main Input Form with Mic Button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Main Microphone Button */}
          <button
            type="button"
            onClick={onToggleListen}
            aria-label={isListening ? "Arrêter l'écoute vocale" : "Démarrer l'écoute vocale"}
            className={`relative p-3 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 active:scale-95 ${
              isListening
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse'
                : 'bg-slate-900 border-cyan-500/40 text-cyan-400 hover:border-cyan-300 hover:bg-cyan-950/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 animate-bounce" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? "Parlez maintenant, JARVIS vous écoute..."
                  : "Écrivez ou appuyez sur le micro pour parler à JARVIS..."
              }
              className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
            />

            {isSpeaking && (
              <button
                type="button"
                onClick={onStopSpeech}
                title="Couper la voix de JARVIS"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-300"
              >
                <StopCircle className="w-4 h-4 animate-spin-slow" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || state === 'thinking'}
            aria-label="Envoyer le message"
            className={`p-3 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 ${
              inputText.trim() && state !== 'thinking'
                ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
