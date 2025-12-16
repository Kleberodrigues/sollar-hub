import { z } from "zod";

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
  organizationName: z
    .string()
    .min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
    .max(200, "Nome da empresa deve ter no máximo 200 caracteres"),
  industry: z
    .string()
    .max(100, "Setor deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  size: z
    .enum(["", "1-50", "51-200", "201-500", "500+"])
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Função helper para validar FormData
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData
): { success: true; data: T } | { success: false; error: string } {
  const rawData: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  const result = schema.safeParse(rawData);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError.message };
  }

  return { success: true, data: result.data };
}
