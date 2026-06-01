require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testWriteSettings() {
  const { data, error } = await supabase.from('settings').upsert({ key: 'test_key', value: 'test_val' }).select();
  if (error) {
    console.error("Error writing setting:", error.message, error);
  } else {
    console.log("Successfully wrote setting:", data);
  }
}
testWriteSettings();
