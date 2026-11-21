import { cookies } from 'next/headers';
import { arPlatshallareNamn } from '@/lib/profile/dokumentKontakt';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import { extractJobInfo } from '@/lib/openai/api';
import { markFirstMilestone } from '@/lib/activation-tracking';
import { DAILY_LIMIT_LETTERS } from '@/lib/quota/quotaService';
import { arBrevTypsnitt, arTon, brevMallId, premiumSparr } from '@/lib/letters/brevRegler';
import { brevKvotEfterSkrivning } from '@/lib/letters/brevKvot';
import { kravMedTraffar } from '@/lib/letters/krav';
import { titelUrStrukturerad } from '@/lib/letters/brevData';
import { hamtaBrevProfil, ritaRad, startmallForCv } from '@/lib/letters/server';
import {
  kvotArSlut,
  kvotLage,
  kvotSlutSvar,
  raknaBrevMotKvot,
  skrivBrevtext,
} from '@/lib/letters/skrivBrev';

// Enkel cache för att spåra pågående genereringar och förhindra dubbletter
// Denna cache finns på serversidan och delas mellan alla användare
const activeGenerations = new Map<string, { startTime: number, promise: Promise<any> }>();

// Tidsperioder
const GENERATION_TIMEOUT_MS = 60000; // 60 sekunder max för en generering

// Hjälpfunktion för att rensa gamla cache-poster
function cleanupCache() {
  const now = Date.now();
  
  // Rensa gamla pågående genereringar (timeout)
  for (const [key, { startTime }] of activeGenerations.entries()) {
    if (now - startTime > GENERATION_TIMEOUT_MS) {
      console.log(`Rensning av timeouted generering: ${key}`);
      activeGenerations.delete(key);
    }
  }
}

// Schemalägg regelbunden rensning av cachen
if (typeof setInterval === 'function') {
  setInterval(cleanupCache, 30000); // Kör var 30:e sekund
}

