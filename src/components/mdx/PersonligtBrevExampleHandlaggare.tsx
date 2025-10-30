'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Försäkringskassan Stockholm
Box 5544
103 27 Stockholm

Ansökan till tjänsten som handläggare

Hej,

Jag söker tjänsten som handläggare på Försäkringskassan Stockholm. Med min juristexamen, fyra års erfarenhet från myndighetsarbete och god kunskap i förvaltningsrätt, ser jag fram emot att bidra till rättssäker och effektiv ärendehantering.

Under mina år på Migrationsverket har jag handlagt uppehållstillstånd, utrett och beslutat i cirka 400 ärenden årligen med 97% korrekt beslut vid överprövning. Jag har vana av att tillämpa lagstiftning, skriva väl underbyggda beslut och kommunicera med sökande och ombud. Min förmåga att hantera komplexa ärenden och hålla tidsfrister har varit avgörande för mitt arbete.

Vad som driver mig som handläggare är att bidra till rättssäkerhet och korrekt tillämpning av regelverk. Jag trivs med det strukturerade i myndighetsarbete men uppskattar även det mänskliga mötet – att förklara beslut och ge service till medborgare.

Försäkringskassans roll i välfärdssystemet och er satsning på digitalisering av ärendehantering matchar mina egna värderingar om effektiv och rättssäker förvaltning. Jag ser fram emot att bidra till ert viktiga uppdrag.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Johan Svensson`;

export default function PersonligtBrevExampleHandlaggare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-handlaggare.txt';
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
                Exempel på personligt brev för handläggare
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Myndighetshandläggare med juridisk bakgrund
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för handläggare"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för handläggare"
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
          <strong>Tips:</strong> Detta exempel lyfter juridisk kompetens, kvantifierbara resultat (400 ärenden/år, 97% korrekthet) och visar både saklighet och service-fokus – viktigt för handläggare-roller.
        </p>
      </div>
    </div>
  );
}
