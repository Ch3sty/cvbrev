// src/lib/jobbcoachen/bilagor.ts
//
// Dokument som bifogas till Jobbcoachen (oftast CV:t) maskas innan de går
// till modellen (ägarens regel 2026-11-21). Namn, e-post, telefon, adress,
// postnummer, personnummer, födelsedatum och webbadresser byts mot
// platshållare med samma maskering som CV-flödena (cvForModel.ts), med
// profilens namn och nummer som kända värden och namnet i dokumentets början
// läst lokalt. Filnamnet maskas också ("CV Anna Lindqvist.pdf").
//
// Det användaren själv skriver i chatten maskas inte: fritext går inte att
// maska säkert utan att förstöra frågan. Bara bifogad text maskas.

import { maskaCvForModel } from '@/lib/privacy/cvForModel';
import { extractContactLocally } from '@/lib/privacy/extractContact';

export interface Bilaga {
  file_name?: string;
  file_type?: string;
  extracted_text?: string;
  [nyckel: string]: unknown;
}

export interface Agare {
  full_name?: string | null;
  phone?: string | null;
}

/** En bilaga med text och filnamn maskade för modellen. */
export function maskeraBilaga<T extends Bilaga>(bilaga: T, agare: Agare | null | undefined): T {
  const text = typeof bilaga.extracted_text === 'string' ? bilaga.extracted_text : '';
  const lokalt = text ? extractContactLocally(text) : null;
  const opts = {
    fullName: agare?.full_name ?? null,
    extraNames: [lokalt?.fullName],
    knownPhones: [agare?.phone, lokalt?.phone],
  };
  return {
    ...bilaga,
    file_name: typeof bilaga.file_name === 'string' ? maskaCvForModel(bilaga.file_name, opts) : bilaga.file_name,
    extracted_text: text ? maskaCvForModel(text, opts) : bilaga.extracted_text,
  };
}

/** Alla bilagor maskade. Tål att listan saknas. */
export function maskeraBilagor<T extends Bilaga>(bilagor: T[] | null | undefined, agare: Agare | null | undefined): T[] {
  if (!Array.isArray(bilagor)) return [];
  return bilagor.map((b) => maskeraBilaga(b, agare));
}
