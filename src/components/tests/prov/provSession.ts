// Hämtar en enskild prov-session via GET <endpoint>?id=<uuid>.
// Kontrakt (samma som logicTestV4/session): { session } med answers[],
// started_at och completed_at (null tills provet rättats).
// Returnerar null vid nätverksfel/404 — rehydreringen ska aldrig blockera
// provet, då fortsätter sidan med tomt state precis som tidigare.

export interface ProvSessionSnapshot {
  completed_at: string | null;
  started_at: string | null;
  answers: unknown[];
}

export async function fetchProvSession(
  endpoint: string,
  sessionId: string
): Promise<ProvSessionSnapshot | null> {
  try {
    const res = await fetch(`${endpoint}?id=${sessionId}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const session = data?.session;
    if (!session) return null;
    return {
      completed_at: session.completed_at ?? null,
      started_at: session.started_at ?? null,
      answers: Array.isArray(session.answers) ? session.answers : [],
    };
  } catch {
    return null;
  }
}
