import { z } from "zod";

/**
 * Schema for pre-checkout form validation
 * Used on the public checkout page before redirecting to Stripe
 */
export const preCheckoutSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email muito longo"),

  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(
      /^[a-zA-ZÀ-ÿ\s]+$/,
      "Nome deve conter apenas letras"
    ),

  companyName: z
    .string()
    .min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
    .max(200, "Nome da empresa muito longo"),

  industry: z
    .string()
    .max(100, "Setor muito longo")
    .optional()
    .or(z.literal("")),

  size: z
    .enum(["", "1-50", "51-200", "201-500", "500+"])
    .optional(),

  plan: z.enum(["base", "intermediario", "avancado"], {
    required_error: "Plano inválido",
  }),

  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os Termos de Uso" }),
  }),

  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar a Política de Privacidade" }),
  }),
});

export type PreCheckoutInput = z.infer<typeof preCheckoutSchema>;

/**
 * Plan display information for the checkout page
 */
export const PLAN_INFO = {
  base: {
    name: "Base",
    description: "50 a 120 colaboradores",
    price: "R$ 3.970",
    pricePerMonth: "R$ 330,83",
  },
  intermediario: {
    name: "Intermediário",
    description: "121 a 250 colaboradores",
    price: "R$ 4.970",
    pricePerMonth: "R$ 414,17",
  },
  avancado: {
    name: "Avançado",
    description: "251 a 400 colaboradores",
    price: "R$ 5.970",
    pricePerMonth: "R$ 497,50",
  },
} as const;

export type PlanId = keyof typeof PLAN_INFO;

export function isValidPlan(plan: string): plan is PlanId {
  return plan in PLAN_INFO;
}
