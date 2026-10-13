// Affischbilder (WebP) för sajtversionen: första bildrutan, samma som videons start.
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const main = async () => {
  const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
  for (const [id, namn] of [['Sajt169', 'tester-169-affisch.webp'], ['Sajt916', 'tester-916-affisch.webp']]) {
    const composition = await selectComposition({ serveUrl, id });
    await renderStill({ composition, serveUrl, output: path.resolve('out/webb', namn), frame: 0, imageFormat: 'webp', scale: 2 / 3 });
    console.log(namn);
  }
};
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
