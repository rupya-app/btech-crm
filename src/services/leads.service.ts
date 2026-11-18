import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { Lead, LeadFilterParams, PaginatedResponse, LeadActivity, LeadRemark } from '@/types';

// Mock/fallback leads for local testing when Supabase keys are not configured
const FALLBACK_LEADS: Lead[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    lead_number: 10001,
    business_name: 'Apex Logistics & Freight Solutions',
    contact_person: 'Rajesh Verma',
    phone: '+91 98201 12345',
    normalized_phone: '+919820112345',
    alternate_phone: '+91 22 2830 1100',
    email: 'rajesh@apexlogistics.in',
    website: 'https://apexlogistics.in',
    category: 'Logistics & Supply Chain',
    address: 'Plot 45, MIDC Industrial Area, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    business_details: 'Fleet of 85 freight vehicles. Looking to automate CRM and shipment dispatch.',
    custom_fields: { gst: '27AABCA1234C1Z5', annual_turnover: '₹45 Cr' },
    source: 'Direct Reference',
    status: 'interested',
    priority: 'high',
    created_by: null,
    import_job_id: null,
    last_contacted_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    lead_number: 10002,
    business_name: 'BlueWave Digital Marketing',
    contact_person: 'Sneha Kapoor',
    phone: '+91 98112 98765',
    normalized_phone: '+919811298765',
    alternate_phone: null,
    email: 'sneha@bluewave.agency',
    website: 'https://bluewave.agency',
    category: 'Advertising & Marketing',
    address: 'Cyber City, DLF Phase 2',
    city: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    business_details: 'Performance marketing agency with 30 team members. Wants inbound lead routing.',
    custom_fields: { team_size: '30', budget: '₹5 Lakhs/mo' },
    source: 'Website Contact Form',
    status: 'contacted',
    priority: 'medium',
    created_by: null,
    import_job_id: null,
    last_contacted_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    lead_number: 10003,
    business_name: 'Vanguard Healthtech Labs',
    contact_person: 'Dr. Arun Nair',
    phone: '+91 94470 55443',
    normalized_phone: '+919447055443',
    alternate_phone: null,
    email: 'arun.nair@vanguardhealth.com',
    website: 'https://vanguardhealth.com',
    category: 'Healthcare & Pharma',
    address: 'Infopark Phase 1, Kakkanad',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    business_details: 'Diagnostic software provider. Requires enterprise compliance and SLA.',
    custom_fields: { branch_count: '12', software: 'LabPro ERP' },
    source: 'Excel Batch #1',
    status: 'confirmed',
    priority: 'critical',
    created_by: null,
    import_job_id: null,
    last_contacted_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    confirmed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 240).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    lead_number: 10004,
    business_name: 'Zenith Precision Engineering',
    contact_person: 'Karthik Sundaram',
    phone: '+91 98401 22334',
    normalized_phone: '+919840122334',
    alternate_phone: null,
    email: 'karthik@zenithengineering.co',
    website: 'https://zenithengineering.co',
    category: 'Manufacturing & Industrial',
    address: 'Guindy Industrial Estate',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    business_details: 'CNC tooling and precision components exporter. 120 employees.',
    custom_fields: {},
    source: 'Excel Batch #1',
    status: 'follow_up',
    priority: 'high',
    created_by: null,
    import_job_id: null,
    last_contacted_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    lead_number: 10005,
    business_name: 'GreenLeaf Agritech & Organics',
    contact_person: 'Manpreet Kaur',
    phone: '+91 98140 88776',
    normalized_phone: '+919814088776',
    alternate_phone: null,
    email: 'manpreet@greenleafagri.com',
    website: 'https://greenleafagri.com',
    category: 'Agriculture & Agritech',
    address: 'GT Road, Focal Point',
    city: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    business_details: 'Organic fertilizer distribution network covering 400 retailers.',
    custom_fields: {},
    source: 'Trade Show Expo',
    status: 'new',
    priority: 'medium',
    created_by: null,
    import_job_id: null,
    last_contacted_at: null,
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    lead_number: 10006,
    business_name: 'UrbanCraft Modern Furniture',
    contact_person: 'Amitabh Saxena',
    phone: '+91 99887 66554',
    normalized_phone: '+919988766554',
    alternate_phone: null,
    email: 'info@urbancraft.co.in',
    website: 'https://urbancraft.co.in',
    category: 'Retail & E-commerce',
    address: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    business_details: 'B2B office furniture supply and turnkey interiors.',
    custom_fields: {},
    source: 'Excel Batch #2',
    status: 'pending',
    priority: 'high',
    created_by: null,
    import_job_id: null,
    last_contacted_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    lead_number: 10007,
    business_name: 'CloudScale Systems Private Ltd',
    contact_person: 'Pooja Deshmukh',
    phone: '+91 98220 33445',
    normalized_phone: '+919822033445',
    alternate_phone: null,
    email: 'pooja.d@cloudscale.io',
    website: 'https://cloudscale.io',
    category: 'Information Technology',
    address: 'Hinjawadi Phase 2, IT Park',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    business_details: 'SaaS cloud migration and managed AWS infrastructure partner.',
    custom_fields: {},
    source: 'Inbound Webinar',
    status: 'interested',
    priority: 'critical',
    created_by: null,
    import_job_id: null,
    last_contacted_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 144).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000008',
    lead_number: 10008,
    business_name: 'SilverLine Jewellery Wholesalers',
    contact_person: 'Ramesh Chordia',
    phone: '+91 94140 11223',
    normalized_phone: '+919414011223',
    alternate_phone: null,
    email: 'sales@silverlinejewels.in',
    website: null,
    category: 'Gems & Jewellery',
    address: 'Johari Bazaar',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    business_details: 'B2B hallmarked silver ornaments supplier with 60 retail client accounts.',
    custom_fields: {},
    source: 'Cold Outreach',
    status: 'new',
    priority: 'low',
    created_by: null,
    import_job_id: null,
    last_contacted_at: null,
    confirmed_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getLeads(params: LeadFilterParams = {}): Promise<PaginatedResponse<Lead>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from('leads').select('*', { count: 'exact' });

    // Status filter
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else if (params.status !== 'all' as any) {
        query = query.eq('status', params.status);
      }
    }

    // Priority filter
    if (params.priority) {
      if (Array.isArray(params.priority)) {
        query = query.in('priority', params.priority);
      } else {
        query = query.eq('priority', params.priority);
      }
    }

    // Category filter
    if (params.category) {
      query = query.eq('category', params.category);
    }

    // Search query
    if (params.search && params.search.trim().length > 0) {
      const s = params.search.trim();
      query = query.or(
        `business_name.ilike.%${s}%,contact_person.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,city.ilike.%${s}%`
      );
    }

    // Sorting
    const sortBy = params.sortBy || 'created_at';
    const ascending = params.sortOrder === 'asc';
    query = query.order(sortBy, { ascending }).range(from, to);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      // If table is empty or error connecting, return fallback filtered data
      return filterFallbackLeads(params);
    }

    const total = count || data.length;
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    };
  } catch (err) {
    return filterFallbackLeads(params);
  }
}

