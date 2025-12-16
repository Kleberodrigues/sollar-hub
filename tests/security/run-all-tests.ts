/**
 * Runner para todos os testes de segurança
 */

import { loadEnv } from './load-env';
import { testOrganizationIsolation } from './test-isolation';
import { testRoleHierarchy } from './test-roles';
import { testAnonymity } from './test-anonymity';

// Carregar variáveis de ambiente
loadEnv();

interface TestSuite {
  name: string;
  description: string;
  runner: () => Promise<any[]>;
}

const testSuites: TestSuite[] = [
  {
    name: 'Isolamento Multi-Tenant',
    description: 'Valida que organizações diferentes não conseguem acessar dados umas das outras',
    runner: testOrganizationIsolation
  },
  {
    name: 'Hierarquia de Roles',
    description: 'Valida que Admin > Manager > Member > Viewer têm permissões corretas',
    runner: testRoleHierarchy
  },
  {
    name: 'Anonimato de Respostas',
    description: 'Valida que respostas são completamente anônimas e protegidas',
    runner: testAnonymity
  }
];

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🔐 SUITE COMPLETA DE TESTES DE SEGURANÇA - SOLLAR INSIGHT HUB');
  console.log('='.repeat(80));

  const suiteResults: Array<{
    suite: string;
    passed: number;
    failed: number;
    total: number;
    percentage: number;
  }> = [];

  for (const suite of testSuites) {
    console.log('\n\n' + '─'.repeat(80));
    console.log(`📋 ${suite.name.toUpperCase()}`);
    console.log(`   ${suite.description}`);
    console.log('─'.repeat(80) + '\n');

    try {
      const results = await suite.runner();

      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      const total = results.length;
      const percentage = Math.round((passed / total) * 100);

      suiteResults.push({
        suite: suite.name,
        passed,
        failed,
        total,
        percentage
      });

      // Exibir resultados da suite
      console.log('\n' + '─'.repeat(80));
      results.forEach((result, index) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.test}`);
        if (!result.passed) {
          console.log(`   └─ ${result.message}`);
        }
      });

      console.log('\n' + '─'.repeat(80));
      console.log(`📊 ${suite.name}: ${passed}/${total} testes passaram (${percentage}%)`);
      console.log('─'.repeat(80));

    } catch (error) {
      console.error(`\n❌ Erro ao executar suite "${suite.name}":`, error);
      suiteResults.push({
        suite: suite.name,
        passed: 0,
        failed: 1,
        total: 1,
        percentage: 0
      });
    }

    // Aguardar um pouco entre suites
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Relatório final
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO FINAL - RESUMO DE TODAS AS SUITES');
  console.log('='.repeat(80) + '\n');

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;

  suiteResults.forEach((result, index) => {
    const icon = result.percentage === 100 ? '✅' : result.percentage >= 70 ? '⚠️' : '❌';
    console.log(`${index + 1}. ${icon} ${result.suite}`);
    console.log(`   Passou: ${result.passed}/${result.total} (${result.percentage}%)`);
    if (result.failed > 0) {
      console.log(`   Falhou: ${result.failed} teste(s)`);
    }
    console.log('');

    totalPassed += result.passed;
    totalFailed += result.failed;
    totalTests += result.total;
  });

  const overallPercentage = Math.round((totalPassed / totalTests) * 100);

  console.log('─'.repeat(80));
  console.log('\n🎯 RESULTADO GERAL:\n');
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   ✅ Passaram: ${totalPassed} (${overallPercentage}%)`);
  console.log(`   ❌ Falharam: ${totalFailed}`);
  console.log('');

  if (overallPercentage === 100) {
    console.log('🎉 SUCESSO! Todos os testes de segurança passaram!');
  } else if (overallPercentage >= 90) {
    console.log('✅ Bom! A maioria dos testes passaram, mas há alguns pontos a melhorar.');
  } else if (overallPercentage >= 70) {
    console.log('⚠️  Atenção! Alguns testes críticos falharam. Revise as políticas de segurança.');
  } else {
    console.log('❌ CRÍTICO! Muitos testes falharam. Há problemas sérios de segurança!');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Retornar código de saída
  process.exit(overallPercentage === 100 ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests();
}

export { runAllTests };
