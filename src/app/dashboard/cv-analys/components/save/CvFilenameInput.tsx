'use client';

import { useState } from 'react';

interface CvFilenameInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

/**
 * Namnet CV:t sparas under.
 *
 * Bort: orange kant runt fältet, glödlampan, förslagen som orange pillar
 * och tipsrutan i orange. Ett vanligt fält enligt formulärmönstret, med
 * förslagen som chips i insunken ton.
 */
export default function CvFilenameInput({
  value,
  onChange,
  suggestions = [],
}: CvFilenameInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placeholder = suggestions[0] || 'Mitt CV 2026';
  const otherSuggestions = suggestions.slice(0, 4);

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-2">
          Ge ditt CV ett namn
        </span>
        <input
          type="text"
          enterKeyHint="done"
          inputMode="text"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
        />
        <span className="mt-1 block text-meta text-ink-3">
          Hjälper dig hitta rätt CV senare. Roll och år brukar räcka.
        </span>
      </label>

      <button
        type="button"
        onClick={() => setShowSuggestions((v) => !v)}
        className="mt-2 text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1"
        aria-expanded={showSuggestions}
      >
        Behöver du inspiration?
      </button>

      {showSuggestions && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {otherSuggestions.map((suggestion, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onChange(suggestion);
                  setShowSuggestions(false);
                }}
                className="inline-flex min-h-[44px] items-center rounded-md border border-kant-stark bg-panel px-3 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
