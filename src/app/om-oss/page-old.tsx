/**
 * Fil: src/app/om-oss/page.tsx
 *
 * Beskrivning:
 * "Om Oss"-sidan för Jobbcoach.ai. Berättar om företagets mission,
 * vision, värderingar och resan från cvbrev.se.
 */
'use client'

// --- Core Imports ---
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'

// --- Icon Imports (Lucide React) ---
import {
    ChevronRight, Users, Target, BrainCircuit, Heart, Lightbulb, Rocket,
    CheckCircle // För värderingar/principer
} from 'lucide-react'

// --- Main Page Component: OmOssPage ---

export default function OmOssPage() {
    // State för session och laddning (kan behållas för enhetlighet, även om det inte direkt används för innehållet här)
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function getSession() {
             try {
                 setIsLoading(true);
                 const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
                 const supabase = getSupabaseClient();
                 const { data } = await supabase.auth.getSession();
                 setSession(data.session);
             } catch (error) {
                 console.error('Kunde inte hämta session:', error);
                 setSession(null);
             } finally {
                 setIsLoading(false);
             }
        }
        getSession();
    }, []);

    // Laddningsindikator (för konsekvens)
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
                 <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" aria-label="Laddar innehåll"></div>
                 <p className="mt-4 text-white">Laddar om oss...</p>
             </div>
         );
    }

    return (
        <>
            {/* SEO och Metadata */}
            <Head>
                <title>Om Oss | Jobbcoach.ai - Din partner i karriären</title>
                <meta name="description" content="Lär känna teamet och visionen bakom Jobbcoach.ai. Vi brinner för att hjälpa dig nå dina karriärmål med smarta, AI-drivna verktyg för jobbsökning."/>
                <meta name="keywords" content="om jobbcoach.ai, om oss, digital jobbcoach, AI jobbsökning, karriärutveckling, cvbrev.se"/>
                <meta property="og:title" content="Om Oss | Jobbcoach.ai - Din partner i karriären" />
                <meta property="og:description" content="Upptäck missionen och människorna bakom Jobbcoach.ai. Läs om hur vi använder AI för att förenkla och förbättra din jobbsökning." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://jobbcoach.ai/om-oss" />
                <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-about.png" /> {/* Uppdatera denna bild */}
                <link rel="canonical" href="https://jobbcoach.ai/om-oss" />
            </Head>

            {/* Huvudinnehåll */}
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">

                {/* === Hero Section === */}
                <section className="relative pt-24 pb-16 text-center lg:pt-32 lg:pb-20 overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950">
                    <div className="absolute inset-0 opacity-20" aria-hidden="true">
                        <div className="absolute bottom-0 left-1/4 -translate-x-1/2 translate-y-1/4 w-80 h-80 bg-purple-700 rounded-full filter blur-3xl"></div>
                        <div className="absolute top-0 right-1/4 translate-x-1/2 -translate-y-1/4 w-80 h-80 bg-pink-700 rounded-full filter blur-3xl"></div>
                    </div>
                    <div className="container relative px-4 mx-auto z-10">
                        <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-purple-400 bg-purple-900/50 rounded-full border border-purple-800">
                            Vår Vision
                        </span>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Vi hjälper dig att nå dina <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">karriärmål</span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-gray-300">
                            Jobbcoach.ai är mer än bara ett verktyg – vi är din digitala partner, dedikerade till att förenkla och förbättra din resa mot drömjobbet med hjälp av smart AI.
                        </p>
                    </div>
                </section>

                {/* === Vår Resa Section === */}
                <section id="var-resa" aria-labelledby="journey-heading" className="py-16 lg:py-24 bg-navy-950">
                    <div className="container px-4 mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Bild/Illustration (Placeholder) */}
                            <div className="relative flex justify-center items-center order-last lg:order-first">
                                <div className="absolute w-64 h-64 bg-pink-600/30 rounded-full filter blur-3xl -z-10"></div>
                                <Rocket className="w-48 h-48 lg:w-64 lg:h-64 text-pink-500 opacity-80 transform -rotate-12" strokeWidth={1.5}/>
                            </div>
                            {/* Textinnehåll */}
                            <div className="max-w-xl lg:max-w-none">
                                <h2 id="journey-heading" className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                                    Från <span className="text-gray-400 line-through">cvbrev.se</span> till Jobbcoach.ai
                                </h2>
                                <p className="mb-4 text-lg text-gray-300">
                                    Vår resa började med en enkel idé: att göra det lättare att skriva personliga brev. Med cvbrev.se hjälpte vi tusentals användare att skapa ansökningar snabbare.
                                </p>
                                <p className="mb-4 text-lg text-gray-300">
                                    Men vi insåg att jobbsökning är mer än bara ett personligt brev. Vi såg potentialen i AI att erbjuda djupare insikter och stöd genom hela processen.
                                </p>
                                <p className="mb-6 text-lg text-gray-300">
                                    Därför utvecklades vi till <strong className="text-pink-400">Jobbcoach.ai</strong> – en mer komplett digital jobbcoach som inkluderar CV-analys, insikter och fler kommande funktioner, allt drivet av specialiserad AI designad för att maximera dina chanser på arbetsmarknaden.
                                </p>
                                <Link href="/funktioner" className="inline-flex items-center font-medium text-pink-400 hover:text-pink-300 group">
                                    Utforska våra funktioner
                                    <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === Våra Värderingar Section === */}
                <section id="varderingar" aria-labelledby="values-heading" className="py-16 lg:py-24 bg-navy-900">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto mb-16 text-center">
                            <h2 id="values-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                                Vad som driver oss
                            </h2>
                            <p className="text-xl text-gray-300">
                                Våra kärnvärderingar guidar allt vi gör, från produktutveckling till kundsupport.
                            </p>
                        </div>
                        {/* Grid med värderingar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Värdering 1 */}
                            <div className="flex flex-col items-center text-center p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:border-pink-500/50 hover:shadow-lg hover:-translate-y-1">
                                <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-md flex-shrink-0">
                                    <Target className="w-7 h-7" aria-hidden="true" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">Användarfokus</h3>
                                <p className="text-sm text-gray-300">
                                    Din framgång är vår framgång. Vi bygger verktyg som är intuitiva, effektiva och verkligen hjälper dig att nå dina mål.
                                </p>
                            </div>
                            {/* Värdering 2 */}
                            <div className="flex flex-col items-center text-center p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:-translate-y-1">
                                <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md flex-shrink-0">
                                    <BrainCircuit className="w-7 h-7" aria-hidden="true" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">Smart innovation</h3>
                                <p className="text-sm text-gray-300">
                                    Vi använder kraften i AI på ett ansvarsfullt och specialiserat sätt för att ge dig konkreta fördelar och insikter.
                                </p>
                            </div>
                            {/* Värdering 3 */}
                            <div className="flex flex-col items-center text-center p-6 bg-navy-800 border border-navy-700 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1">
                                <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-md flex-shrink-0">
                                    <Heart className="w-7 h-7" aria-hidden="true" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">Tillit & Transparens</h3>
                                <p className="text-sm text-gray-300">
                                    Vi värnar om din data och är öppna med hur vår teknologi fungerar. Din integritet är högsta prioritet.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                 {/* === Meet the Team Section (Placeholder) === */}
                 {/* <section id="team" aria-labelledby="team-heading" className="py-16 lg:py-24 bg-navy-950">
                     <div className="container px-4 mx-auto">
                         <div className="max-w-3xl mx-auto mb-16 text-center">
                             <h2 id="team-heading" className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                                 Möt teamet (Valfritt)
                             </h2>
                             <p className="text-xl text-gray-300">
                                 Personerna som gör Jobbcoach.ai möjligt.
                             </p>
                         </div>
                         {/* Grid för teammedlemmar (placeholder) */}
                         {/* <div className="flex justify-center text-gray-400">
                             <p>Information om teamet kommer snart...</p>
                             <Users className="w-6 h-6 ml-2"/>
                         </div>
                     </div>
                 </section> */}

                {/* === CTA Section === */}
                <section aria-labelledby="cta-heading-omoss" className="py-16 lg:py-20 bg-gradient-to-t from-navy-950 via-navy-900 to-navy-800">
                     <div className="container px-4 mx-auto text-center">
                         <div className="max-w-2xl mx-auto">
                             <Lightbulb className="w-10 h-10 mx-auto mb-4 text-yellow-400" aria-hidden="true"/>
                             <h2 id="cta-heading-omoss" className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                 Redo att ta nästa steg i karriären?
                             </h2>
                             <p className="mb-8 text-xl text-gray-300">
                                 Utforska hur Jobbcoach.ai kan hjälpa dig. Skapa ett gratiskonto eller upptäck våra kraftfulla funktioner.
                             </p>
                             <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                     href={session ? "/dashboard" : "/register"}
                                     className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 group sm:w-auto"
                                 >
                                     {session ? "Gå till dashboard" : "Kom igång gratis"}
                                     <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                 </Link>
                                 <Link href="/funktioner" className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-gray-300 transition-colors bg-navy-800/50 border border-gray-700 rounded-lg hover:bg-navy-700/70 hover:text-white sm:w-auto">
                                     Se funktioner
                                 </Link>
                             </div>
                         </div>
                    </div>
                </section>

            </div> {/* Stänger huvudinnehålls-div */}
        </>
    );
}