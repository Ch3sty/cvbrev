'use client';

/**
 * Adminatgarderna pa en enskild anvandare.
 *
 * Tva handlingar, bada bakom ConfirmDialog: ge premium, och radera kontot.
 * Native confirm() anvands aldrig, varken har eller nagon annanstans: den
 * blockerar traden, gar inte att formge och ser ut som ett webblasarfel.
 *
 * Bada gar mot de befintliga rutterna under /api/admin/users, som ligger bakom
 * requireSuperAdmin. Komponenten gor ingen egen behorighetskontroll: en
 * kontroll i klienten ar ingen kontroll.
 *
 * Radering ar oaterkallelig och kaskaderar till brev, CV och ansokningar via
 * foreign keys. Darfor ar den destruktiv i dialogen, sa att Avbryt far
 * knappform och bekraftelsen blir rod.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import FlowError from '@/components/shell/FlowError';

const KNAPP_SEKUNDAR =
  'inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken disabled:opacity-40';

const KNAPP_DESTRUKTIV =
  'inline-flex h-11 items-center justify-center rounded-lg border border-fel-kant bg-panel px-4 text-sm font-medium text-fel transition-colors hover:bg-fel-mjuk disabled:opacity-40';

const FALT_KLASS =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-sm text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1';

/** Valbara langder. Obegransat finns med for de fa konton som ska ha det. */
const LANGDER: Array<{ varde: string; etikett: string }> = [
  { varde: '7', etikett: '7 dagar' },
  { varde: '30', etikett: '30 dagar' },
  { varde: '90', etikett: '90 dagar' },
  { varde: '365', etikett: '365 dagar' },
  { varde: 'unlimited', etikett: 'Obegränsat' },
];

export interface AtgarderProps {
  userId: string;
  /** Visas i dialogtexten sa att admin ser vem hen ar pa vag att andra. */
  epost: string;
  /** Adminens eget id. Ingen far radera eller andra sig sjalv harifran. */
  egetId: string;
}

export default function Atgarder({ userId, epost, egetId }: AtgarderProps) {
  const router = useRouter();
  const [langd, setLangd] = useState('30');
  const [oppen, setOppen] = useState<'premium' | 'radera' | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [klart, setKlart] = useState<string | null>(null);

  const egetKonto = userId === egetId;

  const gePremium = async () => {
    setFel(null);
    setKlart(null);
    try {
      const svar = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_premium',
          premiumDays: langd === 'unlimited' ? 'unlimited' : Number(langd),
        }),
      });
      const data = await svar.json();
      if (!svar.ok) throw new Error(data?.error ?? 'Åtgärden gick inte igenom');
      setOppen(null);
      setKlart(data?.message ?? 'Paket tilldelat.');
      router.refresh();
    } catch (e) {
      setOppen(null);
      setFel(e instanceof Error ? e.message : 'Åtgärden gick inte igenom');
    }
  };

  const radera = async () => {
    setFel(null);
    setKlart(null);
    try {
      const svar = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await svar.json();
      if (!svar.ok) throw new Error(data?.error ?? 'Kontot kunde inte tas bort');
      setOppen(null);
      router.push('/admin/anvandare');
    } catch (e) {
      setOppen(null);
      setFel(e instanceof Error ? e.message : 'Kontot kunde inte tas bort');
    }
  };

  return (
    <div className="space-y-4">
      {fel ? <FlowError message={fel} /> : null}

      {klart ? (
        <p role="status" className="text-sm text-positiv">
          {klart}
        </p>
      ) : null}

      {egetKonto ? (
        <p className="text-sm leading-[22px] text-ink-2">
          Det här är ditt eget konto. Åtgärderna är avstängda för att en admin
          inte ska kunna låsa ut sig själv.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block sm:max-w-[200px] sm:flex-1">
              <span className="mb-1 block text-sm font-medium text-ink-2">
                Ge premium
              </span>
              <select
                value={langd}
                onChange={(e) => setLangd(e.target.value)}
                className={FALT_KLASS}
              >
                {LANGDER.map((l) => (
                  <option key={l.varde} value={l.varde}>
                    {l.etikett}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setOppen('premium')}
              className={KNAPP_SEKUNDAR}
            >
              Ge premium
            </button>
          </div>

          <div className="border-t border-kant pt-4">
            <p className="mb-2 text-sm leading-[22px] text-ink-2">
              Radering tar bort kontot permanent, tillsammans med brev, CV,
              analyser och ansökningar. Det går inte att ångra.
            </p>
            <button
              type="button"
              onClick={() => setOppen('radera')}
              className={KNAPP_DESTRUKTIV}
            >
              Radera kontot
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={oppen === 'premium'}
        onCancel={() => setOppen(null)}
        onConfirm={gePremium}
        title="Ge premium?"
        description={
          langd === 'unlimited'
            ? `${epost} får premium utan slutdatum.`
            : `${epost} får ${langd} dagar till. Tiden läggs ovanpå den premium kontot redan har.`
        }
        confirmLabel="Ge premium"
      />

      <ConfirmDialog
        open={oppen === 'radera'}
        onCancel={() => setOppen(null)}
        onConfirm={radera}
        title="Radera kontot permanent?"
        description={`${epost} och allt kontot innehåller tas bort. Det går inte att ångra.`}
        confirmLabel="Radera"
        destructive
      />
    </div>
  );
}
