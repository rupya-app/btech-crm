import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function HomePage() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        redirect('/admin/dashboard');
      } else {
        redirect('/employee/dashboard');
      }
    }
  } catch (e) {
    // Fallback to login if session lookup fails
  }

  redirect('/login');
}
