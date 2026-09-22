import 'server-only';

/**
 * En läsning av köpliggaren per sidrendering.
 *
 * Översikt och Intäkter läser liggaren i flera Suspense-gränser (kort,
 * tabell, diagram, "Sedan i går"). React cache() gör att de delar ett och
 * samma anrop per begäran, och hamtaKopLiggare cachar i sin tur 15 minuter
 * mellan begäranden. Båda sidorna tar 90 dagar, så de delar också cacheposten:
 * 30 dagar och ett dygn skärs ut i kopFormat.ts.
 */

import { cache } from 'react';
import { hamtaKopLiggare } from '@/lib/admin/kop';

/** 90 dagar räcker för "före det" på Nya betalande. */
export const KOP_LIGGARE_DAGAR = 90;

export const lasKopLiggare = cache(() => hamtaKopLiggare(KOP_LIGGARE_DAGAR));