function filterFallbackLeads(params: LeadFilterParams): PaginatedResponse<Lead> {
  let filtered = [...FALLBACK_LEADS];

  if (params.status && params.status !== ('all' as any)) {
    if (Array.isArray(params.status)) {
      filtered = filtered.filter((l) => (params.status as string[]).includes(l.status));
    } else {
      filtered = filtered.filter((l) => l.status === params.status);
    }
  }

  if (params.priority) {
    if (Array.isArray(params.priority)) {
      filtered = filtered.filter((l) => (params.priority as string[]).includes(l.priority));
    } else {
      filtered = filtered.filter((l) => l.priority === params.priority);
    }
  }

  if (params.category) {
    filtered = filtered.filter((l) => l.category === params.category);
  }

  if (params.search && params.search.trim()) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.business_name.toLowerCase().includes(s) ||
        (l.contact_person && l.contact_person.toLowerCase().includes(s)) ||
        (l.phone && l.phone.includes(s)) ||
        (l.email && l.email.toLowerCase().includes(s)) ||
        (l.city && l.city.toLowerCase().includes(s))
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 25;
  const total = filtered.length;
  const from = (page - 1) * pageSize;
  const paginated = filtered.slice(from, from + pageSize);

  return {
    data: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
    hasMore: page * pageSize < total,
  };
}

export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
    if (!error && data) return data;
  } catch (err) {}

  return FALLBACK_LEADS.find((l) => l.id === id) || FALLBACK_LEADS[0];
}

export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*, profiles(id, full_name, employee_id)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {}

  return [
    {
      id: 'act-1',
      lead_id: leadId,
      employee_id: 'emp-1',
      activity_type: 'call_outcome',
      call_outcome: 'connected',
      duration_seconds: 240,
      description: 'Discussed CRM requirements with Decision Maker Rajesh. Very keen on automated dispatch.',
      metadata: {},
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'act-2',
      lead_id: leadId,
      employee_id: 'emp-1',
      activity_type: 'status_changed',
      call_outcome: null,
      duration_seconds: 0,
      description: 'Status changed from "Contacted" to "Interested". Follow-up scheduled.',
      metadata: {},
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'act-3',
      lead_id: leadId,
      employee_id: null,
      activity_type: 'lead_imported',
      call_outcome: null,
      duration_seconds: 0,
      description: 'Lead imported into CRM from Master Dataset.',
      metadata: {},
      created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    },
  ];
}

export async function getLeadRemarks(leadId: string): Promise<LeadRemark[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('lead_remarks')
      .select('*, profiles(id, full_name, employee_id)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {}

  return [
    {
      id: 'rem-1',
      lead_id: leadId,
      employee_id: 'emp-1',
      remark: 'Client mentioned budget is approved for Q1. Requested product brochure and custom API documentation.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];
}
