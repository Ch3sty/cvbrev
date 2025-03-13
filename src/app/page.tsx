"use client";
export const dynamic = "force-dynamic";

import React from "react";
import nextDynamic from "next/dynamic"; 
import { useAuth } from '@/contexts/AuthContext';
import Link from "next/link";

// Dynamisk import av Header och HeroSection (ssr: false)
const Header = nextDynamic(() => import("../components/Header"), { ssr: false });
const HeroSection = nextDynamic(() => import("../components/HeroSection"), { ssr: false });

export default function Home() {
  const { user, loading: authLoading } = useAuth();  

  // Om användaren inte är autentiserad, visa en begränsad version av startsidan
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <HeroSection />
        
        {/* Visa endast uppmaning att registrera sig om användaren inte är inloggad */}
        <section className="py-20 px-6 md:px-10 bg-gradient-to-b from-indigo-950 to-purple-900">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Börja generera dina brev nu</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Registrera dig för att börja skapa professionella ansökningsbrev med hjälp av AI.
            </p>

            <Link
              href="/signup"
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Registrera dig nu
            </Link>
          </div>
        </section>

        <footer className="bg-gray-900 text-gray-400 py-10 px-6 md:px-10">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="text-white font-bold text-xl">
                  cv<span className="text-pink-500">brev</span>
                </div>
                <p className="mt-2">Personliga ansökningsbrev med AI</p>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div>
                  <h4 className="font-medium text-white mb-4">Sidor</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">
                        Hem
                      </Link>
                    </li>
                    <li>
                      <Link href="/generator" className="hover:text-white transition-colors">
                        Generator
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="hover:text-white transition-colors">
                        Priser
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4">Support</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/faq" className="hover:text-white transition-colors">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-white transition-colors">
                        Kontakt
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4">Legal</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/privacy" className="hover:text-white transition-colors">
                        Integritetspolicy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="hover:text-white transition-colors">
                        Användarvillkor
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-10 pt-6 text-center md:text-left">
              <p>
                &copy; {new Date().getFullYear()} cvbrev.se. Alla rättigheter förbehållna.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <HeroSection />

      <section className="py-20 px-6 md:px-10 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Hur det fungerar</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-4">Ladda upp ditt CV</h3>
              <p className="text-gray-400">
                Ladda upp eller klistra in ditt befintliga CV i vår generator.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-4">Lägg till jobbannonsen</h3>
              <p className="text-gray-400">
                Klistra in arbetsplatsannonsen för tjänsten du söker.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-4">
                Få ditt personliga brev
              </h3>
              <p className="text-gray-400">
                Vår AI genererar ett skräddarsytt ansökningsbrev på sekunder.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/generator"
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Testa gratis
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-10 bg-gradient-to-b from-indigo-950 to-purple-900">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Redo att få jobbet?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Skapa ansökningsbrev som sticker ut och ökar dina chanser att bli kallad till intervju.
          </p>

          <Link
            href="/signup"
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Kom igång nu
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 px-6 md:px-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-white font-bold text-xl">
                cv<span className="text-pink-500">brev</span>
              </div>
              <p className="mt-2">Personliga ansökningsbrev med AI</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h4 className="font-medium text-white mb-4">Sidor</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Hem
                    </Link>
                  </li>
                  <li>
                    <Link href="/generator" className="hover:text-white transition-colors">
                      Generator
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white transition-colors">
                      Priser
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-4">Support</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/faq" className="hover:text-white transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      Kontakt
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Integritetspolicy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Användarvillkor
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center md:text-left">
            <p>
              &copy; {new Date().getFullYear()} cvbrev.se. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </footer>
    </div>    
  );
}