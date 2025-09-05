// Example: How to implement an async CV template
// This demonstrates how the solution handles both sync and async generateHTML functions

import { CVTemplate, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';
import { generateQRCodeDataURL } from '@/lib/cv/visual-elements';

export const exampleAsyncCVTemplate: CVTemplate = {
  id: 'async-example',
  name: 'Async Example',
  description: 'Example template that uses async HTML generation',
  category: 'Example',
  bestFor: ['Demonstration'],
  features: ['Async QR Code', 'Dynamic content'],
  colorSchemes: ['blue'],
  previewImage: '/images/example.png',
  
  // This generateHTML function is async and returns Promise<string>
  generateHTML: async (cvData: CVMetadata, options: CVGenerationOptions): Promise<string> => {
    // Simulate async operation - generate real QR code
    const qrCodeDataURL = cvData.personalInfo.linkedIn 
      ? await generateQRCodeDataURL(cvData.personalInfo.linkedIn)
      : '';
    
    // Simulate other async operations like external API calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV - ${cvData.personalInfo.fullName}</title>
        </head>
        <body>
          <h1>${cvData.personalInfo.fullName}</h1>
          ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" alt="QR Code" />` : ''}
          <p>This template was generated asynchronously!</p>
        </body>
      </html>
    `;
  }
};

// The API routes now handle this seamlessly:
// const html = await generateHTMLSafely(template, cvData, options);
// Whether the template is sync or async, the result is always a Promise<string>