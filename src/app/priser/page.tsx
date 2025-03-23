'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { 
  ChevronRight, 
  CheckCircle, 
  X, 
  CreditCard,
  Clock,
  Gift,
  Medal,
  Shield,
  Repeat
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

// Data för ROI jämförelse per plan
const roiData = [
  { 
    name: 'Gratis', 
    investering: 0, 
    värde: 500,
    fill: '#94a3b8' 
  },
  { 
    name: 'Standard', 
    investering: 99, 
    värde: 2500,
    fill: '#9333ea' 
  },
  { 
    name: 'Premium', 
    investering: 169, 
    värde: 6000,
    fill: '#ec4899' 
  },
];

// ROI graf-komponent
function ROIChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={roiData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
        <YAxis tickFormatter={(value) => `${value} kr`} tick={{ fill: '#e2e8f0' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value) => [`${value} kr`]} 
        />
        <Legend />
        <Bar dataKey="investering" name="Månadskostnad" fill="#6b7280" />
        <Bar dataKey="värde" name="Uppskattat värde" fill="#ec4899" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function PriserPage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' eller 'yearly'
  
  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true);
        
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        } catch (error) {
          console.error('Kunde inte hämta session:', error);
          setSession(null);
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Allmänt fel i getSession:', error);
        setIsLoading(false);
      }
    }
    
    getSession();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Laddar...</p>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>CVBrev priser - Prisvärda planer för att skapa personliga brev med AI</title>
        <meta name="description" content="Utforska CVBrevs prisplaner: Gratis, Standard och Premium. Skapa personliga ansökningsbrev med AI från 0 kr/månad. Obegränsade revideringar, inga bindningstider." />
        <meta name="keywords" content="CV pris, personligt brev kostnad, AI pris, ansökningsbrev tjänst, jobbansökan verktyg" />
        <meta property="og:title" content="CVBrev priser - Prisvärda planer för att skapa personliga brev med AI" />
        <meta property="og:description" content="Utforska våra olika prisplaner för att skapa personliga ansökningsbrev med AI. Börja gratis eller uppgradera för premium-funktioner." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cvbrev.se/priser" />
        <meta property="og:image" content="https://cvbrev.se/images/cvbrev-og.png" />
      </Head>

      <div className="flex flex-col min-h-screen bg-navy-950">
        {/* Hero section with gradient background */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-800/50"></div>
          
          <div className="container relative px-4 py-16 mx-auto lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Enkla och <span className="text-pink-500">transparenta</span> priser
              </h1>
              
              <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300">
                Välj den plan som passar dina behov. Börja gratis eller uppgradera för fler funktioner.
              </p>
              
              <div className="flex justify-center mb-10 mt-8 gap-3">
                <button
                  className={`px-8 py-3 text-base font-medium transition-colors rounded-md ${
                    billingPeriod === 'monthly' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-navy-800 text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Månad
                </button>
                <button
                  className={`px-8 py-3 text-base font-medium transition-colors rounded-md flex items-center ${
                    billingPeriod === 'yearly' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-navy-800 text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  År <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">Spara 20%</span>
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                <div className="relative flex justify-center p-4">
                  <img 
                    src="/cvbrev.png" 
                    alt="CVBrev AI Assistent" 
                    className="w-24 lg:w-32 animate-bounce" 
                    style={{ animationDuration: '6s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing plans */}
        <section className="py-16 -mt-10 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Free plan */}
              <div className="overflow-hidden transition-all duration-300 bg-navy-800 border border-gray-700 rounded-xl hover:border-pink-500 hover:shadow-xl hover:translate-y-[-8px]">
                <div className="p-6 lg:p-8">
                  <h2 className="mb-2 text-2xl font-bold text-white">Gratis</h2>
                  <p className="mb-6 text-gray-400">Perfekt för tillfälliga ansökningar</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">0 kr</span>
                    <span className="text-gray-400"> / månad</span>
                  </div>
                  
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">2 brev per månad</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Grundläggande anpassning</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Standard AI-generering</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 mr-3 text-gray-500 shrink-0" />
                      <span className="text-gray-500">Obegränsade brev</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 mr-3 text-gray-500 shrink-0" />
                      <span className="text-gray-500">Flera tonaliteter</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 mr-3 text-gray-500 shrink-0" />
                      <span className="text-gray-500">Avancerade funktioner</span>
                    </li>
                  </ul>
                  
                  <Link 
                    href="/register"
                    className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                  >
                    Kom igång gratis
                  </Link>
                </div>
              </div>
              
              {/* Standard plan */}
              <div className="overflow-hidden transition-all duration-300 bg-navy-800 border border-gray-700 rounded-xl hover:border-pink-500 hover:shadow-xl hover:translate-y-[-8px]">              
                <div className="p-6 lg:p-8">
                  <h2 className="mb-2 text-2xl font-bold text-white">Standard</h2>
                  <p className="mb-6 text-gray-400">För aktiva jobbsökande</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{billingPeriod === 'monthly' ? '99 kr' : '79 kr'}</span>
                    <span className="text-gray-400"> / månad</span>
                    {billingPeriod === 'yearly' && <p className="text-sm text-gray-400 mt-1">Faktureras årligen som {79 * 12} kr</p>}
                  </div>
                  
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Obegränsade brev</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Flera tonaliteter</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Spara mallar</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Avancerad AI-generering</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 mr-3 text-gray-500 shrink-0" />
                      <span className="text-gray-500">Premium AI-modell</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 mr-3 text-gray-500 shrink-0" />
                      <span className="text-gray-500">Prioriterad support</span>
                    </li>
                  </ul>
                  
                  <Link 
                    href={`/register?plan=standard&billing=${billingPeriod}`}
                    className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                  >
                    Välj Standard
                  </Link>
                </div>
              </div>
              
              {/* Premium plan */}
              <div className="relative overflow-hidden transition-all duration-300 bg-navy-800 border-2 border-pink-500 rounded-xl hover:shadow-xl hover:translate-y-[-8px]">
                <div className="w-full bg-pink-600 py-2 flex items-center justify-center text-white font-semibold">
                  POPULÄRASTE
                </div>
                
                <div className="p-6 lg:p-8">
                  <h2 className="mb-2 text-2xl font-bold text-white">Premium</h2>
                  <p className="mb-6 text-gray-400">För professionella jobbsökande</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{billingPeriod === 'monthly' ? '169 kr' : '135 kr'}</span>
                    <span className="text-gray-400"> / månad</span>
                    {billingPeriod === 'yearly' && <p className="text-sm text-gray-400 mt-1">Faktureras årligen som {135 * 12} kr</p>}
                  </div>
                  
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Allt i Standard</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Prioriterad support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Premium AI-modell</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">CV-feedback</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Intervjutipsgenererare</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Obegränsad användning</span>
                    </li>
                  </ul>
                  
                  <Link 
                    href={`/register?plan=premium&billing=${billingPeriod}`}
                    className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                  >
                    Välj Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ROI section */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Investeringen som lönar sig
              </h2>
              <p className="text-xl text-gray-300">
                Med rätt personligt brev ökar dina chanser att få jobbet dramatiskt – en smart investering i din karriär.
              </p>
            </div>
            
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h3 className="mb-6 text-2xl font-bold text-white">Värdet av ett professionellt personligt brev</h3>
                <p className="mb-8 text-gray-300">
                  Ett välskrivet personligt brev kan vara skillnaden mellan att få drömjobbet eller bli bortsorterad. 
                  Våra beräkningar visar att det potentiella värdet av att använda CVBrev överstiger kostnaden många gånger om.
                </p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">60x avkastning</span> på investeringen med våra premiumplaner</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">Spara över 10 timmar</span> per månad på att skriva personliga brev</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">2.6x högre intervjufrekvens</span> jämfört med standardansökningar</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 bg-navy-800 rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-white">Kostnad vs. Värde</h3>
                <div className="relative h-80">
                  <ROIChart />
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Beräknat utifrån genomsnittliga fördelar baserat på användardata</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Additional benefits */}
        <section className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Alla planer inkluderar
              </h2>
              <p className="text-xl text-gray-300">
                Oavsett vilken plan du väljer får du tillgång till dessa grundläggande fördelar.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 transition-all duration-300 bg-navy-800 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Ingen bindningstid</h3>
                </div>
                <p className="text-gray-300">
                  Avsluta prenumerationen när som helst utan extra kostnader eller krångel.
                </p>
              </div>
              
              <div className="p-6 transition-all duration-300 bg-navy-800 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                    <Repeat className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Obegränsade revideringar</h3>
                </div>
                <p className="text-gray-300">
                  Justera dina genererade brev så många gånger du behöver tills du är helt nöjd.
                </p>
              </div>
              
              <div className="p-6 transition-all duration-300 bg-navy-800 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">100% datasäkerhet</h3>
                </div>
                <p className="text-gray-300">
                  Dina personuppgifter och dokument lagras säkert och delas aldrig med tredje part.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Vanliga frågor om priser
              </h2>
              <p className="text-xl text-gray-300">
                Hitta svar på frågor om betalning, uppgradering och avbokning.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Kan jag uppgradera eller nedgradera min plan?</h3>
                  <p className="text-gray-300">
                    Ja, du kan enkelt byta mellan olika planer när som helst från ditt kontolläge. Uppgraderingar träder i kraft omedelbart, medan nedgraderingar börjar gälla vid nästa betalningsperiod.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Vilka betalningsmetoder accepterar ni?</h3>
                  <p className="text-gray-300">
                    Vi accepterar alla större kreditkort inklusive Visa, Mastercard och American Express. Du kan också betala via Swish eller direktbetalning från ditt bankkonto.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Får jag tillgång till framtida uppdateringar?</h3>
                  <p className="text-gray-300">
                    Absolut! När du prenumererar på någon av våra planer får du automatiskt tillgång till alla nya funktioner och förbättringar som tillkommer inom din plansnivå.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur avbryter jag min prenumeration?</h3>
                  <p className="text-gray-300">
                    Du kan när som helst avbryta din prenumeration via kontolläget. Efter att du avbrutit kommer din plan att fortsätta vara aktiv till slutet av den aktuella faktureringsperioden, sedan återgår ditt konto till gratisplanen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Redo att förbättra dina jobbansökningar?
            </h2>
            
            <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
              Börja med vår gratis plan för att se hur CVBrev kan hjälpa dig att få drömjobbet.
            </p>
            
            <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
              <Link 
                href={session ? "/create-letter" : "/register"}
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-600 transition-colors bg-white rounded-md shadow-lg hover:bg-gray-100 group"
              >
                {session ? "Skapa brev nu" : "Kom igång gratis"}
                <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              
              {!session && (
                <Link 
                  href="/register?plan=premium"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-colors border-2 border-white rounded-md hover:bg-white hover:bg-opacity-10"
                >
                  Välj Premium
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}