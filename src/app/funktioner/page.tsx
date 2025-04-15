/**
 * Fil: src/app/funktioner/page.tsx
 *
 * Beskrivning:
 * Detta är sidan som presenterar funktionerna i Jobbcoach.ai.
 * Den inkluderar en hero-sektion, en översikt över uppnådda resultat,
 * en detaljerad genomgång av kärnfunktionerna (med video-demos), en sektion som förklarar
 * varför Jobbcoach.ai:s specialiserade AI är överlägsen, samt en FAQ-sektion.
 * Sidan använder 'use client' för state och effekter.
 */
'use client'

// --- Core Imports ---
import { useState, useEffect, FC } from 'react'
import Link from 'next/link'
import Head from 'next/head'

// --- Icon Imports (Lucide React) ---
import {
  UserPlus, // Behövs inte här, men skadar inte
  X, // För modal stängning
  PlayCircle, // För "Se video"-knapp
  GraduationCap, // <<< LADE TILL FÖR NYTT KORT
  ChevronRight, CheckCircle, FileText, Upload, Lightbulb, Save, Zap, Clock,
  Target, BrainCircuit, UserCheck, BarChartHorizontal, FileSearch, Sparkles,
  ArrowRight, ChevronDown, ChevronUp, Lock,
} from 'lucide-react'

// --- Data Definitions ---

// FAQ Items Interface och Data (Behålls som tidigare)
interface FaqItem { question: string; answer: string; }
const faqItems: FaqItem[] = [
    { question: "Hur skiljer sig gratis CV-analys från Premium?", answer: "Gratisversionen ger dig en grundläggande översikt och identifierar uppenbara förbättringspunkter (1 analys/vecka). Premium ger en djupgående analys med specifika förslag på nyckelord, kvantifiering av prestationer, strukturförbättringar och obegränsade analyser." },
    { question: "Är min uppladdade data säker?", answer: "Ja, säkerheten för din data är vår högsta prioritet. All dataöverföring är krypterad (SSL). Vi lagrar dina CV-texter och genererade brev säkert och delar dem aldrig med tredje part utan ditt uttryckliga medgivande. Du kan när som helst radera dina uppgifter från ditt konto." },
    { question: "Hur 'smart' är AI:n? Vad baseras den på?", answer: "Vår AI använder avancerade modeller (som GPT-4o) men är finjusterad med expert-designade instruktioner (prompts) specifikt framtagna för att skapa högkvalitativa, relevanta och anpassade jobbansökningar. Den är tränad att förstå sammanhanget i både ditt CV och jobbannonsen för att skapa bästa möjliga matchning." },
    { question: "Kan jag lita på att texten blir unik och inte plagiat?", answer: "Absolut. AI:n genererar text baserat på din unika input (CV och jobbannons). Varje genererat brev är unikt för den specifika kombinationen. Vi uppmuntrar dig dock alltid att granska och personifiera texten ytterligare för att säkerställa att den helt representerar dig." },
    { question: "Hur fungerar betalning och kan jag avsluta när som helst?", answer: "Premium kostar 149 kr per månad och betalas via säker kortbetalning (via Stripe). Det finns ingen bindningstid. Du kan enkelt avsluta din prenumeration när som helst direkt från dina kontoinställningar, och du behåller tillgången till Premium månaden ut." },
    { question: "Vilka filformat stöds för CV-uppladdning?", answer: "Vi stöder för närvarande uppladdning av CV i PDF (.pdf) och Microsoft Word (.docx) format. Du kan också klistra in texten direkt från ditt CV." }
];

// --- Definition och data för videodemos ---
// Återanvänder samma struktur och data som på startsidan
interface VideoDemoData {
    [key: string]: { // Använder funktionens titel (eller en identifierare) som nyckel
        title: string;
        videoSrc: string;
        // posterSrc behövs inte här eftersom vi inte visar miniatyr
    };
}

