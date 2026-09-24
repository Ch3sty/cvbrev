# Profil och registrering: överlämningsspec

Datum 2026-09-24. Design: `docs/design/profil-registrering-2026-09-24.html` (godkänns av ägaren före bygge). Skärmdumpar av produktionen före bygget: `docs/design/profil-registrering-2026-09-24/produktion/`. Allt nedan gäller efter godkännandet och de fem besluten sist i designfilen. Slutcopyn står i designfilens tabell "Alla strängar på ett ställe" och är den enda källan till text.

Uppdaterad samma dag efter saas-leads beslut (`docs/rapporter/beslut-registrering-2026-09-24.md`): alternativ A med tre villkor, alternativ C avgörs 22 oktober, tre punkter för bredden i samma släpp som tratten, statusraden utan foto och vänd byggordning. Väntar på ägarens slutliga ja.

Två delar som kan byggas och släppas var för sig, Del B först. Del A rör bara inloggat läge. Del B rör /register, /login, auth-callbacken och ett nytt steg efter kontot.

---

## Del A: profilen och prenumerationen

### Filer

| Fil | Ändring |
|---|---|
| `src/components/dashboard/Sidebar.tsx` | Gruppen Konto får två `SidebarLink`: Profil (`/dashboard/profil`, `IkonProfil`) och Prenumeration (`/dashboard/profil/prenumeration`, `IkonKrona`, samma `badge` och `highlight` som dagens rad). Aktiv-matchning: Profil får inte bli aktiv på `/dashboard/profil/prenumeration` eller `/dashboard/profil/cv` (Mina CV). Kontrollera `SidebarLink`s matchning, lägg till `exact` om den matchar på prefix. |
| `src/components/dashboard/header.tsx` | `PLATSER`: `'/dashboard/profil/prenumeration'` blir `'Konto · Prenumeration'`. |
| `src/components/dashboard/ProfileMenu.tsx` | Ordning Kom igång, Profil, Prenumeration, Logga ut. "Köp eller byt paket" byts mot "Prenumeration". |
| `src/app/dashboard/profil/ProfilClient.tsx` | Ny sektionsordning, `Hoppa till`, statusraden för saknade CV-fält. `IntegritetsBlock` överst tas bort. |
| `src/app/dashboard/profil/components/PresentationSection.tsx` | Byter namn till `CvUppgifterSection.tsx`, id `cv`. Fältordning foto, namn, ort, telefon, e-post, LinkedIn. Växlarna "Ta med i brev" och `BrevhuvudPreview` flyttas ut. Desktop: två spalter med ny `CvHuvudPreview` till höger (sticky inom sektionen). Integritetsraden (`IntegritetsRad`, finns redan) sist i sektionen med "Så gör vi" som öppnar dagens IntegritetsBlock-text i `Sheet`. |
| `src/app/dashboard/profil/components/PersonligaBrevSection.tsx` | Ny, id `personliga-brev`. Förvald ton (flyttas ur `InriktningSection`), Brevhuvudet (de två `ProfileToggle`), `BrevhuvudPreview`. |
| `src/app/dashboard/profil/components/InriktningSection.tsx` | Byter namn till `JobbsokSection.tsx`, id `jobbsok`. Målroll, bransch, preferenserna som en rad med "Ändra" som öppnar `JobPreferencesFields` i `Sheet`, och Bli upptäckt-statusraden (ur `BliUpptacktSection`, som tas bort som egen sektion). |
| `src/app/dashboard/profil/components/KontoSection.tsx` | Ny, id `konto`. Ersätter `NotisInstallningar` och `AccountSection` som sektioner. Fyra rader: Prenumeration (länk), Mejl från oss (Sheet med dagens två växlar), Logga ut (direkt), Radera mitt konto (Sheet med dagens bekräftelseflöde). Innehållet i arken återanvänds ur de två gamla komponenterna. |
| `src/app/dashboard/profil/components/InlineProfilePhotoUpload.tsx` | Ny form: ram 88/96 px, sekundärknapp, textlänk, metarad, felrad i flödet (inte `successWithMascot`). Klientförminskning, se nedan. Dra och släpp bara vid `(pointer: fine)`. |
| `src/app/dashboard/profil/components/tonalities.ts` | Ingen ändring i data. Metaraden för Smart val i UI byts från "Ingår i Premium" till "Ingår när du har ett paket". |
| `src/app/dashboard/profil/components/PremiumGateModal.tsx` | Rubriken "Automatiskt tonval ingår i Premium" skrivs om med paketnamn och pris enligt reglerna (copywriter), eller ersätts av `GraValSheet` om det täcker fallet. |
| `src/app/dashboard/skapa-brev/...` (tonsteget) | Textlänk "Ändra förvald ton" till `/dashboard/profil#personliga-brev`. |
| `src/app/dashboard/(oversikt)/ProfilKomplettering.tsx` | `#presentation` blir `#cv`. |
| `src/app/dashboard/cv-analys/components/save/TemplateInlineOptions.tsx` | `/dashboard/profil` blir `/dashboard/profil#cv`. |
| `src/components/pricing/PaketKort.tsx` | Knappen `h-auto min-h-11 py-2` så att tre kort bredvid sidomenyn inte klipper texten (fynd i designfilen). |

