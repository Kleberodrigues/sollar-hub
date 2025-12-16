/**
 * Carrega variáveis de ambiente do .env.local
 */

import * as fs from 'fs';
import * as path from 'path';

export function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado!');
    console.error(`   Esperado em: ${envPath}`);
    process.exit(1);
  }

  const envFile = fs.readFileSync(envPath, 'utf-8');
  const lines = envFile.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (key && value) {
      process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  });

  // Validar que as variáveis necessárias foram carregadas
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ Variáveis de ambiente carregadas:');
  console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`);
  console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...`);
  console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30)}...\n`);
}
