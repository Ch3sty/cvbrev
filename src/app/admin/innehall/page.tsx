/**
 * /admin/innehall (docs/plan-admin.md avsnitt 4.8).
 *
 * Fem flikar som ersatter de fem gamla sidorna cvs, letters, ai-documents,
 * kandidatpool och rekryterare. Sidan svarar pa en enda fraga: vad finns det i
 * systemet, och vaxer det?
 *
 * Tre saker som ar medvetna:
 *
 * **Ingen dokumenttext.** Varken brevets innehall eller CV:ts rada text lases
 * hit. En lista over 242 brev som bar med sig varje brevtext ar bade en
 * integritetslacka och ett prestandaproblem, och den loser ingen uppgift:
 * adminen behover veta att brevet finns, inte vad det star i det. Dokumentet
 * oppnas pa begaran, i anvandarens egen vy.
 *
 * **Serverrenderat och serverpaginerat.** Sidan gor inget klientanrop for att
 * fylla en lista. Flik, sok och sidnummer star i URL:en, sa varje tillstand ar
 * en lank som gar att dela och backa till.
 *
 * **Bara den valda flikens data hamtas.** Antalsraden ovanfor listan ar
 * billig (count head), sjalva raderna ar det inte. Att hamta alla fem flikarna
 * vid varje sidladdning hade gjort fyra av dem till ren spillvarme.
 */

import type { Metadata } from 'next';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import EmptyState from '@/components/shell/EmptyState';
import RekryterareLista from './RekryterareLista';
import {
  FLIKAR,
  SIDSTORLEK,
  arFlik,
  hamtaBrev,
  hamtaBrevAntal,
  hamtaCv,
  hamtaCvAntal,
  hamtaKandidater,
  hamtaMallar,
  hamtaRekryterare,
  type FlikNyckel,
} from './data';
import {
  Chip,
  Flikrad,
  Paginering,
  Sokfalt,
  Tabell,
  Td,
  Th,
  datum,
  datumtid,
} from './Delar';

export const metadata: Metadata = { title: 'Innehåll' };

// Listorna ar farska fragor mot sma tabeller, inte cachade aggregat. Sidan ar
// snabb for att fragan ar liten, precis som anvandarlistan i planens 4.4.
export const dynamic = 'force-dynamic';

const BAS = '/admin/innehall';

