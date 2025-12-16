/**
 * Authentication Cleanup
 *
 * Limpa os storage states após execução dos testes
 */

import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');

async function globalTeardown() {
  // Opcional: limpar estados de autenticação após os testes
  // Descomente se quiser limpar automaticamente
  /*
  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    console.log('🧹 Auth states cleaned up');
  }
  */
  console.log('✅ Test cleanup complete');
}

export default globalTeardown;
