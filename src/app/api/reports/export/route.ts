import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getDbClient } from '@/lib/supabase/server';
import { getEmployeeRankings } from '@/services/analytics.service';

export async function POST(request: NextRequest) {
  try {
    const { reportType = 'all_leads', format = 'csv', status = 'all' } = await request.json();
    const supabase = await getDbClient();

    let columns: { header: string; key: string; width?: number }[] = [];
    let rows: Record<string, any>[] = [];

    if (reportType === 'employee_performance') {
      const rankings = await getEmployeeRankings();
      columns = [
        { header: 'Employee ID', key: 'employee_id', width: 16 },
        { header: 'Full Name', key: 'full_name', width: 24 },
        { header: 'Assigned Leads', key: 'assigned', width: 16 },
        { header: 'Contacted Leads', key: 'contacted', width: 16 },
        { header: 'Interested Prospects', key: 'interested', width: 18 },
        { header: 'Confirmed Won', key: 'confirmed', width: 16 },
        { header: 'Pending Leads', key: 'pending', width: 16 },
        { header: 'Conversion Rate (%)', key: 'conversion_rate', width: 18 },
        { header: 'Contact Rate (%)', key: 'contact_rate', width: 16 },
      ];
      rows = rankings.map((r) => ({
        employee_id: r.employee.employee_id,
        full_name: r.employee.full_name,
        assigned: r.assignedLeads,
        contacted: r.contactedLeads,
        interested: r.interestedLeads,
        confirmed: r.confirmedLeads,
        pending: r.pendingLeads,
        conversion_rate: `${r.conversionRate}%`,
        contact_rate: `${r.contactRate}%`,
      }));
    } else if (reportType === 'call_activities') {
      const { data: activities } = await supabase
        .from('lead_activities')
        .select('*, lead:leads(lead_number, business_name, phone), employee:profiles(full_name, employee_id)')
        .order('created_at', { ascending: false });

      columns = [
        { header: 'Activity Time', key: 'created_at', width: 22 },
        { header: 'Activity Type', key: 'activity_type', width: 18 },
        { header: 'Lead #', key: 'lead_number', width: 12 },
        { header: 'Business Name', key: 'business_name', width: 28 },
        { header: 'Phone', key: 'phone', width: 18 },
        { header: 'Call Outcome', key: 'call_outcome', width: 18 },
        { header: 'Duration (s)', key: 'duration_seconds', width: 14 },
        { header: 'Representative', key: 'employee', width: 24 },
        { header: 'Details / Remarks', key: 'description', width: 42 },
      ];

      rows = (activities || []).map((a: any) => ({
        created_at: new Date(a.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        activity_type: a.activity_type,
        lead_number: a.lead?.lead_number || '—',
        business_name: a.lead?.business_name || '—',
        phone: a.lead?.phone || '—',
        call_outcome: a.call_outcome || '—',
        duration_seconds: a.duration_seconds || 0,
        employee: a.employee ? `${a.employee.full_name} (${a.employee.employee_id})` : 'System / Admin',
        description: a.description || '',
      }));
    } else {
      // Leads export
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

      if (reportType === 'confirmed_leads') {
        query = query.eq('status', 'confirmed');
      } else if (reportType === 'interested_leads') {
        query = query.eq('status', 'interested');
      } else if (reportType === 'pending_leads') {
        query = query.eq('status', 'pending');
      } else if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const [{ data: leads }, { data: activeAssigns }] = await Promise.all([
        query,
        supabase
          .from('lead_assignments')
          .select('lead_id, employee:profiles(full_name, employee_id, is_active)')
          .eq('is_active', true),
      ]);

      const assignMap = new Map<string, string>();
      (activeAssigns || []).forEach((a: any) => {
        if (a.employee && a.employee.is_active !== false) {
          assignMap.set(a.lead_id, `${a.employee.full_name} (${a.employee.employee_id})`);
        }
      });

      let filteredLeads = leads || [];
      if (reportType === 'unassigned_leads') {
        filteredLeads = filteredLeads.filter((l: any) => !assignMap.has(l.id));
      }

      columns = [
        { header: 'Lead ID', key: 'lead_number', width: 12 },
        { header: 'Business Name', key: 'business_name', width: 30 },
        { header: 'Contact Person', key: 'contact_person', width: 22 },
        { header: 'Phone Number', key: 'phone', width: 18 },
        { header: 'Email', key: 'email', width: 26 },
        { header: 'Stage', key: 'status', width: 16 },
        { header: 'Priority', key: 'priority', width: 14 },
        { header: 'Category', key: 'category', width: 22 },
        { header: 'City', key: 'city', width: 16 },
        { header: 'State', key: 'state', width: 16 },
        { header: 'Assigned Representative', key: 'assigned_to', width: 26 },
        { header: 'Source', key: 'source', width: 20 },
        { header: 'Created Date', key: 'created_at', width: 20 },
      ];

      rows = filteredLeads.map((l: any) => ({
        lead_number: l.lead_number,
        business_name: l.business_name,
        contact_person: l.contact_person || '',
        phone: l.phone || '',
        email: l.email || '',
        status: l.status,
        priority: l.priority,
        category: l.category || '',
        city: l.city || '',
        state: l.state || '',
        assigned_to: assignMap.get(l.id) || 'Unassigned Pool',
        source: l.source || '',
        created_at: new Date(l.created_at).toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
        }),
      }));
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('CRM Export');
      sheet.columns = columns;
      sheet.getRow(1).font = { bold: true };
      rows.forEach((r) => sheet.addRow(r));

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${reportType}_${Date.now()}.xlsx"`,
        },
      });
    }

    // CSV format
    const escapeCsv = (val: any) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headerLine = columns.map((c) => escapeCsv(c.header)).join(',');
    const dataLines = rows.map((r) =>
      columns.map((c) => escapeCsv(r[c.key])).join(',')
    );
    const csvContent = [headerLine, ...dataLines].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${reportType}_${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
