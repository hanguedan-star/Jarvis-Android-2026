import React from 'react';
import { Mic, MicOff, Volume2, Cpu, Sparkles, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { JarvisState } from '../types';

interface ArcReactorCoreProps {
  state: JarvisState;
  onToggleListen: () => void;
  isListening: boolean;
  transcript?: string;
  errorMessage?: string | null;
  onClearError?: () => void;
  lastSpokenText?: string;
  onReplayVoice?: () => void;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  state,
  onToggleListen,
  isListening,
  transcript,
  errorMessage,
  onClearError,
  lastSpokenText,
  onReplayVoice,
}) => {
  // Determine state labels and glow colors
  const getStateDetails = () => {
    switch (state) {
      case 'listening':
        return {
          label: 'ÉCOUTE ACTIVE',
          subLabel: 'Parlez en français...',
          color: 'text-cyan-400',
          borderColor: 'border-cyan-400',
          glowClass: 'shadow-[0_0_60px_rgba(6,182,212,0.8)]',
          badgeBg: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300',
        };
      case 'thinking':
        return {
          label: 'CALCUL NEURONAL',
          subLabel: 'Traitement Gemini en cours...',
          color: 'text-sky-300',
          borderColor: 'border-sky-400',
          glowClass: 'shadow-[0_0_70px_rgba(56,189,248,0.85)]',
          badgeBg: 'bg-sky-500/20 border-sky-400/50 text-sky-200',
        };
      case 'speaking':
        return {
          label: 'TRANSMISSION VOCALE',
          subLabel: 'Synthèse vocale active en français...',
          color: 'text-indigo-400',
          borderColor: 'border-indigo-400',
          glowClass: 'shadow-[0_0_65px_rgba(99,102,241,0.7)]',
          badgeBg: 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200',
        };
      default:
        return {
          label: 'SYSTÈME EN VEILLE',
          subLabel: 'Touchez pour activer JARVIS',
          color: 'text-cyan-300/80',
          borderColor: 'border-cyan-500/30',
          glowClass: 'shadow-[0_0_35px_rgba(6,182,212,0.3)]',
          badgeBg: 'bg-slate-900/60 border-cyan-500/20 text-cyan-400/80',
        };
    }
  };

  const details = getStateDetails();

  return (
    <div className="relative flex flex-col items-center justify-center py-4 px-2 select-none">
      {/* Background Hologram Radial Aura */}
      <div
        className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full transition-all duration-700 pointer-events-none ${
          state === 'listening'
            ? 'bg-cyan-500/15 scale-110 blur-3xl'
            : state === 'thinking'
            ? 'bg-sky-500/20 scale-125 blur-3xl'
            : state === 'speaking'
            ? 'bg-indigo-500/20 scale-115 blur-3xl'
            : 'bg-cyan-600/10 scale-95 blur-2xl'
        }`}
      />

      {/* Central Interactive Core Sphere */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Outermost Telemetry Ring with Segments */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed transition-all duration-1000 ${
            state === 'thinking'
              ? 'animate-spin-medium border-sky-400'
              : state === 'listening'
              ? 'animate-spin-slow border-cyan-400'
              : state === 'speaking'
              ? 'animate-spin-slow border-indigo-400'
              : 'animate-spin-slow border-cyan-500/30'
          }`}
          style={{ borderWidth: '2px', strokeDasharray: '8 12' }}
        />

        {/* Counter-Rotating Middle Ring with Arc notches */}
        <div
          className={`absolute inset-4 rounded-full border border-dotted transition-all duration-1000 ${
            state === 'thinking'
              ? 'animate-spin-reverse border-sky-300'
              : 'animate-spin-reverse border-cyan-400/40'
          }`}
          style={{ strokeDasharray: '4 8' }}
        />

        {/* SVG Decorative Sci-Fi Segments */}
        <svg
          className={`absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] pointer-events-none transition-all duration-700 ${
            state === 'thinking' ? 'animate-spin-slow' : ''
          }`}
          viewBox="0 0 200 200"
        >
          {/* Segmented HUD circle brackets */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="20 40 10 30"
          />
          <circle
            cx="100"
            cy="100"
            r="76"
            fill="none"
            stroke={state === 'listening' ? '#06b6d4' : state === 'speaking' ? '#818cf8' : 'rgba(14, 165, 233, 0.4)'}
            strokeWidth="2"
            strokeDasharray="60 15 20 15"
          />
          {/* Corner tick crosses */}
          <line x1="100" y1="5" x2="100" y2="15" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="2" />
          <line x1="100" y1="185" x2="100" y2="195" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="2" />
          <line x1="5" y1="100" x2="15" y2="100" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="2" />
          <line x1="185" y1="100" x2="195" y2="100" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="2" />
        </svg>

        {/* Pulsing Concentric Energy Ring */}
        <div
          className={`absolute inset-10 rounded-full transition-all duration-500 ${
            state === 'listening'
              ? 'animate-listening border-2 border-cyan-400 bg-cyan-950/30'
              : state === 'speaking'
              ? 'animate-speaking border-2 border-indigo-400 bg-indigo-950/30'
              : state === 'thinking'
              ? 'animate-pulse border-2 border-sky-300 bg-sky-950/40'
              : 'animate-pulse-glow border border-cyan-500/40 bg-slate-950/60'
          }`}
        />

        {/* Main Central Reactor Button (Tap to talk / stop) */}
        <button
          onClick={onToggleListen}
          type="button"
          aria-label={isListening ? "Arrêter l'écoute" : "Activer l'écoute vocale de JARVIS"}
          className={`relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 group focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${details.glowClass} ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-cyan-900/90 via-sky-800/90 to-cyan-500/80 border-2 border-cyan-300'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-sky-950 via-slate-900 to-sky-700 border-2 border-sky-400'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-600 border-2 border-indigo-300'
              : 'bg-gradient-to-tr from-slate-950 via-[#0a1835] to-[#0e2a5c] border border-cyan-500/50 hover:border-cyan-300 hover:shadow-[0_0_45px_rgba(6,182,212,0.6)]'
          }`}
        >
          {/* Inner Reactor Geometric pattern */}
          <div className="absolute inset-2 rounded-full border border-cyan-400/30 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent opacity-70" />
          </div>

          {/* Icon in Center */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            {state === 'listening' ? (
              <div className="relative">
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-200 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
                </span>
              </div>
            ) : state === 'thinking' ? (
              <div className="relative">
                <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-sky-200 animate-spin-slow" />
                <Sparkles className="w-4 h-4 text-sky-300 absolute -top-1 -right-2 animate-bounce" />
              </div>
            ) : state === 'speaking' ? (
              <div className="relative">
                <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-200 animate-bounce" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Mic className="w-9 h-9 sm:w-11 sm:h-11 text-cyan-400 group-hover:text-cyan-200 transition-colors" />
                <span className="text-[10px] tracking-widest text-cyan-300/80 mt-1 font-mono-hud uppercase">
                  PARLER
                </span>
              </div>
            )}
          </div>

          {/* Mini frequency bar animation inside reactor during speaking or listening */}
          {(state === 'listening' || state === 'speaking') && (
            <div className="absolute bottom-4 flex items-center gap-1 z-20">
              <span className="w-1 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-cyan-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          )}
        </button>
      </div>

      {/* State Badge & Status Readout */}
      <div className="mt-4 flex flex-col items-center text-center max-w-sm px-4 z-20">
        <div className={`px-3 py-1 rounded-full text-xs font-mono-hud tracking-wider border uppercase transition-colors duration-300 flex items-center gap-2 ${details.badgeBg}`}>
          <span className={`w-2 h-2 rounded-full ${
            state === 'listening' ? 'bg-cyan-400 animate-ping' :
            state === 'thinking' ? 'bg-sky-400 animate-pulse' :
            state === 'speaking' ? 'bg-indigo-400 animate-pulse' :
            'bg-cyan-500/60'
          }`} />
          {details.label}
        </div>

        <p className="text-xs text-slate-400 mt-1.5 font-hud tracking-wide">
          {details.subLabel}
        </p>

        {/* Replay last voice button (Requirement 6) */}
        {lastSpokenText && onReplayVoice && state !== 'speaking' && state !== 'listening' && (
          <button
            type="button"
            onClick={onReplayVoice}
            className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/40 hover:bg-cyan-900/60 hover:border-cyan-300 text-cyan-200 text-xs font-mono-hud flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
            <span>RÉPÉTER LA DERNIÈRE RÉPONSE</span>
          </button>
        )}

        {/* Live speech transcription bubble when user is speaking */}
        {isListening && transcript && (
          <div className="mt-3 p-2.5 px-4 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 text-sm shadow-[0_0_20px_rgba(6,182,212,0.25)] animate-fade-in backdrop-blur-md max-w-xs sm:max-w-md">
            <span className="text-[10px] uppercase font-mono-hud text-cyan-400 block mb-0.5 tracking-wider">
              En direct :
            </span>
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        {/* Clear error alert notification (Requirement 5) */}
        {errorMessage && (
          <div className="mt-3 p-2.5 px-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs shadow-lg flex items-start gap-2 max-w-xs sm:max-w-md text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-red-300">Avertissement Système</span>
              <span>{errorMessage}</span>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="p-1 text-red-400 hover:text-red-200 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
