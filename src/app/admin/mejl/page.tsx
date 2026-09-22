/**
 * Mejl: fraga 4, fungerar mejlen? (planens avsnitt 4.6)
 *
 * Serverrenderad. All statistik laser ur Supabase, aldrig ur Resends API:
 * nyckeln ar sandbegransad och svarar 401 pa /emails.
 *
 * Fonstret ar 90 dagar. Kortare an sa och kampanjen i juli faller ur, vilket
 * gor att de enda siffrorna med volym forsvinner. Kon och studsarna galler
 * nu och bryr sig inte om fonstret.
 *
 * Spec-admin-tydlighet 2026-09-22, sida 7:
 *   - Oppnandegraden raknas per utskick och passerar aldrig 100 %.
 *   - Utskick till undantagna konton raknas inte.
 *   - Tomma diagram och listor sager "0 sedan ..., senaste skickat ...".
 *   - Kopmejlen ar en egen grupp, direkt under korten.
 *   - Inga streck i kort.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import { MATSTART, nollSedan, tidKort } from '@/lib/admin/tomt';
import { hamtaMejl, DIGEST_FONSTER_TIMMAR } from './data';
import MejlTabell from './MejlTabell';
import Kolarm from './Kolarm';
import { MallDiagram, OppnandegradDiagram } from './MejlDiagram';
import { antal, grad, mallNamn, procent } from './format';

export const metadata: Metadata = {
  title: 'Mejl',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Fonstret i dagar. 90 rymmer bade julikampanjen och livscykelmejlen. */
const FONSTER_DAGAR = 90;

/** Hur manga mallar som far plats i stapeldiagrammet innan det blir grot. */
const DIAGRAM_MALLAR = 8;

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

/** "0 köpmejl sedan 22 sep kl. 10.51, senaste skickat 15 sep kl. 07.00." */
function nollText(enhet: string, sedan: string, senast: string | null): string {
  const efter = senast ? `senaste skickat ${tidKort(senast)}` : 'inget skickat än';
  return `${nollSedan(enhet, sedan)}, ${efter}.`;
}

/** Den senare av tva tidpunkter, som ISO eller datum. */
function senare(a: string, b: string): string {
  const t = (s: string) => Date.parse(s.length === 10 ? `${s}T00:00:00Z` : s);
  return t(a) >= t(b) ? a : b;
}

/** "14 sep kl. 07.00", eller en mening nar inget vantar. */
function nastaText(iso: string | null): string {
  return iso ? tidKort(iso) : 'inget väntar';
}

