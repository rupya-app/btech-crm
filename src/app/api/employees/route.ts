import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createAdminClient, invalidateCrmCache } from '@/lib/supabase/server';
import { generateEmployeeId } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = await getDbClient();
    const { data: employees, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/employees error:', error);
      return NextResponse.json({ employees: [] });
    }

    return NextResponse.json({ employees: employees || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, employees: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, department, jobTitle, password } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const employeeId = (body.employeeId || generateEmployeeId('EMP')).toUpperCase();
    const provisionalPassword = password || 'Password@123';
    const cleanEmail = email.trim().toLowerCase();

    const adminClient = createAdminClient();

    // 1. Create user in Supabase Auth via Admin API
    let userId: string | null = null;
    const { data: createdAuth, error: authErr } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: provisionalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        employee_id: employeeId,
        role: 'employee',
      },
    });

    if (authErr) {
      // Check if user already exists in auth.users
      const { data: existingList } = await adminClient.auth.admin.listUsers();
      const found = existingList?.users?.find(
        (u: any) => u.email?.toLowerCase() === cleanEmail
      );
      if (found) {
        userId = found.id;
      } else {
        return NextResponse.json(
          { error: authErr.message || 'Failed to create auth account in Supabase' },
          { status: 400 }
        );
      }
    } else {
      userId = createdAuth.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not resolve user ID' }, { status: 500 });
    }

    // 2. Upsert into public.profiles
    const profilePayload = {
      id: userId,
      employee_id: employeeId,
      full_name: fullName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      role: 'employee',
      department: department || 'Enterprise Sales',
      job_title: jobTitle || 'Sales Executive',
      is_active: true,
      must_change_password: false,
    };

    const { data: insertedProfile, error: profileErr } = await adminClient
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*')
      .single();

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    // 3. Create welcome notification for employee
    await adminClient.from('notifications').insert({
      user_id: userId,
      title: 'Welcome to Digital Sales CRM',
      message: `Your account (${employeeId}) is active. You can now claim and manage leads.`,
      notification_type: 'account_created',
    });

    // 4. Audit log
    await adminClient.from('audit_logs').insert({
      action: 'Employee Account Created',
      entity_type: 'profile',
      entity_id: userId,
      after_data: { employee_id: employeeId, full_name: fullName.trim(), email: cleanEmail },
    });

    invalidateCrmCache();

    return NextResponse.json({
      success: true,
      message: `Employee ${fullName} created with ID ${employeeId}. Default password: ${provisionalPassword}`,
      employee: insertedProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active, newPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (typeof is_active === 'boolean') {
      const { data, error } = await adminClient
        .from('profiles')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      invalidateCrmCache();
      return NextResponse.json({ success: true, employee: data });
    }

    if (newPassword) {
      const { error } = await adminClient.auth.admin.updateUserById(id, {
        password: newPassword,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Employee password updated successfully.',
      });
    }

    return NextResponse.json({ error: 'No update parameters provided' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