Adresserna ändras inte. `/dashboard/profil/prenumeration` används av Stripe (return_url i tre routes), betalväggar och mejl.

### Komponent-API

```ts
// src/app/dashboard/profil/components/HoppaTill.tsx
export interface HoppaTillProps {
  sektioner: { id: 'cv' | 'personliga-brev' | 'jobbsok' | 'konto'; etikett: string }[]
}
// Ankarlänkar, 44 px, understrykning i ink-1 på den sektion som syns
// (IntersectionObserver, rootMargin '-40% 0px -55% 0px'). Inte sticky.

// src/app/dashboard/profil/components/SaknasRad.tsx
export interface SaknasRadProps {
  namn: boolean      // true om ifyllt
  ort: boolean
}
// Foto räknas aldrig och nämns aldrig. Renderar null när namn och ort är ifyllda.
// Namn saknas: StatusRow tone="warm", "Namnet saknas. Utan det kan vi inte skapa ditt CV."
// Bara ort saknas (det vanliga fallet): tone="neutral", "Ort saknas i ditt CV".

// src/app/dashboard/profil/components/FotoFalt.tsx (ersätter fotodelen i PresentationSection)
export interface FotoFaltProps {
  url: string
  franGoogle: boolean
  onUppladdad: (url: string) => void   // sparar profile_photo_url
  onBorttagen: () => void
  state: FieldSaveState                // ur useFieldSave
}
// Lägen: tom | laddar | klar | google | fel. Felet står i felraden under
// ramen, med rubrik och en mening om vad man gör.

// src/lib/profil/forminska-bild.ts
export async function forminskaBild(fil: File, langstaSida = 800, kvalitet = 0.85): Promise<Blob>
// createImageBitmap + canvas, respekterar EXIF-orientering
// (imageOrientation: 'from-image'), returnerar image/jpeg.
// Faller tillbaka på originalfilen om canvas saknas.
```

`ProfileCard`, `ProfileTextField`, `ProfileToggle`, `ToggleSwitch`, `FieldStatusLine`, `useFieldSave`, `ChoiceCard`, `StatusRow`, `Sheet` återanvänds oförändrade.

### Datamodell

Ingen ändring. Samma kolumner i `profiles`: `full_name`, `location`, `phone`, `linkedin_url`, `profile_photo_url`, `avatar_source`, `preferred_tonality`, `include_phone_in_letters`, `include_location_in_letters`, `goal_role`, `industry`, `job_preferences`, `weekly_digest_opt_out`, `quota_emails_opt_out`. Samma routes: `updateProfile`, `/api/profile/photo/upload`, `/api/profile/photo/delete`, `/api/email/digest-preference`, `/api/profile/quota-emails`.

### Sparlogik

Per fält, som i dag. Textfält på blur, växlar och tonval direkt, fotot när uppladdningen svarat. Ingen sektionsknapp. Namnet valideras (minst två tecken) före sparning.

### Händelser, del A

