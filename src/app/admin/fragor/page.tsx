/**
 * /admin/fragor (beställningen omgång 3, B3; copy-omgang3.md 5).
 *
 * Tre flikar: Kalibrering (registret mot fraga_kalibrering_vy, flaggade
 * först), Per testtyp (frågor i bank, kalibrerade, svar 7 och 30 dagar,
 * median andel rätt per nivå) och Rapporter (fraga_rapporter, nyast först).
 * Serverrenderat och serverpaginerat som Innehåll; flik, filter och sida står
 * i URL:en. Undantagna konton syns aldrig: vyn tar bort dem, rapporterna och
 * sessionerna läses med uteslut().
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import EmptyState from '@/components/shell/EmptyState';
import { Flikrad, Tabell, Td, Th, datum } from '../innehall/Delar';
import { Filterrad, NivaStaplar, PStapel, Sidvisning, StatusOrd, familjText, fragaHref, sekunder } from './Delar';
import { FLIKAR, NIVAER, arFlik, hamtaKalibrering, hamtaPerTestTyp, hamtaRapporter, SIDSTORLEK, type FlikNyckel } from './data';
import { TEST_KINDS, TEST_KIND_NAMN, arTestKind, type Niva } from '@/lib/fragor/register.server';
import { STATUS_ORDNING, STATUS_TEXT, type KalibreringStatus } from '@/lib/kalibrering/flaggor';
import { RAPPORT_COPY, type RapportOrsak } from '@/lib/traning/fragaRapport';

export const metadata: Metadata = { title: 'Frågor' };
export const dynamic = 'force-dynamic';

const BAS = '/admin/fragor';
const NIVA_NAMN: Record<Niva, string> = { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' };

interface Sidprops {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const las = (v: string | string[] | undefined) => (typeof v === 'string' ? v.trim() : '');

export default async function FragorSida({ searchParams }: Sidprops) {
  const sp = await searchParams;
  const flik: FlikNyckel = arFlik(las(sp.flik)) ? (las(sp.flik) as FlikNyckel) : 'kalibrering';
  const sida = Math.max(1, Number.parseInt(las(sp.sida) || '1', 10) || 1);
  const kind = arTestKind(las(sp.testtyp)) ? (las(sp.testtyp) as (typeof TEST_KINDS)[number]) : null;
  const niva = (NIVAER as readonly string[]).includes(las(sp.niva)) ? (las(sp.niva) as Niva) : null;
  const status = (STATUS_ORDNING as readonly string[]).includes(las(sp.status)) ? (las(sp.status) as KalibreringStatus) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Frågor" description="Kalibrering, statistik per testtyp och rapporter från användarna.">
        <Flikrad bas={BAS} aktiv={flik} flikar={FLIKAR} />
      </PageHeader>
      {flik === 'kalibrering' ? <KalibreringFlik sida={sida} kind={kind} niva={niva} status={status} /> : null}
      {flik === 'testtyp' ? <TestTypFlik /> : null}
      {flik === 'rapporter' ? <RapportFlik sida={sida} /> : null}
    </div>
  );
}

async function KalibreringFlik({
  sida,
  kind,
  niva,
  status,
}: {
  sida: number;
  kind: (typeof TEST_KINDS)[number] | null;
  niva: Niva | null;
  status: KalibreringStatus | null;
}) {
  const lista = await hamtaKalibrering({ kind, niva, status }, sida);
  const params = { flik: 'kalibrering', testtyp: kind ?? undefined, niva: niva ?? undefined, status: status ?? undefined };
  return (
    <div className="space-y-4">
      <Filterrad
        bas={BAS}
        flik="kalibrering"
        falt={[
          { namn: 'testtyp', etikett: 'Testtyp', varde: kind ?? '', val: TEST_KINDS.map((k) => ({ varde: k, etikett: TEST_KIND_NAMN[k] })) },
          { namn: 'niva', etikett: 'Nivå', varde: niva ?? '', val: NIVAER.map((n) => ({ varde: n, etikett: NIVA_NAMN[n] })) },
          { namn: 'status', etikett: 'Status', varde: status ?? '', val: STATUS_ORDNING.map((s) => ({ varde: s, etikett: STATUS_TEXT[s] })) },
        ]}
      />
      <SectionCard rubrik={`Frågor, ${SIDSTORLEK} per sida, flaggade först`} naken>
        {lista.rader.length === 0 ? (
          <EmptyState bare title="Inga frågor matchar filtret." />
        ) : (
          <>
            <Tabell>
              <thead>
                <tr>
                  <Th>Fråga</Th>
                  <Th>Nivå</Th>
                  <Th>Familj</Th>
                  <Th hoger>Svar</Th>
                  <Th>Andel rätt</Th>
                  <Th hoger>Mediantid</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {lista.rader.map((r) => (
                  <tr key={`${r.test_kind}:${r.id}`} data-fraga={r.id}>
                    <Td>
                      <Link href={fragaHref(r.test_kind, r.id)} className="break-all underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1">
                        {r.id}
                      </Link>
                      <span className="mt-0.5 block text-meta text-ink-3">{TEST_KIND_NAMN[r.test_kind]}</span>
                    </Td>
                    <Td dampad>{NIVA_NAMN[r.niva]}</Td>
                    <Td dampad>{familjText(r.test_kind, r.familj)}</Td>
                    <Td hoger tal>
                      {r.svar}
                    </Td>
                    <Td>
                      <PStapel pPrior={r.p_prior} p={r.p} />
                    </Td>
                    <Td hoger tal dampad>
                      {sekunder(r.tid_median_s)}
                    </Td>
                    <Td>
                      <StatusOrd status={r.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabell>
            <Sidvisning bas={BAS} params={params} sida={lista.sida} sidor={lista.sidor} />
          </>
        )}
      </SectionCard>
      <p className="text-meta text-ink-3">
        {lista.vyFinns
          ? 'Okalibrerad: under 30 svar eller 20 konton. Stapeln visar uppmätt andel rätt, strecket den antagna. Ägarens konto och testkonton räknas inte.'
          : 'Kalibreringsvyn gick inte att läsa, så alla frågor står som okalibrerade.'}
      </p>
    </div>
  );
}

async function TestTypFlik() {
  const { rader } = await hamtaPerTestTyp();
  const tom = rader.every((r) => r.svar30 === 0 && r.kalibrerade === 0);
  return (
    <SectionCard rubrik="Per testtyp" naken>
      <Tabell>
        <thead>
          <tr>
            <Th>Testtyp</Th>
            <Th hoger>I bank</Th>
            <Th hoger>Kalibrerade</Th>
            <Th hoger>Svar, 7 dagar</Th>
            <Th hoger>Svar, 30 dagar</Th>
            <Th>Andel rätt, grund · avancerad · expert</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kant">
          {rader.map((r) => (
            <tr key={r.kind}>
              <Td>{TEST_KIND_NAMN[r.kind]}</Td>
              <Td hoger tal>
                {r.iBank}
              </Td>
              <Td hoger tal>
                {r.kalibrerade}
              </Td>
              <Td hoger tal>
                {r.svar7}
              </Td>
              <Td hoger tal>
                {r.svar30}
              </Td>
              <Td>
                {NIVAER.every((n) => r.medianP[n].p == null) ? (
                  <span className="text-ink-3">Inga svar än.</span>
                ) : (
                  <NivaStaplar varden={NIVAER.map((n) => ({ niva: NIVA_NAMN[n], ...r.medianP[n] }))} />
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Tabell>
      {tom ? <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">Inga svar än.</p> : null}
    </SectionCard>
  );
}

async function RapportFlik({ sida }: { sida: number }) {
  const lista = await hamtaRapporter(sida);
  return (
    <SectionCard rubrik="Rapporter, nyast först" naken>
      {lista.rader.length === 0 ? (
        <EmptyState bare title="Inga rapporter än." />
      ) : (
        <>
          <Tabell>
            <thead>
              <tr>
                <Th>Fråga</Th>
                <Th>Testtyp</Th>
                <Th>Orsak</Th>
                <Th>Kommentar</Th>
                <Th hoger>Datum</Th>
                <Th hoger>Rapporter på frågan</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {lista.rader.map((r) => (
                <tr key={r.id} data-rapport={r.id}>
                  <Td>
                    <Link href={fragaHref(r.test_kind, r.q_id)} className="break-all underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1">
                      {r.q_id}
                    </Link>
                  </Td>
                  <Td dampad>{TEST_KIND_NAMN[r.test_kind]}</Td>
                  <Td>{RAPPORT_COPY.orsak[r.orsak as RapportOrsak] ?? r.orsak}</Td>
                  <Td dampad>{r.kommentar ?? 'Ingen kommentar'}</Td>
                  <Td hoger tal dampad>
                    {datum(r.created_at)}
                  </Td>
                  <Td hoger tal>
                    {r.paFragan}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabell>
          <Sidvisning bas={BAS} params={{ flik: 'rapporter' }} sida={lista.sida} sidor={lista.sidor} />
        </>
      )}
    </SectionCard>
  );
}
