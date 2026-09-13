'use client';

import { splitIntoParagraphs } from './splitParagraphs';

interface PassageDisplayProps {
  title: string;
  topic: string;
  text: string;
  difficulty: 1 | 2 | 3;
  passageNumber: number;
}

/**
 * Textpassagen i det verbala testet: en panel med steg-etikett, rubrik,
 * ämne och svårighetspunkter i ink, sedan texten i läsvänlig storlek.
 */
export default function PassageDisplay({
  title,
  topic,
  text,
  difficulty,
  passageNumber,
}: PassageDisplayProps) {
  // Strippa "PASSAGE X, "-prefix från titeln
  const cleanTitle = title.replace(/^PASSAGE\s+\d+\s*[--]\s*/i, '');

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <p className="text-steg text-ink-3">Passage {passageNumber}</p>
      <h2 className="mt-1 text-kort text-ink-1">{cleanTitle}</h2>
      <div className="mt-1 flex items-center gap-2 text-meta text-ink-3">
        <span>{topic}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span>Svårighet</span>
          <span className="flex items-center gap-0.5" aria-label={`${difficulty} av 3`}>
            {[1, 2, 3].map((level) => (
              <span
                key={level}
                className={`h-1.5 w-1.5 rounded-full ${level <= difficulty ? 'bg-ink-1' : 'bg-kant-stark'}`}
              />
            ))}
          </span>
        </span>
      </div>

      <div className="mt-4 space-y-3 border-t border-kant pt-4 text-base leading-[26px] text-ink-1">
        {splitIntoParagraphs(text).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