const videoDemoData: VideoDemoData = {
    "AI-generering av personliga brev": {
        title: "Skapa Personliga Brev med AI",
        videoSrc: "/videos/Personligt%20brev%20-%20Jobbcoach.ai.mp4",
    },
    "Djupgående CV-analys": {
        title: "Djupgående CV-Analys",
        videoSrc: "/videos/Analysera%20CV%20-%20Jobbcoach.ai.mp4",
    },
    "Kompetensutveckling & Karriärvägledning": { // Nyckeln för det nya kortet
        title: "Identifiera Kompetensgap",
        videoSrc: "/videos/Kompetensanalys%20-%20Jobbcoach.ai.mp4",
    },
};


// --- Sub-Components ---

// FaqAccordion Component (Behålls som tidigare)
const FaqAccordion: FC<{ items: FaqItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const handleClick = (index: number) => { setOpenIndex(openIndex === index ? null : index); };
    return ( <div className="space-y-4"> {items.map((item, index) => ( <div key={index} className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden"> <button onClick={() => handleClick(index)} className="flex justify-between items-center w-full px-6 py-4 text-left text-white hover:bg-navy-700/50 focus:outline-none focus-visible:ring focus-visible:ring-pink-500 focus-visible:ring-opacity-75 transition-colors duration-200" aria-expanded={openIndex === index} aria-controls={`faq-answer-${index}`}> <span className="font-medium text-base">{item.question}</span> {openIndex === index ? <ChevronUp className="w-5 h-5 text-pink-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />} </button> {openIndex === index && ( <div id={`faq-answer-${index}`} className="px-6 pb-4 pt-2 border-t border-navy-700" role="region"> <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p> </div> )} </div> ))} </div> );
};

// --- Main Page Component: FunktionerPage ---

