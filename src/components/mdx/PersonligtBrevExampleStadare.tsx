'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

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
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-stadare-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel visar noggrannhet med siffror (98% godkänt), kunskap om metoder och kemikalier, samt flexibilitet – viktigt för städjobb.
        </p>
      </div>
    </div>
  );
}
