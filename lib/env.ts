/**
 * Environment Variables Validation - Sollar Insight Hub
 *
 * Valida todas as variáveis de ambiente no startup da aplicação
 * usando Zod para garantir tipagem e valores corretos.
 *
 * @see https://env.t3.gg/docs/nextjs
 */

import { z } from "zod";

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = z.object({
  // ============================================
  // Supabase (Obrigatórias)
  // ============================================
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY é obrigatória para operações server-side")
    .optional(),

  // ============================================
  // Stripe (Opcionais - desabilitam billing se ausentes)
  // ============================================
  STRIPE_SECRET_KEY: z
    .string()
    .refine((val) => !val || val.startsWith("sk_"), {
      message: "STRIPE_SECRET_KEY deve começar com 'sk_'",
    })
    .optional(),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .refine((val) => !val || val.startsWith("whsec_"), {
      message: "STRIPE_WEBHOOK_SECRET deve começar com 'whsec_'",
    })
    .optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .refine((val) => !val || val.startsWith("pk_"), {
      message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY deve começar com 'pk_'",
    })
    .optional(),

  // Stripe Price IDs
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE_YEARLY: z.string().optional(),

  // ============================================
  // n8n Webhooks (Opcionais)
  // ============================================
  N8N_WEBHOOK_URL: z
    .string()
    .url("N8N_WEBHOOK_URL deve ser uma URL válida")
    .optional(),
  N8N_WEBHOOK_SECRET: z.string().min(1).optional(),

  // ============================================
  // App Configuration
  // ============================================
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL deve ser uma URL válida")
    .optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Tipo inferido do schema de variáveis de ambiente
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Valida as variáveis de ambiente
 * Falha fast se configuração inválida
 */
function validateEnv(): Env {
  // Em client-side, só valida as variáveis públicas
  const isClient = typeof window !== "undefined";

  if (isClient) {
    // Validação parcial para client-side
    const clientSchema = envSchema.pick({
      NEXT_PUBLIC_SUPABASE_URL: true,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: true,
      NEXT_PUBLIC_APP_URL: true,
      NODE_ENV: true,
    });

    const result = clientSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!result.success) {
      console.error("❌ Variáveis de ambiente inválidas (client):");
      console.error(result.error.flatten().fieldErrors);
      throw new Error("Configuração de ambiente inválida");
    }

    return result.data as Env;
  }

  // Validação completa para server-side
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Variáveis de ambiente inválidas:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));

    // Em desenvolvimento, mostrar quais estão faltando
    if (process.env.NODE_ENV === "development") {
      const missing = Object.entries(result.error.flatten().fieldErrors)
        .map(([key, errors]) => `  - ${key}: ${errors?.join(", ")}`)
        .join("\n");
      console.error("\nVariáveis com problema:\n" + missing);
    }

    throw new Error("Configuração de ambiente inválida. Verifique o arquivo .env.local");
  }

  return result.data;
}

/**
 * Variáveis de ambiente validadas
 * Usar esta variável ao invés de process.env diretamente
 */
export const env = validateEnv();

/**
 * Helpers para verificar configurações opcionais
 */
export const config = {
  /** Stripe está configurado? */
  hasStripe: Boolean(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),

  /** n8n webhooks estão configurados? */
  hasN8n: Boolean(env.N8N_WEBHOOK_URL),

  /** É ambiente de produção? */
  isProduction: env.NODE_ENV === "production",

  /** É ambiente de desenvolvimento? */
  isDevelopment: env.NODE_ENV === "development",

  /** É ambiente de teste? */
  isTest: env.NODE_ENV === "test",
} as const;
