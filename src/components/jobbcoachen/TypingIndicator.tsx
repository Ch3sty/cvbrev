'use client';

import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Söker i arbetsmarknadsdata',
  'Analyserar information',
  'Sammanställer svar',
];

/**
 * Lång väntan enligt designsystemet: en panel med tre insunkna rader som
 * fylls (writing-lines i globals.css) och en roterande statustext i meta.
 * Ingen shimmer, ingen studs, ingen rörelsebiblioteksanimering.
 */
export default function TypingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 flex justify-start">
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="w-full max-w-[85%] rounded-xl border border-kant bg-panel p-4 sm:max-w-[75%]"
      >
        <p className="mb-3 text-meta text-ink-3">{LOADING_MESSAGES[messageIndex]}</p>
        <div className="writing-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
