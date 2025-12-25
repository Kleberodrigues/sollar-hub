"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUser } from "@/app/dashboard/users/actions";
import { inviteUserSchema } from "@/lib/validations";

interface InviteUserDialogProps {
  memberCount?: number;
  managerCount?: number;
}

export function InviteUserDialog({ memberCount = 0, managerCount = 0 }: InviteUserDialogProps) {
  const memberLimitReached = memberCount >= 1;
  const managerLimitReached = managerCount >= 1;
  const bothLimitsReached = memberLimitReached && managerLimitReached;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Validação Zod client-side
    const validation = inviteUserSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      role: formData.get("role") || "membro",
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const result = await inviteUser(formData);

      if ('error' in result && result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();

        // Fechar dialog após 1 segundo
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          // Reset form
          (e.target as HTMLFormElement).reset();
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao convidar usuário";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Convidar Usuário</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convidar Novo Usuário</DialogTitle>
          <DialogDescription>
            Adicione um novo membro à sua organização. Ele receberá um email
            com as credenciais de acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-risk-high-bg border border-risk-high-border rounded-md">
              <p className="text-sm text-risk-high">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-risk-low-bg border border-risk-low rounded-md">
              <p className="text-sm text-risk-low font-medium">
                ✓ Usuário convidado com sucesso!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="João Silva"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="joao@empresa.com"
              required
              disabled={loading}
            />
            <p className="text-xs text-text-muted">
              O usuário receberá um email com as instruções de acesso
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Perfil *</Label>
            {bothLimitsReached ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-700 font-medium">
                  Limite de usuários atingido
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Sua organização já possui 1 gerente e 1 membro. Contate o suporte para aumentar os limites.
                </p>
              </div>
            ) : (
              <>
                <Select
                  name="role"
                  defaultValue={managerLimitReached ? "membro" : memberLimitReached ? "responsavel_empresa" : "membro"}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="responsavel_empresa" disabled={managerLimitReached}>
                      Responsável {managerLimitReached && "(limite atingido)"}
                    </SelectItem>
                    <SelectItem value="membro" disabled={memberLimitReached}>
                      Membro {memberLimitReached && "(limite atingido)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-muted">
                  <strong>Responsável:</strong> Acesso completo, gerencia usuários e diagnósticos |{" "}
                  <strong>Membro:</strong> Acesso limitado, visualiza relatórios
                </p>
                {(memberLimitReached || managerLimitReached) && (
                  <p className="text-xs text-amber-600">
                    {memberLimitReached && "Limite de 1 membro atingido. "}
                    {managerLimitReached && "Limite de 1 gerente atingido. "}
                    Contate o suporte para aumentar.
                  </p>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || bothLimitsReached}>
              {loading ? "Convidando..." : "Convidar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