export default async function MejlPage() {
  const data = await hamtaMejl(FONSTER_DAGAR);

  const leveransgrad = grad(data.totalt.levererade, data.totalt.skickade);
  const oppnandegrad = grad(data.totalt.oppnade, data.totalt.levererade);
  const studsgrad = grad(data.totalt.studs, data.totalt.skickade);

  const tomtAlla = nollText('utskick', data.fran, data.senast.alla);
  const tomtLivscykel = nollText('livscykelmejl', data.fran, data.senast.livscykel);
  // Kopmejl kan inte ha skickats fore paketen, sa sedan-datumet ar det
  // senare av fonstrets start och paketens mätstart.
  const tomtKop = nollText('köpmejl', senare(data.fran, MATSTART.paket), data.senast.kop);

  // Andel som text, eller vad som saknas nar basen ar noll. Aldrig ett streck.
  const andelAv = (andel: number | null, bas: string, decimaler = 0) =>
    andel === null ? tomtAlla : `${procent(andel, decimaler)} av ${bas}`;

  // Stapeldiagrammet tar de storsta mallarna. Resten star i tabellen under,
  // dar de gar att lasa exakt i stallet for att gissas ur en stapelhojd.
  const diagramMallar = data.perMall
    .filter((r) => r.levererade > 0)
    .slice(0, DIAGRAM_MALLAR)
    .map((r) => ({
      mall: mallNamn(r.nyckel),
      levererade: r.levererade,
      oppnade: r.oppnade,
      klick: r.klick,
    }));

  // Hogst en warm rad per vy enligt designsystemet. Misslyckade utskick i kon
  // ar det enda som kraver handling; nasta korning ar bara information.
  const harFel = data.koTotalt.misslyckade > 0;

  // Utan RESEND_WEBHOOK_SECRET skriver webhooken ingenting, och da stannar
  // varje grad pa noll utan att nagot ser trasigt ut. Det ar den enda
  // felkallan pa sidan som inte gar att se i talen, sa den star som text.
  const webhookKonfigurerad = Boolean(process.env.RESEND_WEBHOOK_SECRET);

  const undantag = `${data.undantagText}${
    data.undantagnaUtskick
      ? `, ${antal(data.undantagnaUtskick)} utskick till dem räknas inte`
      : ''
  }.`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mejl"
        description={`Utskick, leverans och öppningar de senaste ${FONSTER_DAGAR} dagarna. Kön gäller nu. ${undantag}`}
      />

      {!webhookKonfigurerad ? (
        <div className="rounded-xl border border-kant bg-insunken px-4 py-3">
          <p className="text-sm text-ink-2">
            RESEND_WEBHOOK_SECRET är inte satt i den här miljön. Utan den
            skriver webhooken inga händelser, och leverans, öppningar och klick
            stannar på noll utan att något ser trasigt ut. Skickade räknas ur
            email_log och påverkas inte.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Skickade"
          varde={antal(data.totalt.skickade)}
          jamforelse={
            data.totalt.skickade ? `senaste ${FONSTER_DAGAR} dagarna` : tomtAlla
          }
        />
        <MetricCard
          etikett="Levererade"
          varde={antal(data.totalt.levererade)}
          jamforelse={andelAv(leveransgrad, 'skickade')}
        />
        <MetricCard
          etikett="Öppnade"
          varde={antal(data.totalt.oppnade)}
          jamforelse={
            oppnandegrad === null
              ? tomtAlla
              : `${procent(oppnandegrad, 0)} av levererade, räknat per utskick`
          }
        />
        <MetricCard
          etikett="Studs"
          varde={antal(data.totalt.studs)}
          inverterad
          jamforelse={andelAv(studsgrad, 'skickade', 1)}
        />
      </div>

      <SectionCard
        rubrik={`Köpmejl (${data.perKop.length})`}
        action={
          <Link href="/admin/intakter" className={LANK}>
            Köpen på Intäkter
          </Link>
        }
        naken
      >
        <MejlTabell rader={data.perKop} rubrik="Köpmejl" tomText={tomtKop} />
        <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">
          Kvitto, Kom igång, Paketet förnyas och uppsägningskvittot. Kom igång
          och Paketet förnyas har ett utskick per dag och köpare, de räknas
          ihop här och står per dag i tabellen Per mall.
        </p>
      </SectionCard>

      <SectionCard rubrik="Kön i email_schedule">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard etikett="Väntande" varde={antal(data.koTotalt.vantande)} />
          <MetricCard
            etikett="Misslyckade försök"
            varde={antal(data.koTotalt.misslyckade)}
            inverterad
          />
          {/* En tidpunkt ar inte ett stort tal: "14 sep kl. 07.00" i text-tal
              bryter pa tva rader i kortets bredd. Vardet ar en ReactNode,
              sa kortet far en mindre grad har utan att komponenten rors. */}
          <MetricCard
            etikett="Nästa körning"
            varde={<span className="text-h1">{nastaText(data.koTotalt.nasta)}</span>}
          />
        </div>

        {harFel ? (
          <div className="mt-4">
            <Kolarm antal={data.koTotalt.misslyckade} />
          </div>
        ) : null}

        {data.ko.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th scope="col" className="py-3 pr-4 font-medium">Steg</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Väntande</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Misslyckade</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Nästa körning</th>
                  <th scope="col" className="py-3 pl-4 font-medium">Senaste fel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {data.ko.map((rad) => (
                  <tr key={rad.steg}>
                    <td className="py-3 pr-4 text-ink-1">{mallNamn(rad.steg)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {antal(rad.vantande)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${
                        rad.misslyckade > 0 ? 'text-fel' : 'text-ink-3'
                      }`}
                    >
                      {antal(rad.misslyckade)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-ink-2">
                      {nastaText(rad.nasta)}
                    </td>
                    <td className="max-w-[260px] py-3 pl-4 text-meta text-ink-3">
                      <span className="block truncate" title={rad.senasteFel ?? undefined}>
                        {rad.senasteFel ?? 'inget fel'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-2">Kön är tom.</p>
        )}
      </SectionCard>

      <SectionCard rubrik="Levererat, öppnat och klickat per mall">
        <MallDiagram rader={diagramMallar} tomText={tomtAlla} />
        <p className="mt-3 text-meta text-ink-3">
          De {DIAGRAM_MALLAR} största mallarna. Talen står exakt i tabellen
          under. Öppnat och klickat räknas en gång per utskick och mot
          levererade: ett mejl som aldrig kom fram kan varken öppnas eller
          klickas, och ett öppnat mejl räknas alltid som levererat.
        </p>
      </SectionCard>

      <SectionCard rubrik="Öppnandegrad per vecka">
        <OppnandegradDiagram rader={data.perVecka} tomText={tomtAlla} />
      </SectionCard>

      <SectionCard rubrik={`Per mall (${data.perMall.length})`} naken>
        <MejlTabell rader={data.perMall} rubrik="Mall" tomText={tomtAlla} />
      </SectionCard>

      <SectionCard rubrik={`Per livscykelsteg (${data.perSteg.length})`} naken>
        <MejlTabell rader={data.perSteg} rubrik="Steg" tomText={tomtLivscykel} />
      </SectionCard>

      <SectionCard rubrik="Veckodigestens effekt">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard etikett="Digest skickade" varde={antal(data.digest.skickade)} />
          <MetricCard
            etikett="Öppnade"
            varde={antal(data.digest.oppnade)}
            jamforelse={
              data.digest.skickade
                ? `${procent(grad(data.digest.oppnade, data.digest.skickade), 0)} av skickade`
                : `0 digest sedan ${tidKort(data.fran)}`
            }
          />
          <MetricCard
            etikett="Tillbaka inom 48 h"
            varde={antal(data.digest.medSession)}
            jamforelse={
              data.digest.andel === null
                ? 'ingen har öppnat än'
                : `${procent(data.digest.andel, 0)} av öppnarna`
            }
          />
        </div>
        <p className="mt-3 text-meta text-ink-3">
          En öppnare räknas som tillbaka när det finns aktivitet i
          user_activities inom {DIGEST_FONSTER_TIMMAR} timmar efter utskicket.
          Digesten gick första gången 13 september 2026, så underlaget är litet
          och talen säger ännu lite om effekten.
        </p>
      </SectionCard>

      <SectionCard
        rubrik={`Studsande adresser (${data.studsadeAdresser.length})`}
        naken
      >
        {data.studsadeAdresser.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th scope="col" className="px-4 py-3 font-medium">Adress</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Studsar</th>
                  <th scope="col" className="px-4 py-3 font-medium">Mallar</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Senast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {data.studsadeAdresser.map((rad) => (
                  <tr key={rad.adress}>
                    <td className="px-4 py-3 text-ink-1" title={rad.adress}>
                      {rad.adress}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-fel">
                      {antal(rad.antal)}
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-ink-2">
                      <span className="block truncate">
                        {rad.mallar.map(mallNamn).join(', ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-ink-3">
                      {tidKort(rad.senast)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-6 text-sm text-ink-2">
            {`0 studsar sedan ${tidKort(data.fran)}.`}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
