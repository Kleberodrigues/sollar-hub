import { z } from "zod";

/**
 * Schema de validação para convite de usuário
 */
export const inviteUserSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  role: z
    .enum(["admin", "manager", "member", "viewer"], {
      errorMap: () => ({ message: "Role inválido" }),
    })
    .default("member"),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

/**
 * Schema de validação para atualização de role
 */
export const updateRoleSchema = z.object({
  userId: z
    .string()
    .uuid("ID de usuário inválido"),
  role: z.enum(["admin", "manager", "member", "viewer"], {
    errorMap: () => ({ message: "Role inválido" }),
  }),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

/**
 * Schema de validação para ID de usuário
 */
export const userIdSchema = z
  .string()
  .uuid("ID de usuário inválido");
