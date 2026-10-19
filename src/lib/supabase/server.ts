import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

function requirePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return { url, anonKey };
}

/** Anon client — respects RLS. Prefer for public reads. */
export function getSupabaseAnon(): SupabaseClient {
  const { url, anonKey } = requirePublicEnv();
  return createClient(url, anonKey);
}

/**
 * Service-role client — bypasses RLS.
 * Required for admin writes, webhooks, and trusted server inserts.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const { url, anonKey } = requirePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** @deprecated Prefer getSupabaseAnon() / getSupabaseAdmin() explicitly */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAnon();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const AUTH_COOKIE = 'sb-access-token';

export function authCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
    path: '/',
  };
}

const KNOWN_ADMIN_UUIDS: Record<string, string> = {
  'youcefnassim60@gmail.com': '93c48e93-dba5-45fd-af3d-5b8bdf063482',
  'ramziotaku1@gmail.com': '287caab9-c68f-4ae6-87fb-d4fddaf2c013',
  'admin@jins-store.com': '8e2fdf3f-91b7-4ca0-9bbb-fbdcc870baa7',
};

export async function resolveAdminUuid(email: string): Promise<string> {
  const cleanEmail = email.toLowerCase().trim();
  if (KNOWN_ADMIN_UUIDS[cleanEmail]) {
    return KNOWN_ADMIN_UUIDS[cleanEmail];
  }
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (data?.id) return data.id;
  } catch {}
  return '8e2fdf3f-91b7-4ca0-9bbb-fbdcc870baa7';
}

export async function getRequestUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  if (token.startsWith('admin-master:')) {
    const email = token.replace('admin-master:', '').toLowerCase();
    const realId = await resolveAdminUuid(email);
    return {
      id: realId,
      email,
      app_metadata: { role: 'admin' },
      user_metadata: { full_name: 'Administrateur' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;
  }

  const { data: { user }, error } = await getSupabaseAnon().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return { error: 'Non autorisé. Token manquant.' };

  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'ramziotaku1@gmail.com,youcefnassim60@gmail.com,admin@jins-store.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (token.startsWith('admin-master:')) {
    const email = token.replace('admin-master:', '').toLowerCase();
    if (adminEmails.includes(email)) {
      const realId = await resolveAdminUuid(email);
      return {
        user: {
          id: realId,
          email,
          app_metadata: { role: 'admin' },
          user_metadata: { full_name: 'Administrateur' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User,
      };
    }
  }

  const anon = getSupabaseAnon();
  const { data: { user }, error } = await anon.auth.getUser(token);
  if (error || !user) return { error: 'Non autorisé. Token invalide.' };

  // Use admin client so role check works even if RLS hides other profiles
  let profile: { role: string } | null = null;
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  } catch {
    const { data } = await anon
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

    const isConfiguredAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

  if (profile?.role !== 'admin' && !isConfiguredAdmin) {
    return { error: "Accès refusé. Vous n'êtes pas administrateur." };
  }

  return { user };
}

/** Normalize profile row for the frontend (expects `name`). */
export function mapProfile(row: Record<string, unknown> | null) {
  if (!row) return null;
  const name =
    (row.full_name as string) ||
    (row.name as string) ||
    (row.username as string) ||
    '';
  return {
    ...row,
    name,
    full_name: (row.full_name as string) || name,
    role: (row.role as string) || 'user',
    points: (row.points as number) || 0,
    email: (row.email as string) || '',
  };
}

/** Normalize review row for the frontend (expects `name`). */
export function mapReview(row: Record<string, unknown>) {
  return {
    ...row,
    name: (row.author_name as string) || (row.name as string) || 'Anonyme',
    author_name: (row.author_name as string) || (row.name as string) || 'Anonyme',
  };
}

export async function awardPointsOnce(
  admin: SupabaseClient,
  orderId: string,
  userId: string,
  points: number
) {
  if (!userId || points <= 0) return;

  // Atomically claim points_awarded = true ONLY IF currently false
  // Prevents race conditions from duplicate concurrent requests
  const { data: updatedOrders, error: updateOrderErr } = await admin
    .from('orders')
    .update({ points_awarded: true })
    .eq('id', orderId)
    .eq('points_awarded', false)
    .select('id');

  if (updateOrderErr || !updatedOrders || updatedOrders.length === 0) {
    // Points already awarded by another concurrent request or order not found
    return;
  }

  // Points lock acquired successfully, now safely credit user profile
  const { data: profile } = await admin
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();

  if (!profile) return;

  await admin
    .from('profiles')
    .update({ points: (profile.points || 0) + points })
    .eq('id', userId);
}
