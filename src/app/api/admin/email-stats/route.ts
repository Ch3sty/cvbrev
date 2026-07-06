import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET /api/admin/email-stats?days=30
// Aggregerad statistik för e-postkampanjerna (kvotpåminnelser + trial-mail).
// email_log, email_events och quota_reminders är RLS-låsta utan policies,
// därför sker all läsning via service role-klienten.

interface EmailLogRow {
  resend_id: string | null;
  email_type: string;
  feature: string | null;
  recipient: string;
  subject: string;
  sent_at: string;
}

interface EmailEventRow {
  resend_id: string | null;
  event_type: string;
  link_url: string | null;
  created_at: string;
}

interface QuotaReminderRow {
  user_id: string;
  feature: string;
  sent_at: string | null;
  created_at: string;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function buildDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(toDateStr(d));
  }
  return dates;
}

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Tidsperiod (7/30/90 dagar, default 30)
    const daysParam = Number(request.nextUrl.searchParams.get('days'));
    const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sinceIso = since.toISOString();

    // Nya tabellerna finns inte i genererade databastyper ännu, samma
    // any-cast som webhook-routen använder.
    const admin = getSupabaseAdmin() as any;

    const [
      remindersRes,
      optOutRes,
      trialRes,
      logsRes,
      eventsRes,
      anyEventsRes,
    ] = await Promise.all([
      admin
        .from('quota_reminders')
        .select('user_id, feature, sent_at, created_at'),
      admin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('quota_emails_opt_out', true),
      admin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .not('trial_reminder_sent_at', 'is', null),
      admin
        .from('email_log')
        .select('resend_id, email_type, feature, recipient, subject, sent_at')
        .gte('sent_at', sinceIso)
        .order('sent_at', { ascending: false }),
      admin
        .from('email_events')
        .select('resend_id, event_type, link_url, created_at')
        .gte('created_at', sinceIso),
      admin
        .from('email_events')
        .select('resend_id', { count: 'exact', head: true }),
    ]);

    const reminderRows: QuotaReminderRow[] = remindersRes.data ?? [];
    const logs: EmailLogRow[] = logsRes.data ?? [];
    const events: EmailEventRow[] = eventsRes.data ?? [];

    // a. Påminnelser (opt-ins) per feature
    const reminderByFeature = new Map<string, { pending: number; sent: number; total: number }>();
    const reminderUsers = new Set<string>();
    for (const row of reminderRows) {
      reminderUsers.add(row.user_id);
      const entry = reminderByFeature.get(row.feature) ?? { pending: 0, sent: 0, total: 0 };
      entry.total += 1;
      if (row.sent_at) entry.sent += 1;
      else entry.pending += 1;
      reminderByFeature.set(row.feature, entry);
    }

    // Opt-ins per dag, senaste 14 dagarna
    const optInDates = buildDateRange(14);
    const optInsByDay = new Map<string, number>(optInDates.map((d) => [d, 0]));
    for (const row of reminderRows) {
      const date = toDateStr(new Date(row.created_at));
      if (optInsByDay.has(date)) {
        optInsByDay.set(date, (optInsByDay.get(date) ?? 0) + 1);
      }
    }

    const reminders = {
      perFeature: Array.from(reminderByFeature.entries())
        .map(([feature, counts]) => ({ feature, ...counts }))
        .sort((a, b) => b.total - a.total),
      uniqueUsers: reminderUsers.size,
      pendingTotal: reminderRows.filter((r) => !r.sent_at).length,
      optInsPerDay: optInDates.map((date) => ({ date, count: optInsByDay.get(date) ?? 0 })),
    };

    // d. Utskick från email_log inom perioden
    const byType: Record<string, number> = {};
    const byFeature = new Map<string, number>();
    const perDayMap = new Map<string, { quota_back: number; trial_reminder: number }>(
      buildDateRange(days).map((d) => [d, { quota_back: 0, trial_reminder: 0 }])
    );

    for (const log of logs) {
      byType[log.email_type] = (byType[log.email_type] ?? 0) + 1;
      if (log.email_type === 'quota_back' && log.feature) {
        byFeature.set(log.feature, (byFeature.get(log.feature) ?? 0) + 1);
      }
      const date = toDateStr(new Date(log.sent_at));
      const day = perDayMap.get(date);
      if (day) {
        if (log.email_type === 'quota_back') day.quota_back += 1;
        else if (log.email_type === 'trial_reminder') day.trial_reminder += 1;
      }
    }

    const sends = {
      total: logs.length,
      byType,
      byFeature: Array.from(byFeature.entries())
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count),
      perDay: Array.from(perDayMap.entries()).map(([date, counts]) => ({ date, ...counts })),
      recent: logs.slice(0, 20).map((log) => ({
        sent_at: log.sent_at,
        email_type: log.email_type,
        feature: log.feature,
        recipient: log.recipient,
        subject: log.subject,
      })),
    };

    // e. Engagemang: joina email_events mot email_log via resend_id
    const typeByResendId = new Map<string, string>();
    for (const log of logs) {
      if (log.resend_id) typeByResendId.set(log.resend_id, log.email_type);
    }

    interface TypeEngagement {
      delivered: Set<string>;
      opened: Set<string>;
      clicked: Set<string>;
      bounced: Set<string>;
      complained: Set<string>;
      eventCount: number;
    }
    const engagementByType = new Map<string, TypeEngagement>();
    const emptyEngagement = (): TypeEngagement => ({
      delivered: new Set(),
      opened: new Set(),
      clicked: new Set(),
      bounced: new Set(),
      complained: new Set(),
      eventCount: 0,
    });

    const linkClicks = new Map<string, number>();

    for (const event of events) {
      if (event.event_type === 'clicked' && event.link_url) {
        linkClicks.set(event.link_url, (linkClicks.get(event.link_url) ?? 0) + 1);
      }

      if (!event.resend_id) continue;
      const emailType = typeByResendId.get(event.resend_id);
      if (!emailType) continue;

      const entry = engagementByType.get(emailType) ?? emptyEngagement();
      entry.eventCount += 1;
      switch (event.event_type) {
        case 'delivered': entry.delivered.add(event.resend_id); break;
        case 'opened': entry.opened.add(event.resend_id); break;
        case 'clicked': entry.clicked.add(event.resend_id); break;
        case 'bounced': entry.bounced.add(event.resend_id); break;
        case 'complained': entry.complained.add(event.resend_id); break;
      }
      engagementByType.set(emailType, entry);
    }

    const emailTypes = Array.from(
      new Set([...Object.keys(byType), ...engagementByType.keys()])
    );

    const engagementRows = emailTypes.map((emailType) => {
      const sentCount = byType[emailType] ?? 0;
      const entry = engagementByType.get(emailType) ?? emptyEngagement();
      const delivered = entry.delivered.size;
      const uniqueOpened = entry.opened.size;
      const uniqueClicked = entry.clicked.size;
      const openBase = delivered > 0 ? delivered : sentCount;
      return {
        email_type: emailType,
        sentCount,
        delivered,
        uniqueOpened,
        uniqueClicked,
        bounced: entry.bounced.size,
        complained: entry.complained.size,
        openRate: rate(uniqueOpened, openBase),
        clickRate: rate(uniqueClicked, openBase),
        hasEvents: entry.eventCount > 0,
      };
    });

    // Totaler för stat-korten
    const totalSent = logs.length;
    const totalDelivered = engagementRows.reduce((sum, r) => sum + r.delivered, 0);
    const totalOpened = engagementRows.reduce((sum, r) => sum + r.uniqueOpened, 0);
    const totalClicked = engagementRows.reduce((sum, r) => sum + r.uniqueClicked, 0);
    const totalOpenBase = totalDelivered > 0 ? totalDelivered : totalSent;

    const engagement = {
      byType: engagementRows,
      totals: {
        sentCount: totalSent,
        delivered: totalDelivered,
        uniqueOpened: totalOpened,
        uniqueClicked: totalClicked,
        openRate: rate(totalOpened, totalOpenBase),
        clickRate: rate(totalClicked, totalOpenBase),
      },
      topLinks: Array.from(linkClicks.entries())
        .map(([link_url, clicks]) => ({ link_url, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10),
    };

    return NextResponse.json({
      days,
      reminders,
      optOutCount: optOutRes.count ?? 0,
      trialRemindersSent: trialRes.count ?? 0,
      sends,
      engagement,
      webhookConfigured: !!process.env.RESEND_WEBHOOK_SECRET,
      hasEvents: (anyEventsRes.count ?? 0) > 0,
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
