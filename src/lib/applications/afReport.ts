// src/lib/applications/afReport.ts
// Aktivitetsrapportens rytm (docs/plan-inloggat-omdesign.md, vag 3 punkt 25).
//
// Arbetsformedlingens aktivitetsrapport lamnas en gang per manad och avser
// foregaende kalendermanad. Rapporteringsfonstret oppnar den 1:a och stanger
// den 14:e i manaden efter. Missar man det kan ersattningen paverkas, sa det
// ar produktens starkaste naturliga aterkomstankare. Idag finns rapporten
// bara om anvandaren rakar klicka in, utan pamminnelse och utan deadline.
//
// Klientsaker: inga server-beroenden, ingen fetch. Bara datumlogik.

/** Sista dagen i manaden da rapporten for foregaende manad ska vara inne. */
export const AF_REPORT_DEADLINE_DAY = 14;

/** Antal dagar kvar da raden byter ton till warm. En gang, inte gradvis. */
export const AF_REPORT_WARM_DAYS = 7;

export interface AfReportDeadline {
  /** Manaden rapporten avser, YYYY-MM. */
  reportMonth: string;
  /** Manadens namn i klartext, till exempel "augusti". */
  reportMonthLabel: string;
  /** Sista inlamningsdag. */
  dueDate: Date;
  /** Sista inlamningsdag i klartext, till exempel "14 september". */
  dueDateLabel: string;
  /** Hela dygn kvar till och med deadline. 0 = sista dagen, negativt = passerad. */
  daysLeft: number;
  /** Sant nar deadline ar inom AF_REPORT_WARM_DAYS och inte passerad. */
  isUrgent: boolean;
  /** Sant nar fonstret for den har manaden redan stangt. */
  isOverdue: boolean;
}

const MONTHS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

/** Dagens datum i svensk tid, som lokal midnatt. Undviker UTC-glidning. */
export function startOfTodayStockholm(now: Date = new Date()): Date {
  const sv = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return new Date(`${sv}T00:00:00`);
}

/**
 * Nasta rapporttillfalle raknat fran dagens datum.
 *
 * Ar vi den 1 till 14 galler foregaende manads rapport, med deadline den 14:e
 * i den har manaden. Ar vi den 15 eller senare har det fonstret stangt, och
 * nasta rapport avser den har manaden med deadline den 14:e nasta manad.
 */
export function nextAfReportDeadline(now: Date = new Date()): AfReportDeadline {
  const today = startOfTodayStockholm(now);
  const day = today.getDate();
  const withinWindow = day <= AF_REPORT_DEADLINE_DAY;

  // Manaden rapporten avser.
  const reportRef = withinWindow
    ? new Date(today.getFullYear(), today.getMonth() - 1, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  // Deadline ligger alltid manaden efter den rapporterade.
  const dueDate = new Date(
    reportRef.getFullYear(),
    reportRef.getMonth() + 1,
    AF_REPORT_DEADLINE_DAY
  );

  const daysLeft = Math.round((dueDate.getTime() - today.getTime()) / 86400000);

  return {
    reportMonth: `${reportRef.getFullYear()}-${String(reportRef.getMonth() + 1).padStart(2, '0')}`,
    reportMonthLabel: MONTHS[reportRef.getMonth()],
    dueDate,
    dueDateLabel: `${AF_REPORT_DEADLINE_DAY} ${MONTHS[dueDate.getMonth()]}`,
    daysLeft,
    isUrgent: daysLeft >= 0 && daysLeft <= AF_REPORT_WARM_DAYS,
    isOverdue: daysLeft < 0,
  };
}

/** Raden ovanför rapporten. Säger datum och dagar kvar, aldrig bara "snart". */
export function afReportStatusText(d: AfReportDeadline, appliedCount: number): string {
  const jobs = appliedCount === 1 ? '1 jobb' : `${appliedCount} jobb`;

  if (d.isOverdue) {
    return `Rapporten för ${d.reportMonthLabel} skulle varit inne ${d.dueDateLabel}.`;
  }
  if (d.daysLeft === 0) {
    return `Sista dagen att lämna rapporten för ${d.reportMonthLabel}. Du sökte ${jobs}.`;
  }
  if (d.daysLeft === 1) {
    return `En dag kvar att lämna rapporten för ${d.reportMonthLabel}. Du sökte ${jobs}.`;
  }
  return `Rapporten för ${d.reportMonthLabel} ska vara inne ${d.dueDateLabel}, ${d.daysLeft} dagar kvar. Du sökte ${jobs}.`;
}
