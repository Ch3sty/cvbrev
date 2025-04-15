/**
 * Fil: src/app/priser/page.tsx
 *
 * Beskrivning:
 * Prissidan för Jobbcoach.ai. Visar de tillgängliga planerna (Gratis och Premium),
 * deras funktioner och priser. Inkluderar även argument för att uppgradera,
 * information om vad som alltid ingår, samt en FAQ för prisrelaterade frågor.
 * Använder Stripe för prenumerationshantering via SubscribeButton-komponenten.
 */
'use client'

// --- Core Imports ---
import { useState, useEffect, FC } from 'react'
import Link from 'next/link'
import Head from 'next/head'

// --- Component Imports ---
// *** VERIFIERA SÖKVÄGEN TILL SubscribeButton ***
import { SubscribeButton } from '@/components/subscription/SubscribeButton';

// --- Icon Imports (Lucide React) ---
import {
  ChevronRight, CheckCircle, Lock, Zap, Save, Upload, Lightbulb, Gift,
  Repeat, Shield, Target, BrainCircuit, Bot, CreditCard, BarChartHorizontal,
  FileSearch, ChevronDown, ChevronUp, ArrowRight // Lade till ArrowRight
} from 'lucide-react'

// --- Data Definitions ---

/**
 * Typdefinition för ett FAQ-item.
 */
interface FaqItem { question: string; answer: string; }

/**
 * Data för FAQ-sektionen på prissidan.
 */
const pricingFaqItems: FaqItem[] = [
    {
        question: "Kan jag byta plan senare?",
        answer: "Ja, absolut! Du kan enkelt uppgradera från Gratis till Premium, eller byta mellan månads- och årsbetalning för Premium, direkt från dina kontoinställningar."
    },
    {
        question: "Vad händer när jag avslutar min Premium-prenumeration?",
        answer: "Du behåller tillgång till alla Premium-funktioner under den period du redan betalat för (månad eller år). Därefter återgår ditt konto automatiskt till Gratis-planen, och dina sparade dokument finns kvar (inom Gratis-planens gränser)."
    },
    {
        question: "Erbjuder ni någon prova-på-period för Premium?",
        answer: "Vi erbjuder för närvarande ingen specifik gratis provperiod för Premium, men vår generösa Gratis-plan låter dig testa kärnfunktionerna, inklusive AI-generering och grundläggande CV-analys, helt utan kostnad."
    },
    {
        question: "Vilka betalningsmetoder accepteras?",
        answer: "Vi accepterar säkra kortbetalningar (Visa, Mastercard, American Express m.fl.) via vår betalpartner Stripe."
    },
    {
        question: "Är årsplanen en engångsbetalning?",
        answer: "Ja, när du väljer årsplanen betalar du hela årsavgiften på en gång och får då 20% rabatt jämfört med månadspriset. Prenumerationen förnyas automatiskt efter ett år om du inte väljer att avsluta den."
    },
];

// --- Sub-Components ---

/**
 * FaqAccordion Component
 * Renderar en expanderbar FAQ-lista.
 */
