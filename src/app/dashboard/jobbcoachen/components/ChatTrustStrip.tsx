'use client';

import { Shield } from 'lucide-react';

export default function ChatTrustStrip() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-orange-50/40 border border-orange-200/50">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
        <Shield className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
      </div>
      <span className="text-xs sm:text-sm text-slate-700 leading-snug">
        Svar baseras på verifierade källor. Alltid med klickbar källhänvisning.
      </span>
    </div>
  );
}