interface Sidprops {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function las(v: string | string[] | undefined): string {
  return typeof v === 'string' ? v.trim() : '';
}

export default async function InnehallSida({ searchParams }: Sidprops) {
  const sp = await searchParams;

  const flik: FlikNyckel = arFlik(las(sp.flik)) ? (las(sp.flik) as FlikNyckel) : 'cv';
  const sok = las(sp.sok);
  const sida = Math.max(1, Number.parseInt(las(sp.sida) || '1', 10) || 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Innehåll"
        description="Vad som finns i systemet: dokument, mallar, kandidater och rekryterare."
      >
        <Flikrad bas={BAS} aktiv={flik} flikar={FLIKAR} />
      </PageHeader>

      {flik === 'cv' ? <CvFlik sida={sida} sok={sok} /> : null}
      {flik === 'brev' ? <BrevFlik sida={sida} sok={sok} /> : null}
      {flik === 'mallar' ? <MallarFlik /> : null}
      {flik === 'kandidater' ? <KandidatFlik sida={sida} sok={sok} /> : null}
      {flik === 'rekryterare' ? <RekryterareFlik /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CV
// ---------------------------------------------------------------------------

async function CvFlik({ sida, sok }: { sida: number; sok: string }) {
  const [antal, lista] = await Promise.all([hamtaCvAntal(), hamtaCv(sida, sok)]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard etikett="CV totalt" varde={antal.totalt.toLocaleString('sv-SE')} />
        <MetricCard etikett="Senaste 7 dagarna" varde={antal.period7.toLocaleString('sv-SE')} />
        <MetricCard etikett="Senaste 30 dagarna" varde={antal.period30.toLocaleString('sv-SE')} />
        <MetricCard etikett="Senaste 90 dagarna" varde={antal.period90.toLocaleString('sv-SE')} />
      </div>

      <Sokfalt bas={BAS} flik="cv" varde={sok} placeholder="Sök på filnamn" />

      <SectionCard rubrik={`Uppladdade CV, ${SIDSTORLEK} per sida`} naken>
        {lista.rader.length === 0 ? (
          <EmptyState
            bare
            title={sok ? 'Inget CV matchar sökningen' : 'Inga CV ännu'}
            description={
              sok
                ? 'Sökningen går mot filnamnet. Prova en kortare del av namnet.'
                : 'CV som laddas upp eller skapas hamnar här.'
            }
          />
        ) : (
          <>
            <Tabell>
              <thead>
                <tr>
                  <Th>Användare</Th>
                  <Th>Filnamn</Th>
                  <Th>Innehåll</Th>
                  <Th hoger>Uppladdat</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {lista.rader.map((r) => (
                  <tr key={r.id}>
                    <Td>{r.epost ?? 'Okänd'}</Td>
                    <Td dampad>
                      {/*
                        Filnamn kommer fran anvandarens filsystem och kan vara
                        hundratals tecken langt, ofta URL-kodat. Utan en bredd
                        trycker en enda sadan rad de tva sista kolumnerna utanfor
                        tabellens synfalt. Namnet bryts i stallet over tva rader.
                      */}
                      <span className="block max-w-[28rem] break-all">
                        {r.filnamn ?? 'Utan filnamn'}
                      </span>
                    </Td>
                    <Td>
                      <span className="flex flex-wrap gap-1">
                        {r.extraheringMisslyckades ? (
                          <Chip ton="fel">Text saknas</Chip>
                        ) : (
                          <Chip ton="positiv">Text läst</Chip>
                        )}
                        {r.strukturerat ? <Chip>Strukturerat</Chip> : null}
                      </span>
                    </Td>
                    <Td hoger tal dampad>
                      {datumtid(r.skapad)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabell>
            <Paginering
              bas={BAS}
              flik="cv"
              sok={sok}
              sida={lista.sida}
              sidor={lista.sidor}
              totalt={lista.totalt}
            />
          </>
        )}
      </SectionCard>

      <p className="text-meta text-ink-3">
        CV-texten läses aldrig in i den här listan. Dokumentet öppnas på begäran, i
        användarens egen vy.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brev
// ---------------------------------------------------------------------------

async function BrevFlik({ sida, sok }: { sida: number; sok: string }) {
  const [antal, lista] = await Promise.all([hamtaBrevAntal(), hamtaBrev(sida, sok)]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard etikett="Brev totalt" varde={antal.totalt.toLocaleString('sv-SE')} />
        <MetricCard etikett="Senaste 7 dagarna" varde={antal.period7.toLocaleString('sv-SE')} />
        <MetricCard etikett="Senaste 30 dagarna" varde={antal.period30.toLocaleString('sv-SE')} />
        <MetricCard etikett="Senaste 90 dagarna" varde={antal.period90.toLocaleString('sv-SE')} />
      </div>

      <Sokfalt bas={BAS} flik="brev" varde={sok} placeholder="Sök på företag eller tjänst" />

      <SectionCard rubrik={`Skapade brev, ${SIDSTORLEK} per sida`} naken>
        {lista.rader.length === 0 ? (
          <EmptyState
            bare
            title={sok ? 'Inget brev matchar sökningen' : 'Inga brev ännu'}
            description={
              sok
                ? 'Sökningen går mot företag och tjänst.'
                : 'Brev som skapas i flödet hamnar här.'
            }
          />
        ) : (
          <>
            <Tabell>
              <thead>
                <tr>
                  <Th>Användare</Th>
                  <Th>Företag</Th>
                  <Th>Tjänst</Th>
                  <Th>Ton</Th>
                  <Th>Språk</Th>
                  <Th hoger>Skapat</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {lista.rader.map((r) => (
                  <tr key={r.id}>
                    <Td>{r.epost ?? 'Okänd'}</Td>
                    <Td>{r.foretag ?? 'Utan företag'}</Td>
                    <Td dampad>{r.tjanst ?? 'Utan tjänst'}</Td>
                    <Td dampad>{r.tonalitet ?? 'Standard'}</Td>
                    <Td dampad>{(r.sprak ?? 'sv').toUpperCase()}</Td>
                    <Td hoger tal dampad>
                      {datumtid(r.skapad)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabell>
            <Paginering
              bas={BAS}
              flik="brev"
              sok={sok}
              sida={lista.sida}
              sidor={lista.sidor}
              totalt={lista.totalt}
            />
          </>
        )}
      </SectionCard>

      <p className="text-meta text-ink-3">
        Brevtexten läses aldrig in i den här listan. Kolumnerna är metadata som
        användaren själv fyllt i.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mallar
// ---------------------------------------------------------------------------

async function MallarFlik() {
  const m = await hamtaMallar();
  const oanvanda = m.rader.filter((r) => r.nedladdningar + r.brev === 0).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard etikett="Mallar i registret" varde={m.totalt} />
        <MetricCard etikett="Gratis" varde={m.gratis} jamforelse={`${m.premium} premium`} />
        <MetricCard
          etikett="Nedladdningar"
          varde={m.nedladdningarTotalt.toLocaleString('sv-SE')}
        />
        <MetricCard
          etikett="Används inte"
          varde={oanvanda}
          jamforelse="mallar utan en enda användning"
        />
      </div>

      <SectionCard rubrik="Mallanvändning, mest använd först" naken>
        <Tabell>
          <thead>
            <tr>
              <Th>Mall</Th>
              <Th>Kategori</Th>
              <Th>Nivå</Th>
              <Th hoger>CV-nedladdningar</Th>
              <Th hoger>Brev</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {m.rader.map((r) => (
              <tr key={r.id}>
                <Td>
                  <span className="flex flex-wrap items-center gap-2">
                    {r.namn}
                    {r.atsSaker ? <Chip>ATS-säker</Chip> : null}
                  </span>
                </Td>
                <Td dampad>{r.kategori}</Td>
                <Td dampad>{r.niva === 'free' ? 'Gratis' : 'Paket'}</Td>
                <Td hoger tal>
                  {r.nedladdningar.toLocaleString('sv-SE')}
                </Td>
                <Td hoger tal dampad>
                  {r.brev.toLocaleString('sv-SE')}
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabell>
      </SectionCard>

      {m.okandaMallar.length ? (
        <SectionCard rubrik="Mall-id utan mall i registret">
          <p className="text-sm text-ink-2">
            Historiken pekar på {m.okandaMallar.length} mall-id som inte längre finns i
            registret: {m.okandaMallar.join(', ')}. Det betyder att en mall tagits bort
            under fötterna på sin egen historik.
          </p>
        </SectionCard>
      ) : null}

      <p className="text-meta text-ink-3">
        Registret är sanningen om vilka mallar som finns. Användningen räknas ur
        formatted_cv_downloads för CV och letters.template_id för brev, så en mall med
        noll är en mall ingen valt, inte en mall som saknar data.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kandidatpool
// ---------------------------------------------------------------------------

async function KandidatFlik({ sida, sok }: { sida: number; sok: string }) {
  const lista = await hamtaKandidater(sida, sok);

  const vantande = lista.rader.reduce((s, r) => s + r.intressenVantande, 0);
  const accepterade = lista.rader.reduce((s, r) => s + r.intressenAccepterade, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard etikett="Kandidater i poolen" varde={lista.totalt.toLocaleString('sv-SE')} />
        <MetricCard
          etikett="Väntande intressen"
          varde={vantande}
          jamforelse="på den här sidan"
        />
        <MetricCard
          etikett="Accepterade intressen"
          varde={accepterade}
          jamforelse="på den här sidan"
        />
      </div>

      <Sokfalt bas={BAS} flik="kandidater" varde={sok} placeholder="Sök på namn eller e-post" />

      <SectionCard rubrik={`Kandidatpool, ${SIDSTORLEK} per sida`} naken>
        {lista.rader.length === 0 ? (
          <EmptyState
            bare
            title={sok ? 'Ingen kandidat matchar sökningen' : 'Poolen är tom'}
            description={
              sok
                ? 'Sökningen går mot namn och e-post.'
                : 'Kandidater som gör sig synliga för rekryterare hamnar här.'
            }
          />
        ) : (
          <>
            <Tabell>
              <thead>
                <tr>
                  <Th>Kandidat</Th>
                  <Th>Synlighet</Th>
                  <Th>Tillgänglig</Th>
                  <Th>Regioner</Th>
                  <Th hoger>Intressen</Th>
                  <Th hoger>Samtycke</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {lista.rader.map((r) => (
                  <tr key={r.userId}>
                    <Td>
                      <span className="block">{r.namn ?? 'Utan namn'}</span>
                      <span className="block text-meta text-ink-3">{r.epost ?? 'Okänd'}</span>
                    </Td>
                    <Td dampad>{r.synlighet ?? 'Okänd'}</Td>
                    <Td dampad>{r.tillganglighet ?? 'Ej angivet'}</Td>
                    <Td dampad>{r.regioner.length ? r.regioner.join(', ') : 'Hela landet'}</Td>
                    <Td hoger tal>
                      {r.intressenTotalt}
                      {r.intressenVantande ? (
                        <span className="block text-meta text-varning">
                          {r.intressenVantande} väntar
                        </span>
                      ) : null}
                    </Td>
                    <Td hoger tal dampad>
                      {datum(r.samtycke)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabell>
            <Paginering
              bas={BAS}
              flik="kandidater"
              sok={sok}
              sida={lista.sida}
              sidor={lista.sidor}
              totalt={lista.totalt}
            />
          </>
        )}
      </SectionCard>

      <p className="text-meta text-ink-3">
        Lönespann och kandidatens egen pitch läses inte hit. Lönespannet går aldrig ut,
        och pitchen hör hemma i kandidatens vy.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rekryterare
// ---------------------------------------------------------------------------

async function RekryterareFlik() {
  const r = await hamtaRekryterare();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          etikett="Väntar på beslut"
          varde={r.vantande}
          jamforelse={r.vantande ? 'kräver en handling' : 'ingenting att göra'}
        />
        <MetricCard etikett="Godkända" varde={r.godkanda} />
        <MetricCard etikett="Avslagna" varde={r.avslagna} />
      </div>

      <SectionCard rubrik="Ansökningar, väntande först" naken>
        <RekryterareLista rader={r.rader} />
      </SectionCard>

      <p className="text-meta text-ink-3">
        Beslutet skrivs via /api/admin/recruiters, samma rutt och samma kontrakt som
        tidigare. Rutten sätter status, beslutstidpunkt och vem som beslutade.
      </p>
    </div>
  );
}
