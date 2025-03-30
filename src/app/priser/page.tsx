// src/app/priser/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import {
  ChevronRight,
  CheckCircle,
  Lock, // För låsta funktioner (Gratis)
  Zap, // För obegränsat/premium & fördelar
  Save, // För sparade brev
  Upload, // För CV-uppladdning
  Lightbulb, // För tonalitet & fördelar
  Gift, // För allmänna förmåner (ingen bindningstid)
  Repeat, // För allmänna förmåner (revisioner)
  Shield, // För allmänna förmåner (datasäkerhet)
  Target, // För fördelar (matchning)
  BrainCircuit, // För fördelar (vetenskap)
  MessageSquare, // För gratisplanens gräns
  Bot, // För AI-val tonalitet & fördelar
  X, // För FAQ eller ej inkluderat (om det skulle behövas)
  CreditCard // För FAQ betalning
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
// *** NY IMPORT: Importera din prenumerationsknapp ***
import { SubscribeButton } from '@/components/subscription/SubscribeButton'; 

// === Data för LINJEdiagram (från startsidan) ===
const timelineData = [
  { name: 'Dag 1', standardAnsökan: 20, cvBrevAnsökan: 45 },
  { name: 'Dag 3', standardAnsökan: 25, cvBrevAnsökan: 62 },
  { name: 'Dag 7', standardAnsökan: 30, cvBrevAnsökan: 75 },
  { name: 'Dag 14', standardAnsökan: 32, cvBrevAnsökan: 85 },
  { name: 'Dag 30', standardAnsökan: 35, cvBrevAnsökan: 92 },
];

// === Graf-komponent: LINJEdiagram (från startsidan) ===
function CVBrevTimelineChart() {
  // (Behåll grafkomponenten som den är)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#e2e8f0' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value, name) => [`${value}%`, name === 'standardAnsökan' ? 'Standard ansökningar' : 'cvbrev.se ansökningar']}
        />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        <Line type="monotone" dataKey="standardAnsökan" name="Standard ansökningar" stroke="#94a3b8" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="cvBrevAnsökan" name="cvbrev.se ansökningar" stroke="#ec4899" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}


