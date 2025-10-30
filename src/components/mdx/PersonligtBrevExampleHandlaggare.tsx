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
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-handlaggare-exempel.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(EXEMPEL_BREV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Example Content - Always Visible */}
      <div className="p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {EXEMPEL_BREV}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          Ladda ned exempel (.txt)
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-200 transition-colors"
        >
          <Copy className="w-5 h-5" />
          {copied ? 'Kopierat!' : 'Kopiera text'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Tips:</strong> Detta exempel lyfter juridisk kompetens, kvantifierbara resultat (400 ärenden/år, 97% korrekthet) och visar både saklighet och service-fokus – viktigt för handläggare-roller.
        </p>
      </div>
    </div>
  );
}
