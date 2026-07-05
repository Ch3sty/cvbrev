'use client';

import { AlertTriangle } from 'lucide-react';

// Diskret amber-varning, samma utseende som i matrislogik-träningsflödet.
// Standardtexten gäller osparade svar; `message` kan ersätta den (t.ex. fel
// vid slutförande av provet).
export function UnsavedAnswerBanner({
  message = 'Ett svar kunde inte sparas. Vi försöker igen automatiskt.',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2.25} />
      <p className="text-sm text-amber-800">{message}</p>
    </div>
  );
}
