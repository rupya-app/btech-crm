import { NextRequest, NextResponse } from 'next/server';
import {
  getDbClient,
  createAdminClient,
  invalidateCrmCache,
  fetchAllRows,
} from '@/lib/supabase/server';
import { generateEmployeeId } from '@/lib/utils';

export type AccountStatus = 'active' | 'paused' | 'deactivated';

export function resolveAccountStatus(profile: any): AccountStatus {
  if (profile.is_active) return 'active';
  if (profile.avatar_url === 'status:paused') return 'paused';
  return 'deactivated';
}

export async function GET() {
  try {
    const supabase = await getDbClient();

    const [{ data: employees, error }, activeAssignments] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .order('created_at', { ascending: false }),
      fetchAllRows((from, to) =>
        supabase
          .from('lead_assignments')
          .select('employee_id')
          .eq('is_active', true)
          .range(from, to)
      ),
    ]);

    if (error) {
      console.error('GET /api/employees error:', error);
      return NextResponse.json({ employees: [] });
    }

    const activeCountMap = new Map<string, number>();
    activeAssignments.forEach((a: any) => {
      activeCountMap.set(a.employee_id, (activeCountMap.get(a.employee_id) || 0) + 1);
    });

    const enriched = (employees || []).map((emp: any) => ({
      ...emp,
      account_status: resolveAccountStatus(emp),
      active_leads_count: activeCountMap.get(emp.id) || 0,
    }));

    return NextResponse.json({ employees: enriched });
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
        account_status: 'active',
      },
    });

    if (authErr) {
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
      avatar_url: 'status:active',
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

    await adminClient.from('notifications').insert({
      user_id: userId,
      title: 'Welcome to Digital Sales CRM',
      message: `Your account (${employeeId}) is active. You can now claim and manage leads.`,
      notification_type: 'account_created',
    });

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
      employee: {
        ...insertedProfile,
        account_status: 'active',
        active_leads_count: 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      action,
      accountStatus,
      newPassword,
    }: {
      id: string;
      action?: 'pause' | 'resume' | 'deactivate' | 'reset_password';
      accountStatus?: AccountStatus;
      newPassword?: string;
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch existing employee profile first
    const { data: currentProfile, error: fetchErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !currentProfile) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const currentStatus = resolveAccountStatus(currentProfile);

    // Password reset
    if (newPassword || action === 'reset_password') {
      if (currentStatus === 'deactivated') {
        return NextResponse.json(
          { error: 'Cannot reset password for a permanently deactivated account.' },
          { status: 400 }
        );
      }
      const { error } = await adminClient.auth.admin.updateUserById(id, {
        password: newPassword || 'Password@123',
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Employee password updated successfully.',
      });
    }

    const targetStatus: AccountStatus | undefined =
      accountStatus ||
      (action === 'pause'
        ? 'paused'
        : action === 'resume'
        ? 'active'
        : action === 'deactivate'
        ? 'deactivated'
        : undefined);

    if (!targetStatus) {
      return NextResponse.json({ error: 'No status action specified' }, { status: 400 });
    }

    // CRITICAL RULE: Once deactivated, an account can NEVER be made active or paused again
    if (currentStatus === 'deactivated' && targetStatus !== 'deactivated') {
      return NextResponse.json(
        {
          error: `${currentProfile.full_name} (${currentProfile.employee_id}) is permanently deactivated and cannot be reactivated.`,
        },
        { status: 400 }
      );
    }

    // 1. PAUSE ACCOUNT (Temporary Portal Lock — Leads remain assigned, can be resumed later)
    if (targetStatus === 'paused') {
      const { data: updated, error } = await adminClient
        .from('profiles')
        .update({
          is_active: false,
          avatar_url: 'status:paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await adminClient.auth.admin.updateUserById(id, {
        user_metadata: { account_status: 'paused' },
      });

      await adminClient.from('audit_logs').insert({
        action: 'Employee Portal Paused',
        entity_type: 'profile',
        entity_id: id,
        after_data: { status: 'paused', employee_id: currentProfile.employee_id },
      });

      invalidateCrmCache();

      return NextResponse.json({
        success: true,
        revertedLeadsCount: 0,
        message: `${currentProfile.full_name} (${currentProfile.employee_id}) has been paused. Their portal access is temporarily locked until you resume their account.`,
        employee: {
          ...updated,
          account_status: 'paused',
        },
      });
    }

    // 2. RESUME / ACTIVATE ACCOUNT (Only allowed from 'paused')
    if (targetStatus === 'active') {
      const { data: updated, error } = await adminClient
        .from('profiles')
        .update({
          is_active: true,
          avatar_url: 'status:active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await adminClient.auth.admin.updateUserById(id, {
        user_metadata: { account_status: 'active' },
      });

      await adminClient.from('audit_logs').insert({
        action: 'Employee Portal Resumed',
        entity_type: 'profile',
        entity_id: id,
        after_data: { status: 'active', employee_id: currentProfile.employee_id },
      });

      invalidateCrmCache();

      return NextResponse.json({
        success: true,
        revertedLeadsCount: 0,
        message: `${currentProfile.full_name} (${currentProfile.employee_id}) is now Active and can access their sales portal again.`,
        employee: {
          ...updated,
          account_status: 'active',
        },
      });
    }

    // 3. PERMANENT DEACTIVATION:
    // - Reverts all currently assigned leads back to the Unassigned Pool (`is_active = false, released_at = now()`)
    // - Preserves 100% of historical assignments, activities, calls, remarks, and daily work logs
    // - Permanently locks the account from ever being reactivated
    if (targetStatus === 'deactivated') {
      const nowIso = new Date().toISOString();

      // Atomically mark ALL active assignments for this employee as inactive and released
      const { data: revertedRows, error: revertErr } = await adminClient
        .from('lead_assignments')
        .update({
          is_active: false,
          released_at: nowIso,
        })
        .eq('employee_id', id)
        .eq('is_active', true)
        .select('lead_id');

      if (revertErr) {
        console.error('Error reverting lead assignments on deactivation:', revertErr);
      }

      const leadIdsToRevert = (revertedRows || []).map((r: any) => r.lead_id);

      if (leadIdsToRevert.length > 0) {
        const CHUNK_SIZE = 250;
        for (let i = 0; i < leadIdsToRevert.length; i += CHUNK_SIZE) {
          const chunk = leadIdsToRevert.slice(i, i + CHUNK_SIZE);
          const revertActivities = chunk.map((lId: string) => ({
            lead_id: lId,
            employee_id: id,
            activity_type: 'lead_reverted_to_pool',
            description: `Lead automatically reverted to Unassigned Pool upon permanent deactivation of ${currentProfile.full_name} (${currentProfile.employee_id}).`,
          }));
          await adminClient.from('lead_activities').insert(revertActivities);
        }
      }

      const { data: updated, error } = await adminClient
        .from('profiles')
        .update({
          is_active: false,
          avatar_url: 'status:deactivated',
          updated_at: nowIso,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await adminClient.auth.admin.updateUserById(id, {
        user_metadata: { account_status: 'deactivated' },
      });

      await adminClient.from('audit_logs').insert({
        action: 'Employee Permanently Deactivated & Leads Reverted',
        entity_type: 'profile',
        entity_id: id,
        after_data: {
          status: 'deactivated',
          employee_id: currentProfile.employee_id,
          reverted_leads_count: leadIdsToRevert.length,
        },
      });

      invalidateCrmCache();

      return NextResponse.json({
        success: true,
        revertedLeadsCount: leadIdsToRevert.length,
        message: `${currentProfile.full_name} (${currentProfile.employee_id}) has been permanently deactivated. ${leadIdsToRevert.length} assigned lead(s) have been reverted to the Unassigned Pool and are now available to assign to other representatives. Their complete work history is preserved.`,
        employee: {
          ...updated,
          account_status: 'deactivated',
          active_leads_count: 0,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
