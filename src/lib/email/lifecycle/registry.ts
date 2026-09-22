// src/lib/email/lifecycle/registry.ts
// Alla livscykelmail på ett ställe. Runnern slår upp email_type här.
//
// Reverse trial-sekvensen rt_day0 till rt_day10 är borta (ägarens beslut 3 i
// docs/plan-paket-och-onboarding.md), och veckoserien cv_day1 till test_day7
// föll med veckoprogrammet (docs/design/spec-onboarding-2026-09-22.html).
// I stället ligger hjälpredans två mejl: komigang (ett om dagen om nästa
// bricka) och paket_fornyas (dagen före förnyelsen), plus uppsägningskvittot.

import type { LifecycleEmail } from './types';
import { winback14, winback30 } from './templates/winback';
import { quotaWall, onetimeExpired } from './templates/conversion';
import { paymentFailed, cancelImmediate, cancelFollowup } from './templates/transactional';
import { gratisnivaAndras, GRATISNIVA_EMAIL_TYPE } from './templates/campaign-gratisniva';
import { weeklyDigest, WEEKLY_DIGEST_TYPE } from './templates/weekly-digest';
import { uppsagtGallerUt, kvittoMejl } from './templates/vecka';
import { komIgangMejl, paketFornyasMejl, KOMIGANG_TYPE, PAKET_FORNYAS_TYPE } from './templates/komigang';

const ALL: LifecycleEmail[] = [
  komIgangMejl,
  paketFornyasMejl,
  uppsagtGallerUt,
  kvittoMejl,
  winback14,
  winback30,
  quotaWall,
  // De kortkrävande trialmejlen står kvar: webhooken schemalägger dem
  // fortfarande för Stripes egna provperioder. Det är reverse trial som är
  // borta, inte varje form av provperiod.
  onetimeExpired,
  paymentFailed,
  cancelImmediate,
  cancelFollowup,
  gratisnivaAndras,
  weeklyDigest,
];

export const LIFECYCLE_EMAILS: Record<string, LifecycleEmail> = Object.fromEntries(
  ALL.map((email) => [email.type, email])
);

/**
 * quota_wall får veckosuffix (quota_wall_2026w37) för att unique-indexet ska
 * släppa igenom en ny vecka men aldrig två samma vecka. Runnern måste därför
 * kunna hitta basmallen från en suffixad email_type.
 */
export function resolveLifecycleEmail(emailType: string): LifecycleEmail | null {
  const direct = LIFECYCLE_EMAILS[emailType];
  if (direct) return direct;

  const weekSuffix = emailType.match(/^(.+)_\d{4}w\d{1,2}$/);
  if (weekSuffix && LIFECYCLE_EMAILS[weekSuffix[1]]) {
    return LIFECYCLE_EMAILS[weekSuffix[1]];
  }

  // Hjälpredans mejl får datumsuffix (komigang_2026-09-25): ett om dagen,
  // aldrig två samma dag.
  const daySuffix = emailType.match(/^(.+)_\d{4}-\d{2}-\d{2}$/);
  if (daySuffix && LIFECYCLE_EMAILS[daySuffix[1]]) {
    return LIFECYCLE_EMAILS[daySuffix[1]];
  }
  return null;
}

export { GRATISNIVA_EMAIL_TYPE, WEEKLY_DIGEST_TYPE, KOMIGANG_TYPE, PAKET_FORNYAS_TYPE };
