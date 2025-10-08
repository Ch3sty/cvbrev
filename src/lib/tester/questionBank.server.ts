import { ServerQuestion, Shape, MatrixCell } from './patternTypes';
import crypto from 'crypto';

// Helper functions för att skapa shapes
const createShape = (
  form: Shape['form'],
  fill: Shape['fill'],
  color: Shape['color'],
  size: Shape['size'] = 'medium',
  rotation: number = 0
): Shape => ({ form, fill, color, size, rotation });

const createCell = (shapes: Shape[]): MatrixCell => ({ shapes });

export const QUESTION_BANK: ServerQuestion[] = [
  // ==================== DIFFICULTY 1-2: Enkla mönster ====================

  // Fråga 1: Enkel färgsekvens (Difficulty 1)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 1,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'blue')]),
        createCell([createShape('circle', 'solid', 'red')]),
        createCell([createShape('circle', 'solid', 'green')])
      ],
      [
        createCell([createShape('square', 'solid', 'blue')]),
        createCell([createShape('square', 'solid', 'red')]),
        createCell([createShape('square', 'solid', 'green')])
      ],
      [
        createCell([createShape('triangle', 'solid', 'blue')]),
        createCell([createShape('triangle', 'solid', 'red')]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'solid', 'green')]), // CORRECT
      createCell([createShape('triangle', 'solid', 'blue')]),
      createCell([createShape('circle', 'solid', 'green')]),
      createCell([createShape('triangle', 'solid', 'red')]),
      createCell([createShape('square', 'solid', 'green')]),
      createCell([createShape('triangle', 'striped', 'green')])
    ],
    correctAnswer: 0,
    explanation: 'Färgsekvens per rad: blå → röd → grön. Formen ändras per rad (cirkel, fyrkant, triangel) men färgordningen är konsekvent.',
    patternTypes: ['color-change'],
    timeEstimateSeconds: 45
  },

  // Fråga 2: Enkel formsekvens med fyllnad (Difficulty 1)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 1,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'black')]),
        createCell([createShape('circle', 'striped', 'black')]),
        createCell([createShape('circle', 'empty', 'black')])
      ],
      [
        createCell([createShape('square', 'solid', 'black')]),
        createCell([createShape('square', 'striped', 'black')]),
        createCell([createShape('square', 'empty', 'black')])
      ],
      [
        createCell([createShape('diamond', 'solid', 'black')]),
        createCell([createShape('diamond', 'striped', 'black')]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('diamond', 'empty', 'black')]), // CORRECT
      createCell([createShape('diamond', 'solid', 'black')]),
      createCell([createShape('diamond', 'dotted', 'black')]),
      createCell([createShape('circle', 'empty', 'black')]),
      createCell([createShape('diamond', 'striped', 'black')]),
      createCell([createShape('square', 'empty', 'black')])
    ],
    correctAnswer: 0,
    explanation: 'Fyllnadssekvens per rad: solid → striped → empty. Formen varierar per rad men fyllnadsmönstret är konstant.',
    patternTypes: ['color-change'],
    timeEstimateSeconds: 50
  },

  // Fråga 3: Enkel rotation 90° (Difficulty 2)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 2,
    matrix: [
      [
        createCell([createShape('triangle', 'solid', 'black', 'medium', 0)]),
        createCell([createShape('triangle', 'solid', 'black', 'medium', 90)]),
        createCell([createShape('triangle', 'solid', 'black', 'medium', 180)])
      ],
      [
        createCell([createShape('diamond', 'solid', 'black', 'medium', 0)]),
        createCell([createShape('diamond', 'solid', 'black', 'medium', 90)]),
        createCell([createShape('diamond', 'solid', 'black', 'medium', 180)])
      ],
      [
        createCell([createShape('star', 'solid', 'black', 'medium', 0)]),
        createCell([createShape('star', 'solid', 'black', 'medium', 90)]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('star', 'solid', 'black', 'medium', 180)]), // CORRECT
      createCell([createShape('star', 'solid', 'black', 'medium', 270)]),
      createCell([createShape('star', 'solid', 'black', 'medium', 90)]),
      createCell([createShape('triangle', 'solid', 'black', 'medium', 180)]),
      createCell([createShape('star', 'solid', 'black', 'medium', 0)]),
      createCell([createShape('star', 'striped', 'black', 'medium', 180)])
    ],
    correctAnswer: 0,
    explanation: 'Rotationssekvens per rad: 0° → 90° → 180°. Formen varierar per rad men rotationsmönstret är detsamma.',
    patternTypes: ['rotation'],
    timeEstimateSeconds: 55
  },

  // Fråga 4: Kvantitet - ökning (Difficulty 2)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 2,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'blue', 'small')]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small')
        ])
      ],
      [
        createCell([createShape('square', 'solid', 'red', 'small')]),
        createCell([
          createShape('square', 'solid', 'red', 'small'),
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'small'),
          createShape('square', 'solid', 'red', 'small'),
          createShape('square', 'solid', 'red', 'small')
        ])
      ],
      [
        createCell([createShape('triangle', 'solid', 'green', 'small')]),
        createCell([
          createShape('triangle', 'solid', 'green', 'small'),
          createShape('triangle', 'solid', 'green', 'small')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small')
      ]), // CORRECT
      createCell([
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small')
      ]),
      createCell([createShape('triangle', 'solid', 'green', 'small')]),
      createCell([
        createShape('circle', 'solid', 'green', 'small'),
        createShape('circle', 'solid', 'green', 'small'),
        createShape('circle', 'solid', 'green', 'small')
      ]),
      createCell([
        createShape('triangle', 'solid', 'blue', 'small'),
        createShape('triangle', 'solid', 'blue', 'small'),
        createShape('triangle', 'solid', 'blue', 'small')
      ]),
      createCell([
        createShape('triangle', 'striped', 'green', 'small'),
        createShape('triangle', 'striped', 'green', 'small'),
        createShape('triangle', 'striped', 'green', 'small')
      ])
    ],
    correctAnswer: 0,
    explanation: 'Kvantitetssekvens per rad: 1 form → 2 former → 3 former. Formen och färgen varierar per rad men antalet ökar konsekvent.',
    patternTypes: ['quantity'],
    timeEstimateSeconds: 60
  },

  // ==================== DIFFICULTY 3: Kombinerade mönster ====================

  // Fråga 5: Färg + Rotation (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([createShape('triangle', 'solid', 'blue', 'medium', 0)]),
        createCell([createShape('triangle', 'solid', 'red', 'medium', 90)]),
        createCell([createShape('triangle', 'solid', 'green', 'medium', 180)])
      ],
      [
        createCell([createShape('triangle', 'solid', 'red', 'medium', 0)]),
        createCell([createShape('triangle', 'solid', 'green', 'medium', 90)]),
        createCell([createShape('triangle', 'solid', 'blue', 'medium', 180)])
      ],
      [
        createCell([createShape('triangle', 'solid', 'green', 'medium', 0)]),
        createCell([createShape('triangle', 'solid', 'blue', 'medium', 90)]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'solid', 'red', 'medium', 180)]), // CORRECT
      createCell([createShape('triangle', 'solid', 'green', 'medium', 180)]),
      createCell([createShape('triangle', 'solid', 'red', 'medium', 90)]),
      createCell([createShape('triangle', 'solid', 'blue', 'medium', 180)]),
      createCell([createShape('square', 'solid', 'red', 'medium', 180)]),
      createCell([createShape('triangle', 'striped', 'red', 'medium', 180)])
    ],
    correctAnswer: 0,
    explanation: 'Två mönster: (1) Rotation per kolumn: 0° → 90° → 180°. (2) Färgrotation per rad: blå→röd→grön, röd→grön→blå, grön→blå→röd.',
    patternTypes: ['rotation', 'color-change'],
    timeEstimateSeconds: 75
  },

  // Fråga 6: Fyllnad + Form (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'black')]),
        createCell([createShape('square', 'striped', 'black')]),
        createCell([createShape('triangle', 'empty', 'black')])
      ],
      [
        createCell([createShape('square', 'solid', 'black')]),
        createCell([createShape('triangle', 'striped', 'black')]),
        createCell([createShape('circle', 'empty', 'black')])
      ],
      [
        createCell([createShape('triangle', 'solid', 'black')]),
        createCell([createShape('circle', 'striped', 'black')]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('square', 'empty', 'black')]), // CORRECT
      createCell([createShape('square', 'solid', 'black')]),
      createCell([createShape('triangle', 'empty', 'black')]),
      createCell([createShape('square', 'striped', 'black')]),
      createCell([createShape('circle', 'empty', 'black')]),
      createCell([createShape('square', 'dotted', 'black')])
    ],
    correctAnswer: 0,
    explanation: 'Två mönster: (1) Formrotation per rad: cirkel→fyrkant→triangel, fyrkant→triangel→cirkel, triangel→cirkel→fyrkant. (2) Fyllnad per kolumn: solid→striped→empty.',
    patternTypes: ['structural', 'color-change'],
    timeEstimateSeconds: 80
  },

  // Fråga 7: Kvantitet + Färg (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'blue', 'small')]),
        createCell([
          createShape('circle', 'solid', 'red', 'small'),
          createShape('circle', 'solid', 'red', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'green', 'small'),
          createShape('circle', 'solid', 'green', 'small'),
          createShape('circle', 'solid', 'green', 'small')
        ])
      ],
      [
        createCell([createShape('square', 'solid', 'red', 'small')]),
        createCell([
          createShape('square', 'solid', 'green', 'small'),
          createShape('square', 'solid', 'green', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'blue', 'small'),
          createShape('square', 'solid', 'blue', 'small'),
          createShape('square', 'solid', 'blue', 'small')
        ])
      ],
      [
        createCell([createShape('triangle', 'solid', 'green', 'small')]),
        createCell([
          createShape('triangle', 'solid', 'blue', 'small'),
          createShape('triangle', 'solid', 'blue', 'small')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([
        createShape('triangle', 'solid', 'red', 'small'),
        createShape('triangle', 'solid', 'red', 'small'),
        createShape('triangle', 'solid', 'red', 'small')
      ]), // CORRECT
      createCell([
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small')
      ]),
      createCell([
        createShape('circle', 'solid', 'red', 'small'),
        createShape('circle', 'solid', 'red', 'small'),
        createShape('circle', 'solid', 'red', 'small')
      ]),
      createCell([
        createShape('triangle', 'solid', 'blue', 'small'),
        createShape('triangle', 'solid', 'blue', 'small'),
        createShape('triangle', 'solid', 'blue', 'small')
      ]),
      createCell([
        createShape('triangle', 'solid', 'red', 'small'),
        createShape('triangle', 'solid', 'red', 'small')
      ]),
      createCell([
        createShape('triangle', 'striped', 'red', 'small'),
        createShape('triangle', 'striped', 'red', 'small'),
        createShape('triangle', 'striped', 'red', 'small')
      ])
    ],
    correctAnswer: 0,
    explanation: 'Två mönster: (1) Kvantitet per kolumn: 1→2→3. (2) Färgrotation per rad: blå→röd→grön, röd→grön→blå, grön→blå→röd.',
    patternTypes: ['quantity', 'color-change'],
    timeEstimateSeconds: 85
  },

  // Fråga 8: Storlek + Position (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'black', 'small')]),
        createCell([createShape('circle', 'solid', 'black', 'medium')]),
        createCell([createShape('circle', 'solid', 'black', 'large')])
      ],
      [
        createCell([createShape('square', 'solid', 'black', 'medium')]),
        createCell([createShape('square', 'solid', 'black', 'large')]),
        createCell([createShape('square', 'solid', 'black', 'small')])
      ],
      [
        createCell([createShape('triangle', 'solid', 'black', 'large')]),
        createCell([createShape('triangle', 'solid', 'black', 'small')]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'solid', 'black', 'medium')]), // CORRECT
      createCell([createShape('triangle', 'solid', 'black', 'large')]),
      createCell([createShape('triangle', 'solid', 'black', 'small')]),
      createCell([createShape('circle', 'solid', 'black', 'medium')]),
      createCell([createShape('square', 'solid', 'black', 'medium')]),
      createCell([createShape('triangle', 'striped', 'black', 'medium')])
    ],
    correctAnswer: 0,
    explanation: 'Storleksrotation per rad: Rad 1 (liten→medium→stor), Rad 2 (medium→stor→liten), Rad 3 (stor→liten→medium). Formen varierar per rad.',
    patternTypes: ['size-change'],
    timeEstimateSeconds: 90
  },

  // Fråga 9: Form + Rotation + Fyllnad (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([createShape('triangle', 'solid', 'black', 'medium', 0)]),
        createCell([createShape('square', 'striped', 'black', 'medium', 45)]),
        createCell([createShape('circle', 'empty', 'black', 'medium', 0)])
      ],
      [
        createCell([createShape('square', 'solid', 'black', 'medium', 0)]),
        createCell([createShape('circle', 'striped', 'black', 'medium', 0)]),
        createCell([createShape('triangle', 'empty', 'black', 'medium', 45)])
      ],
      [
        createCell([createShape('circle', 'solid', 'black', 'medium', 0)]),
        createCell([createShape('triangle', 'striped', 'black', 'medium', 45)]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('square', 'empty', 'black', 'medium', 0)]), // CORRECT
      createCell([createShape('square', 'solid', 'black', 'medium', 0)]),
      createCell([createShape('circle', 'empty', 'black', 'medium', 0)]),
      createCell([createShape('square', 'empty', 'black', 'medium', 45)]),
      createCell([createShape('triangle', 'empty', 'black', 'medium', 0)]),
      createCell([createShape('square', 'dotted', 'black', 'medium', 0)])
    ],
    correctAnswer: 0,
    explanation: 'Tre mönster: (1) Formrotation per rad: triangel→fyrkant→cirkel, fyrkant→cirkel→triangel, cirkel→triangel→fyrkant. (2) Fyllnad per kolumn: solid→striped→empty. (3) Rotation: kolumn 2 har 45°.',
    patternTypes: ['structural', 'rotation', 'color-change'],
    timeEstimateSeconds: 100
  },

  // Fråga 10: Diagonal + Kvantitet (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'small'),
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([createShape('triangle', 'solid', 'green', 'small')])
      ],
      [
        createCell([
          createShape('square', 'solid', 'red', 'small'),
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([
          createShape('triangle', 'solid', 'green', 'small'),
          createShape('triangle', 'solid', 'green', 'small'),
          createShape('triangle', 'solid', 'green', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small')
        ])
      ],
      [
        createCell([createShape('triangle', 'solid', 'green', 'small')]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([
        createShape('square', 'solid', 'red', 'small'),
        createShape('square', 'solid', 'red', 'small'),
        createShape('square', 'solid', 'red', 'small')
      ]), // CORRECT
      createCell([
        createShape('square', 'solid', 'red', 'small'),
        createShape('square', 'solid', 'red', 'small')
      ]),
      createCell([
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small'),
        createShape('triangle', 'solid', 'green', 'small')
      ]),
      createCell([createShape('square', 'solid', 'red', 'small')]),
      createCell([
        createShape('circle', 'solid', 'blue', 'small'),
        createShape('circle', 'solid', 'blue', 'small'),
        createShape('circle', 'solid', 'blue', 'small')
      ]),
      createCell([
        createShape('square', 'striped', 'red', 'small'),
        createShape('square', 'striped', 'red', 'small'),
        createShape('square', 'striped', 'red', 'small')
      ])
    ],
    correctAnswer: 0,
    explanation: 'Diagonalt mönster från top-left till bottom-right: Cirklar (3→2→?), Trianglar (2→3→?), Fyrkanter (1→2→3). Sista cellen ska ha 3 fyrkanter.',
    patternTypes: ['spatial', 'quantity'],
    timeEstimateSeconds: 105
  },

  // Fråga 11: Färg + Fyllnad + Form (Difficulty 3)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 3,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'blue')]),
        createCell([createShape('square', 'striped', 'red')]),
        createCell([createShape('triangle', 'empty', 'green')])
      ],
      [
        createCell([createShape('square', 'striped', 'green')]),
        createCell([createShape('triangle', 'empty', 'blue')]),
        createCell([createShape('circle', 'solid', 'red')])
      ],
      [
        createCell([createShape('triangle', 'empty', 'red')]),
        createCell([createShape('circle', 'solid', 'green')]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('square', 'striped', 'blue')]), // CORRECT
      createCell([createShape('square', 'solid', 'blue')]),
      createCell([createShape('circle', 'striped', 'blue')]),
      createCell([createShape('square', 'striped', 'green')]),
      createCell([createShape('triangle', 'striped', 'blue')]),
      createCell([createShape('square', 'empty', 'blue')])
    ],
    correctAnswer: 0,
    explanation: 'Latin square-mönster: Varje form, färg och fyllnad förekommer exakt en gång per rad och kolumn. Sista cellen måste vara en randig blå fyrkant.',
    patternTypes: ['structural', 'color-change'],
    timeEstimateSeconds: 110
  },

  // ==================== DIFFICULTY 4-5: Avancerade mönster ====================

  // Fråga 12: Tre överlappande former (Difficulty 4)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 4,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'blue', 'large'),
          createShape('square', 'empty', 'red', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'large'),
          createShape('square', 'empty', 'red', 'small'),
          createShape('triangle', 'striped', 'green', 'medium')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'large')
        ])
      ],
      [
        createCell([
          createShape('square', 'solid', 'red', 'large'),
          createShape('triangle', 'empty', 'green', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'large'),
          createShape('triangle', 'empty', 'green', 'small'),
          createShape('circle', 'striped', 'blue', 'medium')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'large')
        ])
      ],
      [
        createCell([
          createShape('triangle', 'solid', 'green', 'large'),
          createShape('circle', 'empty', 'blue', 'small')
        ]),
        createCell([
          createShape('triangle', 'solid', 'green', 'large'),
          createShape('circle', 'empty', 'blue', 'small'),
          createShape('square', 'striped', 'red', 'medium')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'solid', 'green', 'large')]), // CORRECT
      createCell([
        createShape('triangle', 'solid', 'green', 'large'),
        createShape('circle', 'empty', 'blue', 'small')
      ]),
      createCell([createShape('circle', 'solid', 'blue', 'large')]),
      createCell([
        createShape('triangle', 'solid', 'green', 'large'),
        createShape('square', 'striped', 'red', 'medium')
      ]),
      createCell([createShape('square', 'solid', 'red', 'large')]),
      createCell([
        createShape('triangle', 'striped', 'green', 'large')
      ])
    ],
    correctAnswer: 0,
    explanation: 'Överlappningsmönster per rad: Kolumn 1 (2 former), Kolumn 2 (3 former), Kolumn 3 (1 form - endast basformen). Rad 3, Kolumn 3 ska ha endast triangeln.',
    patternTypes: ['quantity', 'structural'],
    timeEstimateSeconds: 120
  },

  // Fråga 13: Diagonal rotation + färgbyte (Difficulty 4)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 4,
    matrix: [
      [
        createCell([createShape('triangle', 'solid', 'blue', 'medium', 0)]),
        createCell([createShape('square', 'solid', 'red', 'medium', 0)]),
        createCell([createShape('circle', 'solid', 'green', 'medium', 0)])
      ],
      [
        createCell([createShape('circle', 'solid', 'red', 'medium', 0)]),
        createCell([createShape('triangle', 'solid', 'green', 'medium', 90)]),
        createCell([createShape('square', 'solid', 'blue', 'medium', 0)])
      ],
      [
        createCell([createShape('square', 'solid', 'green', 'medium', 0)]),
        createCell([createShape('circle', 'solid', 'blue', 'medium', 0)]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'solid', 'red', 'medium', 180)]), // CORRECT
      createCell([createShape('triangle', 'solid', 'red', 'medium', 0)]),
      createCell([createShape('triangle', 'solid', 'blue', 'medium', 180)]),
      createCell([createShape('square', 'solid', 'red', 'medium', 180)]),
      createCell([createShape('triangle', 'solid', 'red', 'medium', 90)]),
      createCell([createShape('triangle', 'striped', 'red', 'medium', 180)])
    ],
    correctAnswer: 0,
    explanation: 'Två mönster: (1) Formrotation per diagonal: top-left→center→bottom-right innehåller triangel (0°→90°→180°). (2) Färgrotation per rad med offset.',
    patternTypes: ['spatial', 'rotation', 'color-change'],
    timeEstimateSeconds: 125
  },

  // Fråga 14: Komplex kvantitet + position (Difficulty 4)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 4,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'black', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'black', 'small'),
          createShape('circle', 'solid', 'black', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'black', 'small'),
          createShape('circle', 'solid', 'black', 'small'),
          createShape('circle', 'solid', 'black', 'small')
        ])
      ],
      [
        createCell([
          createShape('square', 'solid', 'black', 'small'),
          createShape('square', 'solid', 'black', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'black', 'small'),
          createShape('square', 'solid', 'black', 'small'),
          createShape('square', 'solid', 'black', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'black', 'small')
        ])
      ],
      [
        createCell([
          createShape('triangle', 'solid', 'black', 'small'),
          createShape('triangle', 'solid', 'black', 'small'),
          createShape('triangle', 'solid', 'black', 'small')
        ]),
        createCell([
          createShape('triangle', 'solid', 'black', 'small')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([
        createShape('triangle', 'solid', 'black', 'small'),
        createShape('triangle', 'solid', 'black', 'small')
      ]), // CORRECT
      createCell([
        createShape('triangle', 'solid', 'black', 'small'),
        createShape('triangle', 'solid', 'black', 'small'),
        createShape('triangle', 'solid', 'black', 'small')
      ]),
      createCell([
        createShape('triangle', 'solid', 'black', 'small')
      ]),
      createCell([
        createShape('circle', 'solid', 'black', 'small'),
        createShape('circle', 'solid', 'black', 'small')
      ]),
      createCell([
        createShape('square', 'solid', 'black', 'small'),
        createShape('square', 'solid', 'black', 'small')
      ]),
      createCell([
        createShape('triangle', 'striped', 'black', 'small'),
        createShape('triangle', 'striped', 'black', 'small')
      ])
    ],
    correctAnswer: 0,
    explanation: 'Kvantitetsmönster per rad roterar: Rad 1 (1→2→3), Rad 2 (2→3→1), Rad 3 (3→1→2). Formen varierar per rad.',
    patternTypes: ['quantity', 'structural'],
    timeEstimateSeconds: 130
  },

  // Fråga 15: Addition/Subtraktion av element (Difficulty 4)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 4,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'blue', 'medium'),
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'medium')
        ])
      ],
      [
        createCell([
          createShape('triangle', 'solid', 'green', 'medium'),
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([
          createShape('triangle', 'solid', 'green', 'medium')
        ])
      ],
      [
        createCell([
          createShape('square', 'solid', 'red', 'medium'),
          createShape('triangle', 'solid', 'green', 'small')
        ]),
        createCell([
          createShape('triangle', 'solid', 'green', 'small')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('square', 'solid', 'red', 'medium')]), // CORRECT
      createCell([createShape('triangle', 'solid', 'green', 'small')]),
      createCell([
        createShape('square', 'solid', 'red', 'medium'),
        createShape('triangle', 'solid', 'green', 'small')
      ]),
      createCell([createShape('circle', 'solid', 'blue', 'medium')]),
      createCell([createShape('square', 'solid', 'red', 'small')]),
      createCell([createShape('square', 'striped', 'red', 'medium')])
    ],
    correctAnswer: 0,
    explanation: 'Subtraktionsmönster per rad: Kolumn 1 innehåller två former, Kolumn 2 innehåller den form som ska subtraheras, Kolumn 3 är resultatet (återstående form).',
    patternTypes: ['structural', 'quantity'],
    timeEstimateSeconds: 135
  },

  // Fråga 16: Komplex färg + fyllnad + rotation (Difficulty 5)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 5,
    matrix: [
      [
        createCell([createShape('triangle', 'solid', 'blue', 'medium', 0)]),
        createCell([createShape('triangle', 'striped', 'red', 'medium', 45)]),
        createCell([createShape('triangle', 'empty', 'green', 'medium', 90)])
      ],
      [
        createCell([createShape('triangle', 'striped', 'green', 'medium', 0)]),
        createCell([createShape('triangle', 'empty', 'blue', 'medium', 45)]),
        createCell([createShape('triangle', 'solid', 'red', 'medium', 90)])
      ],
      [
        createCell([createShape('triangle', 'empty', 'red', 'medium', 0)]),
        createCell([createShape('triangle', 'solid', 'green', 'medium', 45)]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'striped', 'blue', 'medium', 90)]), // CORRECT
      createCell([createShape('triangle', 'solid', 'blue', 'medium', 90)]),
      createCell([createShape('triangle', 'striped', 'red', 'medium', 90)]),
      createCell([createShape('triangle', 'striped', 'blue', 'medium', 45)]),
      createCell([createShape('triangle', 'empty', 'blue', 'medium', 90)]),
      createCell([createShape('triangle', 'dotted', 'blue', 'medium', 90)])
    ],
    correctAnswer: 0,
    explanation: 'Latin square med tre dimensioner: (1) Färg per rad och kolumn unik, (2) Fyllnad per rad och kolumn unik, (3) Rotation per kolumn: 0°→45°→90°.',
    patternTypes: ['structural', 'color-change', 'rotation'],
    timeEstimateSeconds: 150
  },

  // Fråga 17: Diagonal symmetri (Difficulty 5)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 5,
    matrix: [
      [
        createCell([createShape('circle', 'solid', 'blue')]),
        createCell([createShape('square', 'striped', 'red')]),
        createCell([createShape('triangle', 'empty', 'green')])
      ],
      [
        createCell([createShape('square', 'striped', 'red')]),
        createCell([createShape('triangle', 'solid', 'green')]),
        createCell([createShape('circle', 'empty', 'blue')])
      ],
      [
        createCell([createShape('triangle', 'empty', 'green')]),
        createCell([createShape('circle', 'empty', 'blue')]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('square', 'solid', 'red')]), // CORRECT
      createCell([createShape('circle', 'solid', 'blue')]),
      createCell([createShape('triangle', 'solid', 'green')]),
      createCell([createShape('square', 'striped', 'red')]),
      createCell([createShape('square', 'empty', 'red')]),
      createCell([createShape('square', 'dotted', 'red')])
    ],
    correctAnswer: 0,
    explanation: 'Diagonal spegling: Matrisen är symmetrisk längs huvuddiagonalen (top-left till bottom-right). Position [0,1] = [1,0], [0,2] = [2,0], [1,2] = [2,1]. Center-cellen [2,2] ska komplettera mönstret med solid fyllnad.',
    patternTypes: ['spatial', 'structural'],
    timeEstimateSeconds: 160
  },

  // Fråga 18: XOR-operation (Difficulty 5)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 5,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'blue', 'small'),
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'small')
        ])
      ],
      [
        createCell([
          createShape('triangle', 'solid', 'green', 'small'),
          createShape('circle', 'solid', 'blue', 'small')
        ]),
        createCell([
          createShape('triangle', 'solid', 'green', 'small')
        ]),
        createCell([
          createShape('circle', 'solid', 'blue', 'small')
        ])
      ],
      [
        createCell([
          createShape('square', 'solid', 'red', 'small'),
          createShape('triangle', 'solid', 'green', 'small')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'small')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([createShape('triangle', 'solid', 'green', 'small')]), // CORRECT
      createCell([createShape('square', 'solid', 'red', 'small')]),
      createCell([
        createShape('square', 'solid', 'red', 'small'),
        createShape('triangle', 'solid', 'green', 'small')
      ]),
      createCell([createShape('circle', 'solid', 'blue', 'small')]),
      createCell([]),
      createCell([createShape('triangle', 'striped', 'green', 'small')])
    ],
    correctAnswer: 0,
    explanation: 'XOR-operation per rad: Kolumn 1 innehåller två former (A ∪ B), Kolumn 2 innehåller en form (A), Kolumn 3 innehåller den andra formen (B). Detta är en set difference operation: (A ∪ B) - A = B.',
    patternTypes: ['structural', 'quantity'],
    timeEstimateSeconds: 170
  },

  // Fråga 19: Komplex överlappning + färgblandning (Difficulty 5)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 5,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'blue', 'large'),
          createShape('circle', 'solid', 'red', 'medium')
        ]),
        createCell([
          createShape('square', 'solid', 'red', 'large'),
          createShape('square', 'solid', 'green', 'medium')
        ]),
        createCell([
          createShape('triangle', 'solid', 'green', 'large'),
          createShape('triangle', 'solid', 'blue', 'medium')
        ])
      ],
      [
        createCell([
          createShape('square', 'solid', 'green', 'large'),
          createShape('square', 'solid', 'blue', 'medium')
        ]),
        createCell([
          createShape('triangle', 'solid', 'blue', 'large'),
          createShape('triangle', 'solid', 'red', 'medium')
        ]),
        createCell([
          createShape('circle', 'solid', 'red', 'large'),
          createShape('circle', 'solid', 'green', 'medium')
        ])
      ],
      [
        createCell([
          createShape('triangle', 'solid', 'red', 'large'),
          createShape('triangle', 'solid', 'green', 'medium')
        ]),
        createCell([
          createShape('circle', 'solid', 'green', 'large'),
          createShape('circle', 'solid', 'blue', 'medium')
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([
        createShape('square', 'solid', 'blue', 'large'),
        createShape('square', 'solid', 'red', 'medium')
      ]), // CORRECT
      createCell([
        createShape('square', 'solid', 'red', 'large'),
        createShape('square', 'solid', 'blue', 'medium')
      ]),
      createCell([
        createShape('triangle', 'solid', 'blue', 'large'),
        createShape('triangle', 'solid', 'red', 'medium')
      ]),
      createCell([
        createShape('circle', 'solid', 'blue', 'large'),
        createShape('circle', 'solid', 'red', 'medium')
      ]),
      createCell([
        createShape('square', 'solid', 'green', 'large'),
        createShape('square', 'solid', 'blue', 'medium')
      ]),
      createCell([
        createShape('square', 'striped', 'blue', 'large'),
        createShape('square', 'striped', 'red', 'medium')
      ])
    ],
    correctAnswer: 0,
    explanation: 'Latin square med överlappning: Varje form förekommer en gång per rad/kolumn. Färgparen roterar: blå+röd, röd+grön, grön+blå. Rad 3, Kolumn 3 måste vara fyrkant (den enda formen som saknas i rad 3) med färgpar blå+röd.',
    patternTypes: ['structural', 'color-change', 'quantity'],
    timeEstimateSeconds: 180
  },

  // Fråga 20: Ultra-komplex multi-dimensionell transformation (Difficulty 5)
  {
    id: crypto.randomUUID(),
    testType: 'matrislogik-classic',
    difficulty: 5,
    matrix: [
      [
        createCell([
          createShape('circle', 'solid', 'blue', 'small', 0),
          createShape('square', 'striped', 'red', 'medium', 45)
        ]),
        createCell([
          createShape('circle', 'striped', 'red', 'medium', 45),
          createShape('square', 'empty', 'green', 'large', 90)
        ]),
        createCell([
          createShape('circle', 'empty', 'green', 'large', 90),
          createShape('square', 'solid', 'blue', 'small', 0)
        ])
      ],
      [
        createCell([
          createShape('square', 'solid', 'green', 'small', 0),
          createShape('triangle', 'striped', 'blue', 'medium', 45)
        ]),
        createCell([
          createShape('square', 'striped', 'blue', 'medium', 45),
          createShape('triangle', 'empty', 'red', 'large', 90)
        ]),
        createCell([
          createShape('square', 'empty', 'red', 'large', 90),
          createShape('triangle', 'solid', 'green', 'small', 0)
        ])
      ],
      [
        createCell([
          createShape('triangle', 'solid', 'red', 'small', 0),
          createShape('circle', 'striped', 'green', 'medium', 45)
        ]),
        createCell([
          createShape('triangle', 'striped', 'green', 'medium', 45),
          createShape('circle', 'empty', 'blue', 'large', 90)
        ]),
        createCell([]) // Missing
      ]
    ],
    options: [
      createCell([
        createShape('triangle', 'empty', 'blue', 'large', 90),
        createShape('circle', 'solid', 'red', 'small', 0)
      ]), // CORRECT
      createCell([
        createShape('triangle', 'solid', 'blue', 'large', 90),
        createShape('circle', 'solid', 'red', 'small', 0)
      ]),
      createCell([
        createShape('triangle', 'empty', 'red', 'large', 90),
        createShape('circle', 'solid', 'blue', 'small', 0)
      ]),
      createCell([
        createShape('triangle', 'empty', 'blue', 'large', 0),
        createShape('circle', 'solid', 'red', 'small', 90)
      ]),
      createCell([
        createShape('circle', 'empty', 'blue', 'large', 90),
        createShape('triangle', 'solid', 'red', 'small', 0)
      ]),
      createCell([
        createShape('triangle', 'dotted', 'blue', 'large', 90),
        createShape('circle', 'solid', 'red', 'small', 0)
      ])
    ],
    correctAnswer: 0,
    explanation: 'Multi-dimensionell transformation med fem samtidiga mönster: (1) Form 1 roterar per rad: cirkel→fyrkant→triangel. (2) Form 2 roterar per rad: fyrkant→triangel→cirkel. (3) Inom varje rad, färg på form 1 transformeras: kolumn 1 färg → kolumn 2 → kolumn 3 (cyklisk rotation). (4) Fyllnad transformeras: solid→striped→empty per kolumn för form 1. (5) Storlek växer: small→medium→large per kolumn, samtidigt som rotation ökar: 0°→45°→90°.',
    patternTypes: ['structural', 'color-change', 'rotation', 'size-change', 'spatial'],
    timeEstimateSeconds: 200
  }
];

// ============================================================================
// HELPER - Hämta frågor för test
// ============================================================================

export function getQuestionsForTest(count: number = 15): ServerQuestion[] {
  // Shuffle och välj random frågor
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);

  // Balansera svårighetsgrad (3 lätta, 7 medium, 5 svåra)
  const easy = shuffled.filter(q => q.difficulty <= 2).slice(0, 3);
  const medium = shuffled.filter(q => q.difficulty === 3).slice(0, 7);
  const hard = shuffled.filter(q => q.difficulty >= 4).slice(0, 5);

  return [...easy, ...medium, ...hard].slice(0, count);
}

export function getQuestionById(id: string): ServerQuestion | undefined {
  return QUESTION_BANK.find(q => q.id === id);
}
