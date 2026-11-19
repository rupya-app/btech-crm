import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Singleton admin client instance so we don't recreate HTTP clients on every query
let cachedAdminClient: SupabaseClient | null = null;

// Fast in-memory server query cache with instant mutation invalidation
const serverQueryCache = new Map<string, { data: any; expiresAt: number }>();

export async function getCachedOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = serverQueryCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.data as T;
  }
  const data = await fetcher();
  serverQueryCache.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

export function invalidateCrmCache() {
  serverQueryCache.clear();
}

/**
 * Fetches all rows from a Supabase table in 1000-row chunks so queries
 * never silently truncate at PostgREST's default 1,000-row limit.
 */
export async function fetchAllRows<T = any>(
  queryBuilderFactory: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  let all: T[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await queryBuilderFactory(offset, offset + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component
          }
        },
      },
    }
  );
}

// Admin client with service role key — singleton for maximum performance
export function createAdminClient() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  cachedAdminClient = createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedAdminClient;
}

// Preferred server DB client: uses singleton service role client if available
export async function getDbClient() {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_')
  ) {
    return createAdminClient();
  }
  return createServerSupabaseClient();
}
