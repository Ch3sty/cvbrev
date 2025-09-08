// test-swedish-cv-validation.js
// Testskript för att validera svenska CV-mallar

const { runSwedishCVValidation } = require('./src/lib/cv/tests/swedish-cv-validation.ts');

async function main() {
  try {
    console.log('Startar validering av svenska CV-mallar...\n');
    await runSwedishCVValidation();
  } catch (error) {
    console.error('Fel vid validering:', error);
    process.exit(1);
  }
}

main();