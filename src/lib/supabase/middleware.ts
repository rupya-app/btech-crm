import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip expensive remote auth checks on background RSC link prefetches
  if (
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch'
  ) {
    return NextResponse.next();
  }

  // 2. Fast-path: check cached profile cookie + Supabase session cookie in <1ms
  const cachedProfileCookie = request.cookies.get('crm_profile')?.value;
  const hasSbAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.value.length > 10);

  if (cachedProfileCookie && hasSbAuthCookie) {
    try {
      const profile = JSON.parse(decodeURIComponent(cachedProfileCookie));

      if (profile && profile.is_active === false) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'account_deactivated');
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/employee/dashboard';
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith('/employee') && profile.role !== 'employee') {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
      }

      if (pathname === '/login' || pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname =
          profile.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch {
      // Fall through to full verification if cookie parse fails
    }
  }

  // 3. If no auth cookie at all and accessing protected page, redirect immediately in 0ms
  if (
    !hasSbAuthCookie &&
    !pathname.startsWith('/login') &&
    pathname !== '/'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (!hasSbAuthCookie && (pathname.startsWith('/login') || pathname === '/')) {
    return NextResponse.next();
  }

  // 4. Slow-path only once when `crm_profile` cookie is missing
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !pathname.startsWith('/login') && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, is_active, must_change_password, full_name, employee_id, email')
      .eq('id', user.id)
      .single();

    if (profile) {
      const cachePayload = encodeURIComponent(
        JSON.stringify({
          id: profile.id,
          role: profile.role,
          fullName: profile.full_name,
          employeeId: profile.employee_id,
          email: profile.email || user.email,
          is_active: profile.is_active,
        })
      );
      supabaseResponse.cookies.set('crm_profile', cachePayload, {
        path: '/',
        maxAge: 60 * 60 * 12,
        sameSite: 'lax',
      });

      if (!profile.is_active) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/employee/dashboard';
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith('/employee') && profile.role !== 'employee') {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
      }

      if (pathname === '/login' || pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname =
          profile.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
