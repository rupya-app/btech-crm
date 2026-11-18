import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Testing connection to Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  try {
    // 1. Test leads table
    const { data: leads, error: leadsError } = await supabase.from('leads').select('id, lead_number, business_name, status').limit(5);
    if (leadsError) {
      console.error('Error querying leads:', leadsError.message);
    } else {
      console.log(`Successfully connected! Found ${leads?.length || 0} sample leads in "leads" table:`);
      leads?.forEach((l) => console.log(` - [#${l.lead_number}] ${l.business_name} (${l.status})`));
    }

    // 2. Check if admin profile exists
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);

    console.log('\nChecking admin accounts:');
    if (adminProfile && adminProfile.length > 0) {
      console.log('Admin account found:', adminProfile[0].email, `(${adminProfile[0].employee_id})`);
    } else {
      console.log('No admin profile found yet. Bootstrapping initial super admin account...');
      
      // Create auth user for admin
      const adminEmail = 'admin@digitalcrm.com';
      const adminPassword = 'Password@123';
      
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Main Administrator',
          role: 'admin',
        },
      });

      if (authErr) {
        console.log('Note on admin user creation:', authErr.message);
      } else if (authData.user) {
        console.log('Created Auth user for admin:', authData.user.id);
        
        // Insert into profiles
        const { error: profErr } = await supabase.from('profiles').insert({
          id: authData.user.id,
          employee_id: 'ADM001',
          full_name: 'Main Administrator',
          email: adminEmail,
          role: 'admin',
          department: 'Executive',
          job_title: 'Super Administrator',
          is_active: true,
          must_change_password: false,
        });

        if (profErr) {
          console.error('Error inserting admin profile:', profErr.message);
        } else {
          console.log('Successfully created initial admin profile (ADM001 / admin@digitalcrm.com)!');
        }
      }
    }

    // 3. Check employees
    const { data: empProfiles } = await supabase
      .from('profiles')
      .select('employee_id, full_name, email, role')
      .eq('role', 'employee');

    console.log(`\nFound ${empProfiles?.length || 0} employees in "profiles" table:`);
    empProfiles?.forEach((e) => console.log(` - [${e.employee_id}] ${e.full_name} (${e.email})`));

    // If no employees, bootstrap a demo employee account
    if (!empProfiles || empProfiles.length === 0) {
      console.log('Creating demo employee account (EMP1001 / priya@digitalcrm.com)...');
      const empEmail = 'priya@digitalcrm.com';
      const empPassword = 'Password@123';

      const { data: empAuth, error: empAuthErr } = await supabase.auth.admin.createUser({
        email: empEmail,
        password: empPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Priya Sharma',
          role: 'employee',
        },
      });

      if (empAuth?.user) {
        await supabase.from('profiles').insert({
          id: empAuth.user.id,
          employee_id: 'EMP1001',
          full_name: 'Priya Sharma',
          email: empEmail,
          role: 'employee',
          department: 'Enterprise Sales',
          job_title: 'Senior Sales Executive',
          is_active: true,
          must_change_password: false,
        });
        console.log('Successfully created demo employee EMP1001!');
      }
    }

  } catch (err: any) {
    console.error('Connection test error:', err.message);
  }
}

main();
