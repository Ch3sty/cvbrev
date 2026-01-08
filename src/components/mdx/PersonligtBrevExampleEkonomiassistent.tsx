'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

Rekryteringsansvarig
Ekonomi & Redovisning Stockholm AB
Box 7890
114 56 Stockholm

Ansökan till tjänsten som ekonomiassistent

Hej,

Jag söker tjänsten som ekonomiassistent hos Ekonomi & Redovisning Stockholm AB. Med tre års erfarenhet från redovisning, goda kunskaper i Fortnox och Visma samt ett genuint intresse för siffror och struktur, tror jag att jag kan bidra till ert ekonomiteam.

Under min tid på Nordic Accounting Services har jag arbetat med löpande bokföring, fakturering, reskontra och månadsavstämningar för cirka 25 klienter. Jag har vana av att hantera leverantörsfakturor, utbetalningar och kontrollera att allt stämmer enligt verifikationer. Min noggrannhet har resulterat i noll fel vid de två senaste revisionsgenomgångarna.

Jag trivs med det strukturerade i ekonomiarbete – att varje siffra har sin plats och att allt ska gå ihop. Samtidigt uppskattar jag samarbetet med kollegor och klienter för att lösa frågor och förbättra rutiner. Min kunskap i Excel är god, och jag har byggt flera mallar för att effektivisera rapportering.

Era satsningar på digitalisering och moderna ekonomisystem är mycket tilltalande. Jag ser fram emot möjligheten att fortsätta utvecklas inom ekonomiområdet tillsammans med er.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Anna Karlsson`;

export default function PersonligtBrevExampleEkonomiassistent() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-ekonomiassistent-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel lyfter konkreta system (Fortnox, Visma), kvantifierbara resultat (noll fel vid revision) och visar noggrannhet – viktiga egenskaper för ekonomiassistent-roller.
        </p>
      </div>
    </div>
  );
}
