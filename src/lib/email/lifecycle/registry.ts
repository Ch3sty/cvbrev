// src/lib/email/lifecycle/registry.ts
// Alla livscykelmail på ett ställe. Runnern slår upp email_type här.

import type { LifecycleEmail } from './types';
import { rtDay0, rtDay1, rtDay3, rtDay4, rtDay6, rtDay10 } from './templates/reverse-trial';
import { winback14, winback30 } from './templates/winback';
import {
  quotaWall,
  trialDay3,
  trialDay5,
  trialDay7,
  onetimeExpired,
} from './templates/conversion';
import { paymentFailed, cancelImmediate, cancelFollowup } from './templates/transactional';
import { gratisnivaAndras, GRATISNIVA_EMAIL_TYPE } from './templates/campaign-gratisniva';

const ALL: LifecycleEmail[] = [
  rtDay0,
  rtDay1,
  rtDay3,
  rtDay4,
  rtDay6,
  rtDay10,
  winback14,
  winback30,
  quotaWall,
  trialDay3,
  trialDay5,
  trialDay7,
  onetimeExpired,
  paymentFailed,
  cancelImmediate,
  cancelFollowup,
  gratisnivaAndras,
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
  return null;
}

export { GRATISNIVA_EMAIL_TYPE };
