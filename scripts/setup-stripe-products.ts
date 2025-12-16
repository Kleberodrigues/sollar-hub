/**
 * Script para criar produtos e precos do Stripe via API
 * Updated: 2025-12-14 - New plan structure (Base/Intermediario/Avancado)
 * Execute com: npx tsx scripts/setup-stripe-products.ts
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

// Carregar .env manualmente (mesma logica dos outros scripts)
function loadEnv() {
  // Tentar .env primeiro, depois .env.local
  const envFiles = ['.env', '.env.local'];

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(`\uD83D\uDCC1 Carregando variaveis de: ${envFile}`);
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      return true;
    }
  }
  return false;
}

// Plan configuration
const PLANS = {
  base: {
    name: 'Sollar Base',
    description: 'Para empresas de 50 a 120 colaboradores - Cumprir a NR-1 com clareza',
    price: 397000, // R$ 3.970,00 em centavos
    metadata: {
      tier: 'base',
      platform: 'sollar-insight-hub',
      min_employees: '50',
      max_employees: '120',
    },
  },
  intermediario: {
    name: 'Sollar Intermediario',
    description: 'Para empresas de 121 a 250 colaboradores - Apoiar decisoes gerenciais',
    price: 497000, // R$ 4.970,00 em centavos
    metadata: {
      tier: 'intermediario',
      platform: 'sollar-insight-hub',
      min_employees: '121',
      max_employees: '250',
    },
  },
  avancado: {
    name: 'Sollar Avancado',
    description: 'Para empresas de 251 a 400 colaboradores - Atender maior complexidade',
    price: 597000, // R$ 5.970,00 em centavos
    metadata: {
      tier: 'avancado',
      platform: 'sollar-insight-hub',
      min_employees: '251',
      max_employees: '400',
    },
  },
};

async function setupStripeProducts() {
  console.log('\n\uD83D\uDE80 Sollar Stripe Setup - Nova Estrutura de Planos\n');
  console.log('='.repeat(60));

  // Carregar variaveis de ambiente
  if (!loadEnv()) {
    console.error('\u274C Arquivo .env ou .env.local nao encontrado!');
    console.error('   Crie o arquivo com STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  // Verificar chave do Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error('\u274C STRIPE_SECRET_KEY nao encontrada no .env');
    console.error('   Adicione: STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  if (!stripeSecretKey.startsWith('sk_')) {
    console.error('\u274C STRIPE_SECRET_KEY invalida (deve comecar com sk_)');
    process.exit(1);
  }

  const isTestMode = stripeSecretKey.startsWith('sk_test_');
  console.log(`\n\uD83D\uDD11 Modo: ${isTestMode ? 'TESTE' : '\u26A0\uFE0F  PRODUCAO'}`);

  if (!isTestMode) {
    console.warn('\n\u26A0\uFE0F  ATENCAO: Voce esta usando chaves de PRODUCAO!');
    console.warn('   Produtos criados serao REAIS e poderao cobrar clientes.');
    console.warn('   Pressione Ctrl+C para cancelar ou aguarde 5 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Inicializar Stripe
  const stripe = new Stripe(stripeSecretKey);

  try {
    // Verificar conexao
    console.log('\n\uD83D\uDCE1 Verificando conexao com Stripe...');
    await stripe.balance.retrieve();
    console.log('\u2705 Conectado ao Stripe!\n');

    // Verificar se produtos ja existem
    console.log('\uD83D\uDD0D Verificando produtos existentes...');
    const existingProducts = await stripe.products.list({ limit: 100 });

    const existingBase = existingProducts.data.find(p => p.name === 'Sollar Base');
    const existingIntermediario = existingProducts.data.find(p => p.name === 'Sollar Intermediario');
    const existingAvancado = existingProducts.data.find(p => p.name === 'Sollar Avancado');

    if (existingBase || existingIntermediario || existingAvancado) {
      console.log('\n\u26A0\uFE0F  Alguns produtos Sollar ja existem no Stripe:');
      if (existingBase) console.log(`   - Sollar Base: ${existingBase.id}`);
      if (existingIntermediario) console.log(`   - Sollar Intermediario: ${existingIntermediario.id}`);
      if (existingAvancado) console.log(`   - Sollar Avancado: ${existingAvancado.id}`);

      console.log('\n\uD83D\uDD0E Buscando precos existentes...');

      const prices = await stripe.prices.list({ limit: 100, active: true });

      const basePrices = prices.data.filter(p => p.product === existingBase?.id);
      const intermediarioPrices = prices.data.filter(p => p.product === existingIntermediario?.id);
      const avancadoPrices = prices.data.filter(p => p.product === existingAvancado?.id);

      console.log('\n\uD83D\uDCCB Precos encontrados:');

      const baseYearly = basePrices.find(p => p.recurring?.interval === 'year');
      const intermediarioYearly = intermediarioPrices.find(p => p.recurring?.interval === 'year');
      const avancadoYearly = avancadoPrices.find(p => p.recurring?.interval === 'year');

      if (baseYearly) console.log(`   \u2705 Base Anual: ${baseYearly.id}`);
      if (intermediarioYearly) console.log(`   \u2705 Intermediario Anual: ${intermediarioYearly.id}`);
      if (avancadoYearly) console.log(`   \u2705 Avancado Anual: ${avancadoYearly.id}`);

      // Se todos existem, mostrar e sair
      if (baseYearly && intermediarioYearly && avancadoYearly) {
        console.log('\n' + '='.repeat(60));
        console.log('\u2705 Todos os produtos e precos ja existem!\n');
        console.log('Adicione ao seu .env:\n');
        console.log(`STRIPE_PRICE_BASE_YEARLY=${baseYearly.id}`);
        console.log(`STRIPE_PRICE_INTERMEDIARIO_YEARLY=${intermediarioYearly.id}`);
        console.log(`STRIPE_PRICE_AVANCADO_YEARLY=${avancadoYearly.id}`);
        console.log('\n' + '='.repeat(60));
        return;
      }
    }

    // Criar produtos e precos
    console.log('\n\uD83D\uDCE6 Criando produtos no Stripe...\n');

    const results: Record<string, { productId: string; priceId: string }> = {};

    // Criar cada produto
    for (const [planKey, planConfig] of Object.entries(PLANS)) {
      const existingProduct = existingProducts.data.find(p => p.name === planConfig.name);

      let productId: string;

      if (existingProduct) {
        console.log(`\u2139\uFE0F  ${planConfig.name} ja existe: ${existingProduct.id}`);
        productId = existingProduct.id;
      } else {
        console.log(`\uD83C\uDFD7\uFE0F  Criando ${planConfig.name}...`);
        const product = await stripe.products.create({
          name: planConfig.name,
          description: planConfig.description,
          metadata: planConfig.metadata,
        });
        console.log(`   \u2705 Produto criado: ${product.id}`);
        productId = product.id;
      }

      // Verificar se preco anual existe
      const existingPrices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 10,
      });

      const existingYearlyPrice = existingPrices.data.find(p => p.recurring?.interval === 'year');

      if (existingYearlyPrice) {
        console.log(`   \u2139\uFE0F  Preco anual ja existe: ${existingYearlyPrice.id}`);
        results[planKey] = { productId, priceId: existingYearlyPrice.id };
      } else {
        console.log(`   \uD83D\uDCB0 Criando preco anual (R$ ${(planConfig.price / 100).toLocaleString('pt-BR')}/ano)...`);
        const price = await stripe.prices.create({
          product: productId,
          unit_amount: planConfig.price,
          currency: 'brl',
          recurring: {
            interval: 'year',
            interval_count: 1,
          },
          metadata: {
            plan: planKey,
            billing: 'yearly',
          },
        });
        console.log(`   \u2705 Preco criado: ${price.id}`);
        results[planKey] = { productId, priceId: price.id };
      }

      console.log('');
    }

    // Resumo final
    console.log('='.repeat(60));
    console.log('\uD83C\uDF89 Setup concluido com sucesso!\n');
    console.log('Adicione as seguintes variaveis ao seu .env:\n');
    console.log(`STRIPE_PRICE_BASE_YEARLY=${results.base?.priceId || 'NOT_CREATED'}`);
    console.log(`STRIPE_PRICE_INTERMEDIARIO_YEARLY=${results.intermediario?.priceId || 'NOT_CREATED'}`);
    console.log(`STRIPE_PRICE_AVANCADO_YEARLY=${results.avancado?.priceId || 'NOT_CREATED'}`);
    console.log('\n' + '='.repeat(60));

    console.log('\n\uD83D\uDCCB Resumo dos produtos:');
    console.log('\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510');
    console.log('\u2502 Produto                  \u2502 Colaboradores   \u2502 Preco (BRL)   \u2502');
    console.log('\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524');
    console.log('\u2502 Sollar Base              \u2502 50-120          \u2502 R$ 3.970/ano  \u2502');
    console.log('\u2502 Sollar Intermediario     \u2502 121-250         \u2502 R$ 4.970/ano  \u2502');
    console.log('\u2502 Sollar Avancado          \u2502 251-400         \u2502 R$ 5.970/ano  \u2502');
    console.log('\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518');

    console.log('\n\uD83D\uDD17 Verifique no Stripe Dashboard:');
    console.log(`   ${isTestMode ? 'https://dashboard.stripe.com/test/products' : 'https://dashboard.stripe.com/products'}`);

  } catch (error) {
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      console.error('\n\u274C Erro de autenticacao do Stripe!');
      console.error('   Verifique se a STRIPE_SECRET_KEY esta correta.');
    } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      console.error('\n\u274C Erro na requisicao:', error.message);
    } else {
      console.error('\n\u274C Erro inesperado:', error);
    }
    process.exit(1);
  }
}

// Executar
setupStripeProducts();
