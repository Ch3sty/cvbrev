// Klientkontrakt för kandidatens meddelande-hub. Speglar payloaden från
// GET /api/candidate/interests. Kontaktkort + trådstatistik finns bara för
// accepterade intressen (serverside-symmetri med kontaktupplåsningen).

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface RecruiterContact {
  companyName: string;
  contactName: string | null;
  contactRole: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

export interface CandidateInterest {
  id: string;
  companyName: string;
  contactName: string | null;
  message: string | null;
  status: InterestStatus;
  createdAt: string;
  respondedAt: string | null;
  recruiterContact: RecruiterContact | null;
  messageCount: number;
  unreadCount: number;
}

/** Primär CTA-gradient (designregeln: orange → röd → mörkrosa). */
export const HUB_GRADIENT = 'linear-gradient(135deg, #F97316, #DC2626)';

/** Indigo-tintad avatarfärg för personlighet/företagsinitialer. */
export const AVATAR_BG = '#EEF0FF';
export const AVATAR_FG = '#4338CA';

/** Företagets initial för avatarer. */
export function initialFor(name: string | null | undefined): string {
  const trimmed = (name ?? '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}