| Händelse | Egenskaper | När |
|---|---|---|
| `profile_viewed` | `missing: ('namn'\|'ort')[]`, `har_foto: boolean`, `anchor` (hash vid inladdning) | En gång per sidladdning. |
| `profile_field_saved` | `field`, `section: 'cv'\|'personliga_brev'\|'jobbsok'\|'konto'` | Efter lyckad sparning. Aldrig värdet. |
| `profile_photo_uploaded` | `source: 'upload'`, `resized: boolean`, `bytes_before`, `bytes_after` | Efter lyckad uppladdning. |
| `profile_photo_failed` | `reason: 'too_large'\|'type'\|'network'` | Vid fel. |
| `letter_tone_default_set` | `tone` | Tonval sparat. |
| `match_preferences_saved` | oförändrad | oförändrad |

### Acceptanskriterier, del A

1. Sidomenyn på desktop visar Profil och Prenumeration som två rader under Konto. Ingen text trunkeras vid 256 px.
2. På `/dashboard/profil/prenumeration` är raden Prenumeration aktiv, inte Profil. På `/dashboard/profil/cv` är Mina CV aktiv och ingen Konto-rad.
3. Profilmenyn visar Kom igång (om aktuell), Profil, Prenumeration, Logga ut, i den ordningen.
4. På Pixel 7 (412 × 915) syns fotoramen och knappen "Ladda upp foto" inom första 900 px av sidan, och sektionen Överst i ditt CV slutar före 1 400 px.
5. Förvald ton nås med ett tryck på "Personliga brev" i Hoppa till, och `/dashboard/profil#personliga-brev` landar med rubriken synlig under toppraden (scroll-margin 96 px).
6. Växlarna för telefon och ort i brevhuvudet finns bara i Personliga brev, inte i CV-sektionen.
7. Ett 5 MB-foto från mobilkameran laddas upp utan fel och sparas under 2 MB. En PDF ger felraden "Filen går inte att läsa" under ramen, ingen toast.
8. Statusraden: namn saknas ger varm rad, ort saknas ger neutral rad "Ort saknas i ditt CV", namn och ort ifyllda ger ingen rad oavsett foto. Ordet foto förekommer aldrig i raden.
9. Varje fält visar Sparar, Sparat och fel under sig, och ett fält med fel behåller sitt värde.
10. Orange räknat: högst tre element per skärm (tråden, fokusring, varm rad).
11. LCP under 1,0 s på profilen (prestandabudgeten), CLS 0: de dynamiska sektionerna reserverar sin höjd som i dag.

---

## Del B: registreringstratten

### Flödet

```
/register (bar)                  steg 1 val  ─┬─ steg 2 konto ─ /auth eller signUp ─ /dashboard/valkommen ─ steg 3 förslag ─┬─ Köp → /dashboard/valj-spar?paket=X&steg=kop → Stripe → /dashboard/vecka/start
/register?borja=tester           (hoppas)    ─┘                                                                         └─ Börja gratis / kryss → landning per val
/register?paket=cv_week          (hoppas)      steg 2 konto ─────────────────────── /dashboard/valkommen ─ direkt till köpsteget (som i dag)
/register?intervju=|personlighet=|test=|draft=|cv_start=   ett steg, kontot ──────── /dashboard/valkommen ─ hämtkedjan ─ resultatet
/register?redirect=/dashboard/x  ett steg, kontot ───────────────────────────────── /dashboard/valkommen ─ /dashboard/x
Hoppa över i steg 1              steg 2 konto ───────────────────────────────────── /dashboard/valkommen ─ /dashboard/valj-spar utan förval
```

`/dashboard/valkommen` är den enda landningen efter ett nytt konto, för lösenord och för Google. Den ersätter `TRACK_CHOICE_PATH` som mål i `register-form.tsx` och `auth/callback/route.ts`, och den kör hämtkedjan, så att Google-vägen äntligen hämtar hem brevutkast, CV-start och testprov.

### Filer

