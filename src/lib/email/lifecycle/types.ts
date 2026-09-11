// src/lib/email/lifecycle/types.ts
// Typer för livscykelmailen (docs/plan-konvertering.md, spår D2).

import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySupabase = SupabaseClient<any, any, any>;

/** Profilfält som mallarna och shouldSend får läsa. */
export interface LifecycleProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  premium_until: string | null;
  premium_source: string | null;
  quota_emails_opt_out: boolean | null;
  last_active: string | null;
  created_at: string | null;
}

/** Allt en mall får veta om mottagaren när den renderas. */
export interface LifecycleContext {
  admin: AnySupabase;
  userId: string;
  profile: LifecycleProfile;
  /** metadata från email_schedule-raden. */
  metadata: Record<string, unknown>;
}

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
}

export interface LifecycleEmail {
  /** Nyckeln i email_schedule.email_type och email_log.email_type. */
  type: string;
  /** Transaktionella mail ignorerar quota_emails_opt_out (snävt definierat). */
  transactional?: boolean;
  /**
   * Sista kontrollen innan sändning. Falskt → raden avbryts med cancel_reason
   * 'should_send_false'. Körs alltid, även för transaktionella mail.
   */
  shouldSend: (ctx: LifecycleContext) => Promise<boolean>;
  render: (ctx: LifecycleContext) => Promise<RenderedEmail> | RenderedEmail;
}

/** Resend-tags: alltid type + seq=lifecycle. */
export function lifecycleTags(type: string): Array<{ name: string; value: string }> {
  // Resend tillåter bara a-z, A-Z, 0-9, _ och - i tag-värden.
  return [
    { name: 'type', value: type.replace(/[^a-zA-Z0-9_-]/g, '_') },
    { name: 'seq', value: 'lifecycle' },
  ];
}
