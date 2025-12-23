/**
 * Script para criar credencial Resend no n8n via API
 */

const N8N_API_URL = process.env.N8N_API_URL || 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;
if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable is required');
  process.exit(1);
}

// Resend API Key - MUST be set via environment variable
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

async function listCredentials() {
  const response = await fetch(`${N8N_API_URL}/credentials`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list credentials: ${response.status}`);
  }

  return response.json();
}

async function createCredential() {
  // n8n HTTP Header Auth credential structure
  const credentialData = {
    name: 'Resend API Key',
    type: 'httpHeaderAuth',
    data: {
      name: 'Authorization',
      value: `Bearer ${RESEND_API_KEY}`
    }
  };

  const response = await fetch(`${N8N_API_URL}/credentials`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentialData)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create credential: ${response.status} - ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('📋 Listing existing credentials...\n');

  try {
    const credentials = await listCredentials();

    if (credentials.data && credentials.data.length > 0) {
      console.log('Existing credentials:');
      for (const cred of credentials.data) {
        console.log(`  - ${cred.name} (ID: ${cred.id}) [Type: ${cred.type}]`);
      }
    } else {
      console.log('No credentials found.');
    }

    // Check if Resend credential already exists
    const resendCred = credentials.data?.find(c => c.name === 'Resend API Key');

    if (resendCred) {
      console.log('\n✅ Resend API Key credential already exists!');
      console.log(`   ID: ${resendCred.id}`);
      return resendCred;
    }

    console.log('\n🔄 Creating Resend API Key credential...');
    const newCred = await createCredential();
    console.log(`✅ Credential created: ${newCred.name} (ID: ${newCred.id})`);

    return newCred;

  } catch (error) {
    console.error('❌ Error:', error.message);

    // If API doesn't support credential creation, show manual instructions
    console.log('\n⚠️  Se a API não suportar criação de credenciais, configure manualmente:');
    console.log('');
    console.log('1. Acesse: https://sollar-n8n.7wxwzr.easypanel.host');
    console.log('2. Faça login');
    console.log('3. Vá em Settings → Credentials → Add Credential');
    console.log('4. Selecione "Header Auth"');
    console.log('5. Configure:');
    console.log('   - Name: Resend API Key');
    console.log('   - Header Name: Authorization');
    console.log('   - Header Value: Bearer <your-resend-api-key>');
    console.log('6. Salve a credencial');
  }
}

main().catch(console.error);
