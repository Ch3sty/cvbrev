// Registrerar att en premium-gatad funktion faktiskt användes (punkt 12 i
// docs/plan-inloggat-saljflode.md).
//
// Loggen visar vad hon faktiskt använt (premium/usage-summary sorterar på
// den). Utan loggen får vi gissa.
//
// Fire-and-forget. En misslyckad loggning får aldrig fälla ett svar som
// användaren väntar på.

import { logActivityServer } from '@/lib/activation-tracking'

export type PremiumFeature =
  | 'letter_download'
  | 'cv_export'
  | 'cv_analysis_full'
  | 'test_session'
  | 'chat_message'
  | 'af_report'

const LABEL: Record<PremiumFeature, string> = {
  letter_download: 'laddade ner ett brev',
  cv_export: 'exporterade ett CV',
  cv_analysis_full: 'såg hela CV-analysen',
  test_session: 'gjorde ett test',
  chat_message: 'chattade med jobbcoachen',
  af_report: 'hämtade ut aktivitetsrapporten',
}

export function logPremiumUsage(
  userId: string | null | undefined,
  feature: PremiumFeature,
  metadata: Record<string, unknown> = {}
): void {
  if (!userId) return
  void Promise.resolve(
    logActivityServer(userId, 'premium_feature_used', LABEL[feature], { feature, ...metadata })
  ).catch(() => {
    /* loggning får aldrig störa flödet */
  })
}
