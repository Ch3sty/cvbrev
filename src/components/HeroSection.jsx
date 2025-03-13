"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-indigo-950 to-purple-900 pt-16 pb-24 px-6 md:px-10">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Skapa personliga <span className="text-pink-500">ansökningsbrev</span> med AI
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
            Generera professionella och personliga ansökningsbrev baserade på ditt CV och jobbannonsen på sekunder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/generator"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Skapa brev nu
            </Link>
            <Link
              href="/how-it-works"
              className="bg-transparent border border-gray-400 text-white hover:border-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Hur det fungerar
            </Link>
          </div>
        </div>
        
        <div className="relative md:mt-0 h-64 md:h-96">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
          <div className="relative z-10 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl h-full">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <div className="flex-1 text-gray-400 text-sm">Din ansökan.docx</div>
            </div>
            <div className="h-full overflow-hidden text-gray-300 text-sm">
              <p className="mb-3">Hej [Företagsnamn],</p>
              <p className="mb-3">Med stort intresse ansöker jag om tjänsten som [Position] hos [Företagsnamn].</p>
              <p className="mb-3">Med min bakgrund inom [Område] och erfarenhet av [Relevant erfarenhet], är jag övertygad om att jag kan bidra till ert team.</p>
              <p className="mb-3">Under min tid hos [Tidigare arbetsgivare], utvecklade jag starka färdigheter inom [Relevant färdighet]...</p>
              <div className="mt-4 h-2 bg-gray-700 w-3/4 rounded-full animate-pulse"></div>
              <div className="mt-2 h-2 bg-gray-700 w-1/2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
