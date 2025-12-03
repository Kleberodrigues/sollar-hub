import { loadEnv } from './load-env';
import { createAdminClient } from './test-helpers';

loadEnv();

async function checkSchema() {
  const adminClient = createAdminClient();
  
  console.log('🔍 Verificando schema da tabela questions...\n');
  
  // Tentar inserir com campos mínimos
  const { data, error } = await adminClient
    .from('questions')
    .select('*')
    .limit(1);
  
  console.log('Data:', data);
  console.log('Error:', error);
}

checkSchema().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
