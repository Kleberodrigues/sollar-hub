#!/usr/bin/env node
/**
 * Setup Stripe Plans
 *
 * Cria os produtos e preços no Stripe para os planos Sollar
 * Execute: node scripts/setup-stripe-plans.mjs
 */

import Stripe from 'stripe';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config({ path: '.env.local' });

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env.local');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-11-17.clover',
});

// Definição dos planos
const plans = [
  {
    id: 'base',
    name: 'Sollar Base',
    description: 'Plano Base - 50 a 120 colaboradores',
    priceAmount: 397000, // R$ 3.970,00 em centavos
    interval: 'year',
    features: [
      'IA vertical em riscos psicossociais',
      'Dashboards automáticos',
      'Relatório técnico personalizado',
      'Plano de ação orientado à prevenção',
      'Análise por clusters de risco',
      'Assessments ilimitados',
      'Export PDF e CSV',
      'Suporte por email',
    ],
  },
  {
    id: 'intermediario',
    name: 'Sollar Intermediário',
    description: 'Plano Intermediário - 121 a 250 colaboradores',
    priceAmount: 497000, // R$ 4.970,00 em centavos
    interval: 'year',
    features: [
      'Tudo do plano Base',
      'Análise comparativa entre ciclos',
      'Priorização de riscos por impacto organizacional',
      'Dashboards comparativos (tempo/áreas)',
      'Relatório executivo para liderança',
      'Branding personalizado',
      'Suporte prioritário',
    ],
  },
  {
    id: 'avancado',
    name: 'Sollar Avançado',
    description: 'Plano Avançado - 251 a 400 colaboradores',
    priceAmount: 597000, // R$ 5.970,00 em centavos
    interval: 'year',
    features: [
      'Tudo do plano Intermediário',
      'Análise sistêmica dos riscos psicossociais',
      'Correlação entre fatores organizacionais',
      'Alertas de atenção elevada',
      'Relatório técnico estruturado para gestão de riscos',
      'Acesso à API',
      'Export XLSX',
      'Suporte dedicado',
    ],
  },
];

async function createOrGetProduct(plan) {
  console.log(`\n🔍 Buscando produto: ${plan.name}...`);

  // Buscar produtos existentes
  const products = await stripe.products.search({
    query: `metadata['plan_id']:'${plan.id}'`,
  });

  if (products.data.length > 0) {
    console.log(`  ✓ Produto encontrado: ${products.data[0].id}`);
    return products.data[0];
  }

  // Criar novo produto
  console.log(`  📦 Criando produto: ${plan.name}...`);
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: {
      plan_id: plan.id,
      source: 'sollar-insight-hub',
      features: plan.features.join(' | '),
    },
  });

  console.log(`  ✅ Produto criado: ${product.id}`);
  return product;
}

async function createOrGetPrice(product, plan) {
  console.log(`  🔍 Buscando preço anual para ${plan.id}...`);

  // Buscar preços existentes para o produto
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    type: 'recurring',
  });

  const yearlyPrice = prices.data.find(
    p => p.recurring?.interval === 'year' && p.unit_amount === plan.priceAmount
  );

  if (yearlyPrice) {
    console.log(`  ✓ Preço encontrado: ${yearlyPrice.id}`);
    return yearlyPrice;
  }

  // Criar novo preço
  console.log(`  💰 Criando preço: R$ ${(plan.priceAmount / 100).toFixed(2)}/ano...`);
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.priceAmount,
    currency: 'brl',
    recurring: {
      interval: 'year',
      interval_count: 1,
    },
    metadata: {
      plan_id: plan.id,
      source: 'sollar-insight-hub',
    },
    lookup_key: `${plan.id}_yearly`,
  });

  console.log(`  ✅ Preço criado: ${price.id}`);
  return price;
}

async function updateEnvFile(priceIds) {
  const envPath = resolve(process.cwd(), '.env.local');

  if (!existsSync(envPath)) {
    console.log('\n⚠️ .env.local não encontrado');
    return;
  }

  let envContent = readFileSync(envPath, 'utf-8');

  // Atualizar cada price ID
  for (const [planId, priceId] of Object.entries(priceIds)) {
    const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_YEARLY`;
    const regex = new RegExp(`^${envKey}=.*$`, 'm');

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${envKey}=${priceId}`);
    } else {
      envContent += `\n${envKey}=${priceId}`;
    }
  }

  writeFileSync(envPath, envContent);
  console.log('\n✅ .env.local atualizado com os novos Price IDs');
}

async function main() {
  console.log('🚀 Setup Stripe Plans para Sollar Insight Hub\n');
  console.log('━'.repeat(50));

  const priceIds = {};

  try {
    for (const plan of plans) {
      const product = await createOrGetProduct(plan);
      const price = await createOrGetPrice(product, plan);
      priceIds[plan.id] = price.id;
    }

    console.log('\n━'.repeat(50));
    console.log('\n📋 Price IDs para .env.local:\n');
    console.log(`STRIPE_PRICE_BASE_YEARLY=${priceIds.base}`);
    console.log(`STRIPE_PRICE_INTERMEDIARIO_YEARLY=${priceIds.intermediario}`);
    console.log(`STRIPE_PRICE_AVANCADO_YEARLY=${priceIds.avancado}`);

    // Atualizar .env.local automaticamente
    await updateEnvFile(priceIds);

    console.log('\n✅ Setup completo!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verifique os produtos no Stripe Dashboard');
    console.log('   2. Configure o webhook se ainda não configurou');
    console.log('   3. Teste o checkout flow\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Verifique se a STRIPE_SECRET_KEY está correta');
    }
    process.exit(1);
  }
}

main();
