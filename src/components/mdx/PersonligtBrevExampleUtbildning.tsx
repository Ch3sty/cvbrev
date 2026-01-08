'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

Antagningsansvarig
Stockholms Musikpedagogiska Institut
Box 6677
114 56 Stockholm

Ansökan till utbildningen Musiklärare, inriktning piano

Hej,

Jag ansöker till utbildningen Musiklärare med inriktning piano vid Stockholms Musikpedagogiska Institut. Med 12 års pianoundervisning, gymnasieexamen från estetiska programmet och ett brinnande intresse för musikpedagogik, ser jag fram emot att utveckla min förmåga att inspirera nästa generation musiker.

Musik har alltid varit min största passion. Jag spelar piano sedan jag var sex år, har klarat grade 8 i ABRSM-systemet och undervisar sedan tre år tillbaka privatelevar i åldrarna 8-16 år. Denna erfarenhet har lärt mig vikten av att anpassa undervisning till olika inlärningsstilar och att skapa en trygg miljö där elever vågar prova och misslyckas.

Vad som driver mig är att se hur musik kan förändra liv. Att se en elev som tidigare kämpat med notläsning plötsligt "förstå" harmonin, eller en blyg tolvåring växa i självförtroende genom att spela inför publik – det är därför jag vill bli musiklärare.

Er utbildnings fokus på både instrumentalkunskap och pedagogisk metodik, samt möjligheten att praktisera i verkliga klassrumsmiljöer, matchar perfekt vad jag söker. Jag ser fram emot att fördjupa mig i musikpedagogikens teori och praktik tillsammans med er.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Lisa Eklund`;

export default function PersonligtBrevExampleUtbildning() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-utbildning-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel visar passion för ämnet, konkret erfarenhet (undervisat i 3 år, grade 8) och tydlig motivation för just denna utbildning – viktigt för utbildningsansökningar.
        </p>
      </div>
    </div>
  );
}
