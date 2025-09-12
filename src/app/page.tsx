/**
 * Startsidan för Jobbcoach.ai.
 * Visar information om tjänsten, dess funktioner, prissättning,
 * fördelar och vanliga frågor.
 */
'use client'

// --- Core Imports ---
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'

// --- Icon Imports (Lucide React) ---
import {
  UserPlus,
  X,
  PlayCircle,
  ChevronRight, Star, CheckCircle, FileText, FileSearch, Lock, Zap, Save,
  Clock, Target, Lightbulb, BrainCircuit, Sparkles, Upload, ArrowRight, // <<< Lade till Sparkles här
  TrendingUp, ChevronDown, ChevronUp, GraduationCap, Repeat, Briefcase,
} from 'lucide-react'

// --- Data Definitions ---

/**
 * Definition av en funktion som visas i funktionskorten.
 */
interface Feature {
    icon: React.ElementType; // Lucide icon component
    title: string;
    description: string;
    benefit: string;
    gradient: string; // Tailwind gradient classes
    href: string;
}

const features: Feature[] = [
    {
        icon: FileText,
        title: "Personliga brev med AI",
        description: "Skapa unika, träffsäkra personliga brev på sekunder. Vår AI analyserar ditt CV och jobbannonsen för att maximera dina chanser.",
        benefit: "Sticker ut hos arbetsgivaren.",
        gradient: "from-pink-500 to-purple-500",
        href: "/create-letter",
    },
    {
        icon: FileSearch,
        title: "Djupgående CV-analys",
        description: "Få konkret feedback för att förbättra ditt CV. Identifiera styrkor, svagheter och nyckelord som rekryterare letar efter.",
        benefit: "Optimerar din profil.",
        gradient: "from-blue-500 to-teal-500",
        href: "/cv-analysis",
    },
    {
        icon: Lightbulb,
        title: "Anpassningsbar tonalitet",
        description: "Justera enkelt tonen i ditt personliga brev (formell, entusiastisk etc.) för att perfekt spegla företagskulturen du söker till (Premium).",
        benefit: "Matchar företagskulturen.",
        gradient: "from-yellow-500 to-orange-500",
        href: "/create-letter#tonalitet",
    },
    {
        icon: BrainCircuit, // Behåller BrainCircuit för Feature-kortet, använder Sparkles i prisplanen
        title: "Smarta insikter & matchning",
        description: "Förstå hur väl din profil matchar kraven i jobbannonsen. Få datadrivna insikter för att vässa din ansökan ytterligare.",
        benefit: "Ger dig ett övertag.",
        gradient: "from-teal-500 to-cyan-500",
        href: "/insights", // Hypotetisk framtida sida
    },
];

/**
 * Definition av en användarpersona/användarfall.
 */
interface Persona {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string; // Tailwind text color class
    bgColor: string; // Tailwind background color class
}

const personas: Persona[] = [
    {
        icon: GraduationCap,
        title: "Nyexaminerad?",
        description: "Saknar du lång arbetslivserfarenhet? Låt vår AI hjälpa dig lyfta fram relevanta projekt, utbildning och ambitioner i ditt personliga brev och CV.",
        color: "text-pink-400",
        bgColor: "bg-pink-900/30",
    },
    {
        icon: Repeat,
        title: "Karriärbytare?",
        description: "Byter du bransch? Vi hjälper dig identifiera och formulera överförbara färdigheter och motivera ditt byte på ett övertygande sätt.",
        color: "text-purple-400",
        bgColor: "bg-purple-900/30",
    },
    {
        icon: Briefcase,
        title: "Erfaren specialist?",
        description: "Svårt att kortfattat sammanfatta många års erfarenhet? Vår CV-analys hjälper dig att spetsa till din profil och fokusera på det mest relevanta för nästa steg.",
        color: "text-blue-400",
        bgColor: "bg-blue-900/30",
    }
];

/**
 * Definition av ett FAQ-item (fråga och svar).
 */
interface FaqItem {
    question: string;
    answer: string;
}