export default function PriserPage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' eller 'yearly'

  // *** NYA KONSTANTER: Dina Stripe Price IDs ***
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU"; // MÅNADS-ID
  const premiumYearlyPriceId = "price_1R7ezXAB6xHzwmWvDGpuLw2m";   // ÅRS-ID
  // *****************************************

  // --- Priser (Oförändrat) ---
  const premiumMonthlyPrice = 149;
  const premiumYearlyPriceMonthly = Math.round(premiumMonthlyPrice * 0.8); // 20% rabatt
  const premiumYearlyPriceTotal = premiumYearlyPriceMonthly * 12;

  // --- useEffect för att hämta session (Oförändrat) ---
  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true);
        // Använder dynamisk import här, ok
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

  // --- Laddningsindikator (Oförändrat) ---
  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Laddar...</p>
      </div>
    );
  }

  // --- JSX Render (Resten är oförändrat förutom knappen i Premium-kortet) ---
  return (
    <>
      <Head>
        {/* SEO Meta Tags (Oförändrat) */}
        <title>Priser | cvbrev.se - AI-drivna Personliga Brev som Ger Resultat</title>
        <meta name="description" content="Utforska prisplanerna för cvbrev.se. Välj mellan Gratis för att testa eller Premium för obegränsad tillgång till AI-genererade, skräddarsydda personliga brev. Öka dina jobbchanser idag!" />
        <meta name="keywords" content="priser personligt brev, kostnad AI brev, cvbrev priser, premium personligt brev, gratis personligt brev AI, jobbansökan verktyg pris" />
        <meta property="og:title" content="Priser | cvbrev.se - AI-drivna Personliga Brev som Ger Resultat" />
        <meta property="og:description" content="Se våra prisplaner och välj det alternativ som bäst passar ditt jobbsökande. Skapa imponerande personliga brev med AI." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cvbrev.se/priser" />
        <meta property="og:image" content="https://cvbrev.se/images/cvbrev-og-pricing.png" />
        <link rel="canonical" href="https://cvbrev.se/priser" />
      </Head>

      <div className="flex flex-col min-h-screen bg-navy-950 text-white">
        {/* Hero section (Oförändrat) */}
        <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-20 bg-gradient-to-b from-navy-900 to-navy-950">
          <div className="container relative px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Välj din väg till <span className="text-pink-500">nästa jobb</span>
              </h1>
              <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300">
                Starta gratis eller lås upp obegränsad AI-kraft med Premium för att skapa personliga brev som sticker ut.
              </p>
              {/* Månad/År Toggle (Oförändrat) */}
              <div className="flex justify-center mb-10 gap-3">
                <button
                  className={`px-6 py-2.5 text-sm font-medium transition-colors rounded-md ${ 
                    billingPeriod === 'monthly'
                      ? 'bg-pink-600 text-white'
                      : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                  }`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Månadsvis
                </button>
                <button
                  className={`px-6 py-2.5 text-sm font-medium transition-colors rounded-md flex items-center ${ 
                    billingPeriod === 'yearly'
                      ? 'bg-pink-600 text-white'
                      : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                  }`}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  Årsvis <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">Spara 20%</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* === PRICING PLANS (Oförändrat FÖRUTOM KNAPPEN I PREMIUM) === */}
        <section className="py-16 lg:py-20 bg-navy-950">
          <div className="container px-4 mx-auto">
            <div className="grid max-w-4xl gap-8 mx-auto lg:grid-cols-2">
              {/* Free plan (Oförändrat) */}
              <div className="flex flex-col overflow-hidden bg-navy-800 border border-gray-700 rounded-xl transition-shadow hover:shadow-xl hover:shadow-gray-700/10">
                <div className="p-8 flex-grow">
                  <h3 className="mb-2 text-2xl font-semibold text-white">Gratis</h3>
                  <p className="mb-6 text-gray-400">Testa vår AI-assistent</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">0 kr</span>
                  </div>
                  <p className="mb-6 text-gray-300 text-sm">Perfekt för att komma igång och skriva dina första AI-genererade brev.</p>
                  <ul className="mb-8 space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span><span className="font-medium text-white">5</span> Brevgenereringar / vecka</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span><span className="font-medium text-white">2</span> Sparade brev</span>
                    </li>
                     <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span><span className="font-medium text-white">1</span> CV-uppladdning</span>
                    </li>
                     <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span>Standard tonalitetsval</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-5 h-5 mr-3 mt-0.5 text-gray-500 shrink-0" />
                      <span className="text-gray-500">AI-optimerad tonalitet</span>
                    </li>
                  </ul>
                </div>
                <div className="p-8 pt-0">
                  <Link
                    href="/register"
                    className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
                  >
                    Kom igång gratis <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* Premium plan */}
              <div className="relative flex flex-col overflow-hidden bg-navy-800 border-2 border-pink-500 rounded-xl transition-shadow hover:shadow-xl hover:shadow-pink-500/10">
                {/* Premium Badge (Oförändrat) */}
                <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase bg-pink-600 rounded-bl-lg">
                  Premium
                </div>
                {/* Innehåll (Oförändrat) */}
                <div className="p-8 flex-grow">
                  <h3 className="mb-2 text-2xl font-semibold text-pink-400">Premium</h3>
                  <p className="mb-6 text-gray-400">Obegränsad AI-kraft</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {billingPeriod === 'monthly' ? `${premiumMonthlyPrice} kr` : `${premiumYearlyPriceMonthly} kr`}
                    </span>
                    <span className="text-gray-400"> / månad</span>
                    {billingPeriod === 'yearly' && <p className="text-sm text-gray-400 mt-1">Faktureras årligen som {premiumYearlyPriceTotal} kr</p>}
                  </div>
                   <p className="mb-6 text-gray-300 text-sm">För dig som aktivt söker jobb och vill maximera dina chanser med alla verktyg.</p>
                  <ul className="mb-8 space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span><span className="font-medium text-white">Obegränsad</span> brevgenerering</span>
                    </li>
                     <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span><span className="font-medium text-white">Obegränsade</span> sparade brev</span>
                    </li>
                     <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span><span className="font-medium text-white">Obegränsade</span> CV-uppladdningar</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span>AI-optimerad tonalitet <Bot className="inline w-4 h-4 ml-1 text-purple-400"/></span>
                    </li>
                     <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-pink-400 shrink-0" />
                      <span>Alla tonalitetsval</span>
                    </li>
                     {/* Supportkommentar (Oförändrat) */}
                     {/* <li className="flex items-start">
                       <CheckCircle className="w-5 h-5 mr-3 text-pink-400 shrink-0" />
                       <span>Prioriterad support</span>
                     </li> */}
                  </ul>
                </div>

                {/* *** HÄR ÄR ÄNDRINGEN *** */}
                <div className="p-8 pt-0">
                  {session ? (
                    // ANVÄNDAREN ÄR INLOGGAD: Visa SubscribeButton
                    <SubscribeButton
                      // Välj rätt Price ID baserat på vald period
                      priceId={billingPeriod === 'monthly' ? premiumMonthlyPriceId : premiumYearlyPriceId}
                      // Visa rätt namn på knappen
                      planName={billingPeriod === 'monthly' ? 'Månad' : 'År'}
                      // Lägger till samma klasser som Link hade för konsekvent utseende (valfritt)
                      // className="w-full" // SubscribeButton har redan w-full internt, men du kan lägga till mer här
                      // disabled={false} // Lägg till logik här om användaren redan har premium?
                    />
                  ) : (
                    // ANVÄNDAREN ÄR INTE INLOGGAD: Visa den gamla länken till registrering
                    <Link
                      href={`/register?plan=premium&billing=${billingPeriod}`}
                      className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                    >
                      Välj Premium <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>
                {/* *** SLUT PÅ ÄNDRINGEN *** */}

              </div> {/* Slut på Premium-kortet */}
            </div> {/* Slut på grid */}
          </div> {/* Slut på container */}
        </section>

        {/* === Övriga sektioner (Oförändrat) === */}
        {/* VARFÖR ETT BRA BREV? + AI FÖRDELAR */}
        <section className="py-16 lg:py-24 bg-navy-900">
          {/* ... innehåll oförändrat ... */}
             <div className="container px-4 mx-auto">
                <div className="grid lg:grid-cols-2 lg:gap-16 items-center">
                  {/* Vänster kolumn: Text */}
                  <div>
                    <h2 className="text-3xl font-bold mb-6 leading-tight sm:text-4xl">Varför ett <span className="text-pink-400">skräddarsytt</span> personligt brev spelar roll</h2>
                    <p className="text-lg text-gray-300 mb-8">
                      I dagens konkurrensutsatta arbetsmarknad är ett generiskt brev sällan tillräckligt. Ett personligt brev är din chans att visa <span className="text-white font-medium">initiativ</span>, <span className="text-white font-medium">förståelse</span> för rollen och <span className="text-white font-medium">motivation</span>. Det handlar om att:
                    </p>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-400 shrink-0" />
                        <span className="text-gray-200">Koppla din unika profil till arbetsgivarens behov.</span>
                      </li>
                       <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-400 shrink-0" />
                        <span className="text-gray-200">Berätta en övertygande historia om dina prestationer.</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-400 shrink-0" />
                        <span className="text-gray-200">Kommunicera professionellt med rätt tonalitet.</span>
                      </li>
                    </ul>
                     <p className="text-sm text-gray-400">
                      Insikter från <span className="font-medium text-gray-300">Harvard</span>, <span className="font-medium text-gray-300">Stanford</span> och rekryteringsproffs visar att detta markant ökar dina chanser att nå intervjusteget.
                    </p>
                  </div>

                  {/* Höger kolumn: AI Fördelar */}
                  <div className="mt-12 lg:mt-0 p-8 bg-navy-800 border border-gray-700 rounded-xl">
                     <h3 className="text-2xl font-semibold mb-6 text-white">Så hjälper vår AI dig att lyckas:</h3>
                     <ul className="space-y-5">
                        <li className="flex items-start">
                          <Target className="w-6 h-6 mr-4 text-blue-400 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Perfekt matchning</h4>
                            <p className="text-gray-300 text-sm">Analyserar ditt CV och annonsen för maximal relevans.</p>
                          </div>
                        </li>
                         <li className="flex items-start">
                          <BrainCircuit className="w-6 h-6 mr-4 text-purple-400 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Vetenskapligt grundad</h4>
                            <p className="text-gray-300 text-sm">Bygger på beprövade metoder för att fånga intresse.</p>
                          </div>
                        </li>
                         <li className="flex items-start">
                          <Zap className="w-6 h-6 mr-4 text-pink-400 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Snabbt & effektivt</h4>
                            <p className="text-gray-300 text-sm">Frigör tid från skrivkramp till intervjufokus.</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Bot className="w-6 h-6 mr-4 text-yellow-400 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Optimerad för resultat</h4>
                            <p className="text-gray-300 text-sm">Vår specialiserade AI överträffar generiska verktyg.</p>
                          </div>
                        </li>
                     </ul>
                  </div>
                </div>
              </div>
        </section>

        {/* RESULTAT MED GRAF */}
        <section className="py-16 lg:py-24 bg-navy-950">
           {/* ... innehåll oförändrat ... */}
           <div className="container px-4 mx-auto">
             <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl mb-6">
                Resultat som talar för sig själva
              </h2>
              <p className="text-xl text-gray-300">
                Se hur ett AI-optimerat, skräddarsytt personligt brev kan öka din svarsfrekvens jämfört med standardmetoder.
              </p>
            </div>

            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Graf */}
              <div className="p-6 bg-navy-800 rounded-xl border border-gray-700">
                <h3 className="mb-4 text-xl font-semibold text-white text-center">Ökad svarsfrekvens över tid</h3>
                <div className="relative h-80">
                  <CVBrevTimelineChart />
                </div>
                <p className="mt-3 text-xs text-gray-400 text-center">Baserat på aggregerad anonymiserad användardata.</p>
              </div>

              {/* Fördelar/Bevis */}
              <div className="space-y-6">
                 <h3 className="text-2xl font-semibold text-white">Bevisad effektivitet:</h3>
                 <div className="flex items-start p-4 bg-navy-800 rounded-lg border border-gray-700">
                   <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-pink-600 rounded-full text-white font-bold text-lg">
                     <Zap className="w-5 h-5"/>
                   </div>
                   <div>
                     <p className="font-semibold text-white">Snabbare svar</p>
                     <p className="text-gray-300 text-sm">Användare rapporterar markant högre svarsfrekvens inom de första veckorna.</p>
                   </div>
                 </div>
                 <div className="flex items-start p-4 bg-navy-800 rounded-lg border border-gray-700">
                   <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-purple-600 rounded-full text-white font-bold text-lg">
                     <Target className="w-5 h-5"/>
                   </div>
                   <div>
                     <p className="font-semibold text-white">Fler intervjuer</p>
                     <p className="text-gray-300 text-sm">Över 2.5x högre chans att kallas till intervju jämfört med standardansökningar.</p>
                   </div>
                 </div>
                 <div className="flex items-start p-4 bg-navy-800 rounded-lg border border-gray-700">
                   <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-blue-600 rounded-full text-white font-bold text-lg">
                     <BrainCircuit className="w-5 h-5"/>
                   </div>
                   <div>
                     <p className="font-semibold text-white">Smartare ansökningsprocess</p>
                     <p className="text-gray-300 text-sm">Vår AI hjälper dig fokusera på rätt saker för att maximera dina chanser.</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ALLTID INKLUDERAT */}
        <section className="py-16 lg:py-24 bg-navy-900">
          {/* ... innehåll oförändrat ... */}
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Trygghet & flexibilitet ingår
              </h2>
              <p className="text-xl text-gray-300">
                Oavsett plan får du alltid dessa fördelar hos oss.
              </p>
            </div>
            {/* Grid med 3 kolumner */}
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="text-center px-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Ingen bindningstid</h3>
                <p className="text-gray-300 text-sm">Avsluta Premium när du vill, utan krångel.</p>
              </div>
              <div className="text-center px-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                  <Repeat className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Obegränsade revisioner</h3>
                <p className="text-gray-300 text-sm">Justera dina AI-brev tills de är perfekta.</p>
              </div>
              <div className="text-center px-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Datasäkerhet</h3>
                <p className="text-gray-300 text-sm">Dina uppgifter är skyddade och delas aldrig.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-24 bg-navy-950">
           {/* ... innehåll oförändrat ... */}
            <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Vanliga frågor
              </h2>
               <p className="text-xl text-gray-300">
                Svar på funderingar kring våra planer och betalning.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
               {/* FAQ Items - lite renare styling */}
              <details className="p-6 bg-navy-800 rounded-lg border border-gray-700 group cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white list-none">
                      Kan jag uppgradera eller nedgradera min plan?
                      <ChevronRight className="w-5 h-5 transition-transform duration-200 rotate-0 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-gray-300 text-sm">
                      Ja, du kan enkelt byta mellan Gratis och Premium när som helst från din profilsida. Uppgraderingar till Premium träder i kraft direkt. Nedgraderingar till Gratis gäller från nästa förnyelsedatum.
                  </p>
              </details>
              <details className="p-6 bg-navy-800 rounded-lg border border-gray-700 group cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white list-none">
                      Vilka betalningsmetoder accepteras för Premium?
                       <ChevronRight className="w-5 h-5 transition-transform duration-200 rotate-0 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-gray-300 text-sm">
                      Vi accepterar alla större kreditkort (Visa, Mastercard, American Express) via vår säkra betalpartner Stripe.
                  </p>
              </details>
               <details className="p-6 bg-navy-800 rounded-lg border border-gray-700 group cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white list-none">
                      Vad händer om jag väljer årsbetalning?
                       <ChevronRight className="w-5 h-5 transition-transform duration-200 rotate-0 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-gray-300 text-sm">
                    Du betalar för 12 månader i förskott och får 20% rabatt jämfört med månadspriset. Prenumerationen gäller i ett år från betalningsdatumet och förnyas automatiskt om du inte säger upp den innan periodens slut.
                  </p>
              </details>
               <details className="p-6 bg-navy-800 rounded-lg border border-gray-700 group cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white list-none">
                      Hur avbryter jag min Premium-prenumeration?
                       <ChevronRight className="w-5 h-5 transition-transform duration-200 rotate-0 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-gray-300 text-sm">
                    Du kan när som helst avbryta din prenumeration via din profilsida under "Prenumeration". Din Premium-åtkomst fortsätter till slutet av den aktuella faktureringsperioden, därefter återgår ditt konto automatiskt till Gratis-planen.
                  </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-20 bg-gradient-to-r from-pink-600 to-purple-600">
          {/* ... innehåll oförändrat ... */}
           <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Redo att skapa brev som imponerar?
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
              Starta gratis och upplev skillnaden, eller gå direkt till Premium för full AI-potential.
            </p>
            <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
              <Link
                href={session ? "/create-letter" : "/register"}
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-pink-600 transition-colors bg-white rounded-md shadow-lg hover:bg-gray-100 group"
              >
                {session ? "Skapa Brev Nu" : "Testa Gratis"}
                <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              {!session && (
                <Link
                  href="/register?plan=premium"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-colors border-2 border-white rounded-md hover:bg-white hover:bg-opacity-10"
                >
                  Välj Premium Direkt
                </Link>
              )}
            </div>
          </div>
        </section>
      </div> {/* Slut på yttre div */}
    </>
  );
}