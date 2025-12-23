import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient(
  'https://jxpyjbpndssnwuudbuui.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await client
  .from('webhook_events')
  .select('id, event_type, status, error_message, created_at, payload')
  .eq('event_type', 'member.invited')
  .order('created_at', { ascending: false })
  .limit(3);

if (error) {
  console.log('ERROR:', error.message);
} else if (data.length === 0) {
  console.log('No member.invited events found');
} else {
  console.log('Recent member.invited events:');
  data.forEach(e => {
    console.log(`\n- ${e.created_at}`);
    console.log(`  Status: ${e.status}`);
    if (e.error_message) console.log(`  Error: ${e.error_message}`);
    if (e.payload?.data?.name) console.log(`  Name: ${e.payload.data.name}`);
    if (e.payload?.data?.email) console.log(`  Email: ${e.payload.data.email}`);
  });
}
