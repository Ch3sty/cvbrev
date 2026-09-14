/**
 * Handelsetyperna i email_events.
 *
 * Kritiskt: kolumnen lagrar delivered, opened, clicked och bounced, alltsa
 * UTAN email.-prefix. Resends webhookdokumentation skriver email.delivered,
 * och en fraga som filtrerar pa det returnerar noll rader. Det ser ut som ett
 * trasigt system men ar bara fel strang.
 *
 * Skriv konstanterna en gang har och importera dem. Skriv aldrig strangen i
 * en fraga.
 *
 * Resends eget API anvands inte: nyckeln i .env.local ar sandbegransad och
 * svarar 401 pa /emails och /domains. All mejlstatistik laser ur Supabase.
 */

export const EMAIL_EVENT = {
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
} as const;

export type EmailEventType = (typeof EMAIL_EVENT)[keyof typeof EMAIL_EVENT];

export const EMAIL_EVENT_TYPES: EmailEventType[] = [
  EMAIL_EVENT.DELIVERED,
  EMAIL_EVENT.OPENED,
  EMAIL_EVENT.CLICKED,
  EMAIL_EVENT.BOUNCED,
];

/** Joinen mellan email_log och email_events gar pa resend_id. */
export const EMAIL_JOIN_KEY = 'resend_id' as const;
