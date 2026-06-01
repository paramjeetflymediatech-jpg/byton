import { supabase } from '../lib/supabase';

async function check() {
  try {
    const { data: blogs, error } = await supabase.from('blogs').select('id, title, slug').limit(5);
    if (error) {
      console.error('Error fetching blogs:', error);
      return;
    }
    console.log('Successfully connected to Supabase and fetched blogs!');
    console.log('Blog count fetched:', blogs?.length);
    console.log('Sample blogs:', blogs);
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
