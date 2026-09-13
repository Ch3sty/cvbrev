'use client';

/**
 * Premium beviljad av en administratör. Ingen fakturering, inget att säga
 * upp: kortet säger bara vad som gäller och var man frågar.
 */

import { Check } from 'lucide-react';
import { IkonSkold } from '@/components/illustrations/Ikoner';

const PUNKTER = [
  'Aktivt utan slutdatum',
  'Inget kort kopplat, ingen fakturering',
  'Alla premiumfunktioner upplåsta',
];

export default function AdminGrantedCard() {
  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-ink-2" aria-hidden="true">
          <IkonSkold size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-kort text-ink-1">Premium via Jobbcoach</h2>
          <p className="mt-1 text-sm text-ink-2">
            Din åtkomst är beviljad av en administratör.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {PUNKTER.map((text) => (
          <li key={text} className="flex items-start gap-2 text-sm text-ink-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-positiv" strokeWidth={1.75} />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-ink-2">
        Frågor om din åtkomst?{' '}
        <a
          href="mailto:support@jobbcoach.ai"
          className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          support@jobbcoach.ai
        </a>
      </p>
    </section>
  );
}