const faqItems: FaqItem[] = [
    {
        question: "Hur skiljer sig gratis CV-analys från Premium?",
        answer: "Gratisversionen ger dig en grundläggande översikt och identifierar uppenbara förbättringspunkter (2 analyser totalt). Premium ger en djupgående analys med specifika förslag på nyckelord, kvantifiering av prestationer, strukturförbättringar och obegränsade analyser." // Uppdaterad text
    },
    {
        question: "Är min uppladdade data säker?",
        answer: "Ja, säkerheten för din data är vår högsta prioritet. All dataöverföring är krypterad (SSL). Vi lagrar dina CV-texter och genererade brev säkert och delar dem aldrig med tredje part utan ditt uttryckliga medgivande. Du kan när som helst radera dina uppgifter från ditt konto."
    },
    {
        question: "Hur 'smart' är AI:n? Vad baseras den på?",
        answer: "Vår AI använder avancerade modeller (som GPT-4o) men är finjusterad med expert-designade instruktioner (prompts) specifikt framtagna för att skapa högkvalitativa, relevanta och anpassade jobbansökningar. Den är tränad att förstå sammanhanget i både ditt CV och jobbannonsen för att skapa bästa möjliga matchning."
    },
    {
        question: "Kan jag lita på att texten blir unik och inte plagiat?",
        answer: "Absolut. AI:n genererar text baserat på din unika input (CV och jobbannons). Varje genererat brev är unikt för den specifika kombinationen. Vi uppmuntrar dig dock alltid att granska och personifiera texten ytterligare för att säkerställa att den helt representerar dig."
    },
    {
        question: "Hur fungerar betalning och kan jag avsluta när som helst?",
        answer: "Premium kostar 149 kr per månad och betalas via säker kortbetalning (via Stripe). Det finns ingen bindningstid. Du kan enkelt avsluta din prenumeration när som helst direkt från dina kontoinställningar, och du behåller tillgången till Premium månaden ut."
    },
    {
        question: "Vilka filformat stöds för CV-uppladdning?",
        answer: "Vi stöder för närvarande uppladdning av CV i PDF (.pdf) och Microsoft Word (.docx) format. Du kan också klistra in texten direkt från ditt CV."
    }
];

// --- Definition och data för videodemos ---
interface VideoDemo {
    title: string;
    description: string; // Kort beskrivning för videon
    videoSrc: string; // Sökväg till MP4-filen
    posterSrc: string; // Sökväg till förhandsvisningsbilden
}

const videoDemos: VideoDemo[] = [
    {
        title: "Skapa Personliga Brev med AI",
        description: "Se hur AI:n matchar ditt CV mot jobbannonsen och genererar ett anpassat utkast på sekunder.",
        videoSrc: "/videos/Personligt%20brev%20-%20Jobbcoach.ai.mp4",
        posterSrc: "/images/videocover/skriva%20personligt%20brev%20-%20jobbcoach.ai.png",
    },
    {
        title: "Djupgående CV-Analys",
        description: "Få omedelbar feedback på ditt CV, inklusive ATS-vänlighet och konkreta förbättringsförslag.",
        videoSrc: "/videos/Analysera%20CV%20-%20Jobbcoach.ai.mp4",
        posterSrc: "/images/videocover/cv-analys%20-%20jobbcoach.ai.png",
    },
    {
        title: "Identifiera Kompetensgap",
        description: "Upptäck vilka kunskaper du saknar för drömjobbet och få förslag på relevanta kurser och utvecklingsområden.",
        videoSrc: "/videos/Kompetensanalys%20-%20Jobbcoach.ai.mp4",
        posterSrc: "/images/videocover/Kompetensanalys%20-%20jobbcoach.ai.png",
    },
];

// --- Sub-Components ---

/**
 * En återanvändbar Accordion-komponent för FAQ-sektionen.
 */