export default function FunktionerPage() {
    // State och useEffect för session och laddning (Behålls)
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // --- State för modalen ---
    const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string>('');

    useEffect(() => {
        async function getSession() {
             try {
                 setIsLoading(true);
                 const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
                 const supabase = getSupabaseClient();
                 const { data, error } = await supabase.auth.getSession();
                 if (error) { console.error('Fel vid hämtning av session:', error.message); setSession(null); } else { setSession(data.session); }
             } catch (error) { console.error('Oväntat fel i getSession:', error); setSession(null); } finally { setIsLoading(false); }
        }
        getSession();
    }, []);

    // --- Hantera Escape-tangent och Body Scroll för modal ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        if (modalVideoSrc) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [modalVideoSrc]); // Körs när modalVideoSrc ändras


    // Laddningsindikator (Behålls)
    if (isLoading) { return ( <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950"> <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Laddar innehåll"> <span className="sr-only">Laddar...</span> </div> <p className="mt-4 text-white">Laddar funktioner...</p> </div> ); }

    // --- Funktioner för att hantera modalen ---
    const openModal = (src: string, title: string) => {
        setModalVideoSrc(src);
        setModalTitle(title);
    };

    const closeModal = () => {
        setModalVideoSrc(null);
        setModalTitle('');
    };

    return (
        <>
            {/* Sidhuvud med SEO */}
            <Head>
                <title>Funktioner | AI för personligt brev, CV-analys & kompetensutveckling | jobbcoach.ai</title> {/* Uppdaterad title */}
                <meta name="description" content="Upptäck jobbcoach.ai:s AI-funktioner: skapa personliga brev, få detaljerad CV-analys, identifiera kompetensgap och mer. Vetenskapligt baserade verktyg för din karriär."/> {/* Uppdaterad desc */}
                <meta name="keywords" content="personligt brev, AI, funktioner, jobbcoach.ai, skriva personligt brev, jobbansökan, CV-analys, jobbannonsanalys, kompetensutveckling, kompetensanalys, karriärvägledning, tonalitet, AI-assistent, ansökningsbrev, mallar, Harvard, Stanford, vetenskapligt baserad, analysera CV"/> {/* Uppdaterad keywords */}
                <meta property="og:title" content="Funktioner | AI för personligt brev, CV-analys & kompetensutveckling | jobbcoach.ai" /> {/* Uppdaterad og:title */}
                <meta property="og:description" content="Utforska kraftfulla AI-verktyg: generera skräddarsydda personliga brev, få djupgående CV-analys, identifiera kompetensgap och mycket mer. Öka dina jobbchanser med jobbcoach.ai." /> {/* Uppdaterad og:desc */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://jobbcoach.ai/funktioner" />
                <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-funktioner.png" />
                <link rel="canonical" href="https://jobbcoach.ai/funktioner" />
            </Head>

            {/* Huvudbehållare */}
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">

                {/* === Hero Section === (Behålls) */}
                <section className="relative pt-24 pb-16 text-center lg:pt-32 lg:pb-24 overflow-hidden">
                    {/* ... (innehåll som innan) ... */}
                     <div className="absolute inset-0 opacity-30" aria-hidden="true"> <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl"></div> <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div> </div>
                    <div className="container relative px-4 mx-auto z-10">
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                            AI-drivna <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">funktioner</span> för din framgång
                        </h1>
                        <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-300">
                            Upptäck hur Jobbcoach.ai använder specialiserad AI och beprövade metoder för att skapa ansökningar som ger resultat. Från skräddarsydda personliga brev till djupgående CV-analys och karriärvägledning. {/* Lade till karriärvägledning */}
                        </p>
                        <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
                             {session ? ( <Link href="/create-letter" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 group"> Börja skapa nu <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /> </Link> ) : ( <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 group animate-pulse-pink"> Testa gratis <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /> </Link> )}
                             <Link href="#huvudfunktioner" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-300 transition-colors bg-navy-800/50 border border-gray-700 rounded-lg hover:bg-navy-700/70 hover:text-white"> Utforska funktioner </Link>
                        </div>
                    </div>
                </section>

                {/* === Results in Focus Section === (Behålls) */}
                <section id="results" aria-labelledby="results-heading" className="py-16 lg:py-20 bg-gradient-to-b from-navy-800 to-navy-900">
                    {/* ... (innehåll som innan) ... */}
                     <div className="container px-4 mx-auto">
                         <div className="max-w-3xl mx-auto mb-12 text-center">
                             <h2 id="results-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"> Resultat som gör <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">skillnad</span> </h2>
                             <p className="text-xl text-gray-300"> Vår specialiserade AI och metodik levererar mätbara förbättringar i din jobbsökning. </p>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                             <div className="p-6 bg-navy-900/50 border border-pink-700/50 rounded-xl text-center shadow-lg backdrop-blur-sm"> <Zap className="w-12 h-12 mx-auto mb-4 text-pink-400" aria-hidden="true"/> <p className="text-4xl font-bold text-white mb-2">2.6x</p> <p className="text-gray-300">Högre intervjufrekvens jämfört med standardansökningar.</p> </div>
                             <div className="p-6 bg-navy-900/50 border border-purple-700/50 rounded-xl text-center shadow-lg backdrop-blur-sm"> <Target className="w-12 h-12 mx-auto mb-4 text-purple-400" aria-hidden="true"/> <p className="text-4xl font-bold text-white mb-2">92%</p> <p className="text-gray-300">Av premium-användare får svar på sin ansökan inom 30 dagar.</p> </div>
                             <div className="p-6 bg-navy-900/50 border border-blue-700/50 rounded-xl text-center shadow-lg backdrop-blur-sm"> <Clock className="w-12 h-12 mx-auto mb-4 text-blue-400" aria-hidden="true"/> <p className="text-4xl font-bold text-white mb-2">Minuter</p> <p className="text-gray-300">Istället för timmar. Skapa professionella utkast på rekordtid.</p> </div>
                         </div>
                         <p className="mt-8 text-sm text-center text-gray-400"> Baserat på aggregerad anonymiserad användardata och jämförelser. </p>
                     </div>
                 </section>

                {/* === UPPDATERAD Kärnfunktioner === */}
                <section id="huvudfunktioner" aria-labelledby="core-features-heading" className="py-16 bg-navy-950 lg:py-24">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                             <h2 id="core-features-heading" className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"> Kärnfunktionerna i Jobbcoach.ai </h2>
                             <p className="text-xl text-gray-300"> Utforska verktygen som är designade för att ge dig ett övertag i varje steg av ansökningsprocessen. </p>
                        </div>
                        {/* Uppdaterat grid för att inkludera 7 kort */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                             {/* Kort: CV-import (Ingen video)*/}
                             <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-gray-600 flex flex-col">
                                 <div className="flex items-center mb-4">
                                     <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-pink-600 to-pink-500 text-white flex-shrink-0">
                                         <Upload className="w-6 h-6" aria-hidden="true" />
                                     </div>
                                     <h3 className="text-xl font-semibold text-white">CV-import & grundanalys</h3>
                                 </div>
                                 <div className="flex-grow"> {/* För att knappen ska hamna längst ner om korten blir olika höga */}
                                     <p className="text-gray-300 mb-3 text-sm"> Importera ditt CV (<span className='font-medium'>PDF, DOCX, TXT</span>). AI:n extraherar nyckelinformation som används för att skapa personliga brev och för CV-analys. </p>
                                     <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                                         <li>Automatisk extrahering av erfarenhet & utbildning.</li>
                                         <li>Grundläggande formatkontroll.</li>
                                     </ul>
                                 </div>
                            </div>

                            {/* Kort: Jobbannonsanalys (Ingen video) */}
                             <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-gray-600 flex flex-col">
                                 <div className="flex items-center mb-4">
                                     <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white flex-shrink-0">
                                         <FileText className="w-6 h-6" aria-hidden="true" />
                                     </div>
                                     <h3 className="text-xl font-semibold text-white">Jobbannonsanalys</h3>
                                 </div>
                                 <div className="flex-grow">
                                     <p className="text-gray-300 mb-3 text-sm"> Klistra in jobbannonsen. AI:n identifierar automatiskt nyckelkrav, önskvärda meriter och ledtrådar om företagskulturen. </p>
                                     <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                                         <li>Identifiering av hårda och mjuka krav.</li>
                                         <li>Extrahering av företagsvärderingar (om möjligt).</li>
                                     </ul>
                                 </div>
                             </div>

                             {/* Kort: AI-generering (Med video) */}
                             <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-gray-600 flex flex-col">
                                 <div className="flex items-center mb-4">
                                     <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 text-white flex-shrink-0">
                                         <BrainCircuit className="w-6 h-6" aria-hidden="true" />
                                     </div>
                                     <h3 className="text-xl font-semibold text-white">AI-generering av personliga brev</h3>
                                 </div>
                                 <div className="flex-grow">
                                     <p className="text-gray-300 mb-3 text-sm"> Baserat på analysen av ditt CV och annonsen skapar vår specialiserade AI ett unikt, skräddarsytt och övertygande utkast på sekunder. </p>
                                     <ul className="text-xs text-gray-400 list-disc list-inside space-y-1 mb-4"> {/* Lade till mb-4 */}
                                         <li>Fokuserar på att koppla erfarenhet till krav.</li>
                                         <li>Optimerad för relevans och professionellt språk.</li>
                                         <li>Undviker generiska klyschor.</li>
                                     </ul>
                                 </div>
                                 {/* Knapp för att öppna video modal */}
                                 <button
                                     onClick={() => openModal(videoDemoData["AI-generering av personliga brev"].videoSrc, videoDemoData["AI-generering av personliga brev"].title)}
                                     className="inline-flex items-center justify-center mt-auto px-4 py-2 text-sm font-medium text-pink-300 transition-colors bg-navy-700/50 border border-pink-800/60 rounded-md hover:bg-navy-600/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 group"
                                     aria-label="Se video om AI-generering av personliga brev"
                                 >
                                     <PlayCircle className="w-4 h-4 mr-2 text-pink-400" />
                                     Se video
                                 </button>
                             </div>

                             {/* Kort: CV-Analys (Med video & Premium) */}
                             <div className="p-6 bg-navy-800 border border-purple-500/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-purple-600 flex flex-col">
                                 <div className="flex items-center mb-4">
                                     <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white flex-shrink-0">
                                         <FileSearch className="w-6 h-6" aria-hidden="true" />
                                     </div>
                                     <div>
                                         <h3 className="text-xl font-semibold text-white">Djupgående CV-analys</h3>
                                         <span className="text-xs font-medium text-purple-400 bg-purple-900/50 px-2 py-0.5 rounded-full">Premium</span>
                                     </div>
                                 </div>
                                 <div className="flex-grow">
                                     <p className="text-gray-300 mb-3 text-sm"> Få detaljerad och konkret feedback på ditt CV för att maximera dess potential. Optimera ditt viktigaste marknadsföringsdokument. </p>
                                     <ul className="text-xs text-gray-400 list-disc list-inside space-y-1 mb-4"> {/* Lade till mb-4 */}
                                         <li>Identifiering av styrkor och svagheter.</li>
                                         <li>Analys av nyckelord och "action verbs".</li>
                                         <li>Förslag på kvantifiering av prestationer.</li>
                                         <li>Feedback på struktur, tydlighet och längd.</li>
                                     </ul>
                                 </div>
                                  {/* Knapp för att öppna video modal */}
                                  <button
                                     onClick={() => openModal(videoDemoData["Djupgående CV-analys"].videoSrc, videoDemoData["Djupgående CV-analys"].title)}
                                     className="inline-flex items-center justify-center mt-auto px-4 py-2 text-sm font-medium text-pink-300 transition-colors bg-navy-700/50 border border-pink-800/60 rounded-md hover:bg-navy-600/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 group"
                                     aria-label="Se video om Djupgående CV-analys"
                                 >
                                     <PlayCircle className="w-4 h-4 mr-2 text-pink-400" />
                                     Se video
                                 </button>
                             </div>

                             {/* NYTT Kort: Kompetensutveckling (Med video & Premium) */}
                             <div className="p-6 bg-navy-800 border border-teal-500/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-teal-600 flex flex-col">
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex-shrink-0">
                                        <GraduationCap className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Kompetensutveckling & Karriärvägledning</h3>
                                         <span className="text-xs font-medium text-teal-400 bg-teal-900/50 px-2 py-0.5 rounded-full">Premium</span>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-gray-300 mb-3 text-sm"> Identifiera kompetensgap mellan ditt CV och önskade yrkesroller eller specifika jobbannonser. Få skräddarsydda förslag på vidareutveckling. </p>
                                    <ul className="text-xs text-gray-400 list-disc list-inside space-y-1 mb-4">
                                        <li>Jämförelse mot yrkesprofiler & annonser.</li>
                                        <li>Identifiering av saknade nyckelkompetenser.</li>
                                        <li>Förslag på kurser, certifieringar och utbildningar.</li>
                                        <li>Stöd för strategisk karriärplanering.</li>
                                    </ul>
                                </div>
                                {/* Knapp för att öppna video modal */}
                                <button
                                    onClick={() => openModal(videoDemoData["Kompetensutveckling & Karriärvägledning"].videoSrc, videoDemoData["Kompetensutveckling & Karriärvägledning"].title)}
                                    className="inline-flex items-center justify-center mt-auto px-4 py-2 text-sm font-medium text-pink-300 transition-colors bg-navy-700/50 border border-pink-800/60 rounded-md hover:bg-navy-600/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 group"
                                    aria-label="Se video om Kompetensutveckling & Karriärvägledning"
                                >
                                    <PlayCircle className="w-4 h-4 mr-2 text-pink-400" />
                                    Se video
                                </button>
                            </div>

                            {/* Kort: Tonalitet (Ingen video & Premium) */}
                            <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-gray-600 flex flex-col">
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-teal-500 to-green-500 text-white flex-shrink-0">
                                        <Lightbulb className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Anpassningsbar tonalitet</h3>
                                        <span className="text-xs font-medium text-teal-400 bg-teal-900/50 px-2 py-0.5 rounded-full">Premium</span>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-gray-300 mb-3 text-sm"> Matcha företagskulturen perfekt genom att välja tonläge för ditt personliga brev (t.ex. professionell, entusiastisk, kreativ, självsäker, balanserad). </p>
                                    <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                                        <li>Flera fördefinierade tonlägen.</li>
                                        <li>Automatisk anpassning baserad på annons (Auto-läge).</li>
                                    </ul>
                                </div>
                            </div>

                             {/* Kort: Spara & Hantera (Ingen video) */}
                            <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-gray-600 flex flex-col">
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-gradient-to-br from-green-500 to-yellow-500 text-white flex-shrink-0">
                                        <Save className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Redigera, spara & återanvänd</h3>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-gray-300 mb-3 text-sm"> Generera nya versioner, finjustera texten direkt i vår editor, och spara dina personliga brev och CV-uppgifter säkert på ditt konto. </p>
                                    <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                                        <li>Inbyggd textredigerare.</li>
                                        <li>Säker lagring av dina dokument.</li>
                                        <li>Enkel åtkomst och organisering.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* === SLUT UPPDATERAD Kärnfunktioner === */}

                {/* === Den smarta skillnaden === (Behålls) */}
                <section id="smart-difference" aria-labelledby="smart-difference-heading" className="py-16 bg-navy-900 lg:py-24">
                    {/* ... (innehåll som innan) ... */}
                     <div className="container px-4 mx-auto">
                        {/* Sektionsrubrik */}
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                            <h2 id="smart-difference-heading" className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                Den smarta skillnaden: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Varför vår AI ger dig övertaget</span>
                            </h2>
                            <p className="text-xl text-gray-300">
                                Generell AI är kraftfull, men Jobbcoach.ai är specifikt byggd och finjusterad med beprövade metoder för att maximera dina chanser i jobbsökningen.
                            </p>
                        </div>
                        {/* Argumentation & Fördelar */}
                        <div className="max-w-3xl mx-auto space-y-8">
                            {/* Punkt 1: Expert-tränad & Specialiserad AI */}
                            <div className="flex items-start p-6 bg-navy-800/50 rounded-lg border border-navy-700">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-5 mt-1">
                                    <Sparkles className="w-5 h-5 text-white" aria-hidden="true"/>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-xl font-semibold text-white">Expert-tränad & specialiserad AI</h3>
                                    <p className="text-gray-300 text-sm">
                                        Vi använder avancerade modeller som <span className='font-medium text-purple-300'>GPT-4o</span>, men vår verkliga styrka ligger i de <span className='font-medium text-purple-300'>expert-designade instruktioner (prompts)</span> som vägleder AI:n. Dessa bygger på djupgående <span className='font-medium text-purple-300'>forskning om effektiv jobbansökan</span> (principer från Harvard, Stanford m.fl.) och är finjusterade för att skapa texter med hög relevans och kvalitet – långt bortom vad generell AI kan producera utan omfattande manuell styrning. Resultatet är ansökningar som verkligen kommunicerar ditt värde.
                                    </p>
                                </div>
                            </div>
                            {/* Punkt 2: Datadriven Matchning & Kontext */}
                            <div className="flex items-start p-6 bg-navy-800/50 rounded-lg border border-navy-700">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full mr-5 mt-1">
                                     <UserCheck className="w-5 h-5 text-white" aria-hidden="true"/>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-xl font-semibold text-white">Datadriven matchning & kontext</h3>
                                    <p className="text-gray-300 text-sm">
                                        Jobbcoach.ai <span className='font-medium text-blue-300'>analyserar och kombinerar aktivt informationen från både ditt CV och den specifika jobbannonsen</span>. Detta möjliggör en precis matchning där dina relevanta erfarenheter kopplas direkt till arbetsgivarens behov. AI:n kan därmed generera <span className='font-medium text-blue-300'>konkreta exempel och formuleringar</span> som visar exakt hur du kan bidra – en avgörande faktor för att fånga rekryterarens intresse.
                                    </p>
                                </div>
                            </div>
                             {/* Punkt 3: Evidensbaserad Metodik & Förbättring */}
                             <div className="flex items-start p-6 bg-navy-800/50 rounded-lg border border-navy-700">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-full mr-5 mt-1">
                                    <BarChartHorizontal className="w-5 h-5 text-white" aria-hidden="true"/>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-xl font-semibold text-white">Evidensbaserad metodik & ständig förbättring</h3>
                                    <p className="text-gray-300 text-sm">
                                        Våra funktioner, som CV-analys och tonalitetsjustering, styrs av <span className='font-medium text-teal-300'>beprövade metoder och insikter från rekryteringsforskning</span> och branschpraxis. Vi fokuserar på vad som bevisligen ökar dina chanser, från ATS-vänlig struktur till psykologiskt övertygande språk. Plattformen <span className='font-medium text-green-300'>förbättras kontinuerligt</span> baserat på data och feedback, och din data hanteras alltid <span className='font-medium text-teal-300'>säkert och konfidentiellt</span>.
                                    </p>
                                </div>
                            </div>
                             {/* Punkt 4: Användarvänlighet & Effektivitet */}
                            <div className="flex items-start p-6 bg-navy-800/50 rounded-lg border border-navy-700">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full mr-5 mt-1">
                                     <Zap className="w-5 h-5 text-white" aria-hidden="true"/>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-xl font-semibold text-white">Intuitivt & tidseffektivt</h3>
                                    <p className="text-gray-300 text-sm">
                                        Slipp komplexiteten med att skriva egna AI-prompts. Vårt <span className='font-medium text-pink-300'>användarvänliga gränssnitt</span> gör det enkelt att få högkvalitativa utkast och analyser med några få klick. Fokusera på att finslipa innehållet och förbereda dig för intervjun, medan Jobbcoach.ai <span className='font-medium text-orange-400'>sparar dig värdefull tid och energi</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === FAQ Section === (Behålls) */}
                <section id="faq" aria-labelledby="faq-heading-funktioner" className="py-16 bg-navy-950 lg:py-24">
                    {/* ... (innehåll som innan) ... */}
                     <div className="container px-4 mx-auto">
                        {/* Sektionsrubrik */}
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                             <h2 id="faq-heading-funktioner" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                 Vanliga frågor <span className="text-pink-400">om funktionerna</span>
                             </h2>
                             <p className="text-xl text-gray-300">
                                 Få svar på dina funderingar kring hur Jobbcoach.ai fungerar.
                             </p>
                        </div>
                        {/* FAQ Accordion */}
                        <div className="max-w-3xl mx-auto">
                            <FaqAccordion items={faqItems} />
                        </div>
                    </div>
                </section>

                {/* === CTA Section === (Behålls) */}
                <section aria-labelledby="cta-heading-funktioner" className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
                    {/* ... (innehåll som innan) ... */}
                     <div className="container px-4 mx-auto text-center">
                        <h2 id="cta-heading-funktioner" className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                            Redo att optimera hela din ansökan?
                        </h2>
                        <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
                            Ta kontroll över din jobbansökan med AI-drivna personliga brev och djupgående CV-analys. Låt Jobbcoach.ai bli din hemlighet för att vinna drömjobbet. Börja skapa och analysera – redan idag!
                        </p>
                        {/* CTA-knapp */}
                        <Link
                            href={session ? "/create-letter" : "/register"}
                            className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-100 group"
                        >
                            {session ? "Börja skapa nu" : "Kom igång gratis nu"}
                            <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </section>

            </div> {/* Stänger main container div */}

             {/* === Modal för Video (Samma som på startsidan) === */}
             {modalVideoSrc && (
                 <div
                     className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm"
                     onClick={closeModal} // Stäng när man klickar på bakgrunden
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="video-modal-title"
                 >
                     <div
                         className="relative w-full max-w-4xl bg-navy-900 rounded-lg shadow-xl overflow-hidden border border-navy-700"
                         onClick={(e) => e.stopPropagation()} // Förhindra att klick inuti stänger modalen
                     >
                         {/* Header med titel och stängknapp */}
                          <div className="flex items-center justify-between p-4 border-b border-navy-700">
                              <h2 id="video-modal-title" className="text-xl font-semibold text-white">{modalTitle}</h2>
                              <button
                                  onClick={closeModal}
                                  className="text-gray-400 transition-colors rounded-full hover:text-white hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 p-1"
                                  aria-label="Stäng videovisning"
                              >
                                  <X className="w-6 h-6" />
                              </button>
                          </div>

                         {/* Video Container */}
                         <div className="p-4 md:p-6 aspect-video"> {/* Behåll aspect ratio */}
                              <video
                                  key={modalVideoSrc} // Tvinga omrendrering vid src-byte
                                  src={modalVideoSrc} // Använd state för källan
                                  width="100%"
                                  height="auto"
                                  controls // Visa standardkontroller
                                  autoPlay // Spela upp direkt när modalen öppnas
                                  className="w-full h-full rounded"
                                  aria-label={`Videouppspelning av ${modalTitle}`}
                              >
                                  Din webbläsare stöder inte video-taggen.
                              </video>
                          </div>
                     </div>
                 </div>
             )}
             {/* === SLUT Modal === */}
        </>
    );
}