| Fil | Ändring |
|---|---|
| `src/app/register/page.tsx` | Ny sida i det publika flödesskalet. Läser `borja`, `paket`, tokens och `redirect` på servern och väljer läge: `tratt` (steg 1 och 2), `konto` (bara steg 2 med valrad), `smakprov` (steg 2 i smakprovsform), `paket` och `redirect` (bara steg 2 utan valrad). `AuthShell`, `RegisterCvPreview`, `AtsScoreMeter`, `AuthCvPaper`, citaten och statistiken används inte längre. |
| `src/components/auth/register-form.tsx` | Blir `RegisterKontoSteg.tsx` i `src/components/registrering/`. Fälten i profilens fältform. Ingen hämtkedja här: den flyttar till valkommen-sidan. Efter `signUp` sätts cookien och klienten går till `/dashboard/valkommen`. |
| `src/components/registrering/PubliktFlodesskal.tsx` | Ny. Topprad 56 px med logga och Logga in (eller tillbaka-pil och "Skapa konto"), framstegslinje 2 px, innehåll max 560 px, sticky fot. Samma tangentbordsregler som `FlowShell` (sticky i flexkolumn med `100dvh`, aldrig fixed). |
| `src/components/registrering/ValSteg.tsx` | Ny. Steg 1, fem `ChoiceCard` i radiogrupp. |
| `src/components/registrering/intent.ts` | Ny. Typen `SignupIntent`, tabellen intent → spår, plan, landning, copy-nycklar. Enda källan till mappningen. |
| `src/components/auth/GoogleSignInButton.tsx` | Skjuter `signup_started { method: 'google', intent, entry }` vid tryck. `next` blir alltid `/dashboard/valkommen` för nya konton (callbacken avgör ny eller befintlig). |
| `src/app/auth/callback/route.ts` | Nytt konto: redirect till `/dashboard/valkommen` i stället för `TRACK_CHOICE_PATH` när `next` är `/dashboard` eller `/dashboard/valkommen`. `captureServer('signup_completed', ...)` inväntas med ett tak på 1,5 s (`Promise.race`), och får `intent` och `entry` ur `jc_signup`. |
| `src/lib/analytics/server.ts` | `captureServer` returnerar sitt `fetch`-löfte så att anroparen kan vänta. |
| `src/app/dashboard/valkommen/page.tsx` + `ValkommenClient.tsx` | Ny. Server: läser `jc_signup`, profilen (förnamn, `onboarding_intent`). Klient: kör hämtkedjan (`claimPendingDraft` till `claimPendingPersonlighet`) först. Träff: `signup_landed via=smakprov` och redirect. Annars `redirect`, sedan `paket` (till köpsteget), sedan intent (steg 3), annars spårvalet. Steg 3 ritas i `FlowShell`. |
| `src/app/dashboard/valj-spar/ValjSparClient.tsx` | `?steg=kop` öppnar köpsteget direkt. Utan `paket` och utan sparat spår: inget förval (`useState<Track \| null>(initialTrack)`), primären spärrad tills ett kort är valt. |
| `src/app/api/onboarding/track/route.ts` | Tar också emot `intent` och skriver `onboarding_intent`. |
| `src/components/landing/LandingNavbar.tsx`, `src/components/auth/login-form.tsx` | Skapa konto-länkarna sätter `sessionStorage.jc_signup_entry` ('header', 'meny', 'login') vid klick. |
| `src/app/(public)/verktyg/rekryteringstester/page.tsx` | De fyra "Starta gratis test" går till `/register?borja=tester`. Övriga verktygssidor med bar `/register` får motsvarande `borja` (cv, brev, jobb). Grep: `href: '/register'` och `href="/register"` i `src/app/(public)`. |
| `src/app/login/page.tsx` + `login-form.tsx` | Samma publika skal som /register (beslut 4). |
| `src/lib/onboarding/steps.ts` | Ny konstant `VALKOMMEN_PATH = '/dashboard/valkommen'`. |
| `src/lib/onboarding/komigang.ts` | Bredden, punkt 1 (S). `KOM_IGANG_LISTA.gratis` blir en lista per intent: det hon kom för först, sedan en gratis bricka från varje annat område. tester: matris_grund, personlighet, intervjuprov, analys_gratis, brev, jobbmatchning. intervju: intervjuprov, personlighet, matris_grund, analys_gratis, brev, jobbmatchning. cv: analys_gratis, mall, brev, jobbmatchning, matris_grund, intervjuprov. brev: brev, analys_gratis, mall, jobbmatchning, matris_grund, intervjuprov. jobb: jobbmatchning, analys_gratis, brev, mall, matris_grund, intervjuprov. **Regel: brickorna är funktioner man får något av, aldrig steg.** `cv_upp` och `profil` står aldrig i gratislistorna per intent. Uppladdningen är första steget inne i analysen, brevet, mallen och matchningen, och brickan markeras klar först när funktionen gett sitt resultat (`analyze_cv`, `create_letter`, `download_cv_template`, `match_jobs`). Titlar: Analysera ditt CV, Skriv ett personligt brev, Se tre matchade jobb, Välj en CV-mall. Utan intent: dagens lista. Nycklarna finns redan i `BrickaKey`. `personlighet`, `intervjuprov` och `jobbmatchning` får en gratisvariant av undertexten enligt designfilens slutcopy, samma mönster som `analys_gratis`. Arket får två områdesetiketter, "Det du valde" och "Gratis i de andra delarna". |
| `src/app/dashboard/(oversikt)/DashboardHem.tsx` | Bredden, punkt 2 (S). `traningsFokus` gäller också när `onboarding_intent` är tester eller intervju, inte bara `scope === 'tester'`. Raden i HemHuvud för gratis: "Du valde testerna, så vi börjar med träningen." respektive intervjun. Intent intervju ger intervjufrågan först, intent tester testet först. |
| `src/hooks/useUnusedFeatures.ts` | Bredden, punkt 3 (S). Tar `intent` som ordningsnyckel: efter första dokumentet föreslås först en funktion ur det andra området (CV-intent: matrislogik grund; test- och intervju-intent: CV-analysen). Raden byts när funktionen använts, som i dag. Skjuter `next_action_clicked` med `outside_intent`. |
| `src/components/dashboard/Sidebar.tsx`, `src/lib/access/*` | **Ingen ändring.** Menyn och behörigheterna är desamma för alla konton, se grep-kriteriet. |

