import { IconLogicServerQuestion, IconLogicCell } from './iconLogicTypes';
import { QUESTIONS_5_TO_10 } from './iconLogicQuestions5-10';

// Helper function to create cells with raw SVG
const createCell = (svg: string): IconLogicCell => ({ svg });

// Empty cell (question mark placeholder)
const EMPTY_CELL = createCell('');

export const ICON_LOGIC_QUESTION_BANK: IconLogicServerQuestion[] = [
  // ==================== FRÅGA 1: Ring + ekvidistanta pinnar ====================
  {
    id: '08c616db-17ab-48b3-a1dc-5868fe5d0eb9',
    testType: 'icon-logic',
    difficulty: 1,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="30.95" y1="39.00" x2="18.82" y2="32.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="69.05" x2="32.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="30.95" y1="61.00" x2="18.82" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="61.00" y1="30.95" x2="68.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="30.95" y1="39.00" x2="18.82" y2="32.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="69.05" y1="39.00" x2="81.18" y2="32.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="30.95" y1="61.00" x2="18.82" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
    ],
    correctAnswer: 0,
    explanation: 'Rad anger antal pinnar (1,2,3). Kolumn roterar hela mönstret +30° per steg.',
    patternTypes: ['rotation', 'quantity'],
    timeEstimateSeconds: 45
  },

  // ==================== FRÅGA 2: T + punkt ====================
  {
    id: 'b9e16f39-6c72-404e-8276-3bca3857cdc0',
    testType: 'icon-logic',
    difficulty: 1,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(270,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>')
    ],
    correctAnswer: 0,
    explanation: 'Rad roterar T-figuren 0°/90°/180°. Kolumn placerar punkten vänster/center/höger på den horisontella linjen.',
    patternTypes: ['rotation', 'position'],
    timeEstimateSeconds: 50
  },

  // ==================== FRÅGA 3: Latin square med X/O/△ ====================
  {
    id: '884d7250-cdb3-4ba5-a6f7-d79be1187644',
    testType: 'icon-logic',
    difficulty: 2,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>')
    ],
    correctAnswer: 0,
    explanation: 'Varje rad/kolumn innehåller exakt en X, en O och en △.',
    patternTypes: ['latin-square'],
    timeEstimateSeconds: 55
  },

  // ==================== FRÅGA 4: Ring + enkel pinne som går med +45° ====================
  {
    id: '3bf7b690-19ce-41aa-8655-ac95205982b7',
    testType: 'icon-logic',
    difficulty: 2,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="65.56" x2="75.46" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="34.44" y1="65.56" x2="24.54" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="34.44" y1="34.44" x2="24.54" y2="24.54" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="34.44" x2="75.46" y2="24.54" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="65.56" x2="75.46" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
    ],
    correctAnswer: 0,
    explanation: 'Vinkel ökar med +45° från cell till cell radvis (vänster→höger, uppifrån→ned). Efter 315° kommer 0°.',
    patternTypes: ['sequential', 'rotation'],
    timeEstimateSeconds: 60
  },

  ...QUESTIONS_5_TO_10
];

// Export count for validation
export const ICON_LOGIC_TOTAL_QUESTIONS = ICON_LOGIC_QUESTION_BANK.length;
