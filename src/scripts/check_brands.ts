import { supabase } from '../lib/supabase';

async function check() {
  try {
    const { data, error } = await supabase.from('brands').select('*');
    if (error) {
      console.error('Error fetching brands:', error);
      return;
    }
    console.log('Successfully fetched brands! Count:', data?.length);
    console.log('Brands:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
