# Säkerhetstestning - PII-skydd för OpenAI-integration

## Översikt
Detta dokument beskriver hur du verifierar att INGEN personlig information (PII) skickas till OpenAI när användare genererar personliga brev.

## Vad är PII (Personal Identifiable Information)?
- **Namn**: Förnamn, efternamn
- **E-post**: exempel@email.com
- **Telefon**: +46 70 123 45 67, 070-123 45 67
- **Adress**: Gatadress, postnummer, stad
- **Personnummer**: YYMMDD-XXXX

## Säkerhetsarkitektur

### 1. Anonymisering (cv-anonymizer.ts)
**Syfte**: Ta bort ALL PII från CV-text innan den skickas till OpenAI

**Funktioner**:
- `extractSkillsAndExperience()` - Anonymiserar CV och returnerar endast kompetenser
- `validateAnonymization()` - Validerar att ingen PII finns kvar

**Regex-mönster som används**:
```typescript
{
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+46|0046|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g,
  streetAddress: /\b[A-ZÅÄÖ][a-zåäö]+(?:gatan|vägen|stigen|gränden|torget|platsen)\s+\d+[A-Za-z]?\b/g,
  postalCode: /\b\d{3}\s?\d{2}\b/g,
  personnummer: /\b\d{6}[-\s]?\d{4}\b/g,
  url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/g
}
```

### 2. Template Merger (template-merger.ts)
**Syfte**: Lägga till profildata EFTER att OpenAI har genererat brevkroppen

**Flöde**:
1. OpenAI genererar endast brevkropp (body content) baserat på anonymiserad data
2. Template merger hämtar profildata från Supabase
3. Profildata läggs till i brevet via vald mall

### 3. 9-stegs säkert flöde (route.ts)

**STEG 1**: Hämta CV från Supabase
**STEG 2**: Hämta profildata (namn, email, telefon, plats)
**STEG 3**: 🔒 **Anonymisera CV** (ta bort PII)
**STEG 4**: Extrahera jobbinformation
**STEG 5**: 🚀 **Skicka ENDAST anonymiserad data till OpenAI**
**STEG 6**: Bygg JobInfo-objekt
**STEG 7**: Bygg ProfileDataForLetter-objekt
**STEG 8**: Hämta vald mall
**STEG 9**: ✅ **Generera komplett brev** (PII läggs till HÄR, EFTER OpenAI)

## Testscenarion

### Scenario 1: Verifiera via Console Logs

**Steg**:
1. Öppna browser DevTools (F12)
2. Gå till Console-fliken
3. Generera ett personligt brev via `/dashboard/skapa-brev`
4. Titta efter följande loggar:

**Förväntade loggar** (från servern - se via `npm run dev` i terminal):

```
🔒 SÄKERHET: Anonymiserar CV-data...
📋 Original CV-längd: 1234 tecken
📋 Anonymiserad data-längd: 856 tecken
🔍 SÄKERHETSKONTROLL: Validerar anonymisering...
✅ SÄKERHET VERIFIERAD: Ingen PII hittades i anonymiserad data

🚀 SÄKERHET: Skickar ENDAST anonymiserad data till OpenAI...
📤 Data som SKICKAS till OpenAI:
  - Anonymiserade kompetenser: Senior utvecklare med 5 års erfarenhet av React och TypeScript...
  - Jobbbeskrivning: Vi söker en Frontend Developer...
  - Tonalitet: professional
  - Språk: sv

🔒 Data som INTE skickas till OpenAI:
  - Namn: Anders Andersson ❌
  - Email: anders@exempel.se ❌
  - Telefon: +46 70 123 45 67 ❌
  - Plats: Stockholm ❌

✅ SÄKERHET: OpenAI returnerade brevkropp (INGEN PII skickades)
```

**Om du ser varningar**:
```
❌ SÄKERHETSVARNING: PII-läckage detekterat!
🚨 Anonymiserad data innehåller: Email address detected
```

→ Detta betyder att anonymiseringen MISSLYCKADES och PII läckte igenom.
→ Kontakta utvecklingsteamet omedelbart!

### Scenario 2: Verifiera via Network Tab

**Steg**:
1. Öppna browser DevTools (F12)
2. Gå till Network-fliken
3. Generera ett personligt brev
4. Hitta API-anropet till `/api/letters/generate`
5. Kontrollera Request Payload

**Förväntad Request Body**:
```json
{
  "cv_id": "abc123...",
  "job_description": "Vi söker en Frontend Developer...",
  "tonality": "professional",
  "language": "sv",
  "template_id": "classic",
  "save": false
}
```

**Viktigt**: Du ska INTE se något av följande i Request Body:
- ❌ Namn (full_name)
- ❌ E-postadress (email)
- ❌ Telefonnummer (phone)
- ❌ Adress/plats (location)

Profildata hämtas på servern EFTER OpenAI-anropet!

### Scenario 3: Kontrollera OpenAI API-anrop (avancerat)

**Kräver**: Tillgång till serverns console output (`npm run dev` terminal)

