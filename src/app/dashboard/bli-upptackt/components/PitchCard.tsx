'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import SectionCard from './SectionCard';

const MAX_LENGTH = 280;
const DEBOUNCE_MS = 1200;

interface PitchCardProps {
  pitch: string | null;
  onSave: (pitch: string | null) => void;
}

/**
 * Din pitch: fritextfält på max 280 tecken som visas överst i kandidatens
 * profil hos rekryterare. Sparar automatiskt via debounce medan användaren
 * skriver och direkt på blur. En diskret "Sparad"-check bekräftar att texten
 * ligger i databasen (tom text sparas som null).
 */
export default function PitchCard({ pitch, onSave }: PitchCardProps) {
  const [value, setValue] = useState(pitch ?? '');
  const [saved, setSaved] = useState(false);
  // Senast sparade texten, så vi varken dubbelsparar eller skriver över
  // pågående inmatning när profilen laddas in efter första rendern.
  const lastSavedRef = useRef(pitch ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const incoming = pitch ?? '';
    if (incoming !== lastSavedRef.current) {
      lastSavedRef.current = incoming;
      setValue(incoming);
    }
  }, [pitch]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const save = (next: string) => {
    const trimmed = next.trim();
    if (trimmed === lastSavedRef.current) return;
    lastSavedRef.current = trimmed;
    onSave(trimmed.length > 0 ? trimmed : null);
    setSaved(true);
  };

  const handleChange = (next: string) => {
    const clipped = next.slice(0, MAX_LENGTH);
    setValue(clipped);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(clipped), DEBOUNCE_MS);
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    save(value);
  };

  return (
    <SectionCard
      title="Din pitch"
      sub="Två meningar om vem du är och vad du söker. Visas överst i din profil hos rekryterare."
      delay={0.18}
      headerExtra={
        saved ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
            <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
            Sparad
          </span>
        ) : undefined
      }
    >
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="Redovisningsekonom med sex år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp."
        aria-label="Din pitch"
        className="w-full min-h-[100px] resize-y rounded-xl border-[1.5px] border-slate-200 px-3.5 py-3 text-[13.5px] leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none transition-colors"
      />
      <div className="mt-1.5 text-right text-[12px] text-slate-400" aria-live="polite">
        {value.length}/{MAX_LENGTH}
      </div>
    </SectionCard>
  );
}