const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
                    <button
                        onClick={() => handleClick(index)}
                        className="flex justify-between items-center w-full px-6 py-4 text-left text-white hover:bg-navy-700/50 focus:outline-none focus-visible:ring focus-visible:ring-pink-500 focus-visible:ring-opacity-75 transition-colors duration-200"
                        aria-expanded={openIndex === index}
                        aria-controls={`faq-answer-${index}`}
                    >
                        <span className="font-medium text-base">{item.question}</span>
                        {openIndex === index ? (
                            <ChevronUp className="w-5 h-5 text-pink-400 flex-shrink-0" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                    </button>
                    {openIndex === index && (
                        <div
                            id={`faq-answer-${index}`}
                            className="px-6 pb-4 pt-2 border-t border-navy-700"
                            role="region"
                        >
                            <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- Main Page Component ---

export default function Home() {
    // State för användarsession och laddningsstatus
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // --- State för modalen ---
    const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string>('');

    // Effekt för att hämta användarsession vid sidladdning
    useEffect(() => {
        async function getSession() {
             try {
                 setIsLoading(true);
                 const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
                 const supabase = getSupabaseClient();
                 const { data } = await supabase.auth.getSession();
                 setSession(data.session);
                 
                 // Redirect inloggade användare till dashboard
                 if (data.session) {
                     console.log('Användare inloggad, omdirigerar till dashboard...');
                     window.location.href = '/dashboard';
                     return;
                 }
             } catch (error) {
                 console.error('Kunde inte hämta session:', error);
                 setSession(null);
             } finally {
                 setIsLoading(false);
             }
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

    // Visar laddningsindikator
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
                 <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" aria-label="Laddar innehåll"></div>
                 <p className="mt-4 text-white">Laddar jobbcoach.ai...</p>
             </div>
         );
    }

    // --- Funktioner för att hantera modalen ---
    const openModal = (src: string, title: string) => {
        setModalVideoSrc(src);
        setModalTitle(title);
    };

    const closeModal = () => {
        setModalVideoSrc(null);
        setModalTitle('');
    };

    // Rendera huvudsidan
    return (
        <>
            {/* SEO och Metadata */}
            <Head>
                <title>Jobbcoach.ai | Din digitala jobbcoach - AI för CV & personligt brev</title>
                <meta name="description" content="Jobbcoach.ai är din smarta digitala jobbcoach. Använd AI för att skapa vinnande personliga brev, analysera ditt CV, identifiera kompetensgap och optimera din jobbsökning. Testa gratis!"/>
                <meta name="keywords" content="digital jobbcoach, jobbcoach, AI, personligt brev, skriva personligt brev, CV-analys, analysera CV, kompetensutveckling, kompetensanalys, ATS-vänlighet, jobbsökning, karriär, AI-verktyg, jobbansökan, jobbcoach.ai, gratis personligt brev"/>
                <meta property="og:title" content="Jobbcoach.ai | Din digitala jobbcoach - AI för CV & personligt brev" />
                <meta property="og:description" content="Få experthjälp i jobbsökningen med Jobbcoach.ai. Skapa ansökningar som sticker ut, få CV-insikter och utvecklingsförslag. Testa gratis!" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://jobbcoach.ai" />
                <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-main.png" />
                <link rel="canonical" href="https://jobbcoach.ai" />
            </Head>

            {/* Huvudinnehåll */}
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">

                {/* === Hero Section === */}
                <section className="relative pt-24 pb-16 text-center lg:pt-32 lg:pb-24 overflow-hidden">
                   <div className="absolute inset-0 opacity-30" aria-hidden="true">
                       <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl"></div>
                       <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
                   </div>
                   <div className="container relative px-4 mx-auto z-10">
                       <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-pink-400 bg-pink-900/50 rounded-full border border-pink-800">
                           Sveriges smartaste digitala jobbcoach
                       </span>
                       <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                           Landa ditt drömjobb <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">snabbare</span>
                       </h1>
                       <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300">
                           Låt vår AI-drivna plattform guida dig. Skapa vinnande ansökningar, få CV-insikter och optimera din jobbsökning – allt på ett ställe.
                       </p>
                       <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                           {session ? (
                               <Link href="/register" className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 group sm:w-auto">
                                   Prova gratis nu
                                   <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                               </Link>
                           ) : (
                               <>
                                   <Link href="/register" className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 group sm:w-auto animate-pulse-pink">
                                       Kom igång gratis
                                       <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                   </Link>
                                   <Link href="/login" className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-gray-300 transition-colors bg-navy-800/50 border border-gray-700 rounded-lg hover:bg-navy-700/70 hover:text-white sm:w-auto">
                                       Logga in
                                   </Link>
                               </>
                           )}
                       </div>
                       <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10 text-sm text-gray-400">
                           <div className="flex items-center"> <CheckCircle className="w-4 h-4 mr-1.5 text-pink-500 flex-shrink-0" /> <span>AI-drivna personliga brev</span> </div>
                           <div className="flex items-center"> <CheckCircle className="w-4 h-4 mr-1.5 text-pink-500 flex-shrink-0" /> <span>CV-analys & insikter</span> </div>
                           <div className="flex items-center"> <CheckCircle className="w-4 h-4 mr-1.5 text-pink-500 flex-shrink-0" /> <span>Snabbt & enkelt</span> </div>
                       </div>
                   </div>
                </section>

                {/* === Funktions-sektion === */}
                <section id="funktioner" aria-labelledby="features-heading" className="py-16 bg-navy-900 lg:py-24">
                    <div className="container px-4 mx-auto">
                       <div className="max-w-3xl mx-auto mb-16 text-center">
                           <h2 id="features-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                               Din kompletta <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">jobbsökar-assistent</span>
                           </h2>
                           <p className="text-xl text-gray-300">
                               Jobbcoach.ai ger dig verktygen och insikterna för att lyckas. Från första utkast till finslipad ansökan.
                           </p>
                       </div>
                       <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <div key={index} className="relative group p-6 bg-navy-800 border border-navy-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-2 flex flex-col items-center text-center">
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} aria-hidden="true"></div>
                                    <div className={`flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${feature.gradient} text-white shadow-lg flex-shrink-0`}>
                                        <feature.icon className="w-8 h-8" aria-hidden="true" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
                                    <p className="text-gray-300 text-sm mb-3 flex-grow">{feature.description}</p>
                                    <p className="text-sm font-medium text-pink-400 mt-auto">
                                        <TrendingUp className="inline w-4 h-4 mr-1" aria-hidden="true" /> {feature.benefit}
                                    </p>
                                </div>
                            ))}
                       </div>
                    </div>
                </section>

                {/* === UPPDATERAD "Kom igång"-sektion === */}
                <section id="kom-igang" aria-labelledby="how-it-works-heading" className="py-16 bg-navy-950 lg:py-24 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.2) 1px, transparent 1px)', backgroundSize: '30px 30px'}} aria-hidden="true"></div>
                   <div className="container relative px-4 mx-auto z-10">
                       <div className="max-w-3xl mx-auto mb-16 text-center">
                           <h2 id="how-it-works-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                               Kom igång på <span className="text-pink-400">3 enkla steg</span>
                           </h2>
                           <p className="text-xl text-gray-300">
                               Börja använda Jobbcoach.ai och effektivisera din jobbsökning direkt.
                           </p>
                       </div>
                       <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-4">
                           {/* Steg 1: Skapa Konto */}
                           <div className="flex flex-col items-center text-center max-w-sm p-6 bg-navy-800/80 backdrop-blur-sm border border-navy-700 rounded-xl transition-all duration-300 hover:bg-navy-700/70 hover:border-pink-800/50 hover:scale-105">
                               <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-lg flex-shrink-0">
                                   <UserPlus className="w-8 h-8" aria-hidden="true"/>
                               </div>
                               <h3 className="mb-2 text-xl font-semibold text-white">1. Skapa ditt konto</h3>
                               <p className="text-sm text-gray-300">
                                   Registrera dig snabbt och gratis för att få tillgång till våra kraftfulla AI-verktyg.
                               </p>
                           </div>
                           <ArrowRight className="w-8 h-8 text-pink-500/50 hidden lg:block mx-4 self-center shrink-0 transform rotate-90 lg:rotate-0" aria-hidden="true"/>
                           {/* Steg 2: Ladda upp CV */}
                           <div className="flex flex-col items-center text-center max-w-sm p-6 bg-navy-800/80 backdrop-blur-sm border border-navy-700 rounded-xl transition-all duration-300 hover:bg-navy-700/70 hover:border-purple-800/50 hover:scale-105">
                                <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg flex-shrink-0">
                                    <Upload className="w-8 h-8" aria-hidden="true"/>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">2. Ladda upp CV</h3>
                                <p className="text-sm text-gray-300">
                                    Importera ditt CV (PDF/DOCX) eller klistra in texten så att AI:n kan börja jobba.
                                </p>
                           </div>
                           <ArrowRight className="w-8 h-8 text-pink-500/50 hidden lg:block mx-4 self-center shrink-0 transform rotate-90 lg:rotate-0" aria-hidden="true"/>
                           {/* Steg 3: Nyttja Funktionerna */}
                           <div className="flex flex-col items-center text-center max-w-sm p-6 bg-navy-800/80 backdrop-blur-sm border border-navy-700 rounded-xl transition-all duration-300 hover:bg-navy-700/70 hover:border-blue-800/50 hover:scale-105">
                                <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-lg flex-shrink-0">
                                    <Zap className="w-8 h-8" aria-hidden="true"/>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">3. Nyttja AI-verktygen</h3>
                                <p className="text-sm text-gray-300">
                                    Skapa personliga brev, analysera CV, hitta kompetensgap och mycket mer!
                                </p>
                           </div>
                       </div>
                       <p className="mt-12 text-center text-gray-400 text-base">
                           Så enkelt är det att turboladda din jobbsökning med AI.
                       </p>
                   </div>
                </section>
                {/* === SLUT UPPDATERAD "Kom igång"-sektion === */}

                {/* === Utforska Kärnfunktionerna (Video Demos med Autoplay + Modal) === */}
                <section id="funktioner-video" aria-labelledby="video-demos-heading" className="py-16 bg-navy-900 lg:py-24">
                   <div className="container px-4 mx-auto">
                       <div className="max-w-3xl mx-auto mb-12 text-center lg:mb-16">
                           <h2 id="video-demos-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                               Utforska <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Kärnfunktionerna</span>
                           </h2>
                           <p className="text-xl text-gray-300">
                               Se hur Jobbcoach.ai förvandlar din jobbsökning med AI-driven analys och innehållsskapande.
                           </p>
                       </div>
                       <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
                           {videoDemos.map((demo, index) => (
                               <div
                                   key={index}
                                   onClick={() => openModal(demo.videoSrc, demo.title)} // Gör kortet klickbart för modal
                                   className="flex flex-col overflow-hidden transition-all duration-300 bg-navy-800 border border-navy-700 rounded-xl hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 cursor-pointer group" // Styling för klickbarhet + hover
                               >
                                   <div className="relative w-full aspect-video bg-navy-900"> {/* Relativ position för overlay */}
                                       <video
                                           src={demo.videoSrc}
                                           poster={demo.posterSrc}
                                           width="100%"
                                           height="auto"
                                           loop
                                           muted
                                           autoPlay
                                           playsInline
                                           preload="metadata"
                                           className="block object-cover w-full h-full rounded-t-xl"
                                           aria-label={`Autospelande demonstration av ${demo.title}. Klicka för att se större version med kontroller.`}
                                       >
                                           {/* Fallback text mindre kritisk när poster finns */}
                                       </video>
                                       {/* Play-ikon overlay visas vid hover */}
                                       <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 pointer-events-none">
                                           <PlayCircle className="w-16 h-16 text-white opacity-70" />
                                       </div>
                                   </div>
                                   <div className="p-5 lg:p-6">
                                       <h3 className="mb-2 text-lg font-semibold text-white lg:text-xl">{demo.title}</h3>
                                       <p className="text-sm text-gray-300 lg:text-base">{demo.description}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </section>
               {/* === SLUT Utforska Kärnfunktionerna === */}


                {/* === Prisplaner (UPPDATERAD 2024-07-16) === */}
                <section id="priser" aria-labelledby="pricing-heading" className="py-16 bg-navy-900 lg:py-24">
                     <div className="container px-4 mx-auto">
                         <div className="max-w-3xl mx-auto mb-16 text-center">
                             <h2 id="pricing-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                 Enkel prissättning som passar alla
                             </h2>
                             <p className="text-xl text-gray-300">
                                 Starta gratis och upplev grunderna, eller gå Premium för full tillgång.
                             </p>
                         </div>
                         <div className="grid max-w-4xl gap-8 mx-auto lg:grid-cols-2 items-stretch">
                            {/* --- UPDATED Gratis plan --- */}
                            <div className="flex flex-col overflow-hidden bg-navy-800 border border-gray-700 rounded-2xl transition-all duration-300 hover:border-gray-500 hover:shadow-lg">
                                <div className="p-8 pb-6 flex-grow">
                                    <h3 className="mb-2 text-2xl font-semibold text-white">Gratis</h3>
                                    {/* Uppdaterad beskrivning */}
                                    <p className="mb-6 text-gray-400 h-12">Testa grundläggande funktioner och upplev AI-kraften.</p>
                                    <div className="mb-6"> <span className="text-4xl font-bold text-white">0 kr</span> <span className="text-gray-400"> / för alltid</span> </div>
                                    <p className="mb-4 text-sm font-semibold text-gray-300">Detta ingår:</p>
                                    <ul className="space-y-3 text-sm">
                                        {/* Uppdaterade gratis-features */}
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> <span className="text-gray-300">2 AI-genererade personliga brev</span> </li>
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> <span className="text-gray-300">2 CV-analyser (grundläggande)</span> </li>
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> <span className="text-gray-300">2 Kompetensanalyser (grundläggande)</span> </li>
                                        {/* Uppdaterade låsta features */}
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Djupgående CV-analys (Premium)</span> </li>
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Djupgående kompetensanalys (Premium)</span> </li>
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Anpassningsbar tonalitet (Premium)</span> </li>
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Obegränsad användning (Premium)</span> </li>
                                    </ul>
                                </div>
                                <div className="p-6 mt-auto bg-navy-800 border-t border-navy-700 rounded-b-2xl">
                                    {/* Uppdaterad knapptext */}
                                    <Link href="/register" className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-500 text-center">
                                        Registrera gratiskonto
                                        <ArrowRight className="w-4 h-4 ml-2"/>
                                    </Link>
                                </div>
                            </div>
                            {/* --- UPDATED Premium plan --- */}
                             <div className="relative flex flex-col overflow-hidden bg-navy-800 border-2 border-pink-500 rounded-2xl shadow-xl shadow-pink-500/10 transition-all duration-300 hover:shadow-pink-500/20">
                                <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold tracking-wider text-white uppercase bg-gradient-to-r from-pink-600 to-purple-600 rounded-bl-lg rounded-tr-lg z-10">
                                    Mest populär
                                </div>
                                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-pink-500/50 via-transparent to-purple-500/50 rounded-2xl" aria-hidden="true"></div>
                                <div className="p-8 pb-6 flex-grow relative z-10">
                                    <h3 className="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Premium</h3>
                                    {/* Uppdaterad beskrivning */}
                                    <p className="mb-6 text-gray-400 h-12">Lås upp full potential och maximera dina chanser med obegränsad tillgång.</p>
                                    <div className="mb-6"> <span className="text-4xl font-bold text-white">149 kr</span> <span className="text-gray-400"> / månad</span> </div>
                                    <p className="mb-4 text-sm font-semibold text-gray-300">Allt i Gratis, plus:</p>
                                    <ul className="space-y-3 text-sm">
                                        {/* Uppdaterade premium-features med nya ikoner & text */}
                                        <li className="flex items-center"> <Zap className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsad AI-generering</span> </li>
                                        <li className="flex items-center"> <FileSearch className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsad & djupgående CV-analys</span> </li>
                                        <li className="flex items-center"> <FileSearch className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsad & djupgående kompetensanalys</span> </li>
                                        <li className="flex items-center"> <Save className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsat antal sparade ansökningar</span> </li>
                                        <li className="flex items-center"> <Lightbulb className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">AI-optimerad & anpassningsbar tonalitet</span> </li>
                                        <li className="flex items-center"> <Sparkles className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Avancerade matchningsinsikter</span> </li>
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Prioriterad support</span> </li>
                                    </ul>
                                </div>
                                <div className="p-6 mt-auto relative z-10 bg-gradient-to-t from-navy-800 via-navy-800 to-transparent border-t-2 border-pink-500 rounded-b-2xl">
                                    {/* Uppdaterad knapptext & stil */}
                                    <Link href="/register?plan=premium" className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-lg hover:from-pink-700 hover:to-fuchsia-700 hover:shadow-lg text-center">
                                        Uppgradera till Premium
                                        <ArrowRight className="w-4 h-4 ml-2"/>
                                    </Link>
                                </div>
                            </div>
                        </div>
                         <p className="mt-12 text-center text-sm text-gray-400">
                             Alla priser är inklusive moms. Ingen bindningstid, avsluta när du vill.
                         </p>
                    </div>
                </section>
                 {/* === SLUT Prisplaner === */}

                {/* === Varför Välja Oss & Omdömen (Med konkretisering) === */}
                <section aria-labelledby="why-choose-us-heading" className="py-16 bg-navy-950 lg:py-24">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                            <h2 id="why-choose-us-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                Ge din jobbsökning <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">superkrafter</span>
                            </h2>
                            <p className="text-xl text-gray-300">
                                Jobbcoach.ai är mer än bara ett verktyg – det är din strategiska partner för att nå dina karriärmål.
                            </p>
                        </div>
                        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                            {/* Vänsterkolumn: Fördelar */}
                            <div className="mt-4 lg:mt-0">
                                <h3 className="text-2xl font-semibold text-white mb-6 text-center lg:text-left">Fördelarna med Jobbcoach.ai:</h3>
                                <ul className="space-y-6">
                                    <li className="flex items-start p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full shadow-md mt-1"> <Target className="w-5 h-5 text-white" /> </div>
                                        <div className="ml-4">
                                            <h4 className="mb-1 text-lg font-semibold text-white">Stå ut från mängden</h4>
                                            <p className="text-gray-300 text-sm mb-3">Skapa unika och relevanta ansökningar som fångar rekryterarens intresse direkt, istället för generiska mallar.</p>
                                            <div className="mt-2 p-2 bg-navy-900/50 border border-navy-600 rounded text-xs text-gray-400 italic relative overflow-hidden">
                                                 <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-transparent" aria-hidden="true"></div>
                                                "...min erfarenhet av <span className='text-pink-400 not-italic font-medium'>projektledning i agila team</span>, som nämns i er annons, gör att jag snabbt kan..."
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full shadow-md mt-1"> <BrainCircuit className="w-5 h-5 text-white" /> </div>
                                        <div className="ml-4">
                                            <h4 className="mb-1 text-lg font-semibold text-white">Förstå dina styrkor</h4>
                                            <p className="text-gray-300 text-sm mb-3">Få objektiv feedback på ditt CV och lär dig hur du bäst presenterar din kompetens och erfarenhet.</p>
                                            <div className="mt-2 p-2 bg-navy-900/50 border border-navy-600 rounded text-xs space-y-1">
                                                <div className="flex items-center text-blue-400"><FileSearch className="w-3 h-3 mr-1.5" aria-hidden="true"/> Nyckelord Matchning: <span className="font-semibold ml-1">85%</span></div>
                                                <div className="text-gray-400"><Lightbulb className="w-3 h-3 mr-1.5 inline text-yellow-400" aria-hidden="true"/> Förslag: Kvantifiera prestationer under 'Projektledare'-rollen.</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-md mt-1"> <Clock className="w-5 h-5 text-white" /> </div>
                                        <div className="ml-4">
                                            <h4 className="mb-1 text-lg font-semibold text-white">Effektivisera processen</h4>
                                            <p className="text-gray-300 text-sm mb-3">Spara timmar av arbete på varje ansökan och lägg din energi på nätverkande och intervjuförberedelser.</p>
                                            <div className="mt-2 text-sm font-medium text-orange-400">
                                                <Clock className="inline w-4 h-4 mr-1" aria-hidden="true" /> Från timmar av skrivkramp till minuter.
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            {/* Högerkolumn: Testimonials */}
                            <div className="relative">
                                 <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-900/30 to-transparent filter blur-3xl -z-10" aria-hidden="true"></div>
                                 <div className="p-8 bg-navy-800 border border-navy-700 rounded-xl shadow-xl">
                                    <h3 className="mb-8 text-2xl font-semibold text-center text-white">Vad våra användare säger:</h3>
                                    <div className="space-y-6">
                                        <blockquote className="p-4 bg-navy-700/50 border border-navy-600 rounded-lg hover:bg-navy-700/70 transition-colors duration-200">
                                            <div className="flex items-center mb-2" aria-label="Betyg: 5 av 5 stjärnor">
                                                {[...Array(5)].map((_, i) => ( <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-0.5" /> ))}
                                            </div>
                                            <p className="mb-3 italic text-gray-300 text-[0.9rem] leading-relaxed">
                                                "Jobbcoach.ai hjälpte mig att få tre intervjuer på en vecka! De personliga breven gjorde verkligen skillnad."
                                            </p>
                                            <footer className="font-semibold text-sm text-white">- Sofia L.</footer>
                                        </blockquote>
                                        <blockquote className="p-4 bg-navy-700/50 border border-navy-600 rounded-lg hover:bg-navy-700/70 transition-colors duration-200">
                                            <div className="flex items-center mb-2" aria-label="Betyg: 5 av 5 stjärnor">
                                                {[...Array(5)].map((_, i) => ( <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-0.5" /> ))}
                                            </div>
                                            <p className="mb-3 italic text-gray-300 text-[0.9rem] leading-relaxed">
                                                "Jag sparar otroligt mycket tid per ansökan och får mycket bättre respons från rekryterare nu."
                                            </p>
                                            <footer className="font-semibold text-sm text-white">- Johan K.</footer>
                                        </blockquote>
                                        <blockquote className="p-4 bg-navy-700/50 border border-navy-600 rounded-lg hover:bg-navy-700/70 transition-colors duration-200">
                                             <div className="flex items-center mb-2" aria-label="Betyg: 5 av 5 stjärnor">
                                                {[...Array(5)].map((_, i) => ( <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-0.5" /> ))}
                                            </div>
                                            <p className="mb-3 italic text-gray-300 text-[0.9rem] leading-relaxed">
                                                "Äntligen ett verktyg som faktiskt förstår vad rekryterare letar efter. Mina ansökningar sticker verkligen ut nu!"
                                            </p>
                                            <footer className="font-semibold text-sm text-white">- Maria B.</footer>
                                        </blockquote>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === Anpassat för din situation (Personas) === */}
                <section id="personas" aria-labelledby="personas-heading" className="py-16 bg-navy-900 lg:py-24">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                            <h2 id="personas-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                Anpassat för <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">din situation</span>
                            </h2>
                            <p className="text-xl text-gray-300">
                                Oavsett var du befinner dig i karriären, hjälper Jobbcoach.ai dig att nå nästa nivå.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {personas.map((persona, index) => (
                                <div key={index} className={`p-6 rounded-xl border border-navy-700 flex flex-col items-center text-center transition-all duration-300 hover:border-opacity-50 ${persona.bgColor} hover:shadow-lg hover:-translate-y-1`}>
                                    <div className={`flex items-center justify-center w-14 h-14 mb-5 rounded-full ${persona.color} ${persona.bgColor.replace('900/30', '800/50')} flex-shrink-0`}>
                                        <persona.icon className="w-7 h-7" aria-hidden="true" />
                                    </div>
                                    <h3 className={`mb-2 text-xl font-semibold ${persona.color}`}>{persona.title}</h3>
                                    <p className="text-sm text-gray-300">{persona.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === FAQ-sektion === */}
                <section id="faq" aria-labelledby="faq-heading" className="py-16 bg-navy-950 lg:py-24">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                             <h2 id="faq-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                 Vanliga frågor <span className="text-pink-400">(FAQ)</span>
                             </h2>
                             <p className="text-xl text-gray-300">
                                 Har du funderingar? Här hittar du svar på de vanligaste frågorna.
                             </p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <FaqAccordion items={faqItems} />
                        </div>
                    </div>
                </section>

                {/* === Sista CTA-sektion === */}
                <section aria-labelledby="final-cta-heading" className="py-16 bg-gradient-to-t from-navy-950 via-navy-900 to-navy-800 lg:py-20">
                     <div className="container px-4 mx-auto text-center">
                         <div className="max-w-2xl mx-auto">
                             <Sparkles className="w-10 h-10 mx-auto mb-4 text-pink-400" aria-hidden="true"/>
                             <h2 id="final-cta-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                 Redo att ta kontroll över din karriär?
                             </h2>
                             <p className="mb-8 text-xl text-gray-300">
                                 Gå med i jobbcoach.ai idag och upplev skillnaden en smart digital jobbcoach kan göra. Skapa ditt konto och testa gratis!
                             </p>
                             <Link
                                 href={session ? "/register" : "/register"}
                                 className="inline-flex items-center px-10 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 group animate-pulse-pink"
                             >
                                 {session ? "Prova gratis nu" : "Kom igång gratis nu"}
                                 <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                             </Link>
                             <p className="mt-4 text-sm text-gray-400">
                                 Uppgradera till Premium för bara 149 kr/månad när du vill.
                             </p>
                         </div>
                    </div>
                </section>

            </div> {/* Stänger huvudinnehålls-div */}

             {/* === Modal för Video === */}
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
                                  key={modalVideoSrc} // Lägg till key för att tvinga omrendrering vid src-byte
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