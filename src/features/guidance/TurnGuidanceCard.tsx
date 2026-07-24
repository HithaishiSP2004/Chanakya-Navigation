'use client';

import React from 'react';
import { 
  ArrowUp, 
  CornerUpRight, 
  CornerUpLeft, 
  ArrowUpRight, 
  ArrowUpLeft, 
  MapPin 
} from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { TurnType } from '@/types/navigation';

export const TurnGuidanceCard: React.FC = () => {
  const { mode, activeRoute, currentStepIndex, reroutingMessage } = useNavigationStore();

  if ((mode !== 'NAVIGATING' && mode !== 'REROUTING') || !activeRoute || !activeRoute.instructions) return null;

  const currentInstruction = activeRoute.instructions[currentStepIndex] || activeRoute.instructions[0];
  const nextInstruction = activeRoute.instructions[currentStepIndex + 1];

  const getTurnIcon = (turnType: TurnType) => {
    switch (turnType) {
      case 'TURN_RIGHT':
      case 'SHARP_RIGHT':
        return <CornerUpRight className="w-8 h-8 text-emerald-400" />;
      case 'SLIGHT_RIGHT':
      case 'DESTINATION_RIGHT':
        return <ArrowUpRight className="w-8 h-8 text-emerald-400" />;
      case 'TURN_LEFT':
      case 'SHARP_LEFT':
        return <CornerUpLeft className="w-8 h-8 text-emerald-400" />;
      case 'SLIGHT_LEFT':
      case 'DESTINATION_LEFT':
        return <ArrowUpLeft className="w-8 h-8 text-emerald-400" />;
      case 'ARRIVE':
      case 'DESTINATION_AHEAD':
        return <MapPin className="w-8 h-8 text-emerald-400" />;
      default:
        return <ArrowUp className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-40 max-w-md mx-auto flex flex-col gap-2">
      {/* Rerouting Notification Toast */}
      {reroutingMessage && (
        <div className="rounded-2xl bg-amber-500/90 text-slate-950 font-bold px-4 py-2.5 shadow-lg backdrop-blur-md flex items-center justify-between text-xs animate-bounce">
          <span>{reroutingMessage}</span>
          <span className="text-[10px] uppercase font-extrabold bg-slate-950/20 px-2 py-0.5 rounded-full">Recalculating</span>
        </div>
      )}

      {/* Main Guidance Card */}
      <div className="rounded-3xl bg-slate-950/90 text-white border border-slate-800 backdrop-blur-2xl shadow-2xl p-4 flex items-center gap-4">
        {/* Turn Direction Icon Badge */}
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          {getTurnIcon(currentInstruction.turnType)}
        </div>

        {/* Turn Instruction Text & Distance */}
        <div className="flex-1 min-w-0">
          <div className="text-xl font-black text-emerald-400 leading-none mb-1">
            {currentInstruction.distanceMeters > 0 ? `In ${currentInstruction.distanceMeters}m` : 'Arriving'}
          </div>
          <p className="text-sm font-semibold text-white leading-snug truncate">
            {currentInstruction.text}
          </p>
          {nextInstruction && (
            <p className="text-[11px] font-medium text-slate-400 mt-1 truncate">
              Then: {nextInstruction.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
