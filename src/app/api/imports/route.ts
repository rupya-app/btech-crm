import { NextRequest, NextResponse } from 'next/server';
import { getDbClient, createServerSupabaseClient, invalidateCrmCache } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = await getDbClient();
    const { data, error } = await supabase
      .from('import_jobs')
      .select('*, uploader:profiles(full_name, employee_id)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ jobs: [] });
    }

    return NextResponse.json({ jobs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, jobs: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, rows, mappings } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for import' }, { status: 400 });
    }

    const supabase = await getDbClient();

    let uploaderId: string | null = null;
    try {
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      uploaderId = user?.id || null;
    } catch {}

    // Fetch existing phones, emails, and max lead_number to prevent sequence collisions
    const [{ data: existingLeads }, { data: maxLeadRow }] = await Promise.all([
      supabase.from('leads').select('normalized_phone, email'),
      supabase
        .from('leads')
        .select('lead_number')
        .order('lead_number', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    let nextLeadNumber = Math.max(10001, (Number(maxLeadRow?.lead_number) || 10000) + 1);

    const existingPhones = new Set<string>();
    const existingEmails = new Set<string>();

    (existingLeads || []).forEach((l: any) => {
      if (l.normalized_phone) existingPhones.add(l.normalized_phone);
      if (l.email) existingEmails.add(String(l.email).toLowerCase());
    });

    const validLeadsToInsert: any[] = [];
    let duplicateCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      const businessName = (row.business_name || '').trim();
      if (!businessName || businessName.length < 2) {
        failedCount += 1;
        continue;
      }

      const rawPhone = (row.phone || '').trim();
      const normPhone = rawPhone ? normalizePhone(rawPhone) : null;
      const cleanEmail = row.email ? String(row.email).trim().toLowerCase() : null;

      if (normPhone && existingPhones.has(normPhone)) {
        duplicateCount += 1;
        continue;
      }

      if (cleanEmail && existingEmails.has(cleanEmail)) {
        duplicateCount += 1;
        continue;
      }

      if (normPhone) existingPhones.add(normPhone);
      if (cleanEmail) existingEmails.add(cleanEmail);

      validLeadsToInsert.push({
        lead_number: nextLeadNumber++,
        business_name: businessName,
        contact_person: row.contact_person || null,
        phone: rawPhone || null,
        normalized_phone: normPhone,
        alternate_phone: row.alternate_phone || null,
        email: cleanEmail,
        website: row.website || null,
        category: row.category || 'General Business',
        address: row.address || null,
        city: row.city || null,
        state: row.state || null,
        country: row.country || 'India',
        business_details: row.business_details || null,
        source: filename ? `Import: ${filename}` : 'Excel / CSV Import',
        status: 'new',
        priority: 'medium',
        created_by: uploaderId,
      });
    }

    // Create import_jobs record
    const { data: jobRecord } = await supabase
      .from('import_jobs')
      .insert({
        filename: filename || 'Lead_Import.csv',
        uploaded_by: uploaderId,
        total_rows: rows.length,
        processed_rows: rows.length,
        successful_rows: validLeadsToInsert.length,
        duplicate_rows: duplicateCount,
        failed_rows: failedCount,
        status: 'completed',
        column_mapping: mappings || {},
        completed_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (validLeadsToInsert.length > 0) {
      const withJobId = validLeadsToInsert.map((l) => ({
        ...l,
        import_job_id: jobRecord?.id || null,
      }));

      // Insert in batch chunks of 250 for reliability on large spreadsheets
      const CHUNK_SIZE = 250;
      for (let i = 0; i < withJobId.length; i += CHUNK_SIZE) {
        const chunk = withJobId.slice(i, i + CHUNK_SIZE);
        const { error: insertErr } = await supabase.from('leads').insert(chunk);
        if (insertErr) {
          return NextResponse.json({ error: insertErr.message }, { status: 400 });
        }
      }
    }

    if (uploaderId) {
      await supabase.from('notifications').insert({
        user_id: uploaderId,
        title: 'Spreadsheet Import Completed',
        message: `Imported ${validLeadsToInsert.length} new leads from "${filename || 'Spreadsheet'}". (${duplicateCount} duplicates skipped).`,
        notification_type: 'import_completed',
      });
    }

    invalidateCrmCache();

    return NextResponse.json({
      success: true,
      summary: {
        jobId: jobRecord?.id,
        totalRows: rows.length,
        imported: validLeadsToInsert.length,
        duplicates: duplicateCount,
        failed: failedCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