### Komponent-API

```ts
// src/components/registrering/intent.ts
export type SignupIntent = 'cv' | 'brev' | 'tester' | 'intervju' | 'jobb'
export const INTENTS: Record<SignupIntent, {
  track: 'cv' | 'tester' | 'allt'
  plan: 'cv_week' | 'test_week' | 'all_week'
  landning: string          // '/dashboard/skapa-cv' osv.
  ikon: IkonNamn
}>
export function lasIntent(v: unknown): SignupIntent | null

// Cookien som bär tratten genom Google och till valkommen-sidan.
// Namn jc_signup, SameSite=Lax, Path=/, Max-Age 3600, inte httpOnly
// (klienten skriver den före signUp). Innehåll URI-kodad JSON:
export interface SignupCookie {
  intent: SignupIntent | null
  entry: 'header' | 'meny' | 'login' | 'verktyg' | 'pris' | 'smakprov' | 'direkt'
  skipped: boolean
}

// src/components/registrering/PubliktFlodesskal.tsx
export interface PubliktFlodesskalProps {
  steg?: { nu: number; av: number }   // utelämnas i smakprovsläget (linjen full)
  onBack?: () => void                 // ger tillbaka-pil och rubriken "Skapa konto"
  primar: { text: string; onClick: () => void; disabled?: boolean; busy?: boolean; blockedReason?: string }
  fotnot?: ReactNode
  children: ReactNode
}

// src/components/registrering/ValSteg.tsx
export interface ValStegProps {
  forval: SignupIntent | null
  onFortsatt: (intent: SignupIntent) => void
  onHoppaOver: () => void
}

// src/components/registrering/RegisterKontoSteg.tsx
export interface RegisterKontoStegProps {
  lage: 'tratt' | 'konto' | 'smakprov' | 'paket' | 'redirect'
  intent: SignupIntent | null
  smakprov?: { typ: 'intervju' | 'personlighet' | 'test' | 'draft' | 'cv_start'; token: string }
  onAndraVal?: () => void            // "Ändra" i valraden
}

// src/app/dashboard/valkommen/ForslagSteg.tsx
export interface ForslagStegProps {
  intent: SignupIntent
  fornamn: string | null
}
// Primär: "Köp {paketNamn}, {pris}" → /dashboard/valj-spar?paket={plan}&steg=kop
// Sekundär i foten (FlowShell footerSecondary): "Börja gratis" → INTENTS[intent].landning
// onExit (krysset) = Börja gratis. Båda sparar spåret via /api/onboarding/track.
```

Kortet i steg 3 byggs som `SparKort` i `ValjSparClient` (bryts ut till `src/components/pricing/SparKort.tsx` och delas). Raderna i kortet är tre, inte fyra, och läses ur en ny nyckel `FORSLAG` i `paket-copy.ts` så att namn och pris kommer ur `PLANS`.

