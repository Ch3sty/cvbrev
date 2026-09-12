'use client';

/**
 * Klientskalet runt LinkedIn-wizarden.
 *
 * All data kommer färdig som props från page.tsx, som läste den på servern.
 * Det enda som ligger här är toastbehållaren, som måste vara en klientyta men
 * inte får något att vänta på.
 */

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LinkedInOptimizer from './components/LinkedInOptimizer';
import type { LinkedInPageData } from './getLinkedInData';

export default function LinkedInOptimizerClient({
  initialData,
}: {
  initialData: LinkedInPageData;
}) {
  return (
    <>
      <LinkedInOptimizer initialData={initialData} />
      <ToastContainer
        position="bottom-center"
        autoClose={2200}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="light"
      />
    </>
  );
}
