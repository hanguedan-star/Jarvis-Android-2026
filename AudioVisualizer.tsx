import React, { useEffect, useState } from 'react';
import { JarvisState } from '../types';

interface AudioVisualizerProps {
  state: JarvisState;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ state, barCount = 24 }) => {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: barCount }, () => 15));

  useEffect(() => {
    let animationFrame: number;
    let tick = 0;

    const updateBars = () => {
      tick += 0.12;

      setBars(prev => {
        return prev.map((_, i) => {
          if (state === 'speaking') {
            // High dynamic speech oscillations
            const base = Math.sin(tick * 1.5 + i * 0.4) * 35;
            const variance = Math.cos(tick * 2.2 + i * 0.7) * 25;
            return Math.max(12, Math.min(85, Math.abs(base + variance) + 15));
          } else if (state === 'listening') {
            // Faster reactive pulse
            const wave = Math.sin(tick * 3 + i * 0.5) * 45;
            return Math.max(10, Math.min(90, Math.abs(wave) + 20));
          } else if (state === 'thinking') {
            // Symmetrical rhythmic processing wave
            const wave = Math.sin(tick * 2 + (i - barCount / 2) * 0.3) * 30;
            return Math.max(8, Math.min(60, Math.abs(wave) + 10));
          } else {
            // Idle ambient breathing pattern
            const wave = Math.sin(tick * 0.6 + i * 0.25) * 8;
            return Math.max(4, Math.min(22, 10 + wave));
          }
        });
      });

      animationFrame = requestAnimationFrame(updateBars);
    };

    animationFrame = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animationFrame);
  }, [state, barCount]);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-12 px-4 py-1 select-none">
      {bars.map((height, i) => {
        let barColor = 'bg-cyan-500/40';
        if (state === 'listening') {
          barColor = 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]';
        } else if (state === 'speaking') {
          barColor = 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]';
        } else if (state === 'thinking') {
          barColor = 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]';
        }

        return (
          <div
            key={i}
            className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ease-out ${barColor}`}
            style={{
              height: `${height}%`,
              minHeight: '4px',
            }}
          />
        );
      })}
    </div>
  );
};
