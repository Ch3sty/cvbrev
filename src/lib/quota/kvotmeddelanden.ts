/**
 * Kvotmeddelandet testernas API-rutter svarar med när dagens test redan är
 * gjort (F9, beslut om säljytorna 2026-11-15). En konstant i stället för
 * samma sträng i elva rutter. "Utan tak", aldrig "obegränsat".
 */

import { paketKort } from '@/lib/plans/plans'

export const TEST_KVOT_MEDDELANDE = `Du har redan gjort det här testet i dag. Ny chans i morgon, eller köp ${paketKort()} och träna utan tak.`
