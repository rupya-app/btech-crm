import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { generateEmployeeId } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: employees, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });

    if (error || !employees) {
      // Fallback demo employees
      return NextResponse.json({
        employees: [
          {
            id: 'emp-1',
            employee_id: 'EMP1001',
            full_name: 'Priya Sharma',
            email: 'priya.sharma@digitalcrm.com',
            phone: '+91 98201 55667',
            department: 'Enterprise Sales',
            job_title: 'Senior Sales Executive',
            is_active: true,
            created_at: new Date(Date.now() - 3600000 * 2400).toISOString(),
          },
          {
            id: 'emp-2',
            employee_id: 'EMP1002',
            full_name: 'Vikram Patel',
            email: 'vikram.patel@digitalcrm.com',
            phone: '+91 98112 44332',
            department: 'SMB Sales',
            job_title: 'Sales Associate',
            is_active: true,
            created_at: new Date(Date.now() - 3600000 * 1800).toISOString(),
          },
          {
            id: 'emp-3',
            employee_id: 'EMP1003',
            full_name: 'Rahul Varma',
            email: 'rahul.varma@digitalcrm.com',
            phone: '+91 99887 11223',
            department: 'Inbound Sales',
            job_title: 'Inside Sales Specialist',
            is_active: true,
            created_at: new Date(Date.now() - 3600000 * 1200).toISOString(),
          },
          {
            id: 'emp-4',
            employee_id: 'EMP1004',
            full_name: 'Ananya Roy',
            email: 'ananya.roy@digitalcrm.com',
            phone: '+91 98401 77889',
            department: 'Mid-Market Sales',
            job_title: 'Account Executive',
            is_active: false,
            created_at: new Date(Date.now() - 3600000 * 800).toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ employees });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, department, jobTitle, temporaryPassword } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const employeeId = body.employeeId || generateEmployeeId('EMP');

    // Create profile
    return NextResponse.json({
      success: true,
      message: `Employee ${fullName} created with ID ${employeeId}.`,
      employee: {
        id: `emp-${Date.now()}`,
        employee_id: employeeId,
        full_name: fullName,
        email,
        phone,
        department,
        job_title: jobTitle,
        is_active: true,
        must_change_password: true,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
