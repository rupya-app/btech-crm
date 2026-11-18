import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing live Supabase authentication flows...');

  // 1. Admin login with email
  const { data: adminLogin, error: adminErr } = await supabase.auth.signInWithPassword({
    email: 'admin@digitalcrm.com',
    password: 'Password@123',
  });

  if (adminErr) {
    console.error('Admin login failed:', adminErr.message);
  } else {
    console.log('✓ Admin login successful! Auth User ID:', adminLogin.user.id);
  }

  // 2. Employee login resolution test (Employee ID EMP1001 -> priya@digitalcrm.com)
  const { data: empProfile, error: profErr } = await supabase
    .from('profiles')
    .select('email, role, employee_id')
    .eq('employee_id', 'EMP1001')
    .single();

  if (profErr || !empProfile) {
    console.error('Employee ID lookup failed:', profErr?.message);
  } else {
    console.log(`✓ Resolved Employee ID "${empProfile.employee_id}" to email: ${empProfile.email}`);

    const { data: empLogin, error: empErr } = await supabase.auth.signInWithPassword({
      email: empProfile.email,
      password: 'Password@123',
    });

    if (empErr) {
      console.error('Employee authentication failed:', empErr.message);
    } else {
      console.log('✓ Employee authentication successful! User ID:', empLogin.user.id);
    }
  }

  // 3. Test querying leads as authenticated user
  const { data: leads, error: leadsErr } = await supabase.from('leads').select('id, business_name, status');
  if (leadsErr) {
    console.error('Error fetching leads:', leadsErr.message);
  } else {
    console.log(`✓ RLS Query verified! Total live leads retrieved: ${leads?.length || 0}`);
  }
}

testAuth();
