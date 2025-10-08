import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.TEST_SESSION_SECRET || 'default-secret-change-in-production'
);

export interface SessionPayload {
  userId: string;
  testType: string;
  questionIds: string[]; // Order viktigt för att matcha svar
  nonce: string;
  exp?: number;
}

export async function createTestSession(
  userId: string,
  testType: string,
  questionIds: string[]
): Promise<string> {
  const token = await new SignJWT({
    userId,
    testType,
    questionIds,
    nonce: crypto.randomUUID()
  } as SessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30m') // 30 min session
    .sign(SECRET);

  return token;
}

export async function verifyTestSession(token: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as SessionPayload;
  } catch (error) {
    throw new Error('Invalid or expired session token');
  }
}
