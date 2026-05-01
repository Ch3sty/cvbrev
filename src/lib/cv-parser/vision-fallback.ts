// src/lib/cv-parser/vision-fallback.ts
import { cleanExtractedText } from './text-utils';

const MAX_PAGES = 5;
const RENDER_SCALE = 2.0;
const MIN_TEXT_LENGTH = 50;

/**
 * Renderar PDF-sidor till PNG-buffers via pdfjs-dist + @napi-rs/canvas
 * och skickar dem till gpt-4o-mini med vision för text-extraktion.
 *
 * Anropas BARA när pdf-parse misslyckats (image-baserad PDF eller text < 50 tecken).
 *
 * Returnerar extraherad text eller null om även vision-fallback misslyckades.
 */
export async function extractTextWithVision(
  pdfData: Uint8Array
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[vision-fallback] OPENAI_API_KEY saknas');
    return null;
  }

  try {
    const pageImages = await renderPdfPagesToPngs(pdfData);
    if (pageImages.length === 0) {
      console.warn('[vision-fallback] inga sidor kunde renderas');
      return null;
    }

    console.info(
      `[vision-fallback] renderade ${pageImages.length} sida(or), skickar till vision-modell`
    );

    const text = await callVisionModel(pageImages);
    if (!text || text.length < MIN_TEXT_LENGTH) {
      console.warn(
        `[vision-fallback] vision returnerade för lite text (${text?.length || 0} tecken)`
      );
      return null;
    }

    return cleanExtractedText(text);
  } catch (error: any) {
    console.error('[vision-fallback] oväntat fel:', error.message || error);
    return null;
  }
}

async function renderPdfPagesToPngs(pdfData: Uint8Array): Promise<Buffer[]> {
  // Dynamiska imports för att undvika klientside-problem
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');

  const loadingTask = pdfjs.getDocument({
    data: pdfData,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  });
  const doc = await loadingTask.promise;

  const pageCount = Math.min(doc.numPages, MAX_PAGES);
  const buffers: Buffer[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );
    const context = canvas.getContext('2d');

    // pdfjs förväntar sig en CanvasRenderingContext2D-kompatibel context.
    // @napi-rs/canvas implementerar tillräckligt av API:et för att fungera.
    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    } as any).promise;

    buffers.push(canvas.toBuffer('image/png'));
    page.cleanup();
  }

  await doc.destroy();
  return buffers;
}

async function callVisionModel(pageImages: Buffer[]): Promise<string | null> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Du är en CV-textextraherare. Läs sidorna och returnera ALL synlig text exakt som den står. Inga sammanfattningar, ingen analys, ingen formattering. Bevara svenska tecken (åäö). Behåll naturliga radbrytningar mellan sektioner som Erfarenhet, Utbildning, Kompetenser. Returnera bara den extraherade texten, inget annat.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extrahera all text från följande CV-sidor:',
          },
          ...pageImages.map((png) => ({
            type: 'image_url' as const,
            image_url: {
              url: `data:image/png;base64,${png.toString('base64')}`,
              detail: 'high' as const,
            },
          })),
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0,
  });

  const text = response.choices[0]?.message?.content?.trim();
  return text || null;
}
