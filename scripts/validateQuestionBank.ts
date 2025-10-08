/**
 * P2: Validationsskript för frågebanken
 *
 * Kör: npm run validate:questions
 *
 * Validerar:
 * - Grundläggande struktur (id, testType, difficulty)
 * - Matrix 3x3 struktur
 * - Sista cellen [2,2] är tom
 * - Options har exakt 6 alternativ
 * - correctAnswer är 0-5
 * - Alla shapes har giltiga enumvärden
 * - Rotation är i godkända steg (0-315 i 45° steg)
 */

import { QUESTION_BANK } from '../src/lib/tester/questionBank.server';

// Enum-sets för validering
const forms = new Set(['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star']);
const fills = new Set(['solid', 'striped', 'dotted', 'crosshatch', 'empty']);
const colors = new Set(['blue', 'red', 'green', 'black', 'yellow', 'purple']);
const sizes = new Set(['small', 'medium', 'large']);
const rotations = new Set([0, 45, 90, 135, 180, 225, 270, 315]);
const validDifficulties = new Set([1, 2, 3, 4, 5]);

let allOk = true;
let passedCount = 0;
const errors: Array<{ questionId: string; error: string }> = [];

console.log('🔍 Validerar frågebanken...\n');

for (const q of QUESTION_BANK) {
  const questionId = q.id?.substring(0, 8) || 'unknown';

  try {
    // 1. Grundläggande struktur
    if (!q.id || typeof q.id !== 'string') {
      throw new Error('Missing or invalid id');
    }
    if (q.testType !== 'matrislogik-classic') {
      throw new Error(`Bad testType: ${q.testType}`);
    }
    if (!validDifficulties.has(q.difficulty)) {
      throw new Error(`Bad difficulty: ${q.difficulty}`);
    }
    if (!q.explanation || typeof q.explanation !== 'string') {
      throw new Error('Missing or invalid explanation');
    }
    if (typeof q.timeEstimateSeconds !== 'number' || q.timeEstimateSeconds < 0) {
      throw new Error('Invalid timeEstimateSeconds');
    }

    // 2. Matrix 3x3 + tom [2,2]
    if (!Array.isArray(q.matrix) || q.matrix.length !== 3) {
      throw new Error('Matrix must have exactly 3 rows');
    }
    for (let r = 0; r < 3; r++) {
      if (!Array.isArray(q.matrix[r]) || q.matrix[r].length !== 3) {
        throw new Error(`Matrix row ${r} must have exactly 3 columns`);
      }
    }
    if (!Array.isArray(q.matrix[2][2].shapes)) {
      throw new Error('matrix[2][2] must be a valid cell');
    }
    if (q.matrix[2][2].shapes.length !== 0) {
      throw new Error('Last cell [2,2] must be empty (shapes.length === 0)');
    }

    // 3. Options exakt 6 st
    if (!Array.isArray(q.options) || q.options.length !== 6) {
      throw new Error(`Options must have exactly 6 alternatives, found ${q.options?.length || 0}`);
    }

    // 4. correctAnswer 0-5
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 5) {
      throw new Error(`correctAnswer must be 0-5, found ${q.correctAnswer}`);
    }

    // 5. Shapes validering (matrix + options)
    const checkCell = (cell: any, where: string) => {
      if (!cell || !Array.isArray(cell.shapes)) {
        throw new Error(`${where}: Cell missing or shapes is not an array`);
      }

      for (let i = 0; i < cell.shapes.length; i++) {
        const s = cell.shapes[i];
        const shapeLoc = `${where}.shapes[${i}]`;

        if (!s || typeof s !== 'object') {
          throw new Error(`${shapeLoc}: Shape is not an object`);
        }
        if (!forms.has(s.form)) {
          throw new Error(`${shapeLoc}: Invalid form "${s.form}"`);
        }
        if (!fills.has(s.fill)) {
          throw new Error(`${shapeLoc}: Invalid fill "${s.fill}"`);
        }
        if (!colors.has(s.color)) {
          throw new Error(`${shapeLoc}: Invalid color "${s.color}"`);
        }
        if (!sizes.has(s.size)) {
          throw new Error(`${shapeLoc}: Invalid size "${s.size}"`);
        }
        if (s.rotation !== undefined) {
          if (typeof s.rotation !== 'number') {
            throw new Error(`${shapeLoc}: Rotation must be a number`);
          }
          if (!rotations.has(s.rotation)) {
            throw new Error(`${shapeLoc}: Invalid rotation ${s.rotation}° (must be 0, 45, 90, 135, 180, 225, 270, or 315)`);
          }
        }
      }
    };

    // Validera alla celler i matrix
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        checkCell(q.matrix[r][c], `matrix[${r}][${c}]`);
      }
    }

    // Validera alla options
    for (let i = 0; i < q.options.length; i++) {
      checkCell(q.options[i], `options[${i}]`);
    }

    // 6. Kolla att correctAnswer pekar på en existerande option
    const correctOption = q.options[q.correctAnswer];
    if (!correctOption) {
      throw new Error(`correctAnswer ${q.correctAnswer} points to non-existent option`);
    }

    passedCount++;
    console.log(`✅ Fråga ${questionId}... (difficulty ${q.difficulty}) - PASS`);

  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error(`❌ Fråga ${questionId}... - FAIL: ${errorMsg}`);
    errors.push({ questionId, error: errorMsg });
    allOk = false;
  }
}

// Sammanfattning
console.log(`\n${'='.repeat(60)}`);
console.log(`📊 SAMMANFATTNING`);
console.log(`${'='.repeat(60)}`);
console.log(`✅ Godkända frågor: ${passedCount}/${QUESTION_BANK.length}`);
console.log(`❌ Felaktiga frågor: ${errors.length}/${QUESTION_BANK.length}`);

if (errors.length > 0) {
  console.log(`\n⚠️  DETALJERADE FEL:\n`);
  errors.forEach(({ questionId, error }) => {
    console.log(`  • ${questionId}: ${error}`);
  });
}

if (allOk) {
  console.log(`\n✨ Alla frågor är giltiga! Frågebanken är produktionsredo.`);
  process.exit(0);
} else {
  console.log(`\n❌ Valideringen misslyckades. Fixa felen ovan innan produktion.`);
  process.exit(1);
}
