'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title?: string;
  captions?: string[];
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title = 'Destination Gallery',
  captions = [],
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onIndexChange((currentIndex + 1) % images.length);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-2xl p-4 text-white animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto z-10 pt-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold truncate">{title}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Lightbox"
          className="p-2 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-rose-600 transition-all text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Viewer */}
      <div className="relative flex-1 flex items-center justify-center my-4 w-full max-w-4xl mx-auto overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt={captions[currentIndex] || title}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
              aria-label="Previous Image"
              className="absolute left-3 p-3 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-emerald-600 transition-all text-white backdrop-blur-md shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              aria-label="Next Image"
              className="absolute right-3 p-3 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-emerald-600 transition-all text-white backdrop-blur-md shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Caption & Thumbnail Strip */}
      <div className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto pb-2">
        {captions[currentIndex] && (
          <p className="text-xs font-semibold text-slate-300 text-center px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800">
            {captions[currentIndex]}
          </p>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full p-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  currentIndex === idx ? 'border-emerald-500 scale-105 shadow-lg' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
