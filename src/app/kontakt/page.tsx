/**
 * Fil: src/app/kontakt/page.tsx
 *
 * Beskrivning:
 * Kontaktsidan för Jobbcoach.ai. Mobilanpassad och med ljust tema.
 * Innehåller kontaktinformation och formulär för meddelanden.
 */
'use client'

// --- Core Imports ---
import { useState, useEffect, FormEvent } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'

// --- Icon Imports (Lucide React) ---
import { Mail, Send, CheckCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react'

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
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">

            {/* === Hero Section === */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 text-center overflow-hidden bg-gradient-to-b from-white to-slate-50/50">
                {/* Animated gradient orbs - matchar startsidan */}
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                />

                <div className="container relative px-4 sm:px-6 lg:px-8 mx-auto z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Rubrik - mobil-anpassad */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
                            <span className="hidden sm:inline">Vi svarar på dina frågor</span>
                            <span className="sm:hidden">Kontakta oss</span>
                        </h1>

                        {/* Ingress - responsiv */}
                        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed">
                            <span className="hidden sm:block">
                                Välj rätt e-postadress nedan eller skicka ett meddelande via formuläret.
                            </span>
                            <span className="sm:hidden">
                                Skicka ett meddelande eller välj rätt e-post nedan.
                            </span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* === Kontaktformulär & Info Section === */}
            <section id="kontakt-form" aria-labelledby="contact-form-heading" className="py-12 sm:py-16 lg:py-24">
                <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16">

                            {/* Kolumn 1: Formulär */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="md:col-span-1"
                            >
                                <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-900/5">
                                    <h2 id="contact-form-heading" className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                                        Skicka ett meddelande
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                                        {/* Namn */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                                Ditt namn
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                placeholder="För- och efternamn"
                                            />
                                        </div>

                                        {/* E-post */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                                Din e-post
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                placeholder="namn@exempel.se"
                                            />
                                        </div>

                                        {/* Ämne */}
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                                                Vad gäller ditt ärende?
                                            </label>
                                            <input
                                                type="text"
                                                name="subject"
                                                id="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                placeholder="T.ex. 'Fråga om Premium'"
                                            />
                                        </div>

                                        {/* Meddelande */}
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                                Ditt meddelande
                                            </label>
                                            <textarea
                                                name="message"
                                                id="message"
                                                rows={5}
                                                required
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                                placeholder="Berätta hur vi kan hjälpa dig..."
                                            />
                                        </div>

                                        {/* Skicka-knapp - Touch-optimerad (minst 44x44px) */}
                                        <div>
                                            <motion.button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`w-full px-6 py-4 text-base font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center touch-manipulation ${
                                                    isSubmitting
                                                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/25'
                                                }`}
                                                whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                                                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Skickar...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Skicka
                                                        <Send className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </motion.button>

                                            {/* Success meddelande */}
                                            {submitStatus === 'success' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 flex items-start p-4 bg-green-50 border border-green-200 rounded-lg"
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-green-900 text-sm">Tack för ditt meddelande!</p>
                                                        <p className="text-green-700 text-sm mt-1">Vi svarar inom 24 timmar.</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Error meddelande */}
                                            {submitStatus === 'error' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 flex items-start p-4 bg-red-50 border border-red-200 rounded-lg"
                                                >
                                                    <AlertTriangle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-red-900 text-sm">Något gick fel</p>
                                                        <p className="text-red-700 text-sm mt-1">
                                                            {errorMessage || 'Försök igen eller maila oss direkt.'}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </motion.div>

                            {/* Kolumn 2: Specifik Kontaktinfo */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="md:col-span-1 mt-8 md:mt-0 space-y-6"
                            >
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                                    Specifika ärenden
                                </h3>

                                {/* Info-mail */}
                                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <Info className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="ml-4 text-lg font-semibold text-slate-900">Allmänna frågor</h4>
                                    </div>
                                    <p className="text-slate-600 mb-3 text-sm leading-relaxed">
                                        Frågor om funktioner, samarbeten eller feedback? Maila:
                                    </p>
                                    <a
                                        href="mailto:info@jobbcoach.ai"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors break-all"
                                    >
                                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                        info@jobbcoach.ai
                                    </a>
                                </div>

                                {/* Support-mail */}
                                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <HelpCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="ml-4 text-lg font-semibold text-slate-900">Konto och support</h4>
                                    </div>
                                    <p className="text-slate-600 mb-3 text-sm leading-relaxed">
                                        Problem med inloggning, betalning eller ditt Premium-konto? Kontakta:
                                    </p>
                                    <a
                                        href="mailto:support@jobbcoach.ai"
                                        className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors break-all"
                                    >
                                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                        support@jobbcoach.ai
                                    </a>
                                    <p className="text-xs text-slate-500 mt-3">
                                        Premium-användare har prioriterad hantering.
                                    </p>
                                </div>

                                {/* FAQ-länk */}
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center mb-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <Info className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="ml-3 text-lg font-semibold text-slate-900">Vanliga frågor</h4>
                                    </div>
                                    <p className="text-slate-700 mb-4 text-sm leading-relaxed">
                                        Hitta svar direkt i vår FAQ om funktioner, priser och användning.
                                    </p>
                                    <Link
                                        href="/#faq"
                                        className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700 group transition-colors"
                                    >
                                        Gå till FAQ
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
