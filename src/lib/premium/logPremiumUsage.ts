// Registrerar att en premium-gatad funktion faktiskt användes (punkt 12 i
// docs/plan-inloggat-saljflode.md).
//
// Loggen driver copyn i UpgradeSheet på dag 4 till 5: har användaren laddat
// ner tre brev ska nedladdningen stå först bland det hon förlorar. Utan
// loggen får vi gissa, och gissningar säljer sämre än fakta.
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

const LABEL: Record<PremiumFeature, string> = {
  letter_download: 'laddade ner ett brev',
  cv_export: 'exporterade ett CV',
  cv_analysis_full: 'såg hela CV-analysen',
  test_session: 'gjorde ett test',
  chat_message: 'chattade med jobbcoachen',
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
