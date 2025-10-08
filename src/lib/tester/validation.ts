import { z } from 'zod';

// P0: Validera att rotation endast är godkända värden
const rotationSet = new Set([0, 45, 90, 135, 180, 225, 270, 315]);

// Shape schema med alla domänregler
export const shapeSchema = z.object({
  form: z.enum(['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star']),
  fill: z.enum(['solid', 'striped', 'dotted', 'crosshatch', 'empty']),
  color: z.enum(['blue', 'red', 'green', 'black', 'yellow', 'purple']),
  size: z.enum(['small', 'medium', 'large']),
  rotation: z.number()
    .refine(n => rotationSet.has(n), {
      message: 'Rotation måste vara 0, 45, 90, 135, 180, 225, 270 eller 315 grader'
    })
    .optional(),
});

// Cell schema
export const cellSchema = z.object({
  shapes: z.array(shapeSchema)
});

// UserAnswer schema - validerar inkommande svar från klient
export const userAnswerSchema = z.object({
  questionId: z.string().uuid('Question ID måste vara ett giltigt UUID'),
  userAnswer: z.number()
    .int('User answer måste vara ett heltal')
    .min(-1, 'User answer måste vara -1 (obesvarad) eller 0-5')
    .max(5, 'User answer måste vara mellan 0-5 (A-F)'),
  timeSpent: z.number()
    .int('Time spent måste vara ett heltal')
    .min(0, 'Time spent kan inte vara negativt')
    .optional()
});

// Submit payload schema - validerar hela inlämningen
export const submitPayloadSchema = z.object({
  sessionToken: z.string().min(1, 'Session token krävs'),
  answers: z.array(userAnswerSchema)
    .min(0, 'Answers array kan vara tom men måste finnas')
    .max(50, 'För många svar - max 50 frågor per test'), // Säkerhetsgräns
  timeSpent: z.number()
    .int('Total time spent måste vara ett heltal')
    .min(0, 'Total time spent kan inte vara negativt')
    .max(7200, 'Total time spent kan inte överstiga 2 timmar (7200s)') // Säkerhetsgräns
});

// ServerQuestion validation schema - för att validera frågebanken
export const serverQuestionSchema = z.object({
  id: z.string().uuid('Question ID måste vara ett giltigt UUID'),
  testType: z.literal('matrislogik-classic'),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5)
  ]),
  matrix: z.tuple([
    z.tuple([cellSchema, cellSchema, cellSchema]),
    z.tuple([cellSchema, cellSchema, cellSchema]),
    z.tuple([cellSchema, cellSchema, cellSchema])
  ]),
  options: z.array(cellSchema)
    .length(6, 'Options måste ha exakt 6 alternativ'),
  correctAnswer: z.number()
    .int('Correct answer måste vara ett heltal')
    .min(0, 'Correct answer måste vara mellan 0-5')
    .max(5, 'Correct answer måste vara mellan 0-5'),
  explanation: z.string().min(1, 'Explanation krävs'),
  patternTypes: z.array(z.string()),
  timeEstimateSeconds: z.number()
    .int('Time estimate måste vara ett heltal')
    .min(0, 'Time estimate kan inte vara negativt')
}).refine(
  (q) => q.matrix[2][2].shapes.length === 0,
  { message: 'Sista cellen [2,2] måste vara tom' }
);
