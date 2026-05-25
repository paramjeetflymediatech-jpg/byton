require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkBrands() {
  const { data, error } = await supabase.from('brands').select('*').limit(1);
  if (error) {
    console.error("Error querying brands:", error.message);
  } else {
    console.log("Brands table exists. Sample:", data);
  }
}
checkBrands();