**Steg**:
1. Öppna `src/lib/openai/api.ts`
2. Leta efter funktionen `generateCoverLetter()`
3. Lägg till temporär logging:

```typescript
export async function generateCoverLetter(
  anonymizedSkills: string,
  jobDescription: string,
  tonality: string = 'professional',
  language: string = 'sv'
): Promise<GenerateLetterResult> {
  console.log('🔍 DEBUG: Data skickat till OpenAI:');
  console.log('anonymizedSkills:', anonymizedSkills);
  console.log('jobDescription:', jobDescription);

  // ... resten av koden
}
```

4. Generera ett brev
5. Granska outputen - kontrollera att `anonymizedSkills` INTE innehåller:
   - Namn
   - Email
   - Telefon
   - Adresser

### Scenario 4: Verifiera genererat brev

**Steg**:
1. Generera ett personligt brev
2. Kontrollera att brevet INNEHÅLLER:
   - ✅ Ditt namn i header
   - ✅ Din email i header
   - ✅ Ditt telefonnummer (om du valt att inkludera det)
   - ✅ Din plats (om du valt att inkludera det)

Detta bevisar att profildata lades till EFTER OpenAI-anropet via template merger!

## Vanliga problem och lösningar

### Problem 1: Anonymiseringen missar vissa PII-typer

**Symptom**: Du ser `❌ SÄKERHETSVARNING` i loggen

**Lösning**:
1. Öppna `src/lib/letters/cv-anonymizer.ts`
2. Utöka `PII_PATTERNS` med nya regex-mönster
3. Lägg till test i `validateAnonymization()`

### Problem 2: Profildata visas inte i brevet

**Symptom**: Genererat brev saknar namn/email/telefon

**Lösning**:
1. Kontrollera att profildatan finns i Supabase `profiles`-tabellen
2. Verifiera att `include_phone_in_letters` och `include_location_in_letters` är korrekt satta
3. Kontrollera `template-merger.ts` - funktionen `generateLetterHeader()`

### Problem 3: Fel mall används

**Symptom**: Brevet har fel design trots att du valt en annan mall

**Lösning**:
1. Verifiera att `template_id` skickas korrekt i API-anropet
2. Kontrollera `letter-templates.ts` - alla mallar ska finnas i `LETTER_TEMPLATES`
3. Kolla console för fel i `getLetterTemplate()`

## Checklista för säkerhetsverifiering

Innan du sätter systemet i produktion, gå igenom denna checklista:

- [ ] **Loggning fungerar**: Du ser säkerhetsloggar i serverns console
- [ ] **Anonymisering verifierad**: Inga varningar i `validateAnonymization()`
- [ ] **Network-anrop korrekt**: Ingen PII i `/api/letters/generate` Request Body
- [ ] **Profildata läggs till**: Genererat brev innehåller namn, email, etc.
- [ ] **Mallsystemet fungerar**: Kan växla mellan olika mallar
- [ ] **Premium-låsning fungerar**: Gratis-användare kan inte välja premium-mallar
- [ ] **Toggles fungerar**: Kan välja att inkludera/exkludera telefon och plats

## Teknisk implementeringsöversikt

### Filer involverade i säkerhetsflödet

1. **`src/lib/letters/cv-anonymizer.ts`**
   - Anonymiserar CV
   - Validerar att ingen PII finns kvar

2. **`src/lib/letters/template-merger.ts`**
   - Lägger till profildata EFTER AI-generering
   - Genererar brevhuvud med kontaktinfo

3. **`src/lib/letters/letter-templates.ts`**
   - Definierar 6 brevmallar
   - Varje mall har egen `generateHTML()`-metod

4. **`src/lib/openai/api.ts`**
   - Tar emot ENDAST anonymiserad data
   - Skickar ALDRIG PII till OpenAI

5. **`src/app/api/letters/generate/route.ts`**
   - Orkesterar 9-stegs säkert flöde
   - Omfattande säkerhetsloggning

6. **`supabase/migrations/20251119_profile_contact_fields.sql`**
   - Lägger till phone, location, include_*_in_letters
   - RLS-policies för säker dataåtkomst

## GDPR-compliance

✅ **Uppfyllt**:
- Personuppgifter lagras ENDAST i vår Supabase-databas (EU-baserad)
- OpenAI får ALDRIG tillgång till PII
- Användare har full kontroll över vilka uppgifter som inkluderas i brev
- All data anonymiseras innan extern bearbetning

✅ **Dataminimering**:
- Endast nödvändiga fält samlas in
- Telefon och plats är FRIVILLIGA

✅ **Transparens**:
- Användare informeras om att data aldrig skickas till AI-tjänster
- Tydliga integritetsinstruktioner i UI

## Kontakt för säkerhetsfrågor

Om du upptäcker säkerhetsproblem:
1. Dokumentera exakt vad som hände
2. Ta skärmdumpar av console-loggar
3. Rapportera omedelbart till utvecklingsteamet

**Kritiska säkerhetsproblem ska rapporteras omedelbart!**
