'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Grand Hotel Stockholm
Box 1122
103 27 Stockholm

Ansökan till tjänsten som receptionist

Hej,

Jag söker tjänsten som receptionist på Grand Hotel Stockholm. Med fyra års erfarenhet från hotellreception, utmärkt service-känsla och flytande engelska ser jag fram emot att välkomna era gäster med professionalism och värme.

Under min tid på Nordic Comfort Hotel har jag hanterat incheckning/utcheckning, bokningar via olika system (Opera PMS, Booking.com), telefonväxel och gästärenden. Jag har ofta fått beröm för mitt bemötande och min förmåga att lösa problem snabbt – förra året fick jag vårt hotells "Service Excellence Award" för högsta gästbetyg.

Vad jag älskar mest med receptionistyrket är mötet med människor från hela världen. Att kunna hjälpa en stressad affärsresenär att lösa ett problem, eller se glädjen hos en familj när de checkar in för sin semester – det är vad som driver mig. Min erfarenhet av att arbeta under högtryck (konferenser, högsäsong) har lärt mig att behålla lugnet även i hektiska situationer.

Grand Hotel Stockholms rykte som Sveriges främsta hotell och er strävan efter exceptionell service matchar perfekt mina egna värderingar. Jag ser fram emot att representera ert varumärke i receptionen.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Emma Lindström`;

export default function PersonligtBrevExampleReceptionist() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-receptionist.txt';
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
                Exempel på personligt brev för receptionist
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                För hotellreception med service-fokus
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för receptionist"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för receptionist"
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
          <strong>Tips:</strong> Detta exempel lyfter service-award, konkreta system (Opera PMS) och visar både professionalism och värme – nyckelegenskaper för receptionister.
        </p>
      </div>
    </div>
  );
}
