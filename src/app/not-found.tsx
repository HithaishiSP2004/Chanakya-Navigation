import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Compass className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Destination Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            The requested page or route does not exist.
          </p>
        </div>

        <Link
          href="/"
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Return to Campus Navigator</span>
        </Link>
      </div>
    </div>
  );
}
