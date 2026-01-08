'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

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
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-receptionist-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel lyfter service-award, konkreta system (Opera PMS) och visar både professionalism och värme – nyckelegenskaper för receptionister.
        </p>
      </div>
    </div>
  );
}
