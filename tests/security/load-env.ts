/**
 * Carrega variáveis de ambiente do .env.local ou usa variáveis do ambiente (CI)
 */

import * as fs from 'fs';
import * as path from 'path';

export function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  const isCI = process.env.CI === 'true';

  // Check if required env vars are already set (e.g., from CI secrets)
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const alreadySet = required.every(key => process.env[key]);

  // If all required vars are already set, skip file loading
  if (alreadySet) {
    console.log('✅ Variáveis de ambiente já configuradas (CI/Environment):');
    console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`);
    console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30)}...\n`);
    return;
  }

  // Try to load from .env.local
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const lines = envFile.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();

      if (key && value) {
        // Don't override if already set in environment
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });

    console.log('✅ Variáveis de ambiente carregadas de .env.local:');
    console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`);
    console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30)}...\n`);
  } else if (isCI) {
    // In CI, skip security tests if service role key is not available
    console.log('⚠️  CI detectado sem .env.local - verificando variáveis de ambiente...');

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.log('⏭️  Skipping security tests - missing required secrets in CI:');
      missing.forEach(key => console.log(`   - ${key}`));
      console.log('\nTo run security tests in CI, configure these as GitHub secrets.');
      process.exit(0); // Exit with success to not fail the CI
    }
  } else {
    console.error('❌ Arquivo .env.local não encontrado!');
    console.error(`   Esperado em: ${envPath}`);
    process.exit(1);
  }

  // Final validation
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
}
