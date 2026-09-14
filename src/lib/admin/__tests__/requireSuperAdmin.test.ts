import { describe, it, expect, vi, beforeEach } from 'vitest';

// Sessionen och service role-klienten mockas, så testet mäter helperns
// beslutslogik och ingenting annat: 401 utan session, 403 utan rollen
// super_admin, ok först när admin_users har en rad med den rollen.

const getUser = vi.fn();
const maybeSingle = vi.fn();

const eqRole = vi.fn(() => ({ maybeSingle }));
const eqId = vi.fn(() => ({ eq: eqRole }));
const select = vi.fn(() => ({ eq: eqId }));
const from = vi.fn(() => ({ select }));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ from }),
}));

import {
  requireSuperAdmin,
  getSuperAdminUserId,
} from '../requireSuperAdmin';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requireSuperAdmin', () => {
  it('ger 401 utan session', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await requireSuperAdmin();

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it('ger 403 när användaren saknar rollen', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.se' } } });
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const res = await requireSuperAdmin();

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(403);
  });

  it('frågar admin_users på just super_admin', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.se' } } });
    maybeSingle.mockResolvedValue({ data: { role: 'super_admin' }, error: null });

    await requireSuperAdmin();

    expect(from).toHaveBeenCalledWith('admin_users');
    expect(eqId).toHaveBeenCalledWith('id', 'u1');
    expect(eqRole).toHaveBeenCalledWith('role', 'super_admin');
  });

  it('släpper igenom super_admin och ger tillbaka id och e-post', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.se' } } });
    maybeSingle.mockResolvedValue({ data: { role: 'super_admin' }, error: null });

    const res = await requireSuperAdmin();

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.userId).toBe('u1');
      expect(res.email).toBe('a@b.se');
    }
  });

  it('ger 403 när uppslaget mot admin_users fallerar', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: null } } });
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const res = await requireSuperAdmin();

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(403);
  });
});

describe('getSuperAdminUserId', () => {
  it('ger null utan session', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect(await getSuperAdminUserId()).toBeNull();
  });

  it('ger null när rollen saknas', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: null } } });
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await getSuperAdminUserId()).toBeNull();
  });

  it('ger användarens id för super_admin', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: null } } });
    maybeSingle.mockResolvedValue({ data: { role: 'super_admin' }, error: null });
    expect(await getSuperAdminUserId()).toBe('u1');
  });
});
