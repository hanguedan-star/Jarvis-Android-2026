import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Wifi, 
  Volume2, 
  Sliders, 
  Play, 
  RotateCcw,
  Sparkles,
  Server
} from 'lucide-react';
import { SystemStatusData, VoiceSettings } from '../types';

interface DashboardProps {
  systemStatus: SystemStatusData | null;
  onRefreshTelemetry: () => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  onTestVoice: () => void;
  onTriggerDiagnostic: (protocol: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  systemStatus,
  onRefreshTelemetry,
  voiceSettings,
  onUpdateVoiceSettings,
  availableVoices,
  onTestVoice,
  onTriggerDiagnostic,
}) => {
  const [cpuVal, setCpuVal] = useState(24.2);
  const [latencyVal, setLatencyVal] = useState(14);

  // Slight live telemetry variance for futuristic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuVal(prev => +(Math.max(15, Math.min(45, prev + (Math.random() * 4 - 2)))).toFixed(1));
      setLatencyVal(prev => Math.floor(Math.max(9, Math.min(22, prev + (Math.random() * 3 - 1.5)))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top HUD Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Core CPU Load */}
        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono-hud uppercase tracking-wider text-cyan-300">
              CHARGE NOYAU
            </span>
            <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono-hud text-lg sm:text-2xl font-bold text-slate-100">
            {cpuVal}%
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${cpuVal}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 font-hud mt-1 block">4.2 GHz Synchrone</span>
        </div>

        {/* Energy Output */}
        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono-hud uppercase tracking-wider text-emerald-300">
              ÉNERGIE RÉACTEUR
            </span>
            <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono-hud text-lg sm:text-2xl font-bold text-emerald-300">
            99.8%
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[99.8%]" />
          </div>
          <span className="text-[10px] text-slate-500 font-hud mt-1 block">Régime Optimal</span>
        </div>

        {/* Neural Latency */}
        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono-hud uppercase tracking-wider text-sky-300">
              LATENCE QUANTIQUE
            </span>
            <Wifi className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono-hud text-lg sm:text-2xl font-bold text-sky-200">
            {latencyVal} ms
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full w-[25%]" />
          </div>
          <span className="text-[10px] text-slate-500 font-hud mt-1 block">Liaison Gemini 3.8</span>
        </div>

        {/* Protocol Security */}
        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono-hud uppercase tracking-wider text-indigo-300">
              SÉCURITÉ
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono-hud text-sm sm:text-base font-bold text-indigo-200 truncate mt-1">
            ALPHA-SECURE
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-400 h-full rounded-full w-[100%]" />
          </div>
          <span className="text-[10px] text-emerald-400 font-hud mt-1 block">Pare-feu Intact</span>
        </div>
      </div>

      {/* Main Dashboard Section: Diagnostic & Voice Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Diagnostic Protocols */}
        <div className="hud-panel p-4 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono-hud text-xs sm:text-sm text-cyan-200 uppercase tracking-wider">
                PROTOCOLES D'EXÉCUTION RAPIDE
              </h3>
            </div>
            <button
              onClick={onRefreshTelemetry}
              title="Rafraîchir les métriques"
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400 font-hud mb-4">
            Déclenchez un ordre direct. JARVIS effectuera l'analyse avec son moteur neuronal et vocalisera son compte-rendu.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => onTriggerDiagnostic("Exécute un auto-diagnostic complet de tous tes systèmes et fais-moi un rapport succinct.")}
              className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 text-cyan-300 font-mono-hud text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                Auto-Diagnostic
              </div>
              <span className="text-[11px] text-slate-400 font-hud block">
                Bilan de santé du noyau, mémoire et latence.
              </span>
            </button>

            <button
              onClick={() => onTriggerDiagnostic("Quel est le statut météo actuel estimé et l'heure exacte ? Prépare mon briefing du jour.")}
              className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 text-sky-300 font-mono-hud text-xs font-semibold mb-1">
                <Activity className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                Briefing Quotidien
              </div>
              <span className="text-[11px] text-slate-400 font-hud block">
                Planification des tâches et synthèse matinale.
              </span>
            </button>

            <button
              onClick={() => onTriggerDiagnostic("Active le protocole de sécurité Maison Blanche. Vérifie les canaux de communication.")}
              className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 text-indigo-300 font-mono-hud text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                Protocole Défense
              </div>
              <span className="text-[11px] text-slate-400 font-hud block">
                Vérification du cryptage et canaux sécurisés.
              </span>
            </button>

            <button
              onClick={() => onTriggerDiagnostic("Donne-moi une analyse concise de productivité et une pensée stratégique pour aujourd'hui.")}
              className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 text-teal-300 font-mono-hud text-xs font-semibold mb-1">
                <Server className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                Focus & Stratégie
              </div>
              <span className="text-[11px] text-slate-400 font-hud block">
                Aiguisage cognitif et priorisation des objectifs.
              </span>
            </button>
          </div>
        </div>

        {/* French Voice & Audio Configuration */}
        <div className="hud-panel p-4 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono-hud text-xs sm:text-sm text-cyan-200 uppercase tracking-wider">
              PARAMÈTRES DE LA VOIX (FRANÇAIS)
            </h3>
          </div>

          <p className="text-xs text-slate-400 font-hud mb-4">
            Ajustez la texture et la cadence de la synthèse vocale pour reproduire fidèlement l'intonation de JARVIS.
          </p>

          <div className="space-y-3.5">
            {/* Auto speak toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-hud text-slate-200">
                Lecture vocale automatique des réponses
              </span>
              <button
                type="button"
                onClick={() => onUpdateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  voiceSettings.autoSpeak ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    voiceSettings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice selector */}
            <div>
              <label className="text-[11px] font-mono-hud uppercase text-slate-400 block mb-1">
                Sélection de la voix du navigateur :
              </label>
              <select
                value={voiceSettings.voiceName}
                onChange={(e) => onUpdateVoiceSettings({ voiceName: e.target.value })}
                className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-200 focus:outline-none focus:border-cyan-400"
              >
                {availableVoices.length > 0 ? (
                  availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))
                ) : (
                  <option value="">Voix système par défaut (fr-FR)</option>
                )}
              </select>
            </div>

            {/* Voice Speed Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono-hud text-slate-400 mb-1">
                <span>VITESSE DE DICTION :</span>
                <span className="text-cyan-300 font-bold">{voiceSettings.rate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.3"
                step="0.05"
                value={voiceSettings.rate}
                onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Voice Pitch Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono-hud text-slate-400 mb-1">
                <span>TONALITÉ (GRAVE / AIGU) :</span>
                <span className="text-cyan-300 font-bold">{voiceSettings.pitch}</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.05"
                value={voiceSettings.pitch}
                onChange={(e) => onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Test Voice Button */}
            <button
              onClick={onTestVoice}
              className="w-full py-2 px-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono-hud flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              TESTER LA SYNTHÈSE VOCALE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