const FaqAccordion: FC<{ items: FaqItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const handleClick = (index: number) => { setOpenIndex(openIndex === index ? null : index); };

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
                        {openIndex === index ? <ChevronUp className="w-5 h-5 text-pink-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    </button>
                    {openIndex === index && (
                        <div id={`faq-answer-${index}`} className="px-6 pb-4 pt-2 border-t border-navy-700" role="region">
                            <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


// --- Main Page Component: PriserPage ---

export default function PriserPage() {
    // --- State ---
    const [session, setSession] = useState<any>(null); // Ersätt 'any' med specifik typ om möjligt
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    // --- Stripe Price IDs (Verifiera dessa!) ---
    const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU";
    const premiumYearlyPriceId = "price_1R7ezXAB6xHzwmWvDGpuLw2m";

    // --- Prisberäkningar ---
    const premiumMonthlyPrice = 149;
    const premiumYearlyPriceMonthly = Math.round(premiumMonthlyPrice * 12 * 0.8 / 12); // Ca 20% rabatt
    const premiumYearlyPriceTotal = premiumYearlyPriceMonthly * 12;

    // --- Effects ---
    useEffect(() => {
        // Hämtar session vid sidladdning
        async function getSession() {
            try {
                setIsLoading(true);
                const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
                const supabase = getSupabaseClient();
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Fel vid hämtning av session:', error.message);
                    setSession(null);
                } else {
                    setSession(data.session);
                }
            } catch (error) {
                console.error('Oväntat fel i getSession:', error);
                setSession(null);
            } finally {
                setIsLoading(false);
            }
        }
        getSession();
    }, []);

    // --- Render Logic ---

    // Laddningsvy
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Laddar innehåll">
                    <span className="sr-only">Laddar...</span>
                </div>
                <p className="mt-4 text-white">Laddar priser...</p>
            </div>
        );
    }

    // Huvudsida
    return (
        <>
            {/* Sidhuvud och Metadata */}
            <Head>
                <title>Priser | Jobbcoach.ai - Gratis och Premium AI-verktyg</title>
                <meta name="description" content="Utforska prisplanerna för Jobbcoach.ai. Välj mellan Gratis för att testa grunderna eller Premium för obegränsad tillgång till AI-genererade brev, CV-analys och mer. Starta din resa mot drömjobbet!" />
                <meta name="keywords" content="priser jobbcoach.ai, kostnad AI jobbansökan, premium jobbcoach, gratis personligt brev AI, CV-analys pris, prenumeration jobbverktyg" />
                <meta property="og:title" content="Priser | Jobbcoach.ai - Gratis och Premium AI-verktyg" />
                <meta property="og:description" content="Se våra transparenta prisplaner och välj det alternativ som bäst passar ditt jobbsökande. Skapa imponerande ansökningar och få värdefulla insikter med AI." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://jobbcoach.ai/priser" />
                <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-pricing.png" /> {/* Uppdatera bild */}
                <link rel="canonical" href="https://jobbcoach.ai/priser" />
            </Head>

            {/* Sidbehållare */}
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">

                {/* === Hero Section === */}
                <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-20 bg-gradient-to-b from-navy-900 to-navy-950">
                    <div className="absolute inset-0 opacity-30" aria-hidden="true">
                        <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl"></div>
                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
                    </div>
                    <div className="container relative px-4 mx-auto">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                                Välj din väg till <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">nästa jobb</span>
                            </h1>
                            <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300">
                                Starta gratis för att utforska grunderna, eller lås upp obegränsad AI-kraft och avancerade insikter med Premium.
                            </p>
                            {/* Toggle för Månad/År */}
                            <div className="inline-flex p-1 space-x-1 bg-navy-800 border border-navy-700 rounded-lg mb-10">
                                <button
                                    className={`px-5 py-2 text-sm font-medium transition-colors rounded-md ${billingPeriod === 'monthly' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setBillingPeriod('monthly')}
                                    aria-pressed={billingPeriod === 'monthly'}
                                >
                                    Månadsvis
                                </button>
                                <button
                                    className={`px-5 py-2 text-sm font-medium transition-colors rounded-md flex items-center ${billingPeriod === 'yearly' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setBillingPeriod('yearly')}
                                    aria-pressed={billingPeriod === 'yearly'}
                                >
                                    Årsvis
                                    <span className="ml-2 ml-auto px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">Spara 20%</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === Pricing Plans Section === */}
                <section id="pricing-plans" aria-labelledby="pricing-plans-heading" className="py-16 lg:py-20 bg-navy-950">
                    <div className="container px-4 mx-auto">
                        <h2 id="pricing-plans-heading" className="sr-only">Prisplaner</h2>
                        <div className="grid max-w-4xl gap-8 mx-auto lg:grid-cols-2 items-stretch">
                            {/* Kort: Gratis plan */}
                            <div className="flex flex-col overflow-hidden bg-navy-800 border border-gray-700 rounded-2xl transition-all duration-300 hover:border-gray-500 hover:shadow-xl hover:shadow-gray-700/10">
                                <div className="p-8 pb-6 flex-grow">
                                    <h3 className="mb-2 text-2xl font-semibold text-white">Gratis</h3>
                                    <p className="mb-6 text-gray-400 h-12">Testa grundläggande funktioner och upplev AI-kraften.</p>
                                    <div className="mb-6"> <span className="text-4xl font-bold text-white">0 kr</span> <span className="text-gray-400"> / för alltid</span> </div>
                                    <p className="mb-4 text-sm font-semibold text-gray-300">Detta ingår:</p>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> <span className="text-gray-300"><span className="font-medium text-white">5</span> AI-genererade personliga brev / vecka</span> </li>
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> <span className="text-gray-300"><span className="font-medium text-white">1</span> CV-analys / vecka (grundläggande)</span> </li>
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> <span className="text-gray-300"><span className="font-medium text-white">2</span> sparade ansökningar</span> </li>
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Djupgående CV-analys (Premium)</span> </li>
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Anpassningsbar tonalitet (Premium)</span> </li>
                                        <li className="flex items-center opacity-60"> <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> <span className="text-gray-400">Obegränsad användning (Premium)</span> </li>
                                    </ul>
                                </div>
                                <div className="p-6 mt-auto bg-navy-800 border-t border-navy-700 rounded-b-2xl">
                                    <Link href="/register" className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-500 text-center">
                                        Registrera gratiskonto <ArrowRight className="w-4 h-4 ml-2"/>
                                    </Link>
                                </div>
                            </div>

                            {/* Kort: Premium plan */}
                            <div className="relative flex flex-col overflow-hidden bg-navy-800 border-2 border-pink-500 rounded-2xl shadow-xl shadow-pink-500/15 transition-all duration-300 hover:shadow-pink-500/25">
                                <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold tracking-wider text-white uppercase bg-gradient-to-r from-pink-600 to-purple-600 rounded-bl-lg rounded-tr-lg z-10"> Mest populär </div>
                                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-pink-500/50 via-transparent to-purple-500/50 rounded-2xl" aria-hidden="true"></div>
                                <div className="p-8 pb-6 flex-grow relative z-10">
                                    <h3 className="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Premium</h3>
                                    <p className="mb-6 text-gray-400 h-12">Lås upp full potential och maximera dina chanser med obegränsad tillgång.</p>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-white"> {billingPeriod === 'monthly' ? `${premiumMonthlyPrice} kr` : `${premiumYearlyPriceMonthly} kr`} </span>
                                        <span className="text-gray-400"> / månad</span>
                                        {billingPeriod === 'yearly' && <p className="text-sm text-green-400 mt-1">(Faktureras {premiumYearlyPriceTotal} kr årligen – spara 20%!) </p>}
                                    </div>
                                    <p className="mb-4 text-sm font-semibold text-gray-300">Allt i Gratis, plus:</p>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center"> <Zap className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsad AI-generering</span> </li>
                                        <li className="flex items-center"> <FileSearch className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsad & djupgående CV-analys</span> </li>
                                        <li className="flex items-center"> <Save className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Obegränsat antal sparade ansökningar</span> </li>
                                        <li className="flex items-center"> <Lightbulb className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">AI-optimerad & anpassningsbar tonalitet</span> </li>
                                        <li className="flex items-center"> <BrainCircuit className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Avancerade matchningsinsikter</span> </li>
                                        <li className="flex items-center"> <CheckCircle className="w-5 h-5 mr-3 text-pink-400 shrink-0" /> <span className="text-gray-300 font-medium">Prioriterad support</span> </li>
                                    </ul>
                                </div>
                                <div className="p-6 mt-auto relative z-10 bg-gradient-to-t from-navy-800 via-navy-800 to-transparent border-t-2 border-pink-500 rounded-b-2xl">
                                    {session ? (
                                        <SubscribeButton
                                            priceId={billingPeriod === 'monthly' ? premiumMonthlyPriceId : premiumYearlyPriceId}
                                            planName={billingPeriod === 'monthly' ? 'Månad' : 'År'}
                                        />
                                    ) : (
                                        <Link
                                            href={`/register?plan=premium&billing=${billingPeriod}`}
                                            className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 hover:shadow-lg text-center"
                                        >
                                            Välj Premium ({billingPeriod === 'monthly' ? 'Månad' : 'År'}) <ArrowRight className="w-4 h-4 ml-2"/>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                         <p className="mt-12 text-center text-sm text-gray-400"> Alla priser är inklusive moms. Ingen bindningstid för månadsplanen. </p>
                    </div>
                </section>

                 {/* === Why Upgrade Section === */}
                 <section id="why-upgrade" aria-labelledby="why-upgrade-heading" className="py-16 lg:py-24 bg-navy-950">
                    <div className="container px-4 mx-auto">
                         <div className="max-w-3xl mx-auto mb-16 text-center">
                             <h2 id="why-upgrade-heading" className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                 Varför uppgradera till <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Premium?</span>
                             </h2>
                             <p className="text-xl text-gray-300">
                                 Lås upp den fulla potentialen hos Jobbcoach.ai och få verktygen som verkligen accelererar din jobbsökning.
                             </p>
                         </div>
                         {/* Grid med Premium-fördelar */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                             <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl text-center">
                                 <Zap className="w-10 h-10 mx-auto mb-4 text-pink-400" aria-hidden="true"/>
                                 <h3 className="mb-2 text-xl font-semibold text-white">Obegränsad AI-kraft</h3>
                                 <p className="text-gray-300 text-sm">Skapa så många personliga brev och gör så många CV-analyser du behöver – utan begränsningar.</p>
                             </div>
                             <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl text-center">
                                 <FileSearch className="w-10 h-10 mx-auto mb-4 text-purple-400" aria-hidden="true"/>
                                 <h3 className="mb-2 text-xl font-semibold text-white">Djupgående CV-analys</h3>
                                 <p className="text-gray-300 text-sm">Få detaljerad feedback på allt från nyckelord till prestationer för att verkligen optimera ditt CV.</p>
                             </div>
                             <div className="p-6 bg-navy-800 border border-navy-700 rounded-xl text-center">
                                 <Lightbulb className="w-10 h-10 mx-auto mb-4 text-yellow-400" aria-hidden="true"/>
                                 <h3 className="mb-2 text-xl font-semibold text-white">Avancerad anpassning</h3>
                                 <p className="text-gray-300 text-sm">Använd AI-optimerad tonalitet och få tillgång till fler insikter för att skräddarsy varje ansökan perfekt.</p>
                             </div>
                         </div>
                    </div>
                 </section>

                {/* === Alltid Inkluderat Section === */}
                <section aria-labelledby="always-included-heading" className="py-16 lg:py-20 bg-navy-900">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-12 text-center">
                            <h2 id="always-included-heading" className="text-3xl font-bold text-white sm:text-4xl mb-4">
                                Trygghet & flexibilitet ingår alltid
                            </h2>
                            <p className="text-xl text-gray-300">
                                Oavsett om du väljer Gratis eller Premium får du dessa förmåner.
                            </p>
                        </div>
                        {/* Grid med förmåner */}
                        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                            <div className="flex items-center p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                                <Gift className="w-8 h-8 mr-4 text-pink-400 shrink-0" aria-hidden="true"/>
                                <div> <h3 className="text-lg font-semibold text-white">Ingen bindningstid</h3> <p className="text-gray-300 text-sm">Avsluta när som helst.</p> </div>
                            </div>
                            <div className="flex items-center p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                                <Repeat className="w-8 h-8 mr-4 text-purple-400 shrink-0" aria-hidden="true"/>
                                <div> <h3 className="text-lg font-semibold text-white">Fria revisioner</h3> <p className="text-gray-300 text-sm">Justera AI-utkast obegränsat.</p> </div>
                            </div>
                            <div className="flex items-center p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                                <Shield className="w-8 h-8 mr-4 text-blue-400 shrink-0" aria-hidden="true"/>
                                <div> <h3 className="text-lg font-semibold text-white">Datasäkerhet</h3> <p className="text-gray-300 text-sm">Dina uppgifter skyddas.</p> </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === FAQ Section === */}
                <section id="faq-pricing" aria-labelledby="faq-heading-pricing" className="py-16 lg:py-24 bg-navy-950">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-12 text-center">
                            <h2 id="faq-heading-pricing" className="text-3xl font-bold text-white sm:text-4xl mb-4">
                                Frågor om priser & planer?
                            </h2>
                            <p className="text-xl text-gray-300">
                                Här är svar på några vanliga funderingar kring våra prenumerationer.
                            </p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <FaqAccordion items={pricingFaqItems} />
                        </div>
                    </div>
                </section>

                {/* === Final CTA Section === */}
                <section aria-labelledby="cta-heading-pricing" className="py-16 lg:py-20 bg-gradient-to-r from-pink-600 to-purple-600">
                     <div className="container px-4 mx-auto text-center">
                        <h2 id="cta-heading-pricing" className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                            Redo att investera i din karriär?
                        </h2>
                        <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
                            Välj den plan som passar dig bäst och börja skapa ansökningar som öppnar dörrar.
                        </p>
                        {/* CTA-knappar */}
                        <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
                             {/* Logik för att visa rätt knapp(ar) */}
                            {!session ? (
                                // Oinloggad: Visa både Premium-länk och Gratis-länk
                                <>
                                    <Link
                                        href={`/register?plan=premium&billing=${billingPeriod}`}
                                        className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-pink-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-100 group"
                                    >
                                        Välj Premium ({billingPeriod === 'monthly' ? 'Månad' : 'År'})
                                        <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-colors border-2 border-white rounded-lg hover:bg-white hover:bg-opacity-10"
                                    >
                                        Starta Gratis
                                    </Link>
                                </>
                            ) : (
                                // Inloggad: Visa antingen Subscribe-knapp (om inte premium) eller länk till dashboard/skapa
                                // Här krävs egentligen information om användarens nuvarande prenumeration
                                // Förenklad version: Visa alltid Subscribe-knappen om inloggad
                                <SubscribeButton
                                    priceId={billingPeriod === 'monthly' ? premiumMonthlyPriceId : premiumYearlyPriceId}
                                    planName={billingPeriod === 'monthly' ? 'Månad' : 'År'}
                                    // Du behöver antagligen lägga till en className här för att matcha den andra knappen
                                    // ex: className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium ..."
                                />
                                // Alternativt, om du vill ha en länk till skapa-sidan för inloggade:
                                // <Link href="/create-letter" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium ...">Börja Skapa</Link>
                            )}
                        </div>
                    </div>
                </section>

            </div> {/* Stänger main container div */}
        </>
    );
}