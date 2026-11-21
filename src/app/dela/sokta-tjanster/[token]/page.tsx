// Publik delningsvy för sökstatistiken: /dela/sokta-tjanster/[token].
// Server component utan auth. getSharedApplicationData verifierar token,
// TTL och återkallning, och returnerar bara det ägaren valt att exponera.
// Ren läsvy: inga åtgärder, ingen navigering in i appen utöver logotypen och
// fotens länk.
//
// Samma form som Statistik i Jobbsöket: väggen, den lyfta panelen med
// tratten (TrattBild, samma som i rummet) och listan som kitets rader. Sidan
// ligger utanför /dashboard, så den läser själv in Jobbsökets CSS och sätter
// data-rum="jobb" (rummets tokens, ljust och mörkt läge via globals.css).

import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import '../../../jobb3.css';
import '../../../jobb3-b.css';
import '../../../jobb3-c.css';
import Logo from '@/components/Logo';
import {
  JobbVagg,
  VaggHero,
  VaggText,
  Golv,
  LyftPanel,
  PanelHuvud,
  Avsnitt,
  SektionsHuvud,
  Kort,
  TjanstRad,
  TomtLage,
  IkonDokument,
  type BrickTon as KitTon,
  type FyrSteg,
  type Status,
} from '@/components/jobb3/kit';
import { TrattBild, type TrattBildBricka, type TrattBildData } from '@/components/jobb3/sokta/TrattBild';
import { KANAL_TEXT } from '@/components/jobb3/sokta/text';
import { getSharedApplicationData, type DeladeToner, type DeladTratt, type SharedApplicationRow } from '@/lib/applications/shareLinks';
import { STATUS_META, type ApplicationEventType } from '@/lib/applications/status';
import { brickBokstaver, dagFor, idagSv, langDagMedAr, type BrickTon } from '@/lib/jobbsok';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Delad jobbsökningsöversikt | Jobbcoach.ai',
  robots: { index: false, follow: false },
};

function Sida({ children }: { children: ReactNode }) {
  return (
    <div data-rum="jobb" className="j3-sida flex min-h-screen flex-col">
      {children}
      <footer className="j3-fin px-4 pb-8 pt-2 text-center">
        Översikten är delad via{' '}
        <Link href="/" className="font-semibold underline underline-offset-2" style={{ color: 'var(--j3-ink-2)' }}>
          jobbcoach.ai
        </Link>
      </footer>
    </div>
  );
}

function Vagg({ children, hojd, hojdMobil }: { children: ReactNode; hojd: number; hojdMobil: number }) {
  return (
    <JobbVagg hojd={hojd} hojdMobil={hojdMobil} flik={false} etikett="Sökta tjänster">
      <Link href="/" aria-label="Jobbcoach.ai" className="inline-flex">
        <Logo variant="on-dark" height={32} />
      </Link>
      <VaggHero spalt={640}>{children}</VaggHero>
    </JobbVagg>
  );
}

/** Tonerna i den ordning brickorna läggs i lådorna. */
const TON_ORDNING: BrickTon[] = ['erbjudande', 'intervju', 'vantar', 'tyst', 'avslag'];

/** Delningens aggregat blir brickor utan bokstäver, en per sökt tjänst. */
function brickorAv(toner: DeladeToner): TrattBildBricka[] {
  return TON_ORDNING.flatMap((ton) => Array.from({ length: toner[ton] ?? 0 }, () => ({ bokstaver: '', ton })));
}

function trattData(t: DeladTratt): TrattBildData {
  return {
    sokta: { ...t.sokta, brickor: brickorAv(t.sokta.toner) },
    svar: { ...t.svar, brickor: brickorAv(t.svar.toner) },
    intervju: { ...t.intervju, brickor: brickorAv(t.intervju.toner) },
    erbjudande: { ...t.erbjudande, brickor: brickorAv(t.erbjudande.toner) },
  };
}

/** Radens läge ur current_status, som listan visade förut. */
function radLage(status: ApplicationEventType | null): { ton: KitTon; steg: { steg: FyrSteg; avslutad?: boolean }; pill: Status } {
  switch (status) {
    case 'interview_invited':
      return { ton: 'int', steg: { steg: 3 }, pill: 'intervju' };
    case 'interview_completed':
    case 'trial_work_completed':
      return { ton: 'int', steg: { steg: 3 }, pill: 'vantar-besked' };
    case 'offer_received':
    case 'accepted':
      return { ton: 'int', steg: { steg: 4 }, pill: 'erbjudande' };
    case 'rejected':
    case 'declined':
      return { ton: 'slut', steg: { steg: 2, avslutad: true }, pill: 'avslutad' };
    default:
      return { ton: 'standard', steg: { steg: 1 }, pill: 'vantar' };
  }
}

function Rad({ row }: { row: SharedApplicationRow }) {
  const lage = radLage(row.current_status);
  const company = row.company ?? '';
  const dag = dagFor(row.applied_at);
  const kanal = KANAL_TEXT[row.application_channel] ?? '';
  return (
    <TjanstRad
      storlek="stor"
      bricka={{ kod: company ? brickBokstaver(company) : '', ton: lage.ton }}
      rubrik={row.job_title}
      arbetsgivare={company ? (row.location ? `${company}, ${row.location}` : company) : undefined}
      text={[dag ? `Sökt ${langDagMedAr(dag)}` : 'Sökt', kanal].filter(Boolean).join(', ')}
      steg={lage.steg}
      status={{ status: lage.pill, text: row.current_status ? STATUS_META[row.current_status]?.label : 'Sökt' }}
    />
  );
}

export default async function DeladSoktaTjansterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shared = token ? await getSharedApplicationData(token) : null;

  if (!shared) {
    return (
      <Sida>
        <Vagg hojd={360} hojdMobil={280}>
          <VaggText
            ogon="Sökta tjänster"
            rubrik="Länken har upphört"
            ingress="Delningslänkar gäller i 30 dagar och kan återkallas när som helst av den som delade den. Be personen om en ny länk."
          />
        </Vagg>
        <div className="flex-1" />
      </Sida>
    );
  }

  const { tratt, applications, ownerName } = shared;

  return (
    <Sida>
      <Vagg hojd={360} hojdMobil={260}>
        <VaggText ogon="Sökta tjänster" rubrik={ownerName || 'Delad översikt'} ingress={`Läget den ${langDagMedAr(idagSv())}.`} />
      </Vagg>

      <Golv className="flex-1">
        <LyftPanel lyftMobil={28} luft="20px 28px 28px" rubrikId="tratt-rubrik">
          <PanelHuvud rubrik="Från sökt till erbjudande" rubrikId="tratt-rubrik" under="Varje bricka är en sökt tjänst. Följ dem från vänster till höger." />
          <div style={{ marginTop: 22 }}>
            {tratt.sokta.antal > 0 ? (
              <TrattBild tratt={trattData(tratt)} />
            ) : (
              <TomtLage ikon={<IkonDokument />} rubrik="Inga sökta tjänster än" text="Här syns vägen från sökt till erbjudande när den första sökta tjänsten är loggad." />
            )}
          </div>
        </LyftPanel>

        {applications && applications.length > 0 ? (
          <Avsnitt topp={48} rubrikId="lista-rubrik">
            <SektionsHuvud rubrikId="lista-rubrik" rubrik="Sökta tjänster" />
            <Kort lista>
              {applications.map((row, i) => (
                <Rad key={i} row={row} />
              ))}
            </Kort>
          </Avsnitt>
        ) : null}
      </Golv>
    </Sida>
  );
}
