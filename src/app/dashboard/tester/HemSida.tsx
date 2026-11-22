/**
 * Hem i Rekryteringstester v4 (docs/plan-tester-v4-bygg.md 3.3, utkast v4
 * avsnitt 2): var du står och vad som är rimligt härnäst, räknat ur dina
 * resultat. Väggen bär Plan inför provet med nedräkning och banan (eller
 * datumet och "Hem"), det lyfta kortet Nästa steg, golvet Fler steg,
 * Dagsmål, Så ligger du till och Fortsätt där du slutade.
 *
 * Serverrenderad med en omgång: hamtaTesterV4 (A) läser allt parallellt och
 * faller per del till tomt läge. Saknas planen och valde hon tester eller
 * intervju vid registreringen är ingången (Plan inför provet, ?forsta=1)
 * första vyn, men bara tills de har ett första resultat i någon testtyp.
 * När vyn ritas med en ny punkt markeras profilen efter svaret
 * (traning_sedd_at), som förut.
 *
 * Utbruten ur page.tsx (Jobbsöket omgång 2, byggspec 9.14) så att appens
 * /app/tester kan rita samma sida med `iAppen`: en sidas förvalda export får
 * inte ta egna egenskaper i Next. Med `iAppen` ritas kortet "Vilken tjänst
 * gäller provet?" aldrig.
 */
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { markeraTraningSedd } from '@/lib/traning/getTraningSummary';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { hamtaTesterV4, hamtaUnderlagV4, ingangForst } from '@/lib/tester/v4/hamta.server';
import HemVy from '@/components/tester-v4/hem/HemVy';
import { Betalvagg } from '@/components/traning/HemKlient';
import { sparrDataFor } from '@/lib/tester/v4/sparrData';
import type { Scope } from '@/lib/access/features';
import type { PlanKey } from '@/lib/plans/plans';

export async function TesterHemSida({
  searchParams,
  iAppen = false,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  iAppen?: boolean;
}) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');

  const [underlag, data, sp] = await Promise.all([hamtaUnderlagV4(user.id), hamtaTesterV4(user.id), searchParams]);

  const s = underlag.status;
  // Ingången visas bara före första resultatet, även ett grundnivåtest: planen
  // får aldrig låsa ute Hem för den som redan har testat. Vid en hel
  // sidladdning har dashboard-layouten redan gjort omdirigeringen som en 307; här
  // fångas klientnavigeringen och appens sida.
  if (sp.visa !== 'hem' && ingangForst(underlag, data)) {
    redirect(`${TRANING_RUTT.installningar}?forsta=1`);
  }

  if (s?.nyPunkt) after(() => markeraTraningSedd(user.id));

  const sparr = sparrDataFor(data, null);
  return (
    <Betalvagg scope={data.paket.scope as Scope | null} track={data.paket.track as Scope | null} planKey={data.paket.planKey as PlanKey | null} grundKvarIdag={data.gratis.premium ? null : data.gratis.grundKvarIdag} sparrData={sparr.data} dagarKvar={sparr.dagarKvar}>
      <HemVy data={data} iAppen={iAppen} />
    </Betalvagg>
  );
}
