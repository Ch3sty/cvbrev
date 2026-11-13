'use client';

/**
 * Nivåkollen i onboardingen: webbens egen PassFlode (mätningen, samma
 * frågevyer som på webben), med ett API-lager runt webbens fetchPassApi.
 * När mätningen är avslutad tar appen över och visar nivåögonblicket i
 * stället för webbens resultatvy; PassFlode ändras inte.
 *
 * Krysset uppe till vänster ("Avsluta passet") leder tillbaka till
 * Nivåkollens start i stället för till Idag, eftersom kontot kanske inte
 * finns än. Svaren är sparade efter varje fråga.
 */
import { useMemo, useRef } from 'react';
import PassFlode from '@/components/traning/PassFlode';
import { fetchPassApi, type Avslut, type PassApi, type Traningsstatus } from '@/lib/traning/klient';

export default function NivakollPass({
  onKlar,
  onAvbryt,
}: {
  onKlar: (avslut: Avslut, status: Traningsstatus | null, sessionId: string) => void;
  onAvbryt: () => void;
}) {
  const klarRef = useRef(onKlar);
  klarRef.current = onKlar;

  // Stabilt API: PassFlode jämför det mellan monteringar (dubbelstartsspärren).
  const api = useMemo<PassApi>(
    () => ({
      ...fetchPassApi,
      async slutfor(sessionId) {
        const r = await fetchPassApi.slutfor(sessionId);
        if (!r.ok) return r;
        const status = await fetchPassApi.status();
        klarRef.current(r.avslut, status, sessionId);
        // Appens vy tar över; PassFlode avmonteras innan det här löftet behövs.
        return new Promise<never>(() => {});
      },
    }),
    [],
  );

  return (
    <div
      className="flex flex-1 flex-col"
      onClickCapture={(e) => {
        const kryss = (e.target as Element | null)?.closest?.('button[aria-label="Avsluta passet"], a[aria-label="Avsluta passet"]');
        if (!kryss) return;
        e.preventDefault();
        e.stopPropagation();
        onAvbryt();
      }}
    >
      <PassFlode api={api} start={{ typ: 'matning', family: null, format: null }} betalande={false} />
    </div>
  );
}
