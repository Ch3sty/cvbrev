'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

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
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-utbildning.txt';
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
                Exempel på personligt brev för utbildningsansökan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Ansökan till musiklärarutbildning
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för utbildning"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för utbildning"
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
          <strong>Tips:</strong> Detta exempel visar passion för ämnet, konkret erfarenhet (undervisat i 3 år, grade 8) och tydlig motivation för just denna utbildning – viktigt för utbildningsansökningar.
        </p>
      </div>
    </div>
  );
}
