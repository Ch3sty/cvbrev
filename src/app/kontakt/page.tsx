/**
 * Fil: src/app/kontakt/page.tsx
 *
 * Beskrivning:
 * Kontaktsidan för Jobbcoach.ai. Innehåller kontaktinformation
 * (med specifik e-post för info och support) samt ett formulär
 * för att skicka meddelanden.
 */
'use client'

// --- Core Imports ---
import { useState, useEffect, FormEvent } from 'react'
import Head from 'next/head'
import Link from 'next/link'

// --- Icon Imports (Lucide React) ---
import { Mail, Send, CheckCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react' // Lade till HelpCircle för support

// --- Main Page Component: KontaktPage ---

export default function KontaktPage() {
    // State för formulärdata, skickstatus och laddning
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // --- Funktioner ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        // --- TODO: Implementera faktisk API-anrop för att skicka formuläret ---
        try {
            console.log("Skickar formulär:", formData);
            // Simulera API-anrop
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Enkel validering
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                 throw new Error("Alla fält måste fyllas i.");
            }

            // -- HÄR SKICKAS DATAN TILL DIN BACKEND --
            // const response = await fetch('/api/contact', { method: 'POST', ... });
            // if (!response.ok) throw new Error('Något gick fel.');

            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Rensa formulär
        } catch (error: any) {
            console.error("Fel vid skickande:", error);
            setSubmitStatus('error');
            setErrorMessage(error.message || 'Ett oväntat fel inträffade. Försök igen senare.');
        } finally {
            setIsSubmitting(false);
        }
        // --- Slut på TODO ---
    };

    // State och useEffect för laddning (förenklad, ingen session behövs här)
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Laddningsvy
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
                 <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" aria-label="Laddar innehåll"></div>
                 <p className="mt-4 text-white">Laddar kontakt...</p>
             </div>
         );
    }


    return (
        <>
            {/* SEO och Metadata */}
            <Head>
                <title>Kontakt | Jobbcoach.ai - Vi finns här för dig</title>
                <meta name="description" content="Kontakta Jobbcoach.ai för frågor om tjänsten (info@) eller abonnemang (support@). Använd vårt formulär eller hitta rätt e-postadress. Vi hjälper dig gärna!"/>
                <meta name="keywords" content="kontakt jobbcoach.ai, support jobbcoach, hjälp AI jobbansökan, kontakta oss, feedback jobbcoach, info@jobbcoach.ai, support@jobbcoach.ai, abonnemang frågor"/>
                <meta property="og:title" content="Kontakt | Jobbcoach.ai - Vi finns här för dig" />
                <meta property="og:description" content="Har du frågor om tjänsten eller ditt abonnemang hos Jobbcoach.ai? Kontakta oss enkelt via formulär eller rätt e-postadress." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://jobbcoach.ai/kontakt" />
                <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-contact.png" /> {/* Uppdatera denna bild */}
                <link rel="canonical" href="https://jobbcoach.ai/kontakt" />
            </Head>

            {/* Huvudinnehåll */}
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">

                {/* === Hero Section === */}
                <section className="relative pt-24 pb-16 text-center lg:pt-32 lg:pb-20 overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950">
                     <div className="absolute inset-0 opacity-20" aria-hidden="true">
                        <div className="absolute top-1/2 left-0 -translate-x-1/3 -translate-y-1/2 w-80 h-80 bg-blue-700 rounded-full filter blur-3xl"></div>
                        <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-80 h-80 bg-teal-700 rounded-full filter blur-3xl"></div>
                    </div>
                    <div className="container relative px-4 mx-auto z-10">
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Kontakta <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">oss</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-300">
                            Har du frågor, funderingar eller feedback? Välj rätt kontaktväg nedan eller använd formuläret för allmänna ärenden.
                        </p>
                    </div>
                </section>

                {/* === Kontaktformulär & Info Section === */}
                <section id="kontakt-form" aria-labelledby="contact-form-heading" className="py-16 lg:py-24 bg-navy-950">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-3xl mx-auto">
                             <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                                 {/* Kolumn 1: Formulär */}
                                 <div className="md:col-span-1">
                                     <h2 id="contact-form-heading" className="text-2xl font-semibold text-white mb-6">Skicka ett allmänt meddelande</h2>
                                     <form onSubmit={handleSubmit} className="space-y-5">
                                         {/* Namn, E-post, Ämne, Meddelande (Inga ändringar här) */}
                                         <div>
                                             <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Namn</label>
                                             <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-navy-800 border border-navy-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200" placeholder="Ditt namn" />
                                         </div>
                                         <div>
                                             <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-postadress</label>
                                             <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 bg-navy-800 border border-navy-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200" placeholder="din.email@example.com" />
                                         </div>
                                         <div>
                                             <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Ämne</label>
                                             <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2 bg-navy-800 border border-navy-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200" placeholder="Vad gäller ditt ärende?" />
                                         </div>
                                         <div>
                                             <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Meddelande</label>
                                             <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleInputChange} className="w-full px-4 py-2 bg-navy-800 border border-navy-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200" placeholder="Skriv ditt meddelande här..."></textarea>
                                         </div>
                                         {/* Skicka-knapp & Status (Inga ändringar här) */}
                                         <div>
                                              <button type="submit" disabled={isSubmitting} className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white rounded-lg shadow-md transition-all duration-300 group ${ isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 hover:shadow-lg' }`}>
                                                 {isSubmitting ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Skickar...</> ) : ( <>Skicka meddelande<Send className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></> )}
                                             </button>
                                             {submitStatus === 'success' && ( <div className="mt-4 flex items-center p-3 bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm"><CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" /><span>Tack! Vi återkommer så snart som möjligt.</span></div> )}
                                             {submitStatus === 'error' && ( <div className="mt-4 flex items-center p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm"><AlertTriangle className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" /><span>{errorMessage || 'Kunde inte skicka meddelandet. Försök igen.'}</span></div> )}
                                         </div>
                                     </form>
                                 </div>

                                 {/* Kolumn 2: Specifik Kontaktinfo & FAQ */}
                                 <div className="md:col-span-1 mt-8 md:mt-0">
                                     <h3 className="text-2xl font-semibold text-white mb-6">Specifika ärenden</h3>

                                     {/* Info-mail */}
                                     <div className="p-6 bg-navy-800 border border-navy-700 rounded-lg mb-6">
                                         <div className="flex items-center mb-3">
                                             <Info className="w-6 h-6 mr-3 text-pink-400 flex-shrink-0" />
                                             <h4 className="text-lg font-medium text-white">Frågor om tjänsten?</h4>
                                         </div>
                                         <p className="text-gray-300 mb-1 text-sm">För allmänna frågor om hur Jobbcoach.ai fungerar, våra funktioner, feedback eller andra icke-supportrelaterade ärenden:</p>
                                         <a href="mailto:info@jobbcoach.ai" className="text-pink-400 hover:text-pink-300 break-all">
                                             info@jobbcoach.ai
                                         </a>
                                     </div>

                                     {/* Support-mail */}
                                     <div className="p-6 bg-navy-800 border border-navy-700 rounded-lg mb-8">
                                         <div className="flex items-center mb-3">
                                             <HelpCircle className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0" />
                                             <h4 className="text-lg font-medium text-white">Frågor om abonnemang?</h4>
                                         </div>
                                         <p className="text-gray-300 mb-1 text-sm">För frågor gällande ditt konto, betalning, Premium-prenumeration, uppsägning eller teknisk support:</p>
                                         <a href="mailto:support@jobbcoach.ai" className="text-purple-400 hover:text-purple-300 break-all">
                                             support@jobbcoach.ai
                                         </a>
                                         <p className="text-xs text-gray-400 mt-3">(Premium-användare har prioriterad hantering via denna adress).</p>
                                     </div>

                                     {/* FAQ-länk */}
                                     <h3 className="text-2xl font-semibold text-white mb-6">Snabba svar</h3>
                                     <div className="p-6 bg-navy-800 border border-navy-700 rounded-lg">
                                         <div className="flex items-center mb-3">
                                             <Info className="w-6 h-6 mr-3 text-teal-400 flex-shrink-0" /> {/* Bytte färg för variation */}
                                             <h4 className="text-lg font-medium text-white">Vanliga frågor (FAQ)</h4>
                                         </div>
                                         <p className="text-gray-300 mb-4 text-sm">
                                             Många svar, särskilt kring funktioner och planer, hittar du direkt i vår FAQ. Kika gärna där först!
                                         </p>
                                         <Link href="/#faq" className="inline-flex items-center font-medium text-teal-400 hover:text-teal-300 group">
                                              Gå till FAQ
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                         </Link>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </section>

            </div> {/* Stänger huvudinnehålls-div */}
        </>
    );
}