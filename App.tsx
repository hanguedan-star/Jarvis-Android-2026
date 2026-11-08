import React, { useState, useEffect, useCallback } from 'react';
import { ArcReactorCore } from './components/ArcReactorCore';
import { AudioVisualizer } from './components/AudioVisualizer';
import { ChatHistory } from './components/ChatHistory';
import { Dashboard } from './components/Dashboard';
import { HeaderHUD } from './components/HeaderHUD';
import { VoiceInputBar } from './components/VoiceInputBar';
import { CodeStudio } from './components/CodeStudio';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { ChatMessage, JarvisState, SystemStatusData, VoiceSettings, AppTab } from './types';
import { ShieldCheck, Cpu, Volume2, Sparkles, Terminal, Code2 } from 'lucide-react';

const INITIAL_GREETING: ChatMessage = {
  id: 'init-1',
  role: 'model',
  text: "Bonjour Monsieur. Systèmes J.A.R.V.I.S. initialisés et opérationnels. Tous les protocoles neuronaux sont connectés. Comment puis-je vous assister aujourd'hui ?",
  timestamp: new Date().toISOString(),
};

const STORAGE_KEY = 'jarvis_chat_history_v1';
const SETTINGS_KEY = 'jarvis_voice_settings_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('core');
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [INITIAL_GREETING];
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      autoSpeak: true,
      rate: 1.0,
      pitch: 0.95,
      voiceName: '',
    };
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);

  // Sync messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage quota or private mode
    }
  }, [messages]);

  // Sync voice settings to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(voiceSettings));
    } catch {
      // ignore
    }
  }, [voiceSettings]);

  // Fetch telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.warn('Telemetry fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Setup French Speech Synthesis
  const {
    speak,
    cancel: cancelSpeech,
    replay: replaySpeech,
    isSpeaking,
    lastSpokenText,
    voices,
    selectedVoice,
    setSelectedVoice,
    setRate,
    setPitch,
    synthesisError,
  } = useSpeechSynthesis({
    onStart: () => setJarvisState('speaking'),
    onEnd: () => setJarvisState('idle'),
    onError: () => setJarvisState('idle'),
  });

  // Apply voiceSettings to SpeechSynthesis
  useEffect(() => {
    setRate(voiceSettings.rate);
    setPitch(voiceSettings.pitch);

    if (voiceSettings.voiceName && voices.length > 0) {
      const matched = voices.find((v) => v.name === voiceSettings.voiceName);
      if (matched) setSelectedVoice(matched);
    }
  }, [voiceSettings, voices, setRate, setPitch, setSelectedVoice]);

  // Handle sending a message to JARVIS (Gemini API server)
  const handleSendMessage = useCallback(
    async (text: string, isVoiceInput = false, commandMode = 'general') => {
      if (!text.trim()) return;

      // Stop speech if already speaking
      cancelSpeech();

      const userMessage: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString(),
        isVoiceInput,
      };

      setMessages((prev) => [...prev, userMessage]);
      setJarvisState('thinking');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-8).map((m) => ({
              role: m.role,
              text: m.text,
            })),
            commandMode: isVoiceInput ? 'concise_voice' : commandMode,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }

        const data = await response.json();
        const replyText = data.reply || "À vos ordres, Monsieur. Transmission effectuée.";

        const jarvisMessage: ChatMessage = {
          id: 'msg-' + Date.now() + '-jarvis',
          role: 'model',
          text: replyText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, jarvisMessage]);

        // Auto speak response in French if enabled
        if (voiceSettings.autoSpeak) {
          speak(replyText);
        } else {
          setJarvisState('idle');
        }
      } catch (err: any) {
        console.error('Chat error:', err);
        const fallbackText =
          "Monsieur, je constate une perturbation sur mes liaisons de transmission. Je demeure néanmoins à votre écoute pour toute nouvelle instruction.";

        const errMessage: ChatMessage = {
          id: 'msg-' + Date.now() + '-err',
          role: 'model',
          text: fallbackText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errMessage]);

        if (voiceSettings.autoSpeak) {
          speak(fallbackText);
        } else {
          setJarvisState('idle');
        }
      }
    },
    [cancelSpeech, messages, voiceSettings.autoSpeak, speak]
  );

  // Setup French Speech Recognition
  const {
    isListening,
    transcript,
    errorMessage: recognitionError,
    setErrorMessage: setRecognitionError,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        handleSendMessage(finalTranscript, true);
      }
    },
    onError: (err) => {
      console.warn('Voice rec error:', err);
      setJarvisState('idle');
    },
  });

  // Combined error message (Requirement 5)
  const activeError = recognitionError || synthesisError;

  // Keep jarvisState in sync with speech recognition
  useEffect(() => {
    if (isListening) {
      // Cancel speech playback if user speaks
      cancelSpeech();
      setJarvisState('listening');
    } else if (jarvisState === 'listening') {
      setJarvisState('idle');
    }
  }, [isListening, cancelSpeech, jarvisState]);

  const handleClearHistory = () => {
    if (window.confirm("Monsieur, souhaitez-vous réinitialiser l'historique des transmissions ?")) {
      cancelSpeech();
      setMessages([INITIAL_GREETING]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const handleTestVoice = () => {
    speak("Monsieur, mes modules vocaux francophones sont parfaitement calibrés et prêts à vos ordres.");
  };

  const handleUpdateVoiceSettings = (partial: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between hud-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Futuristic Header HUD */}
      <HeaderHUD
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autoSpeak={voiceSettings.autoSpeak}
        onToggleAutoSpeak={() =>
          handleUpdateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })
        }
        isSpeaking={isSpeaking}
        onStopSpeech={cancelSpeech}
        messageCount={messages.length}
      />

      {/* Main Responsive Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {/* VIEW 1: Core View (Central Holographic Circle & Voice Hub) */}
        {activeTab === 'core' && (
          <div className="flex flex-col items-center justify-center my-auto py-2">
            {/* Holographic Arc Reactor Core */}
            <ArcReactorCore
              state={jarvisState}
              onToggleListen={toggleListening}
              isListening={isListening}
              transcript={transcript}
              errorMessage={activeError}
              onClearError={() => setRecognitionError(null)}
              lastSpokenText={lastSpokenText}
              onReplayVoice={replaySpeech}
            />

            {/* Audio Waveform Visualizer */}
            <div className="w-full max-w-md my-2">
              <AudioVisualizer state={jarvisState} barCount={28} />
            </div>

            {/* Sub-status line */}
            <div className="flex items-center gap-4 text-xs font-mono-hud text-cyan-400/80 py-1">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                GEMINI 3.8 FLASH
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                SÉCURISÉ
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-indigo-300">
                <Volume2 className="w-3.5 h-3.5" />
                FR-FR
              </span>
            </div>

            {/* Mobile shortcuts */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-hud hover:border-cyan-400 hover:bg-cyan-950/40 transition-all flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Terminal ({messages.length})
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-hud hover:border-cyan-400 hover:bg-cyan-950/40 transition-all flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                Éditeur de Code Mobile
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Chat & History Terminal */}
        {activeTab === 'chat' && (
          <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
            <ChatHistory
              messages={messages}
              onReplayVoice={(text) => speak(text)}
              onClearHistory={handleClearHistory}
              onSelectPrompt={(prompt) => handleSendMessage(prompt, false)}
              isLoading={jarvisState === 'thinking'}
              isSpeaking={isSpeaking}
            />
          </div>
        )}

        {/* VIEW 3: Dashboard & Diagnostics */}
        {activeTab === 'dashboard' && (
          <div className="w-full max-w-5xl mx-auto">
            <Dashboard
              systemStatus={systemStatus}
              onRefreshTelemetry={fetchTelemetry}
              voiceSettings={voiceSettings}
              onUpdateVoiceSettings={handleUpdateVoiceSettings}
              availableVoices={voices}
              onTestVoice={handleTestVoice}
              onTriggerDiagnostic={(protocol) => {
                setActiveTab('chat');
                handleSendMessage(protocol, false, 'diagnostic');
              }}
            />
          </div>
        )}

        {/* VIEW 4: In-App Code Studio & Android File Editor */}
        {activeTab === 'code' && (
          <div className="w-full max-w-5xl mx-auto">
            <CodeStudio />
          </div>
        )}
      </main>

      {/* Bottom Voice & Text Input Bar */}
      <footer className="sticky bottom-0 z-20 w-full">
        <VoiceInputBar
          onSendMessage={(text, isVoice) => handleSendMessage(text, isVoice)}
          onToggleListen={toggleListening}
          isListening={isListening}
          state={jarvisState}
          transcript={transcript}
          onStopSpeech={cancelSpeech}
          isSpeaking={isSpeaking}
          quickPrompts={[
            "Rapport de statut complet",
            "Météo et heure actuelle",
            "Protocole de sécurité",
            "Conseil du jour",
            "Que sais-tu faire ?",
          ]}
        />
      </footer>
    </div>
  );
}
