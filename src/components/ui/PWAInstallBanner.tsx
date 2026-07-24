'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'chanakya-pwa-install-dismissed';

/**
 * PWAInstallBanner — Android/Chrome "Add to Home Screen" prompt.
 * 
 * - Listens for `beforeinstallprompt` (Android Chrome / Edge).
 * - Shown once per session after 3s; dismissed state persisted in localStorage.
 * - iOS users see a different message (no beforeinstallprompt on Safari).
 * - On installed PWA (standalone mode) the banner never shows.
 */
export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    // Detect iOS (no beforeinstallprompt — need manual share → Add to Home Screen)
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
    if (isIOSDevice) {
      setIsIOS(true);
      setTimeout(() => setIsVisible(true), 3000);
      return;
    }

    // Android / Chrome — capture the native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setIsVisible(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[100] max-w-sm mx-auto animate-slide-up">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl shadow-black/50">
        {/* App icon */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
          <Smartphone className="w-6 h-6 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white leading-tight">
            {isIOS ? 'Add to Home Screen' : 'Install Chanakya Navigate'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
            {isIOS
              ? 'Tap Share → "Add to Home Screen" for offline access'
              : 'Works offline · Faster · Campus GPS navigation'}
          </p>
        </div>

        {/* Install button */}
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white text-xs font-bold shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
