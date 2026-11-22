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
  /**
   * När kandidaten avslutade kontakten efter ett ja (status är då
   * 'declined'), annars null. Tråden går att läsa men inte skriva i.
   */
  avslutadAt?: string | null;
}

/** Företagets initial för avatarer. */
export function initialFor(name: string | null | undefined): string {
  const trimmed = (name ?? '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}