### Datamodell

Migration `supabase/migrations/20260925_profiles_onboarding_intent.sql`:

```sql
alter table public.profiles
  add column if not exists onboarding_intent text
  check (onboarding_intent in ('cv','brev','tester','intervju','jobb'));
comment on column public.profiles.onboarding_intent is
  'Vad användaren valde att börja med i registreringstratten. Finare än onboarding_track, som styr paket.';
```

RLS: kolumnen skrivs bara av `/api/onboarding/track` med serverklienten, läses av ägaren själv. Ingen ny policy behövs om befintliga update-policyn för egen rad gäller; kontrollera med `get_advisors` efter migrationen. `onboarding_track` sätts som i dag (cv, tester, allt) och är fortfarande det som hemskärmen och betalväggarna läser.

### Händelser, del B

Se tabellen i designfilen, sektion "Mätning". Sammanfattning: nya `signup_flow_viewed`, `signup_intent_selected`, `signup_landed`; ändrade `signup_started` (också Google, med `intent`, `entry`) och `signup_completed` (serverhändelsen inväntas, med `intent`, `entry`); befintliga `pricing_viewed` (`surface: 'signup_forslag'`), `track_selected` (`surface: 'signup_forslag'`, `onboarding_intent`), `paywall_cta_clicked`, `purchase_step_viewed`, `checkout_started`, `subscription_paid`, `activation_first_doc`. Alla nya händelser läggs i `src/lib/analytics/events.ts` med typade egenskaper. Insikten i PostHog-dashboarden 968012 får kohortfiltret via `scripts/posthog-filtrera-interna.ts`.

### Villkor och mätregler (saas-lead 2026-09-24)

- **Valet styr aldrig vad som syns.** `onboarding_intent` läses bara av `/dashboard/valkommen`, Kom igång (`komigang.ts`, `KomIgangArk`), hemskärmens ordning (`DashboardHem`, `useUnusedFeatures`) och skrivs bara av `/api/onboarding/track`.
- **Kill-regel för steg 1.** Minst 60 ingångar, tidigast fyra veckor efter deploy. Tappar steg 1 mer än 25 procent mot kontosteget (`signup_flow_viewed step=val` mot `step=konto`) flyttas samma fem kort till efter kontot, inga andra ändringar.
- **Mätregel för steg 3.** Fyra veckor efter deploy: över 85 procent Börja gratis och under 5 procent till kassan byter primärknapp, inget annat.
- **Avläsning 22 oktober, alternativ C.** Köp per konto med `entry=pris` mot `entry=header`. Minst tre gånger fler köp per konto från /priser-ingången bygger C (paketvyn) som A/B-test på bar /register, med gratis som sekundärknapp i foten och längdväxeln bara på Hela paketet.
- **Raden under frågan i steg 1 står kvar:** "Vi öppnar rätt verktyg när kontot är klart. Allt annat finns i menyn, och det mesta går att prova gratis."
- **Bredden:** andelen gratiskonton som provar en funktion utanför sitt intent inom sju dagar, via `kom_igang_tile_clicked` och `next_action_clicked` med `outside_intent: true`. Utgångsläge: 4 av 99 konton gjorde både CV och test.

### Acceptanskriterier, del B

