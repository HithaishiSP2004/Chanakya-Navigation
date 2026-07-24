'use client';

import React, { useState, useEffect } from 'react';
import { Mic, X, Sparkles } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectQuery,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsListening(true);
    setTranscript('Listening for campus destination...');

    // Speech Recognition API or simulation fallback
    const mockVoicePrompts = [
      'Admissions Counter',
      'OP Jindal Food Court',
      'Indoor Badminton Court',
      'Central Library',
      'Academic Block 2',
    ];

    const timer = setTimeout(() => {
      const randomPrompt = mockVoicePrompts[Math.floor(Math.random() * mockVoicePrompts.length)];
      setTranscript(`"${randomPrompt}"`);
      setTimeout(() => {
        setIsListening(false);
        onSelectQuery(randomPrompt);
        onClose();
      }, 1200);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, onSelectQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 text-white animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Close Voice Search"
        className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 shadow-2xl">
          <Mic className={`w-10 h-10 text-emerald-400 ${isListening ? 'animate-pulse' : ''}`} />

          {/* Animated Audio Wave Rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-emerald-400/20 animate-pulse" />
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Voice Search
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Say a destination name, building code, or room (e.g. &ldquo;Admissions&rdquo;)
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-semibold text-emerald-400 min-h-[44px] flex items-center justify-center">
          {transcript}
        </div>
      </div>
    </div>
  );
};
