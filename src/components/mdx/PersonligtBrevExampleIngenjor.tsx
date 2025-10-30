'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
TechBuild Engineering AB
Box 5566
112 34 Stockholm

Ansökan till tjänsten som byggingenjör

Hej,

Jag söker tjänsten som byggingenjör hos TechBuild Engineering AB. Med min civilingenjörsexamen från KTH, tre års erfarenhet från byggprojektledning och god kunskap i AutoCAD och Tekla Structures ser jag fram emot att bidra till era innovativa byggprojekt.

Under mina år på Nordic Construction har jag deltagit i fem större byggprojekt från planering till slutbesiktning. Jag har arbetat med projektering, kalkylering, tidplanering och kvalitetssäkring. Ett av mina framgångsrika projekt var renoveringen av Kvarteret Lindhagen där vi minskade byggtiden med 15% genom optimerad materiallogistik och modulär byggmetod – ett projekt värt 45 miljoner kronor.

Min styrka ligger i att kombinera teknisk expertis med praktisk problemlösning. Jag trivs med utmaningen att hitta smarta lösningar när oförutsedda problem uppstår på byggplatsen, och jag värderar nära samarbete med yrkesarbetare, arkitekter och beställare.

Era projekt inom hållbart byggande och er satsning på BIM-baserad projektering tilltalar mig starkt. Jag ser fram emot att vara med och forma framtidens byggbransch tillsammans med er.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Alexander Nilsson`;

export default function PersonligtBrevExampleIngenjor() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-ingenjor.txt';
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
                Exempel på personligt brev för ingenjör
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Byggingenjör med projekterfarenhet
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för ingenjör"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för ingenjör"
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
          <strong>Tips:</strong> Detta exempel kombinerar tekniska verktyg (AutoCAD, Tekla, BIM), kvantifierbara projekt (45 MSEK, 15% tidsvinst) och visar både teknisk kompetens och samarbetsförmåga – viktigt för ingenjörsroller.
        </p>
      </div>
    </div>
  );
}
