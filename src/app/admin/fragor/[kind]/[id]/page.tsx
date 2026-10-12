/**
 * /admin/fragor/[kind]/[id] (beställningen omgång 3, B3; copy-omgang3.md 5.5).
 *
 * En fråga: renderad med facit markerat, regel och misstag (genomgångens
 * egna komponenter: matrisens, figurseriernas och deduktivens), raden ur
 * kalibreringsvyn och rapporterna på frågan. Verbalt och numeriskt har ingen
 * genomgång per fråga utan session, så texten, påståendet eller tabellen
 * ritas här med facit och förklaring. Serverrenderat, ingen ny API-rutt.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import EmptyState from '@/components/shell/EmptyState';
import NumericalTable from '@/components/tests/numerical-shared/NumericalTable';
import MatrixQuestionReview from '@/components/tests/shared/reviews/MatrixQuestionReview';
import FigurserieReview from '@/components/tests/serie/FigurserieReview';
import { DeduktivGenomgang } from '@/components/tests/deduktiv/DeduktivReview';
import { ALLA_MATRISFRAGOR } from '@/lib/logicTestV7/selectQuestions.v7';
import { genomgaFraga } from '@/lib/logicTestV7/visning';
import { genomgaSerie, hittaSerieFraga } from '@/lib/figurserierV1/fragor.server';
import { genomgaDeduktiv, hittaDeduktivFraga } from '@/lib/deduktivV1/fragor.server';
import { register, arTestKind, TEST_KIND_NAMN, type TestKind } from '@/lib/fragor/register.server';
import { hittaUnderlagsfraga } from '@/lib/fragor/visning.server';
import { kalibreringStatus, STATUS_TEXT } from '@/lib/kalibrering/flaggor';
import { RAPPORT_COPY, type RapportOrsak } from '@/lib/traning/fragaRapport';
import { Tabell, Td, Th, datum } from '../../../innehall/Delar';
import { PStapel, sekunder } from '../../Delar';
import { hamtaRapporter, hamtaVyRad } from '../../data';
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7';

export const metadata: Metadata = { title: 'Fråga' };
export const dynamic = 'force-dynamic';

interface Sidprops {
  params: Promise<{ kind: string; id: string }>;
}

const FACIT_ORD: Record<string, string> = { true: 'Sant', false: 'Falskt', cannot_say: 'Går inte att avgöra' };

export default async function FragaSida({ params }: Sidprops) {
  const { kind: k, id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  if (!arTestKind(k)) notFound();
  const kind = k as TestKind;
  const rad = register().find((r) => r.test_kind === kind && r.id === id) ?? null;
  const [vy, rapporter] = await Promise.all([hamtaVyRad(id), hamtaRapporter(1, id)]);

  const fraga = <Fragan kind={kind} id={id} />;
  const status = rad && vy ? kalibreringStatus({ svar: vy.svar, konton: vy.konton, p: vy.p, p_prior: rad.p_prior, band: rad.band }) : 'okalibrerad';

  return (
    <div className="space-y-6">
      <PageHeader title={id} description={`${TEST_KIND_NAMN[kind]}${rad ? `, ${rad.niva}, ${rad.familj ?? 'utan familj'}` : ''}`}>
        <Link href="/admin/fragor" className="text-sm text-ink-2 underline decoration-kant-stark underline-offset-4">
          Alla frågor
        </Link>
      </PageHeader>

      <SectionCard rubrik="Frågan">
        <div className="space-y-4" data-admin-fraga={id}>
          {fraga}
        </div>
      </SectionCard>

      <SectionCard rubrik="Svar på frågan">
        {!vy || vy.svar === 0 ? (
          <EmptyState bare title="Inga svar än." />
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-meta text-ink-3">Svar</dt>
              <dd className="tabular-nums text-ink-1">{vy.svar}</dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">Konton</dt>
              <dd className="tabular-nums text-ink-1">{vy.konton}</dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">Andel rätt</dt>
              <dd>{rad ? <PStapel pPrior={rad.p_prior} p={vy.p} /> : null}</dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">Mediantid</dt>
              <dd className="tabular-nums text-ink-1">{sekunder(vy.tid_median_s)}</dd>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-meta text-ink-3">Status</dt>
              <dd className="text-ink-1">{STATUS_TEXT[status]}</dd>
            </div>
          </dl>
        )}
      </SectionCard>

      <SectionCard rubrik="Rapporter" naken>
        {rapporter.rader.length === 0 ? (
          <EmptyState bare title="Inga rapporter på den här frågan." />
        ) : (
          <Tabell>
            <thead>
              <tr>
                <Th>Orsak</Th>
                <Th>Kommentar</Th>
                <Th hoger>Datum</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {rapporter.rader.map((r) => (
                <tr key={r.id}>
                  <Td>{RAPPORT_COPY.orsak[r.orsak as RapportOrsak] ?? r.orsak}</Td>
                  <Td dampad>{r.kommentar ?? 'Ingen kommentar'}</Td>
                  <Td hoger tal dampad>
                    {datum(r.created_at)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabell>
        )}
      </SectionCard>
    </div>
  );
}

function Fragan({ kind, id }: { kind: TestKind; id: string }) {
  if (kind === 'matris') {
    const q = (ALLA_MATRISFRAGOR as LayeredQuestion[]).find((x) => x.id === id);
    if (!q) return <EmptyState bare title="Frågan finns inte i banken." />;
    return <MatrixQuestionReview slug="matrislogik-grund" answers={[]} fragor={[genomgaFraga(q, 'admin', false)]} allaOppna utanTid utanKategorier utanRubrik />;
  }
  if (kind === 'figurserie') {
    const q = hittaSerieFraga(id);
    if (!q) return <EmptyState bare title="Frågan finns inte i banken." />;
    return <FigurserieReview answers={[]} fragor={[genomgaSerie(q, 'admin', false)]} oppnaFran={[0]} />;
  }
  if (kind === 'deduktiv') {
    const q = hittaDeduktivFraga(id);
    if (!q) return <EmptyState bare title="Frågan finns inte i banken." />;
    return <DeduktivGenomgang q={genomgaDeduktiv(q, 'admin', false)} nr={1} antal={1} />;
  }
  const u = hittaUnderlagsfraga(kind, id);
  if (!u) return <EmptyState bare title="Frågan finns inte i banken." />;
  return (
    <>
      <div>
        <p className="text-ey uppercase text-ink-3">{u.titel}</p>
        {u.text ? <p className="mt-1.5 whitespace-pre-line text-sm leading-[22px] text-ink-1">{u.text}</p> : null}
      </div>
      {u.tabell ? <NumericalTable data={u.tabell as never} /> : null}
      <p className="font-display text-lg font-bold leading-[24px] text-ink-1">{u.fraga}</p>
      {u.alternativ ? (
        <ul className="space-y-2">
          {u.alternativ.map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border px-3.5 py-2.5 text-sm ${a.ratt ? 'border-koppar text-ink-1 shadow-[inset_0_0_0_1px_var(--koppar)]' : 'border-kant text-ink-2'}`}
            >
              {a.text}
              {a.ratt ? <span className="ml-2 text-meta text-koppar-ink">facit</span> : null}
              {a.misstag ? <span className="mt-0.5 block text-meta text-ink-3">{a.misstag}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {u.facit ? (
        <p className="text-sm text-ink-1">
          <span className="text-meta text-ink-3">Facit </span>
          {FACIT_ORD[u.facit] ?? u.facit}
        </p>
      ) : null}
      {u.forklaring ? (
        <div className="regelpanel rounded-[14px] bg-ton px-4 py-3.5">
          <p className="text-ey uppercase text-ton-ink">Förklaringen</p>
          <p className="regelpanel-regel mt-1 text-sm leading-[21px]">{u.forklaring}</p>
        </div>
      ) : null}
    </>
  );
}