1. Headerns Skapa konto öppnar steg 1 på /register. Inga statistikrutor, ingen CV-poängmätare, ingen text om fem dagar Premium någonstans på sidan (grep `Fem dagar Premium` i src ger noll träffar).
2. Steg 1 på Pixel 7: frågan, minst fyra kort och Fortsätt syns utan scroll. Fortsätt är spärrad tills ett kort är valt och spärrorsaken läses upp.
3. `/register?borja=tester` visar steg 2 direkt med raden "Du börjar med rekryteringstesterna" och Ändra, som leder till steg 1 med testerna förvalda.
4. Konto med lösenord från steg 1 med Skriva CV landar på steg 3 med CV-paketet. Börja gratis landar på `/dashboard/skapa-cv`. Köp landar på köpsteget med CV-paketet och samtyckesrutan.
5. Samma sak med Google: valet överlever redirecten (cookien), steg 3 visar rätt paket, och `signup_completed` med `method: 'google'` syns i PostHog inom en minut.
6. Från intervjuprovet med token (lösenord och Google) landar kontot på `/dashboard/intervju/{token}` utan steg 1 och steg 3. Samma för personlighetsprovet, testprovet (`?test=`), brevutkastet (`?draft=`) och CV-starten (`?cv_start=`), där de tre sista i dag misslyckas med Google.
7. Prissidans `?paket=all_month` landar efter kontot på köpsteget med Hela paketet och månad valt, utan steg 1 och 3.
8. Hoppa över i steg 1 landar efter kontot på spårvalet utan förvalt kort.
9. Befintlig adress i steg 2 ger felraden med Logga in som bär med sig valet.
10. Krysset i steg 3 gör samma sak som Börja gratis och skjuter `track_selected intent=free`.
11. Orange räknat: steg 1 och 2 högst två (linjen, fokusring), steg 3 ett.
12. Tangentbord: piltangenter i radiogruppen, Tabb till Hoppa över och Fortsätt. I steg 2 går Enter i lösenordet till Skapa konto. Foten ligger ovanför tangentbordet på Android Chrome.
13. /register LCP under 1,5 s på Pixel 7 över 4G (publik budget), ingen JS-bundel över dagens.
14. **Grep-kriteriet.** `grep -rn "onboarding_intent" src` träffar bara `src/app/dashboard/valkommen/`, `src/app/api/onboarding/track/`, `src/lib/onboarding/komigang.ts` (och `komigang-server.ts`), `src/components/dashboard/KomIgang*`, `src/app/dashboard/(oversikt)/`, `src/hooks/useUnusedFeatures.ts`, `src/components/registrering/` och typfilerna. Noll träffar i `src/components/dashboard/Sidebar.tsx`, `src/lib/access/` och i någon route under `src/app/api/` utom `onboarding/track`. Testet läggs som enhetstest som läser filträdet, så att det faller i CI.
15. Menyn är identisk för ett gratiskonto med intent cv, tester och jobb (jämför skärmdumpar av sidomenyn och mobilnavet, alla rader synliga, samma grå rader).
16. Gratiskonto med intent tester: Kom igång visar matrislogik grundnivå först och därefter Analysera ditt CV, Skriv ett personligt brev och Se tre matchade jobb. Ingen gratislista per intent innehåller `cv_upp` eller `profil` (enhetstest på `KOM_IGANG_LISTA`). Hemskärmen visar "Gör ditt första rekryteringstest" som Nästa handling, inte CV-uppladdning, med länken "Vill du börja med CV:t i stället?".
17. Gratiskonto med intent cv, efter första CV:t: raden Prova också föreslår logiktestet på grundnivå.

---

## QA i riktig webbläsare

Enligt [[feedback_riktig_webblasartest]]: klicktest som ny användare i Chrome, Pixel 7 (412 × 915, touch, mobil user agent) och desktop 1280 × 900, skärmdump per steg till `docs/design/profil-registrering-2026-09-24/qa/`.

Testkonton skapas med e-post som matchar undantagsmönstret, så att de aldrig räknas: `qa-reg-<datum>-<n>@jobbcoach.ai`. Google-vägen testas med ett Google-testkonto som ägaren tillhandahåller.

1. Del A, befintligt konto: skapa `qa-profil-<datum>@jobbcoach.ai` med admin-API:t, logga in via /login. Gå Sidomenyn → Profil, → Prenumeration, profilmenyn → Profil och Prenumeration. Skärmdump av varje.
2. Profil på Pixel 7: mät y-koordinaten för fotoknappen och för sektionens slut (`getBoundingClientRect`), tryck Hoppa till → Personliga brev, välj Självsäker, ladda upp ett 5 MB JPEG (fixtur i `scripts/fixtures/`), ladda upp en PDF, ta bort fotot. Ladda om och kontrollera att allt är sparat.
3. Öppna Skriv nytt brev och kontrollera att tonen är Självsäker och att länken "Ändra förvald ton" landar på `#personliga-brev`.
4. Del B, lösenord: för vart och ett av de fem valen och för Hoppa över, ett nytt konto från headern. Skärmdump av steg 1, 2, 3 och landningen. Kontrollera `profiles.onboarding_intent` och `onboarding_track` per konto med en SQL-fråga.
5. Del B, ingångar: `?borja=tester`, `?paket=all_month`, `?intervju=<token>` från ett riktigt prov i en artikel, `?test=<token>` från `/verktyg/rekryteringstester/prova`, `?draft=<token>` från `/skapa-brev/start`. Samma med Google för minst intervju, test och draft.
6. Köpet: från steg 3 med CV-paketet till Stripes testläge (`scripts/qa-kop-testlage.mjs`), avbryt i kassan, kontrollera att kontot är gratis och spåret sparat.
7. Bredden: med kontona från steg 4, öppna Kom igång och hemskärmen för intent tester och cv, skärmdump. Ladda upp ett CV på CV-kontot och kontrollera raden Prova också. Jämför sidomenyn för alla fem konton.
8. PostHog: kör `npx tsx scripts/posthog-query.ts` på `signup_flow_viewed`, `signup_intent_selected`, `signup_started`, `signup_completed`, `signup_landed` för testkontona och kontrollera att varje steg finns en gång, med rätt `intent`, `entry` och `method`.

