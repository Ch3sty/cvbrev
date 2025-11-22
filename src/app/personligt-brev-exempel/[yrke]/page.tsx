import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PersonligtBrevExempelPage from './PersonligtBrevExempelPage'

// Example data for all professions
const exampleData: Record<string, any> = {
  'underskoterska': {
    yrke: 'Undersköterska',
    sokvolym: 750,
    metaTitle: 'Personligt Brev Exempel Undersköterska - Jobbcoach.ai',
    metaDescription: 'Se ett komplett personligt brev-exempel för undersköterska. Skrivet av rekryteringsexperter, ATS-optimerat och anpassat efter svenska vårdmiljöer. Inkluderar tips och branschspecifika nyckelord.',

    // SEO-rik introduktion
    seoIntro: 'Söker du jobb som undersköterska och behöver skriva ett personligt brev som sticker ut? Det här exemplet visar hur du skriver ett ATS-optimerat personligt brev som passar svenska vårdmiljöer. Du får se exakt hur du balanserar teknisk kompetens (ADL-stöd, medicindelegering, dokumentationssystem) med de mjuka färdigheter som rekryterare söker (empati, kommunikation, samarbete). Brevet är anpassat efter Karolinska Universitetssjukhusets värderingar och visar konkreta exempel från geriatrisk vård. Använd det som inspiration för din egen jobbansökan undersköterska och anpassa det efter den tjänst du söker. Läs också våra tips om hur du optimerar ditt CV undersköterska för att öka dina chanser till intervju.',

    intro: 'Ett professionellt personligt brev för undersköterska som visar din omvårdnadskompetens, empati och förmåga att arbeta i stressiga situationer. Detta exempel är optimerat för svenska vårdgivare och ATS-system.',

    exempelBrev: {
      namn: 'Lisa Andersson',
      adress: 'Storgatan 12, 123 45 Stockholm',
      telefon: '070-123 45 67',
      epost: 'lisa.andersson@email.se',
      arbetsgivare: 'Karolinska Universitetssjukhuset',
      roll: 'Undersköterska inom geriatrik',
      datum: new Date().toLocaleDateString('sv-SE'),
      brevText: `Hej,

Jag söker tjänsten som undersköterska inom geriatrik på Karolinska Universitetssjukhuset. Med fem års erfarenhet av personcentrerad vård och ett genuint engagemang för äldres välmående är jag övertygad om att min kompetens skulle passa väl i ert team. Era värderingar om evidensbaserad vård och patientens rätt till trygghet stämmer helt överens med hur jag arbetar.

Under mina år på Stockholms äldreboende har jag utvecklat gedigen erfarenhet av ADL-stöd, demensvård och palliativ omvårdnad. Jag har regelbundet arbetat med 30-40 patienter per arbetspass och har medicinsk delegering för insulin, subkutana injektioner och PEG-sondmatning. Ett konkret exempel är när jag uppmärksammade tidiga tecken på urinvägsinfektion hos en patient med demens, kontaktade läkare och startade behandling innan tillståndet förvärrades. Jag arbetar nära sjuksköterskor och läkare i tvärprofessionella team där snabb kommunikation och noggrann dokumentation i Cosmic varit avgörande.

Det jag uppskattar mest med vårdyrket är relationerna med patienterna. Att få tid att sitta ner med en orolig patient, lyssna på deras berättelser och skapa trygghet i vardagen är det som driver mig. Jag tror starkt på personcentrerad vård och arbetar aktivt för att varje patient ska känna sig sedd och respekterad. När situationen kräver det är jag lugn och beslutsam – jag har hanterat akuta fall, konfusion och plötsliga försämringar och vet hur viktigt det är att agera snabbt samtidigt som jag bevarar lugnet för patienten.

Vad som verkligen tilltalar mig med Karolinska Universitetssjukhuset är er satsning på kontinuerlig kompetensutveckling och evidensbaserad omvårdnad. Jag har under det senaste året genomgått utbildning i basala hygienrutiner och nutritionsbedömning, och jag ser fram emot att fortsätta utvecklas tillsammans med er kompetenta personalgrupp. Er forskning inom geriatrik och fokus på värdighetsbevarande vård ligger helt i linje med min egen yrkesstolthet.

Jag ser fram emot att diskutera hur jag kan bidra till er verksamhet och till patienternas vardag. Tveka inte att kontakta mig på 070-123 45 67 eller lisa.andersson@email.se.

Varma hälsningar,
Lisa Andersson`
    },

    varforDetFungerar: [
      {
        titel: 'Specifika yrkesnyckelord för ATS',
        beskrivning: 'Brevet innehåller viktiga sökord som ATS-system letar efter: ADL-stöd, personcentrerad vård, demensvård, palliativ omvårdnad, medicinsk delegering, tvärprofessionellt team, och Cosmic (dokumentationssystem). Detta ökar chansen att brevet rankas högt i automatiska system.'
      },
      {
        titel: 'Konkreta exempel istället för vaga påståenden',
        beskrivning: 'Istället för "jag är stresstålig" beskrivs konkreta situationer: uppmärksammade tidiga tecken på urinvägsinfektion, hanterat akuta fall och konfusion, arbetat med 30-40 patienter per pass. Detta visar kompetens genom handling, inte tomma ord.'
      },
      {
        titel: 'Mjuka färdigheter med bevis',
        beskrivning: 'Empatiska egenskaper backas upp med exempel: "sitta ner med en orolig patient, lyssna på deras berättelser". Detta är starkare än att bara skriva "jag är empatisk" och visar förståelse för personcentrerad vård som är central inom geriatrik.'
      },
      {
        titel: 'Kompetensutveckling som styrka',
        beskrivning: 'Nämner specifika utbildningar (basala hygienrutiner, nutritionsbedömning) och medicinsk delegering för insulin, PEG och subkutana injektioner. Detta visar lärvilja och professionalism – egenskaper som vårdgivare högt värderar.'
      },
      {
        titel: 'Företagsspecifik anpassning',
        beskrivning: 'Brevet refererar till Karolinskas värderingar om evidensbaserad vård och kontinuerlig kompetensutveckling. Detta visar att kandidaten gjort research och inte skickat ett generiskt brev, vilket ökar chansen att rekryteraren läser hela texten.'
      }
    ],

    tips: [
      {
        rubrik: 'Använd rätt branschterminologi för att passera ATS',
        text: 'ATS-system söker efter specifika nyckelord inom vården. Inkludera termer som ADL-stöd, personcentrerad vård, tvärprofessionellt team, basala hygienrutiner, medicindelegering, demensvård och palliativ vård. Om jobbannonsen nämner specifika dokumentationssystem som Cosmic, Procapita eller PMO, ta med dem om du har erfarenhet. Nämn också vårdplanering, riskbedömning och fallprevention om det är relevant för tjänsten. Dessa nyckelord signalerar både till ATS-systemet och till rekryteraren att du förstår yrkets krav.'
      },
      {
        rubrik: 'Balansera tekniska och mjuka färdigheter med konkreta exempel',
        text: 'Vårdgivare söker undersköterskor som behärskar både praktiska arbetsuppgifter och relationsskapande. Visa teknisk kompetens genom att nämna lyft- och förflytningsteknik enligt Akta Ryggen, PVK-skötsel, katetervård, såromläggning eller andra specifika arbetsuppgifter. Kombinera detta med mjuka färdigheter som empati och kommunikation, men backa alltid upp med exempel. Istället för "jag är bra på att lyssna" skriv "jag tar mig tid att sitta ner med oroliga patienter och lyssna på deras oro, vilket skapar trygghet i vardagen".'
      },
      {
        rubrik: 'Anpassa efter vårdmiljö och patientgrupp',
        text: 'Olika vårdmiljöer kräver olika kompetenser. För geriatrik: betona demensvård, kroniska sjukdomar, palliativ omvårdnad och tålamod. För akutvård: lyft fram stresshantering, snabba beslut, prioriteringsförmåga och teamarbete under press. För hemtjänst: fokusera på självständighet, flexibilitet, problemlösning och förmåga att arbeta ensam. Läs jobbannonsen noga och anpassa ditt brev så att det matchar den specifika arbetsplatsen och patientgruppen.'
      },
      {
        rubrik: 'Kvantifiera din erfarenhet för att öka trovärdigheten',
        text: 'Konkreta siffror gör ditt brev mer trovärdigt. Istället för "jag har erfarenhet av vård" skriv "5 års erfarenhet av geriatrisk vård med 30-40 patienter per arbetspass". Nämn antal års erfarenhet, antal VFU-perioder om du är nyutbildad, eller specifika arbetsuppgifter som "medicinsk delegering för 15-20 patienter dagligen". Om du jobbat deltid eller timanställd, räkna om till heltidsekvivalent: "2 år, motsvarande 3 års heltid". Siffror hjälper rekryteraren att snabbt bedöma din erfarenhetsnivå.'
      },
      {
        rubrik: 'Visa ditt arbetssätt i stressiga situationer',
        text: 'Vårdyrket innebär ofta akuta situationer och högt arbetstempo. Beskriv hur du hanterar stress genom konkreta exempel: "När en patient plötsligt försämrades kontaktade jag omedelbart ansvarig sjuksköterska, övervakade vitalparametrar och dokumenterade förändringen i Cosmic". Detta visar att du inte bara klarar av stress, utan också har strukturerade rutiner för att hantera akuta situationer. Nämn gärna erfarenhet av jour, natt eller helgarbete om du är flexibel gällande schemaläggning.'
      }
    ],

    faq: [
      {
        q: 'Hur lång erfarenhet behöver jag nämna som undersköterska?',
        a: 'Nämn alltid antal års erfarenhet om du har det (t.ex. "3 års erfarenhet inom geriatrik"). Om du är nyutbildad, fokusera på VFU-perioder och var du gjorde dem: "Jag har genomfört VFU inom geriatrik på Stockholms äldreboende och akutvård på Södersjukhuset". Betona vad du lärt dig och vilka arbetsuppgifter du hanterat. Vårdgivare vet att nyutexaminerade behöver introduktion, så var ärlig men positiv.'
      },
      {
        q: 'Ska jag nämna medicindelegering i mitt personliga brev?',
        a: 'Ja, definitivt om du har delegering. Detta är högt värderat och kan vara avgörande för vissa tjänster. Var specifik: "Jag har medicinsk delegering för insulin, subkutana injektioner, PEG-sondmatning och inhalation". Om du inte har delegering men är villig att ta det, skriv "Jag är motiverad att genomgå medicindelegering för de arbetsuppgifter som tjänsten kräver". Nämn också om du har erfarenhet av läkemedelshantering eller kan dospåsar.'
      },
      {
        q: 'Hur visar jag att jag klarar av fysiskt krävande arbete?',
        a: 'Undvik att säga "jag är fysiskt stark" eftersom det låter vagt. Skriv istället "Jag har gedigen erfarenhet av ergonomiska lyft- och förflyttningstekniker enligt Akta Ryggen-principer och använder hjälpmedel som lyftar, glidlakan och rullstolar säkert". Detta visar att du förstår vikten av arbetsmiljö och patientsäkerhet. Om du har utbildning i förflyttningsteknik eller arbetat med tyngre patienter, nämn det konkret.'
      },
      {
        q: 'Ska jag nämna schemaflexibilitet i det personliga brevet?',
        a: 'Ja, detta är ofta avgörande för vårdgivare. Om du är flexibel gällande arbetstider, var tydlig: "Jag är fullt flexibel gällande arbetstider inklusive natt, helger och jourpass". Om du har begränsningar (t.ex. kan inte jobba natt pga. familjesituation), nämn det inte i brevet utan ta upp det vid intervju. Betona istället vad du KAN: "Jag är van vid skiftarbete och har arbetat både dag-, kväll- och helgpass".'
      },
      {
        q: 'Hur hanterar jag ansökan om jag saknar formell erfarenhet?',
        a: 'Fokusera på VFU-perioder, relevanta kurser och personliga egenskaper. Skriv: "Under min VFU inom geriatrik på X fick jag arbeta självständigt med ADL-stöd, dokumentation och kommunikation med anhöriga". Nämn också omsorgserfarenhet från andra sammanhang: anhörigvård, volontärarbete eller extrajobb inom vården. Betona din lärvilja: "Som nyutexaminerad är jag van vid att lära snabbt och tar gärna emot feedback för att utvecklas i rollen".'
      },
      {
        q: 'Vilka certifieringar och utbildningar är värda att nämna?',
        a: 'Nämn alltid basala hygienrutiner (BHR), första hjälpen/HLR, Akta Ryggen, nutritionsbedömning, palliativ vård och demensutbildningar. Även kortare kurser som diabetes, sårbehandling eller smärtlindring är relevanta. Skriv konkret: "Jag har genomgått utbildning i basala hygienrutiner och förnyar min HLR-certifiering årligen". Om du har specialistkompetens som Silviasystern eller motsvarande, lyft fram det tydligt.'
      },
      {
        q: 'Hur skriver jag om jobbyte mellan olika vårdmiljöer?',
        a: 'Beskriv övergången som kompetensutveckling: "Efter tre år inom äldreboende söker jag nu en roll inom akutgeriatrik för att bredda min erfarenhet och arbeta i en mer medicinskt komplex miljö". Förklara vad du tar med dig från tidigare miljöer och vad du vill lära dig i den nya. Betona överförbara färdigheter: "Min erfarenhet av palliativ vård och demensomsorg på äldreboende ger mig en god grund för geriatrisk akutvård".'
      },
      {
        q: 'Ska jag nämna löneförväntningar i brevet?',
        a: 'Nej, nämn inte lön i det personliga brevet om det inte uttryckligen efterfrågas i annonsen. Fokusera på din kompetens och motivation. Löneförhandling sker vanligtvis vid anställningserbjudande. Om annonsen ber om löneönskemål, nämn en realistisk siffra baserad på kollektivavtal och din erfarenhet: "Enligt kollektivavtal med X års erfarenhet". Researcha lön via Unionen eller Kommunal innan du anger siffror.'
      },
      {
        q: 'Hur långt bör brevet vara för undersköterskor?',
        a: 'Sikta på 300-400 ord fördelat på 4-5 stycken, vilket motsvarar cirka 3/4 av en A4-sida. Vårdgivare har ont om tid, så håll brevet koncist och fokuserat. Varje stycke ska ha ett tydligt syfte: inledning med motivation, erfarenhet med konkreta exempel, kompetenser och arbetssätt, koppling till arbetsgivaren, och avslutning med uppmaning till kontakt. Om brevet blir längre än en A4-sida, korta ner genom att ta bort generella fraser.'
      }
    ],

    // Relaterade artiklar
    relateradeArtiklar: [
      {
        titel: 'Hur du skriver ett ATS-optimerat CV som undersköterska',
        slug: 'ats-optimerat-cv-underskoterska'
      },
      {
        titel: 'De vanligaste intervjufrågorna för undersköterskor med svar',
        slug: 'intervjufragor-underskoterska'
      },
      {
        titel: 'Karriärvägar inom vården: från undersköterska till specialist',
        slug: 'karriarvagar-underskoterska'
      },
      {
        titel: 'Medicindelegering för undersköterskor: så tar du nästa steg',
        slug: 'medicindelegering-underskoterska'
      }
    ],

    // Relaterade verktyg
    relateradeVerktyg: [
      {
        namn: 'CV-Mallar för Undersköterska',
        slug: '/verktyg/cv-mallar',
        beskrivning: 'Professionella CV-mallar anpassade för vårdyrken med rätt struktur för ATS-system'
      },
      {
        namn: 'Jobbcoachen - Karriärråd',
        slug: '/verktyg/jobbcoachen',
        beskrivning: 'Få personliga råd om din karriär inom vården från vår AI-coach'
      },
      {
        namn: 'Personligt Brev-verktyget',
        slug: '/verktyg/personligt-brev',
        beskrivning: 'Skapa ett skräddarsytt personligt brev för undersköterskor på 5 minuter'
      }
    ],

    relaterade: [
      { yrke: 'Sjuksköterska', slug: 'sjukskoterska' },
      { yrke: 'Personlig assistent', slug: 'personlig-assistent' },
      { yrke: 'Barnskötare', slug: 'barnskotare' }
    ]
  },

  'student': {
    yrke: 'Student',
    sokvolym: 700,
    metaTitle: 'Personligt Brev Exempel Student - Sommarjobb & Extrajobb | Jobbcoach.ai',
    metaDescription: 'Se ett professionellt personligt brev-exempel för studenter som söker sommarjobb eller extrajobb. ATS-optimerat med tips för studenter utan erfarenhet.',

    seoIntro: 'Söker du sommarjobb eller extrajobb som student och vet inte hur du skriver ett övertygande personligt brev? Det här exemplet visar exakt hur du kompenserar för begränsad arbetslivserfarenhet genom att lyfta fram överförbara färdigheter från studier, projektarbeten och extrajobb. Du får se hur du omvandlar akademiska meriter till konkret yrkesnytta och hur du visar arbetsgivare att du kan kombinera jobb och studier. Brevet är anpassat efter Gekås Ullared men fungerar lika bra för detaljhandel, restaurang, kundtjänst eller andra studentjobb. Följ våra specifika tips om hur du kvantifierar även mindre erfarenheter och visar tydlig tillgänglighet. Perfekt för dig som söker sommarjobb student 2025 eller vill få ett extrajobb vid sidan av studierna.',

    intro: 'Ett professionellt personligt brev för studenter som visar hur du omvandlar akademiska meriter och mindre arbetslivserfarenhet till konkret värde för arbetsgivare. Optimerat för sommarjobb och extrajobb.',

    exempelBrev: {
      namn: 'Erik Johansson',
      adress: 'Vasagatan 8, 411 24 Göteborg',
      telefon: '073-456 78 90',
      epost: 'erik.johansson@student.gu.se',
      arbetsgivare: 'Gekås Ullared',
      roll: 'Sommarjobb som säljare',
      datum: new Date().toLocaleDateString('sv-SE'),
      brevText: `Hej,

Jag söker sommarjobb som säljare på Gekås Ullared för perioden juni till augusti 2025. Som andraårsstudent på ekonomiprogrammet vid Göteborgs universitet kombinerar jag teoretisk kunskap inom marknadsföring och kommunikation med praktisk erfarenhet från kundmöten och serviceyrkande arbete. Gekås rykte som Sveriges mest besökta affär och ert höga tempo lockar mig. Jag vill lära mig retail i en miljö där ingen dag är den andra lik.

Under mitt sommarjobb på Café Lilla Paris serverade jag 200+ kunder per dag i ett högt tempo. Jag hanterade kassasystem, beställningar och konfliktlösning när kunder var missnöjda med väntetider. Ett konkret exempel var när vårt kösystem krashade en lördagseftermiddag. Jag tog initiativ att manuellt notera ordrar på papper, kommunicerade tydligt med stressade kunder om vad som hänt och fick köket att flyta igen. Min chef lyfte fram att jag behöll lugnet och löste problemet istället för att vänta på hjälp. Som volontär på musikfestivalen Way Out West koordinerade jag information till besökare och arbetade i ett team på 15 personer under tre intensiva dagar.

Mina kurser i marknadsföring och kommunikation ger mig verktyg att förstå kundbeteende och säljteknik. I ett projektarbete analyserade vi försäljningsstrategier inom retail och jämförde olika butikslayouter. Det gav mig insikt i hur man styr kundflöden och optimerar exponering av produkter. Jag är social, flexibel och lär mig snabbt. Kolleger beskriver mig som någon som tar ansvar och bidrar till god stämning även när det är stressigt.

Vad som verkligen tilltalar mig med Gekås är kombinationen av stora kundflöden, brett produktsortiment och högt tempo. Jag vill lära mig hur ni hanterar tusentals kunder per dag och får försäljningen att fungera smidigt trots trycket. Era värderingar om god service och att varje kund ska känna sig välkommen stämmer helt med hur jag jobbar.

Jag är tillgänglig hela sommaren från 1 juni till 31 augusti och kan börja direkt efter min sista tenta den 28 maj. Tveka inte att kontakta mig på 073-456 78 90 eller erik.johansson@student.gu.se.

Varma hälsningar,
Erik Johansson`
    },

    varforDetFungerar: [
      {
        titel: 'Omvandlar studier till praktisk yrkesnytta',
        beskrivning: 'Brevet nämner inte bara "ekonomiprogrammet" utan visar konkret värde: kurser i marknadsföring och kommunikation kopplas till kundbeteende och säljteknik. Projektarbete om försäljningsstrategier och butikslayout visar genuine intresse för retail. Detta gör akademiska meriter relevanta för arbetsgivaren.'
      },
      {
        titel: 'Kvantifierar även mindre erfarenheter',
        beskrivning: 'Istället för vaga påståenden används konkreta siffror: "200+ kunder per dag", "team på 15 personer", "tre intensiva dagar", "tillgänglig 1 juni till 31 augusti". Detta gör begränsad erfarenhet mer trovärdig och mätbar, vilket arbetsgivare uppskattar.'
      },
      {
        titel: 'Bevisar problemlösningsförmåga med konkret exempel',
        beskrivning: 'Situationen med krassat kösystem visar hur studenten hanterar stress och tar initiativ utan att vänta på instruktioner. Detta är viktigare än år av erfarenhet för många arbetsgivare som anställer studenter. Exemplet visar handlingskraft, inte bara tomma ord.'
      },
      {
        titel: 'Tydlig tillgänglighet och flexibilitet',
        beskrivning: 'Brevet anger exakta datum (1 juni - 31 augusti) och när studenten kan börja (28 maj efter sista tentan). Detta är kritiskt för arbetsgivare som planerar sommarscheman. Många studenter glömmer detta, men det kan vara avgörande för anställning.'
      },
      {
        titel: 'Visar motivation utan överdrift',
        beskrivning: 'Istället för "dröm att jobba här" eller "alltid velat" fokuserar brevet på vad studenten vill lära sig: "hur ni hanterar tusentals kunder per dag". Detta är konkret, trovärdigt och visar genuine intresse för verksamheten.'
      }
    ],

    tips: [
      {
        rubrik: 'Lyft överförbara färdigheter från studier och projekt',
        text: 'Akademiska meriter är inte bara teoretiska. Översätt dem till arbetslivsnytta. Projektarbete = teamwork och projektledning. Presentationer = kommunikation och självförtroende. Uppsatser = research och analytisk förmåga. Om du läst marknadsföring, koppla det till försäljning. Om du läst statsvetenskap, lyft fram argumentationsteknik och kritiskt tänkande. Var konkret: "I vårt projektarbete om kundlojalitet analyserade vi 500 enkätsvar, vilket lärde mig hur man tolkar kundbeteende". Arbetsgivare förstår inte automatiskt att "ekonomiprogrammet" ger relevant kompetens, du måste visa kopplingen.'
      },
      {
        rubrik: 'Kvantifiera all erfarenhet, även extrajobb och volontärarbete',
        text: 'Även om du jobbat på café i tre månader eller varit volontär på en festival räknas det. Gör erfarenheten konkret med siffror: "Serverade 150-200 kunder per dag under lunch-rushen", "Hanterade kassan och betalningar för ca 80 transaktioner dagligen", "Samarbetade i team på 12 personer under högsäsong". Om du saknar arbetslivserfarenhet, räkna extrajobb, sommarjobb, volontärarbete och föreningsengagemang. Kvantifiera antal timmar, antal personer du arbetat med eller hur länge du haft uppdraget. Detta gör vag erfarenhet trovärdig.'
      },
      {
        rubrik: 'Var kristallklar med tillgänglighet och schema',
        text: 'Arbetsgivare som anställer studenter vill veta exakt när du kan jobba. Ange specifika datum: "Tillgänglig 1 juni till 31 augusti" eller "Kan arbeta 15-20 timmar per vecka under terminstid, heltid på sommarlovet". Nämn om du kan börja direkt efter tentaperiod eller om du har resor inbokade. Om du söker extrajobb, var tydlig med vilka dagar/kvällar du kan jobba och hur flexibel du är. Detta visar professionalitet och underlättar schemaläggning. Många studenter tappar jobb för att de är vaga med tillgänglighet.'
      },
      {
        rubrik: 'Visa att du kan kombinera ansvar med studier',
        text: 'Arbetsgivare vill veta att du är pålitlig trots att studierna är prioritet. Visa detta genom exempel: "Under VT24 kombinerade jag 20 timmars extrajobb med heltidsstudier och behöll snitt 4,2 i betyg". Om du har erfarenhet av att jonglera deadlines, projektarbeten och jobb, nämn det. Detta visar tidsplanering och ansvar. Om du saknar sådan erfarenhet, lyft fram studieprestationer som kräver disciplin: "Jag klarade 45 hp förra året samtidigt som jag var aktiv i studentföreningen". Pålitlighet väger tungt för arbetsgivare som anställer studenter.'
      },
      {
        rubrik: 'Fokusera på lärvilja och motivation framför perfekt CV',
        text: 'Studenter förväntas inte ha tio års erfarenhet. Istället söker arbetsgivare någon som lär snabbt, tar instruktioner väl och har rätt attityd. Visa detta konkret: "Som student är jag van vid att snabbt sätta mig in i nya ämnen och tillämpa teori i praktiken". Ge exempel på när du lärt dig något snabbt: "På mitt förra extrajobb lärde jag mig kassasystemet på två dagar och kunde träna nya kollegor efter en vecka". Betona att du ser jobbet som lärotillfälle, inte bara inkomst: "Jag vill förstå hur retail fungerar i praktiken och ta med mig erfarenheter in i mina framtida studier inom Supply Chain Management".'
      }
    ],

    faq: [
      {
        q: 'Hur skriver jag personligt brev utan arbetslivserfarenhet?',
        a: 'Fokusera på överförbara färdigheter från studier, projekt, föreningsengagemang och volontärarbete. Översätt akademiska meriter till arbetslivsnytta: projektarbete = teamwork, presentationer = kommunikation, uppsatser = analytisk förmåga. Nämn även extrajobb, sommarjobb eller deltidsjobb oavsett hur korta de var. Om du verkligen saknar erfarenhet, lyft personliga egenskaper med konkreta bevis: "Jag lär mig snabbt, vilket visades när jag klarade 45 hp med snitt 4,5 förra året". Var ärlig men fokusera på vad du KAN, inte vad du saknar.'
      },
      {
        q: 'Ska jag nämna mitt gymnasiebetyg i det personliga brevet?',
        a: 'Nämn gymnasiebetyg endast om du söker ditt första jobb och har högt snitt (över 18,0) eller relevanta kurser. Skriv: "Jag tog studenten 2023 med 19,5 i snitt och fördjupning i matematik och ekonomi". Om du redan studerar på universitet fokusera istället på universitetsmeriter: kurser, projekt och betyg därifrån. Gymnasiebetyg blir mindre relevant ju längre du kommit i studierna. För sommarjobb och extrajobb väger praktisk erfarenhet och personlighet tyngre än betyg.'
      },
      {
        q: 'Hur visar jag att jag kan kombinera jobb och studier?',
        a: 'Ge konkreta exempel på när du gjort det tidigare: "Under VT24 jobbade jag 15 timmar per vecka på café samtidigt som jag läste 30 hp och behöll snitt 4,0". Om du saknar sådan erfarenhet, visa tidsplanering på annat sätt: "Jag klarade 45 hp förra året samtidigt som jag var kassör i studentföreningen och tränade fotboll tre gånger i veckan". Detta bevisar att du kan hantera flera bollar i luften. Betona ansvar och struktur: "Jag använder digitala verktyg för att planera tentor, inlämningar och arbetspass så att inget krockar".'
      },
      {
        q: 'Ska jag vara tydlig med att det är sommarjobb eller extrajobb jag söker?',
        a: 'Ja, var kristallklar med vad du söker och när du är tillgänglig. Skriv: "Jag söker sommarjobb för perioden 1 juni - 31 augusti" eller "Jag söker extrajobb 15-20 timmar per vecka under terminstid". Detta hjälper arbetsgivaren förstå dina förutsättningar och undviker missförstånd. Om du kan tänka dig att fortsätta efter sommaren, nämn det: "Jag är öppen för att fortsätta på deltid efter sommaren om ni har behov". Detta visar flexibilitet utan att låsa dig.'
      },
      {
        q: 'Hur långt ska brevet vara för student?',
        a: 'Sikta på 300-400 ord, ungefär 3/4 av en A4-sida. Studenter har ofta mindre erfarenhet att beskriva, så håll brevet koncist och fokuserat. Dela upp i 4-5 stycken: inledning med motivation, erfarenhet från studier och extrajobb, konkreta exempel på färdigheter, koppling till företaget, och avslutning med tillgänglighet. Undvik att fylla ut med fluff om du saknar erfarenhet. Arbetsgivare uppskattar kortfattade brev som går rakt på sak.'
      },
      {
        q: 'Vilka kurser är värda att nämna i det personliga brevet?',
        a: 'Nämn kurser som är direkt relevanta för jobbet du söker. För försäljning: marknadsföring, kommunikation, psykologi. För ekonomiroller: redovisning, ekonomistyrning, Excel-kurser. För tech-jobb: programmering, dataanalys, statistik. Skriv konkret: "Min kurs i konsumentbeteende gav mig verktyg att förstå köpbeslut och hur man påverkar kunder". Undvik att lista alla kurser, välj 1-3 som verkligen är relevanta. Om du saknar relevanta kurser, fokusera istället på projekt och praktiska färdigheter.'
      },
      {
        q: 'Hur skriver jag om studierelaterade projekt?',
        a: 'Beskriv projekt som arbetslivserfarenhet med konkreta resultat. Istället för "Jag gjorde ett projektarbete om marknadsföring" skriv: "I ett projektarbete analyserade vi 500 enkätsvar om kundlojalitet och presenterade våra resultat för 60 studenter och lärare. Jag ansvarade för dataanalys och skapade visualiseringar i Excel". Fokusera på vad DU gjorde, vilka verktyg du använde och vad ni åstadkom. Kvantifiera: antal personer i teamet, omfattning av projektet, verktyg ni använde (Excel, PowerPoint, SPSS).'
      },
      {
        q: 'Ska jag nämna studentföreningar och engagemang?',
        a: 'Ja, absolut om du haft konkreta roller eller ansvar. Studentföreningar visar ledarskap, teamwork och organisationsförmåga. Skriv: "Som kassör i studentföreningen hanterade jag en budget på 200 000 kr och anordnade events för 300+ studenter". Om du bara varit passiv medlem, skippa det. Fokusera på aktivt engagemang: eventansvar, styrelseuppdrag, projektledning. Nämn också volontärarbete, idrottsföreningar eller andra organisationer där du tagit ansvar. Detta kompenserar för bristande arbetslivserfarenhet.'
      },
      {
        q: 'Hur visar jag motivation trots att det är tillfällig anställning?',
        a: 'Var ärlig om att det är sommarjobb eller extrajobb, men visa att du tar det på allvar. Skriv: "Även om det är ett sommarjobb vill jag bidra fullt ut och lära mig så mycket som möjligt under de tre månaderna". Koppla jobbet till dina studier: "Som ekonomistudent vill jag förstå hur retail fungerar i praktiken". Betona lärvilja: "Jag ser sommarjobbet som ett tillfälle att utveckla färdigheter jag kan ta med mig in i min framtida karriär". Arbetsgivare uppskattar studenter som är professionella och engagerade även i tillfälliga roller.'
      }
    ],

    relateradeArtiklar: [
      {
        titel: 'Sommarjobb för studenter: guide till ansökan 2025',
        slug: 'sommarjobb-student-guide'
      },
      {
        titel: 'CV-tips för studenter utan arbetslivserfarenhet',
        slug: 'cv-tips-student'
      },
      {
        titel: 'Så lyckas du kombinera extrajobb och studier',
        slug: 'extrajobb-studier'
      },
      {
        titel: 'Traineeprogram för studenter: vad du behöver veta',
        slug: 'traineeprogram-student'
      }
    ],

    relateradeVerktyg: [
      {
        namn: 'CV-Mallar för Studenter',
        slug: '/verktyg/cv-mallar',
        beskrivning: 'Professionella CV-mallar för studenter och nyutexaminerade'
      },
      {
        namn: 'Jobbcoachen - Karriärråd',
        slug: '/verktyg/jobbcoachen',
        beskrivning: 'Få personliga råd om din studentkarriär och första jobbet'
      },
      {
        namn: 'Personligt Brev-verktyget',
        slug: '/verktyg/personligt-brev',
        beskrivning: 'Skapa ett skräddarsytt personligt brev för sommarjobb på 5 minuter'
      }
    ],

    relaterade: [
      { yrke: 'Säljare', slug: 'saljare' },
      { yrke: 'Kundtjänst', slug: 'kundtjanst' },
      { yrke: 'Barista', slug: 'barista' }
    ]
  },

  'larare': {
    yrke: 'Lärare',
    sokvolym: 850,
    metaTitle: 'Personligt Brev Exempel Lärare - Mallar för Grundskola & Gymnasium',
    metaDescription: 'Se ett professionellt personligt brev-exempel för lärare. ATS-optimerat med konkreta undervisningsexempel, pedagogiska metoder och resultatförbättringar. Perfekt för grundskola, gymnasium och förskola.',

    seoIntro: 'Söker du tjänst som lärare och behöver ett personligt brev som visar din pedagogiska kompetens? Det här exemplet demonstrerar hur du beskriver undervisningserfarenhet med konkreta resultat, elevcentrerat lärande och formativ bedömning på ett sätt som både ATS-system och rektorer uppskattar. Du får se exakt hur du kvantifierar undervisningsmeriter (antal elever, ämnen, årskurser) och hur du visar klassrumsledning genom verkliga exempel. Brevet är anpassat efter svensk skolkontext med fokus på läroplan, differentierad undervisning och kollegialt lärande. Passar lika bra för grundskollärare, gymnasielärare eller förskollärare. Använd det som grund för din jobbansökan lärare och komplettera med våra tips om hur du optimerar ditt CV lärare för att maximera chansen till intervju.',

    intro: 'Ett professionellt personligt brev för lärare som visar pedagogisk kompetens, klassrumsledning och förmåga att skapa engagerande lärmiljöer. Detta exempel är optimerat för svenska skolor och ATS-system.',

    exempelBrev: {
      namn: 'Anna Bergström',
      adress: 'Skolvägen 15, 582 73 Linköping',
      telefon: '070-234 56 78',
      epost: 'anna.bergstrom@email.se',
      arbetsgivare: 'Linköpings Montessoriskola',
      roll: 'Grundskollärare F-3 med inriktning svenska och NO',
      datum: new Date().toLocaleDateString('sv-SE'),
      brevText: `Hej,

Jag söker tjänsten som grundskollärare F-3 med inriktning svenska och NO på Linköpings Montessoriskola. Med fyra års undervisningserfarenhet i årskurs 1-3 och en ämneskombination som matchar er tjänst perfekt, är jag övertygad om att min pedagogiska profil passar väl in i ert Montessori-inspirerade arbetssätt. Er syn på elevcentrerat lärande och att varje barn lär i sin egen takt stämmer helt överens med hur jag undervisar.

Under mina år på Vidängskolan har jag undervisat 65 elever fördelade över tre klasser i svenska, matematik och NO. Jag arbetar med formativ bedömning där eleverna är delaktiga i sin egen lärandeprocess genom tydliga mål och kontinuerlig återkoppling. Ett konkret exempel är när jag utvecklade en läsförståelsemetod med nivåanpassade texter och reflektionsfrågor som ledde till att 85% av mina elever nådde eller överträffade kunskapsmålen i svenska, en förbättring från 68% året innan. Jag har lärarlegitimation för F-3 med behörighet i svenska och NO samt genomgått fortbildning i Bornholmsmodellen för läs- och skrivinlärning.

Det jag värdesätter mest i läraryrket är relationerna med eleverna. Att se när ett barn plötsligt förstår ett svårt begrepp eller övervinner läsrädsla är det som driver mig. Jag arbetar aktivt med klassrumsledning genom tydliga rutiner, positiv förstärkning och inkluderande metoder där alla elever känner sig sedda. När situationen kräver det anpassar jag undervisningen snabbt efter elevernas behov genom differentierad undervisning, extra stöd eller utmaningar för elever som behöver det. Jag har erfarenhet av att samarbeta med specialpedagoger och föräldrar kring IUP och åtgärdsprogram för elever i behov av särskilt stöd.

Vad som verkligen tilltalar mig med Linköpings Montessoriskola är ert fokus på praktiskt lärande och att eleverna ska vara aktiva i sin kunskapsutveckling. Jag har under det senaste året arbetat med Ipads i undervisningen för läsförståelse och NO-experiment, och jag ser fram emot att fortsätta utvecklas i en miljö där ni kombinerar Montessoripedagogik med moderna digitala verktyg. Er satsning på kollegialt lärande och kontinuerlig kompetensutveckling ligger helt i linje med min syn på läraryrket som ett livslångt lärande.

Jag ser fram emot att diskutera hur jag kan bidra till er verksamhet och elevernas lärande. Tveka inte att kontakta mig på 070-234 56 78 eller anna.bergstrom@email.se.

Varma hälsningar,
Anna Bergström`
    },

    varforDetFungerar: [
      {
        titel: 'ATS-nyckelord för pedagogisk kompetens',
        beskrivning: 'Brevet innehåller kritiska sökord som ATS-system och rektorer letar efter: läroplan, formativ bedömning, elevcentrerat lärande, IUP, differentierad undervisning, klassrumsledning, digitala verktyg, kollegialt lärande, lärarlegitimation och behörighet. Detta ökar chansen att brevet rankas högt i rekryteringssystem.'
      },
      {
        titel: 'Konkreta resultat med siffror',
        beskrivning: 'Istället för "jag är en bra lärare" visas kvantifierbara resultat: "85% av eleverna nådde kunskapsmålen, en förbättring från 68%". Brevet nämner antal elever (65), antal klasser (3) och specifika metoder (Bornholmsmodellen). Detta gör kompetensen mätbar och trovärdig.'
      },
      {
        titel: 'Pedagogiskt arbetssätt med konkreta exempel',
        beskrivning: 'Brevet beskriver inte bara vad kandidaten gjort utan hur: formativ bedömning med elevdelaktighet, nivåanpassade texter, reflektionsfrågor och differentierad undervisning. Detta visar djup pedagogisk förståelse snarare än teoretiska kunskaper.'
      },
      {
        titel: 'Relationskompetens med verkliga situationer',
        beskrivning: 'Mjuka färdigheter backas upp med exempel: samarbete med specialpedagoger, föräldrakontakter kring IUP, klassrumsledning genom tydliga rutiner. Detta är starkare än att bara skriva "jag är bra på relationer" och visar förståelse för lärarens komplexa yrkesroll.'
      },
      {
        titel: 'Anpassning efter skolans profil',
        beskrivning: 'Brevet refererar specifikt till Montessoripedagogik, elevcentrerat lärande och praktiskt lärande vilket visar att kandidaten researcht om skolan. Detta gör brevet personligt och ökar chansen att rektorn läser hela texten istället för att avfärda det som en generisk mall.'
      }
    ],

    tips: [
      {
        rubrik: 'Använd pedagogiska nyckelord för att passera ATS',
        text: 'ATS-system och rektorer söker specifika termer inom skolvärlden. Inkludera begrepp som läroplan, formativ bedömning, elevcentrerat lärande, IUP (individuell utvecklingsplan), differentierad undervisning, klassrumsledning, digitala verktyg och kollegialt lärande. Om jobbannonsen nämner specifika pedagogiska inriktningar som Montessori, Reggio Emilia eller waldorf, visa att du förstår och kan arbeta enligt dessa principer. Nämn också ämnesbehörighet och lärarlegitimation tydligt. För gymnasielärare: inkludera gymnasiearbete, betygssättning och studievägledning. Dessa nyckelord signalerar både till ATS-systemet och till rektorn att du behärskar läraryrkets kärnkompetenser.'
      },
      {
        rubrik: 'Kvantifiera undervisningserfarenhet med konkreta siffror',
        text: 'Gör din erfarenhet mätbar genom specifika siffror. Istället för "jag har undervisat många elever" skriv "jag har undervisat 65 elever fördelade över tre klasser i årskurs 1-3". Nämn antal års erfarenhet, ämnen du undervisat, årskurser och antal elever per klass. Om du har resultatförbättringar, kvantifiera dem: "Elevernas läsförståelse ökade från 68% till 85% på nationella prov". För nyutexaminerade: ange antal VFU-perioder, antal veckor per period och vilka årskurser du arbetat med. Konkreta siffror hjälper rektorn snabbt bedöma din erfarenhetsnivå och gör ditt brev mer trovärdigt än vaga påståenden.'
      },
      {
        rubrik: 'Visa pedagogisk kompetens genom konkreta undervisningsmetoder',
        text: 'Rektorer vill se att du kan omsätta pedagogisk teori i praktisk handling. Beskriv specifika metoder du använt: formativ bedömning med kamratrespons, laborativt lärande i matematik med konkret material, stations-undervisning för differentiering eller flipped classroom med digitala verktyg. Ge konkreta exempel: "Jag utvecklade en läsförståelsemetod med nivåanpassade texter som ledde till att fler elever nådde kunskapsmålen". Nämn pedagogiska verktyg du behärskar (Ipads i undervisningen, Kahoot för formativ bedömning, Google Classroom för distansundervisning). Detta visar att du inte bara vet teoretiskt utan kan genomföra effektiv undervisning i praktiken.'
      },
      {
        rubrik: 'Anpassa efter skolform och årskurser',
        text: 'Olika skolformer kräver olika fokus. För förskoleklass/F-3: betona social utveckling, grundläggande läs- och skrivutveckling, lek som lärande och trygghet. För mellanstadiet (4-6): fokusera på fördjupat lärande, självständighet och studieteknik. För högstadiet (7-9): lyft fram betygssättning, studievägledning och förberedelse för gymnasiet. För gymnasiet: betona ämnesdjup, gymnasiearbete, källkritik och akademiskt skrivande. Läs jobbannonsen noga och anpassa ditt brev efter skolformen. Om du byter från grundskola till gymnasium eller vice versa, förklara varför och vad du tar med dig: "Efter fem år i grundskolan söker jag nu gymnasium för att fördjupa min undervisning i svenska och arbeta med mer akademiskt skrivande".'
      },
      {
        rubrik: 'Visa klassrumsledning och elevhantering med exempel',
        text: 'Klassrumsledning är en av de viktigaste kompetenserna för lärare. Visa detta genom konkreta exempel istället för att skriva "jag är bra på klassrumsledning". Beskriv hur du skapar trygghet och struktur: "Jag arbetar med tydliga rutiner, visualiserade regler och positiv förstärkning för att skapa ett tryggt klassrum". Ge exempel på hur du hanterat utmanande situationer: "När en elev hade svårt att fokusera utvecklade jag individuella pauser och anpassade arbetsuppgifter i samarbete med specialpedagog". Nämn erfarenhet av att arbeta med elever i behov av särskilt stöd, IUP, åtgärdsprogram och samarbete med föräldrar. Detta visar att du kan hantera mångfalden i klassrummet och inte bara teoretiskt utan praktiskt.'
      }
    ],

    faq: [
      {
        q: 'Hur lång erfarenhet behöver jag nämna som lärare?',
        a: 'Nämn alltid antal års undervisningserfarenhet om du har det (t.ex. "4 års erfarenhet av undervisning i årskurs 1-3"). Om du är nyutexaminerad, fokusera på VFU-perioder: "Jag har genomfört VFU inom F-3 på Vidängskolan (10 veckor) och årskurs 4-6 på Ullvigymnasiet (8 veckor)". Betona vad du lärt dig, vilka ämnen du undervisat och hur många elever du arbetat med. Skolor förstår att nyexaminerade behöver introduktion, så var ärlig men positiv. Nämn också relevant arbetslivserfarenhet som läxhjälp, fritids eller barnomsorg som visar att du kan arbeta med barn.'
      },
      {
        q: 'Ska jag nämna min lärarlegitimation i brevet?',
        a: 'Ja, absolut. Lärarlegitimation är ofta ett formellt krav och ska nämnas tydligt. Skriv: "Jag har lärarlegitimation för F-3 med behörighet i svenska och NO" eller "Jag har behörighet att undervisa i engelska och historia för gymnasiet". Om du saknar legitimation men är utbildad lärare, förklara var du står: "Jag har lärarexamen från Linköpings universitet och har ansökt om lärarlegitimation". Om du saknar legitimation för vissa ämnen, var ärlig: "Jag har legitimation för F-6 och läser just nu 30 hp kompletterings-NO för full behörighet". För förskollärare gäller förskollärarexamen. Var tydlig för att undvika missförstånd.'
      },
      {
        q: 'Hur visar jag klassrumsledning och elevhantering?',
        a: 'Undvik att skriva "jag är bra på klassrumsledning" eftersom det låter vagt. Beskriv istället konkreta metoder: "Jag skapar trygghet genom tydliga rutiner, visualiserade regler och konsekvent uppföljning. Jag använder positiv förstärkning och proaktiva strategier för att förebygga konflikter". Ge konkreta exempel: "När en elev hade koncentrationssvårigheter utvecklade jag individuella pauser och tydlig struktur med visuella scheman, vilket förbättrade elevens fokus märkbart". Nämn samarbete med specialpedagoger, kuratorer och föräldrar kring IUP och åtgärdsprogram. Om du har utbildning i LP-modellen, Lär för livet eller liknande, nämn det.'
      },
      {
        q: 'Ska jag nämna ämnesbehörighet i det personliga brevet?',
        a: 'Ja, särskilt om det matchar jobbannonsen. Skriv tydligt: "Jag har behörighet i svenska, SO och idrott för F-6" eller "Jag undervisar i engelska och tyska för gymnasiet". Om du har kompletterande utbildningar (t.ex. 30 hp matematik), nämn det. För förskollärare räcker förskollärarexamen. Om du saknar behörighet i ett efterfrågat ämne men är villig att komplettera, skriv: "Jag har behörighet i svenska och SO och är motiverad att läsa komplettering i matematik om tjänsten kräver det". Var ärlig och undvik att ge intryck av behörighet du inte har.'
      },
      {
        q: 'Hur hanterar jag ansökan om jag är nyutexaminerad lärare?',
        a: 'Fokusera på VFU-perioder, examensarbete och relevanta kurser. Skriv: "Under min VFU i årskurs 2 på Vidängskolan undervisade jag 22 elever i svenska och matematik under 10 veckor. Jag planerade och genomförde lektioner, deltog i klassråd och samarbetade med mentor om elevernas utveckling". Nämn examensarbete om det är relevant: "Mitt examensarbete handlade om formativ bedömning i läsförståelse, vilket gav mig djup förståelse för hur elever lär sig läsa". Betona lärvilja: "Som nyutexaminerad är jag van vid att lära snabbt och tar gärna emot feedback för att utvecklas som lärare". Lyft också praktisk erfarenhet från läxhjälp, fritids eller vikariat.'
      },
      {
        q: 'Vilka certifieringar och fortbildningar är värda att nämna?',
        a: 'Nämn fortbildningar som är direkt relevanta för undervisning: Bornholmsmodellen (läs- och skrivinlärning), Språket lyfter (språkutveckling), ASL (autism spectrum disorder), DAMP/ADHD-utbildningar, Lär för livet, LP-modellen, första hjälpen/HLR, brandskydd och likabehandlingsplan. Digitala verktyg som Google Classroom, Ipads i undervisningen, Kahoot eller digitala läromedel är också värdefulla. Skriv konkret: "Jag har genomgått fortbildning i Bornholmsmodellen och använder metoden aktivt i min läs- och skrivundervisning". Om du har specialistkompetens inom dyslexi, matematik-svårigheter eller flerspråkighet, lyft fram det tydligt.'
      },
      {
        q: 'Hur skriver jag om byte mellan skolformer (grundskola till gymnasium)?',
        a: 'Beskriv bytet som kompetensutveckling och tydliggör motivationen: "Efter fem år i grundskolan söker jag nu en tjänst som gymnasielärare i svenska för att fördjupa min ämnesundervisning och arbeta mer med akademiskt skrivande och källkritik". Förklara vad du tar med dig: "Min erfarenhet från grundskolan ger mig förståelse för elevers förutsättningar och hur man bygger grundläggande kunskaper, vilket är värdefullt när jag möter gymnasieelever". Betona överförbara färdigheter: formativ bedömning, differentierad undervisning, klassrumsledning. Om du undervisat både mellanstadiet och högstadiet är steget till gymnasiet mindre. Visa att du förstår skillnaderna mellan skolformerna.'
      },
      {
        q: 'Ska jag nämna resultatförbättringar och elevprestationer?',
        a: 'Ja, definitivt om du har konkreta exempel. Detta är mycket värdefullt för rektorer. Skriv: "Elevernas resultat på nationella prov i matematik förbättrades från 72% godkända till 88% under mitt andra år som lärare". Eller: "Genom systematiskt arbete med läsförståelse ökade andelen elever som nådde kunskapsmålen från 65% till 82%". Var specifik men undvik att ta all äran själv om det var ett lagarbete: "Tillsammans med min kollega utvecklade vi en metod för formativ bedömning som ledde till förbättrade resultat". Om du saknar hårda siffror, beskriv kvalitativa förbättringar: "Flera föräldrar har uttryckt att deras barn blivit mer motiverade och självständiga i sitt lärande".'
      },
      {
        q: 'Hur långt bör brevet vara för lärare?',
        a: 'Sikta på 350-400 ord fördelat på 4-5 stycken, vilket motsvarar cirka en A4-sida. Rektorer har begränsad tid för att läsa ansökningar, så håll brevet fokuserat och konkret. Varje stycke ska ha ett tydligt syfte: inledning med motivation och varför du passar, erfarenhet med konkreta exempel, pedagogisk kompetens och arbetssätt, koppling till skolans profil, och avslutning med uppmaning till kontakt. Om brevet blir längre än en A4-sida, korta ner genom att ta bort allmänna fraser och fokusera på det mest relevanta för just denna tjänst.'
      }
    ],

    relateradeArtiklar: [
      {
        titel: 'Hur du skriver ett ATS-optimerat CV som lärare',
        slug: 'ats-optimerat-cv-larare'
      },
      {
        titel: 'De vanligaste intervjufrågorna för lärare med svar',
        slug: 'intervjufragor-larare'
      },
      {
        titel: 'Karriärvägar inom skolan: från lärare till rektor',
        slug: 'karriarvagar-larare'
      },
      {
        titel: 'Lärarlegitimation och behörighet: komplett guide 2025',
        slug: 'lararlegitimation-behorighet-guide'
      }
    ],

    relateradeVerktyg: [
      {
        namn: 'CV-Mallar för Lärare',
        slug: '/verktyg/cv-mallar',
        beskrivning: 'Professionella CV-mallar anpassade för lärare med rätt struktur för ATS-system'
      },
      {
        namn: 'Jobbcoachen - Karriärråd',
        slug: '/verktyg/jobbcoachen',
        beskrivning: 'Få personliga råd om din lärarkarriär från vår AI-coach'
      },
      {
        namn: 'Personligt Brev-verktyget',
        slug: '/verktyg/personligt-brev',
        beskrivning: 'Skapa ett skräddarsytt personligt brev för lärare på 5 minuter'
      }
    ],

    relaterade: [
      { yrke: 'Förskollärare', slug: 'forskollarare' },
      { yrke: 'Specialpedagog', slug: 'specialpedagog' },
      { yrke: 'Fritidspedagog', slug: 'fritidspedagog' }
    ]
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ yrke: string }>
}): Promise<Metadata> {
  const { yrke } = await params
  const data = exampleData[yrke]

  if (!data) {
    return {
      title: 'Exempel inte funnet - Jobbcoach.ai',
    }
  }

  const canonicalUrl = `https://jobbcoach.ai/personligt-brev-exempel/${yrke}`

  return {
    title: data.metaTitle,
    description: data.metaDescription,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph metadata
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: data.metaTitle,
      description: data.metaDescription,
      siteName: 'Jobbcoach.ai',
      locale: 'sv_SE',
      images: [
        {
          url: 'https://jobbcoach.ai/og-image.png',
          width: 1200,
          height: 630,
          alt: `Personligt brev exempel för ${data.yrke}`,
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: ['https://jobbcoach.ai/og-image.png'],
    },

    // Additional metadata
    keywords: `personligt brev, ${data.yrke.toLowerCase()}, jobbansökan, CV, ATS-optimering, ${data.yrke.toLowerCase()} jobb, svenska vårdmiljöer`,

    // Author and publisher
    authors: [{ name: 'Jobbcoach.ai' }],
    creator: 'Jobbcoach.ai',
    publisher: 'Jobbcoach.ai',
  }
}

export default async function Page({ params }: { params: Promise<{ yrke: string }> }) {
  const { yrke } = await params
  const data = exampleData[yrke]

  if (!data) {
    notFound()
  }

  // SEO: Schema markup för att garantera att brevinnehållet indexeras

  // 1. Article Schema - för brevinnehållet
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Personligt brev exempel för ${data.yrke}`,
    "description": data.intro,
    "articleBody": data.exempelBrev.brevText,
    "author": {
      "@type": "Organization",
      "name": "Jobbcoach.ai",
      "url": "https://jobbcoach.ai"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jobbcoach.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jobbcoach.ai/logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "about": {
      "@type": "JobPosting",
      "title": data.yrke
    },
    "keywords": `personligt brev, ${data.yrke.toLowerCase()}, jobbansökan, CV, ATS-optimering`
  }

  // 2. FAQPage Schema - för featured snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map((item: any) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  }

  // 3. HowTo Schema - för tips-sektionen
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `Hur du skriver ett personligt brev som ${data.yrke}`,
    "description": `Steg-för-steg guide för att skriva ett ATS-optimerat personligt brev för ${data.yrke}`,
    "step": data.tips.map((tip: any, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": tip.rubrik,
      "text": tip.text
    }))
  }

  // 4. BreadcrumbList Schema - för navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hem",
        "item": "https://jobbcoach.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Personligt Brev Exempel",
        "item": "https://jobbcoach.ai/personligt-brev-exempel"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": data.yrke,
        "item": `https://jobbcoach.ai/personligt-brev-exempel/${yrke}`
      }
    ]
  }

  return (
    <>
      {/* Schema markup för SEO - 4 typer för maximal synlighet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PersonligtBrevExempelPage data={data} />
    </>
  )
}
