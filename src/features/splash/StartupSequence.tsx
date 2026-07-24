'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/useUIStore';

export const StartupSequence: React.FC = () => {
  const { isStartupFinished, setStartupFinished } = useUIStore();
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    // 3.5s Total Stage Progression
    const timer1 = setTimeout(() => setStage(1), 400);   // GPS Signal
    const timer2 = setTimeout(() => setStage(2), 1000);  // Pulse Animation
    const timer3 = setTimeout(() => setStage(3), 1600);  // Chanakya Logo
    const timer4 = setTimeout(() => setStage(4), 2200);  // Campus Outline
    const timer5 = setTimeout(() => setStage(5), 2800);  // Finding Location & Zoom
    const timer6 = setTimeout(() => setStartupFinished(true), 3500); // Complete

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [setStartupFinished]);

  if (isStartupFinished) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="startup-splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white select-none overflow-hidden"
      >
        {/* Stage 1 & 2: GPS Signal & Radar Pulse */}
        {stage >= 1 && (
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [1, 2.2, 3], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/60"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 z-10"
            >
              <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
            </motion.div>
          </div>
        )}

        {/* Stage 3 & 4: Chanakya Logo & Campus Polygon Reveal */}
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center text-center px-6"
          >
            <div className="w-20 h-20 mb-4 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center p-3 shadow-2xl">
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-400">
                <path
                  d="M100 35 L150 70 L150 130 L100 165 L50 130 L50 70 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="100" r="24" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Chanakya Navigate
            </h1>
            <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase">
              Official Smart Campus Guide
            </p>
          </motion.div>
        )}

        {/* Stage 4: SVG Campus Polygon Outline */}
        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30"
          >
            <svg viewBox="0 0 500 500" className="w-96 h-96 stroke-emerald-500/40 fill-none stroke-[2]">
              <polygon points="100,150 250,80 400,150 380,350 250,420 120,350" />
              <polyline points="250,80 250,420" strokeDasharray="6 6" />
              <polyline points="100,150 400,150" strokeDasharray="6 6" />
            </svg>
          </motion.div>
        )}

        {/* Stage 5: Finding Location Status Text */}
        {stage >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-16 flex items-center gap-2 text-slate-400 text-sm font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Finding campus position...</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
