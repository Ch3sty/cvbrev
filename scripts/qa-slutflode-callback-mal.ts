// scripts/qa-slutflode-callback-mal.ts: callbackens mål för ett nytt Google-konto, med samma funktioner som /auth/callback (väg 7 i qa-slutflode).
import { googleCallbackMal, lasSignupCookie, landningsgren } from '@/components/registrering/intent'
import { VALKOMMEN_PATH, TRACK_CHOICE_PATH } from '@/lib/onboarding/steps'
const raw = process.argv[2]
const cookie = lasSignupCookie(raw)
const mal = googleCallbackMal({ isNewAccount: true, next: VALKOMMEN_PATH, cookie, valkommenPath: VALKOMMEN_PATH })
console.log(JSON.stringify({ cookie, mal, gren: landningsgren(cookie, TRACK_CHOICE_PATH) }))
