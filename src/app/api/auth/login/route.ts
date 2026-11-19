import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier (Email or Employee ID) and password are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if Supabase keys are configured
    if (!supabaseUrl || !supabaseAnonKey) {
      // In local development / preview mode without database credentials configured,
      // allow testing with demo accounts safely
      if (identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@digitalcrm.com') {
        if (password === 'admin123' || password === 'admin') {
          return NextResponse.json({
            success: true,
            user: {
              id: 'demo-admin-id',
              role: 'admin',
              fullName: 'Main Administrator',
              employeeId: 'ADM001',
              email: 'admin@digitalcrm.com',
            },
            redirectTo: '/admin/dashboard',
          });
        }
      }

      if (identifier.toUpperCase().startsWith('EMP') || identifier.toLowerCase().includes('employee')) {
        if (password === 'emp123' || password === 'password123') {
          return NextResponse.json({
            success: true,
            user: {
              id: 'demo-emp-id',
              role: 'employee',
              fullName: 'Sales Executive',
              employeeId: identifier.toUpperCase(),
              email: 'employee@digitalcrm.com',
            },
            redirectTo: '/employee/dashboard',
          });
        }
      }

      return NextResponse.json(
        {
          error:
            'Invalid credentials or Supabase environment variables not configured. (Use admin / admin123 for demo admin or EMP1001 / emp123 for demo employee)',
        },
        { status: 401 }
      );
    }

    // Connect to Supabase
    let emailToAuth = identifier.trim();

    // If identifier is not an email (e.g. Employee ID like EMP1001), look up email
    const isEmail = identifier.includes('@');
    if (!isEmail) {
      // Server-side lookup using service role or standard client
      const lookupClient = serviceRoleKey
        ? (await import('@supabase/supabase-js')).createClient(supabaseUrl, serviceRoleKey)
        : createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { getAll: () => [] } });

      const { data: profile, error: lookupError } = await lookupClient
        .from('profiles')
        .select('email, is_active, role, avatar_url')
        .eq('employee_id', identifier.trim().toUpperCase())
        .single();

      if (lookupError || !profile) {
        return NextResponse.json(
          { error: `No account found for Employee ID: ${identifier}` },
          { status: 404 }
        );
      }

      if (!profile.is_active) {
        const isPaused = profile.avatar_url === 'status:paused';
        return NextResponse.json(
          {
            error: isPaused
              ? 'Your sales portal access is temporarily PAUSED by the administrator. Please contact your manager to resume access.'
              : 'This employee account has been permanently DEACTIVATED. Portal access is revoked.',
          },
          { status: 403 }
        );
      }

      emailToAuth = profile.email;
    }

    // Now authenticate with Supabase Auth using the email & password
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid login credentials' },
        { status: 401 }
      );
    }

    // Fetch user profile to verify role and status
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role, is_active, must_change_password, full_name, employee_id, avatar_url')
      .eq('id', authData.user.id)
      .single();

    if (userProfile && !userProfile.is_active) {
      await supabase.auth.signOut();
      const isPaused = userProfile.avatar_url === 'status:paused';
      return NextResponse.json(
        {
          error: isPaused
            ? 'Your sales portal access is temporarily PAUSED by the administrator. Please contact your manager to resume access.'
            : 'This account has been permanently DEACTIVATED. Access revoked.',
        },
        { status: 403 }
      );
    }

    const userRole = userProfile?.role || 'employee';
    let redirectTo = userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard';

    if (userProfile?.must_change_password) {
      redirectTo = '/change-password';
    }

    const userPayload = {
      id: authData.user.id,
      role: userRole,
      fullName: userProfile?.full_name || 'Administrator',
      employeeId: userProfile?.employee_id || 'ADM001',
      email: emailToAuth,
      is_active: userProfile?.is_active ?? true,
    };

    cookieStore.set('crm_profile', encodeURIComponent(JSON.stringify(userPayload)), {
      path: '/',
      maxAge: 60 * 60 * 12,
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      user: userPayload,
      redirectTo,
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
