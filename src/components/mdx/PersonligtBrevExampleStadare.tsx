'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Nordic Cleaning Services AB
Box 2233
123 45 Stockholm

Ansökan till tjänsten som lokalvårdare

Hej,

Jag söker tjänsten som lokalvårdare hos Nordic Cleaning Services AB. Med tre års erfarenhet från hotellstädning, noggrannhet och god kunskap om rengöringsmetoder och kemikalier, är jag redo att bidra till era höga standarder för renlighet.

Under mina år på Grand Hotel Stockholm har jag arbetat med daglig städning av hotellrum, konferenslokaler och allmänna utrymmen. Jag behärskar olika städmetoder för olika ytor, känner till vilka kemikalier som passar för vilket ändamål, och arbetar alltid enligt säkerhetsföreskrifter. Min noggrannhet har resulterat i 98% godkänt vid kvalitetskontroller.

Jag trivs med det självständiga i städarbete – att få ansvara för mitt område och se direkt resultat av mitt arbete. Samtidigt uppskattar jag teamkänslan med kollegor och är flexibel gällande arbetstider, inklusive tidiga morgnar och kvällar.

Era satsningar på miljövänliga städmetoder och moderna arbetssätt tilltalar mig starkt. Jag ser fram emot att bidra till rena och trivsamma miljöer för era kunder.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Fatima Hassan`;

export default function PersonligtBrevExampleStadare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-stadare.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXEMPEL_BREV);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera texten:', err);
    }
  };

  return (
    <div className="my-8">
      <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Exempel på personligt brev för städare
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Lokalvårdare med hotellerfarenhet
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för städare"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för städare"
              >
                <Download className="w-4 h-4" />
                Ladda ner
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-base">
            {EXEMPEL_BREV}
          </pre>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Detta exempel visar noggrannhet med siffror (98% godkänt), kunskap om metoder och kemikalier, samt flexibilitet – viktigt för städjobb.
        </p>
      </div>
    </div>
  );
}