### Städregel

Varje testkonto skrivs till en lokal fil med sitt id när det skapas (`scratchpad/qa-konton.json`). Efter testet raderas de **per id**, aldrig per mönster: först rader i `user_activities`, `cv_texts`, `letters`, `job_applications`, `personality_test_sessions` och övriga tabeller med `user_id` (lista dem med `select table_name from information_schema.columns where column_name = 'user_id'`), samt kopplade rader i `anon_interview_samples` med `user_id = id`, sedan `auth.admin.deleteUser(id)`, sedan en kontrollfråga att profilraden är borta. Stripe-testkunder raderas per kund-id i testläget. Loggen över raderade id sparas i QA-mappen.

---

## Byggordning

Vänd efter saas-leads beslut: registreringen träffar varje nytt konto, profilen är bekvämlighet för befintliga.

1. **Mätningen och de osanna påståendena, denna vecka (S).** `captureServer` inväntas i callbacken och Google-knappen skjuter `signup_started`; kontrollera i PostHog att Google-konton syns. Samtidigt bort från /register: raden "Fem dagar Premium ingår. Inget kort behövs." och statistikrutorna (12 487, 94 %, 8, 2 min). Före allt annat, oberoende av resten.
2. **Del B, tratten med de tre punkterna för bredden (M till L).**
   1. Datamodell och valkommen-sidan: migrationen, `intent.ts`, cookien, `/dashboard/valkommen` med hämtkedjan (löser Google-buggen för smakproven), callbackens nya mål.
   2. /register och /login i det publika skalet, steg 1 och 2, alla lägen.
   3. Steg 3 och spårvalets ändringar: `ForslagSteg`, `?steg=kop`, inget förval.
   4. Bredden: Kom igång per intent, träningsfokus för gratis, intent i `useUnusedFeatures`. Samma släpp som steg 3, annars är valet tomt för gratisanvändaren.
   5. Ingångarna: `borja` på verktygssidorna, `jc_signup_entry` i header, meny och login.
   6. Grep-testet (kriterium 14) och händelserna i `events.ts`.
3. **Del A, navigeringen och PaketKort-knappen (S).** Sidomenyn, profilmenyn, toppradens plats, `h-auto min-h-11 py-2` på PaketKort.
4. **Del A, profilsidan (M).** Sektionerna, Hoppa till, statusraden (namn och ort), fotofältet med förminskning, länkarna in.
5. **QA enligt ovan, skärmdumpar, städning per id.** Sedan push.

**Avläsningar:** kill-regeln för steg 1 och mätregeln för steg 3 fyra veckor efter deploy av punkt 2 (och tidigast vid 60 ingångar). Alternativ C den 22 oktober 2026.

Insats totalt: M till L.

## Osäkerheter

- Talen bakom Del B är små (60 konton på 30 dagar, attribution på 4). Designen bygger på riktningen, framför allt att testsidan är största källan till /register, inte på andelar.
- Om Turnstile i managed-läge ibland kräver en synlig kontroll på mobil flyttar den knappen. Testas i steg 6.
- `/dashboard/skapa-brev` utan CV skickar till CV-uppladdningen. Brevvalet i steg 3 säger det, men landningen bör kontrolleras så att hon inte ser en fellik sida.
