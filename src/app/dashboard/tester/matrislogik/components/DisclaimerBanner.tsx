'use client';

import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold text-blue-900 mb-2">
            Viktigt att veta
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Detta är ett <strong>övningstest</strong>, inte ett diagnostiskt verktyg.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Ej affilierat med Assessio, Matrigma, eller Alva Labs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Dina svar sparas för progresstracking enligt GDPR (12 månaders retention).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Poängen är en övningsskala (1-10), inte normerade c-scores.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
