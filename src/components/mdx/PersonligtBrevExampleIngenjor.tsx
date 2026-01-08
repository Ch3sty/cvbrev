'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

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
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-ingenjor-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel kombinerar tekniska verktyg (AutoCAD, Tekla, BIM), kvantifierbara projekt (45 MSEK, 15% tidsvinst) och visar både teknisk kompetens och samarbetsförmåga – viktigt för ingenjörsroller.
        </p>
      </div>
    </div>
  );
}
