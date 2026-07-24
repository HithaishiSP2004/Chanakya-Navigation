'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, X, ThumbsUp, MessageSquare } from 'lucide-react';
import { Venue } from '@/types/venue';

interface ArrivalFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue;
}

export const ArrivalFeedbackModal: React.FC<ArrivalFeedbackModalProps> = ({
  isOpen,
  onClose,
  venue,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 text-white animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <ThumbsUp className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Rate Your Navigation</h3>
              <p className="text-xs text-slate-400">
                How accurate was walking navigation to &ldquo;{venue.name}&rdquo;?
              </p>
            </div>

            {/* Star Rating Bar */}
            <div className="flex items-center justify-center gap-2 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400 scale-110' : ''}`} />
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
            >
              Submit Feedback
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100">Thank You!</h4>
            <p className="text-xs text-slate-400">Your feedback helps improve campus GIS accuracy.</p>
          </div>
        )}
      </div>
    </div>
  );
};