export async function POST(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta användarprofil för att kontrollera prenumerationsnivå
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, weekly_letter_count, weekly_letter_first_used_at, full_name, phone')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // Behörigheten läses via premiumAccess, så att engångsköp i premium_grants
    // och admin räknas, inte bara profiles.subscription_tier.
    const harBetalt = await userHasAccess(supabase, user.id, 'any');

    // Brevkvoten: första brevet gratis, sedan ett per rullande sju dygn.
    // Samma räknarkolumner som omskrivningen (/api/letters/[id]/skriv-om),
    // så att båda delar kvot (src/lib/letters/skrivBrev.ts).
    const now = new Date();
    const kvot = kvotLage(profile, now);
    const nextResetDate = kvot.nextResetDate;
    const newCount = kvot.effectiveCount + 1;

    // Kontrollera om användaren har nått sin gräns (endast för gratisanvändare)
    if (!harBetalt && kvotArSlut(kvot)) {
      return NextResponse.json(kvotSlutSvar(kvot), { status: 429 });
    }

    // Hämta begäransdata (CV-ID, jobbannons, tonalitet, språk och mall)
    const {
      cv_id,
      job_description,
      tonality,
      language = 'sv',
      template_id = 'classic',
      mall_id: mallIn,
      font_id: fontIn,
    } = await request.json();

    if (!cv_id || !job_description) {
      return NextResponse.json(
        { error: 'CV-ID och jobbannons krävs' }, 
        { status: 400 }
      );
    }

    // Brevet bär avsändarens namn i huvud och underskrift. Utan namn i
    // profilen frågar klienten efter det (NameRequiredNotice i brevflödet)
    // och gör om anropet, före modellanropet och utan att kvoten räknas.
    // Ingen platshållare som "Ditt namn" hamnar i brevet.
    if (arPlatshallareNamn(profile.full_name)) {
      return NextResponse.json({ error: 'name_required', code: 'name_required' }, { status: 422 });
    }

    // Mall, typsnitt och ton valideras och Premium kontrolleras på servern
    // (BYGGSPEC avsnitt 4), före modellanropet och utan att kvoten räknas.
    const valdMall = mallIn === undefined || mallIn === null ? null : brevMallId(mallIn);
    if (mallIn !== undefined && mallIn !== null && !valdMall) {
      return NextResponse.json({ error: 'Okänd mall', code: 'invalid_mall' }, { status: 400 });
    }
    const valtTypsnitt: string | null = fontIn === undefined || fontIn === null || fontIn === '' ? null : fontIn;
    if (valtTypsnitt !== null && !arBrevTypsnitt(valtTypsnitt)) {
      return NextResponse.json({ error: 'Okänt typsnitt', code: 'invalid_font' }, { status: 400 });
    }
    if (tonality && !arTon(tonality)) {
      return NextResponse.json({ error: 'Okänd ton', code: 'invalid_tone' }, { status: 400 });
    }
    const sparr = premiumSparr({ mallId: valdMall, fontId: valtTypsnitt, ton: tonality }, harBetalt);
    if (sparr) {
      return NextResponse.json({ error: 'premium_required', code: 'premium_required', sparr }, { status: 402 });
    }
    
    // Skapa en unik nyckel för denna specifika kombination
    // Inkludera språket och mallen i nyckeln för att hålla isär genereringar på olika språk och mallar
    const requestKey = `${user.id}:${cv_id}:${job_description.length}:${language}:${template_id}:${valdMall ?? ''}:${valtTypsnitt ?? ''}`;
    
    // Kontrollera om en generering redan pågår för denna kombination
    if (activeGenerations.has(requestKey)) {
      console.log(`Generering pågår redan för: ${requestKey}`);
      
      try {
        // Vänta på befintlig generering
        const existingGeneration = activeGenerations.get(requestKey);
        if (existingGeneration) {
          const result = await existingGeneration.promise;
          return NextResponse.json({ 
            success: true, 
            data: result,
            shared: true,
            nextResetDate: nextResetDate.toISOString()
          });
        }
      } catch (error) {
        // Om befintlig generering misslyckades, ta bort den från cachen
        activeGenerations.delete(requestKey);
        console.log(`Befintlig generering misslyckades för: ${requestKey}`);
      }
    }
    
    // Skapa generaringslöfte
    const generationPromise = (async () => {
      // Hämta CV-text från databasen
      const { data: cvData, error: cvError } = await supabase
        .from('cv_texts')
        .select('*')
        .eq('id', cv_id)
        .eq('user_id', user.id)
        .single();

      if (cvError) {
        console.error('Fel vid hämtning av CV:', cvError);
        throw new Error('Kunde inte hitta CV');
      }

      const sprak: 'sv' | 'en' = language === 'en' ? 'en' : 'sv';

      // Jobbinformationen och brevtexten parallellt: extractJobInfo får bara
      // annonsen. Brevtexten går genom samma maskering som förut
      // (guardCvTextForModel i skrivBrevtext): profilens och CV:ts namn och
      // telefon tas bort innan något skickas till modellen. Kraven läses ur
      // annonsen mot modellens egna stycken, utan personuppgifter.
      const [jobInfo, skriven] = await Promise.all([
        extractJobInfo(job_description, sprak),
        skrivBrevtext({
          supabase,
          userId: user.id,
          cvText: cvData.cv_text,
          cvStrukturerad: cvData.structured_data,
          profil: profile,
          annons: job_description,
          ton: tonality || 'professional',
          sprak,
          flode: 'letter_preview',
        }),
      ]);

      // Avsändaren ur profilen, efter modellanropen.
      const { profil: brevProfil } = await hamtaBrevProfil(supabase, user.id, null);
      if (!brevProfil) throw new Error('Kunde inte hämta användarens profildata');
      const avsandare = { ...brevProfil, titel: titelUrStrukturerad(cvData.structured_data) };

      // Brevets mall från start: vald mall om den är tillåten (kontrollerad
      // ovan), annars CV:ts mall om användaren får spara den, annars Linne.
      const mallId = valdMall ?? startmallForCv(cvData.structured_data, harBetalt);

      const rad = {
        user_id: user.id,
        title: jobInfo.title || (sprak === 'en' ? 'Job Application' : 'Ansökningsbrev'),
        company: jobInfo.company ?? null,
        job_title: jobInfo.position ?? null,
        tonality: tonality || 'professional',
        language: sprak,
        // Gamla mallens id står kvar för äldre kod; brevet ritas i mall_id.
        template_id: template_id,
        job_description: job_description,
        cv_text: cvData.cv_text,
        cv_id: cv_id,
        // Alla skrivna brev sparas av sig själva (BYGGSPEC avsnitt 2).
        is_saved: true,
        cv_path: cvData.original_file_path,
        body_stycken: skriven.stycken,
        halsning: null,
        mottagare_person: null,
        mall_id: mallId,
        font_id: valtTypsnitt,
        krav: skriven.krav,
        ai_model: skriven.ai_model,
        ai_tokens: skriven.ai_tokens,
        ai_cost: skriven.ai_cost,
        generation_time_ms: skriven.generation_time_ms,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      // content: färdig HTML i vald mall, för äldre kod, mejl och utkastvägen.
      const content = ritaRad(rad, avsandare, user);

      const { data: previewData, error: insertError } = await supabase
        .from('letters')
        .insert({ ...rad, content })
        .select()
        .single();

      if (insertError) {
        console.error('Fel vid skapande av brev:', insertError);
        throw new Error('Kunde inte spara brevet');
      }

      // Första brevet: samma milstolpar som när brevet sparades för hand.
      await markFirstMilestone(user.id, 'first_letter_created_at');
      const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
        user_id: user.id,
        step_name: 'create_letter',
      });
      if (onboardingError) {
        console.error('Failed to update onboarding progress:', onboardingError.message);
      }

      return {
        ...previewData,
        cv_id: cv_id,
        is_saved: true,
        isLocked: false,
        kravTraffar: kravMedTraffar(skriven.krav, skriven.stycken),
        // Behåll även det gamla ai_metadata för kompatibilitet
        ai_metadata: {
          model: previewData.ai_model,
          tokens: skriven.ai_tokens,
          cost: previewData.ai_cost
        }
      };
    })();
    
    // Registrera generering i aktiva genereringar
    activeGenerations.set(requestKey, {
      startTime: Date.now(),
      promise: generationPromise
    });
    
    // Räkna brevet mot kvoten vid förbrukning, som förut före genereringen
    // så att två snabba anrop inte båda hinner igenom. Ett gammalt fönster
    // startar ett nytt: count=1, first_used_at=nu.
    if (!harBetalt) {
      await raknaBrevMotKvot(user.id, kvot, now);
    }
    
    // Vänta på att genereringen slutförs
    try {
      const letterData = await generationPromise;
      
      // Ta bort från aktiva genereringar när den är klar
      activeGenerations.delete(requestKey);

      // Kvoten efter brevet: vyerna skriver "Nästa gratisbrev fredag 27 nov"
      // ur kvot.nastaGratisbrev (src/lib/letters/brevKvot.ts).
      const kvotEfter = harBetalt
        ? { harBetalt: true, grans: DAILY_LIMIT_LETTERS, anvant: 0, kvar: null, nastaGratisbrev: null }
        : brevKvotEfterSkrivning(profile, now);
      
      // För gratisanvändare, returnera också antalet återstående brev
      if (!harBetalt) {
        const remainingLetters = Math.max(0, DAILY_LIMIT_LETTERS - newCount);
        return NextResponse.json({
          success: true,
          data: letterData,
          remainingLetters: remainingLetters,
          limit: DAILY_LIMIT_LETTERS,
          nextResetDate: nextResetDate.toISOString(),
          kvot: kvotEfter,
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: letterData,
        nextResetDate: nextResetDate.toISOString(),
        kvot: kvotEfter,
      });
    } catch (error: any) {
      // Ta bort från aktiva genereringar vid fel
      activeGenerations.delete(requestKey);
      throw error;
    }
  } catch (error: any) {
    console.error('Brevgenerering error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid generering av brev: ' + error.message }, 
      { status: 500 }
    );
  }
}