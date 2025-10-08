import { IconLogicServerQuestion, IconLogicCell } from './iconLogicTypes';

const createCell = (svg: string): IconLogicCell => ({ svg });
const EMPTY_CELL = createCell('');

export const QUESTIONS_5_TO_10: IconLogicServerQuestion[] = [
  // ==================== FRÅGA 5: Två/tre pinnar enligt kolumn, radförskjutning ====================
  {
    id: 'b58ec95c-fc13-416b-9976-9cfeaf33ec8e',
    testType: 'icon-logic',
    difficulty: 2,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="69.05" x2="32.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="30.95" y1="39.00" x2="18.82" y2="32.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="69.05" y1="61.00" x2="81.18" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="30.95" y1="61.00" x2="18.82" y2="68.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="61.00" y1="30.95" x2="68.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="69.05" x2="32.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="61.00" y1="69.05" x2="68.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="69.05" x2="32.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
    ],
    correctAnswer: 0,
    explanation: 'Kolumn = antal pinnar (1,2,3). Rad = +30° basförskjutning (0°,30°,60°). Pinnar jämnt fördelade.',
    patternTypes: ['quantity', 'rotation'],
    timeEstimateSeconds: 65
  },

  // ==================== FRÅGA 6: T + punkt (transponerad) ====================
  {
    id: '25a5294e-d6cf-4994-918f-1694ea859022',
    testType: 'icon-logic',
    difficulty: 2,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></g></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(270,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="74" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="20" y1="50" x2="80" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50" y1="20" x2="50" y2="50" stroke="#000000" stroke-width="2" stroke-linecap="round" /><circle cx="26" cy="50" r="3" fill="#000000" /></g></svg>')
    ],
    correctAnswer: 2,
    explanation: 'Kolumn roterar 0°/90°/180°. Rad placerar punkten vänster/center/höger.',
    patternTypes: ['rotation', 'position'],
    timeEstimateSeconds: 60
  },

  // ==================== FRÅGA 7: △ roterar ====================
  {
    id: '12db7c74-65bd-4973-898c-a59450fc130f',
    testType: 'icon-logic',
    difficulty: 3,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(120,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(240,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(120,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(240,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(240,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(120,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'), // CORRECT (360°=0° then +120°)
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(240,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(300,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>')
    ],
    correctAnswer: 0,
    explanation: 'Varje rad börjar med egen rotation: rad 1 = 0°, rad 2 = 120°, rad 3 = 240°. Därefter roterar triangeln +120° för varje kolumnsteg. Rad 3 kolumn 3: 240° + 120° + 120° = 480° = 120°.',
    patternTypes: ['rotation', 'matrix-rule'],
    timeEstimateSeconds: 70
  },

  // ==================== FRÅGA 8: Diagonalregel ====================
  {
    id: 'f04c5d1f-a4f1-40ae-b478-47a85423e59a',
    testType: 'icon-logic',
    difficulty: 3,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(120,50,50)"><polygon points="50.00,30.00 67.32,60.00 32.68,60.00" fill="none" stroke="#000000" stroke-width="2.5" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="18" fill="none" stroke="#000000" stroke-width="2.5" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="32" y1="32" x2="68" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="68" y1="32" x2="32" y2="68" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /></svg>')
    ],
    correctAnswer: 1,
    explanation: 'Huvuddiagonalen = O. Över diagonalen = X. Under diagonalen = △.',
    patternTypes: ['diagonal-rule'],
    timeEstimateSeconds: 75
  },

  // ==================== FRÅGA 9: Kors + punkt ====================
  {
    id: '0d9e739b-5680-41b8-87a8-ecedb00ca869',
    testType: 'icon-logic',
    difficulty: 3,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="30" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="70" cy="50" r="3" fill="#000000" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="30" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="70" cy="50" r="3" fill="#000000" /></g></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="30" cy="50" r="3" fill="#000000" /></g></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="50" cy="50" r="3" fill="#000000" /></g></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="30" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(90,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="70" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="70" cy="50" r="3" fill="#000000" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="70" cy="50" r="3" fill="#000000" /></g></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(270,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="70" cy="50" r="3" fill="#000000" /></g></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="rotate(180,50,50)"><line x1="30" y1="50" x2="70" y2="50" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><line x1="50" y1="30" x2="50" y2="70" stroke="#000000" stroke-width="2.5" stroke-linecap="round" /><circle cx="30" cy="50" r="3" fill="#000000" /></g></svg>')
    ],
    correctAnswer: 3,
    explanation: 'Varje cell innehåller ett plus (+). Rad 1/2/3 roterar + 0°/90°/180°. Kolumn 1/2/3 placerar punkten vänster/center/höger på plusets horisontella arm.',
    patternTypes: ['rotation', 'position', 'matrix-rule'],
    timeEstimateSeconds: 80
  },

  // ==================== FRÅGA 10: Kolumnantal + radrotation ====================
  {
    id: 'f0962dca-3f4d-476d-b0b5-42e0eee26c3b',
    testType: 'icon-logic',
    difficulty: 3,
    matrix: [
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="69.05" x2="32.00" y2="81.18" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="65.56" x2="75.46" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="65.56" x2="75.46" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="34.44" y1="34.44" x2="24.54" y2="24.54" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="65.56" x2="75.46" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.75" y1="55.69" x2="15.23" y2="59.32" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="55.69" y1="28.75" x2="59.32" y2="15.23" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
      ],
      [
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
        EMPTY_CELL
      ]
    ],
    options: [
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="39.00" y1="30.95" x2="32.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="61.00" y1="30.95" x2="68.00" y2="18.82" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'), // CORRECT
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="50.00" y1="28.00" x2="50.00" y2="14.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="50.00" y1="72.00" x2="50.00" y2="86.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="65.56" y1="65.56" x2="75.46" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="34.44" y1="34.44" x2="24.54" y2="24.54" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="34.44" y1="65.56" x2="24.54" y2="75.46" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>'),
      createCell('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="22" fill="none" stroke="#000000" stroke-width="2" /><line x1="72.00" y1="50.00" x2="86.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /><line x1="28.00" y1="50.00" x2="14.00" y2="50.00" stroke="#000000" stroke-width="2" stroke-linecap="round" /></svg>')
    ],
    correctAnswer: 1,
    explanation: 'Kolumn 1/2/3 = 1/2/3 pinnar. Rad 1/2/3 roterar +0°/+45°/+90°.',
    patternTypes: ['quantity', 'rotation'],
    timeEstimateSeconds: 85
  }
];
