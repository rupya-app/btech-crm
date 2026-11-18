// Supabase middleware for session refresh
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user and trying to access protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/api/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in, check role-based access
  if (user) {
    const pathname = request.nextUrl.pathname;

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active, must_change_password')
      .eq('id', user.id)
      .single();

    // Deactivated user
    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'account_deactivated');
      return NextResponse.redirect(url);
    }

    // Admin trying to access employee routes or vice versa
    if (profile) {
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

      // Must change password redirect
      if (
        profile.must_change_password &&
        !pathname.startsWith('/change-password') &&
        !pathname.startsWith('/api')
      ) {
        const url = request.nextUrl.clone();
        url.pathname = '/change-password';
        return NextResponse.redirect(url);
      }
    }

    // Redirect logged-in user from login to their dashboard
    if (pathname === '/login' || pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = profile?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
