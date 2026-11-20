'use client';

/**
 * Nivåkollen i onboardingen: webbens Nivåkoll i sessionsramen (MatrisNivakoll,
 * samma uppgifter och samma rutter som på webben), med ett API-lager runt
 * webbens fetchPassApi. Sessionen startar direkt, eftersom onboardingens
 * eget steg redan är startskärmen. När mätningen är avslutad tar appen över
 * och visar nivåögonblicket i stället för webbens resultatskärm.
 *
 * Krysset uppe till vänster (data-kryss) leder tillbaka till Nivåkollens
 * start i stället för till Idag, eftersom kontot kanske inte finns än.
 * Svaren är sparade efter varje uppgift.
 */
import { useMemo, useRef } from 'react';
import MatrisNivakoll from '@/components/session/matris/MatrisNivakoll';
import { AVSLUTA_SELEKTOR } from '@/lib/mobilapp/kryss';
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

  // Stabilt API: Nivåkollen håller sin instans över hela monteringen.
  const api = useMemo<PassApi>(
    () => ({
      ...fetchPassApi,
      async slutfor(sessionId) {
        const r = await fetchPassApi.slutfor(sessionId);
        if (!r.ok) return r;
        const status = await fetchPassApi.status();
        klarRef.current(r.avslut, status, sessionId);
        // Appens vy tar över; ramen avmonteras innan det här löftet behövs.
        return new Promise<never>(() => {});
      },
    }),
    [],
  );

  return (
    <div
      className="flex flex-1 flex-col"
      onClickCapture={(e) => {
        const kryss = (e.target as Element | null)?.closest?.(AVSLUTA_SELEKTOR);
        if (!kryss) return;
        e.preventDefault();
        e.stopPropagation();
        onAvbryt();
      }}
    >
      <MatrisNivakoll api={api} betalande={false} datum={null} sessionAdress={null} />
    </div>
  );
}
