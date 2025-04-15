// src/components/ui/InfoTooltip.tsx
'use client';

import { Popover, Transition } from '@headlessui/react';
import { HelpCircle, X } from 'lucide-react';
import { Fragment } from 'react';

interface InfoTooltipProps {
  title: string;
  content: React.ReactNode; // Allow JSX content
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, content }) => {
  return (
    <Popover className="relative inline-block">
      {({ open, close }) => (
        <>
          <Popover.Button
            className="ml-1.5 text-gray-500 hover:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-800 rounded-full transition-colors"
            aria-label={`Information om ${title}`}
          >
            <HelpCircle className="w-4 h-4" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-20 mt-2 w-64 sm:w-72 transform -translate-x-1/2 left-1/2 sm:left-auto sm:right-0 sm:-translate-x-0 px-4 sm:px-0">
              {/* Använd en standard panel-styling */}
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-navy-600">
                <div className="relative bg-navy-700 p-4">
                   <button
                      onClick={() => close()}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white hover:bg-navy-600 rounded-full focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white"
                      aria-label="Stäng information"
                    >
                      <X className="h-4 w-4" />
                   </button>
                  <h4 className="text-sm font-semibold text-white mb-2 pr-6">{title}</h4>
                  <div className="text-xs text-gray-300 space-y-1">
                    {content}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};