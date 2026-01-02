"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Lock } from "lucide-react";
import { type PlanType, PLANS } from "@/lib/stripe/config";

interface InviteUserDialogProps {
  memberCount?: number;
  managerCount?: number;
  currentPlan?: PlanType;
}

export function InviteUserDialog({
  memberCount = 0,
  managerCount = 0,
  currentPlan = 'base',
}: InviteUserDialogProps) {
  // Get plan limits from config
  const planConfig = PLANS[currentPlan];
  const maxTeamMembers = planConfig?.limits.maxTeamMembers ?? 10;
  const totalMembers = memberCount + managerCount;

  // Check if limit is reached based on plan
  const teamLimitReached = maxTeamMembers !== Infinity && totalMembers >= maxTeamMembers;
  const memberLimitReached = memberCount >= Math.max(1, Math.floor(maxTeamMembers * 0.8)); // 80% can be members
  const managerLimitReached = managerCount >= Math.max(1, Math.ceil(maxTeamMembers * 0.2)); // 20% can be managers
  const bothLimitsReached = teamLimitReached;
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
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-700 font-medium">
                    Limite de usuários atingido
                  </p>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Seu plano {planConfig?.name} permite até {maxTeamMembers === Infinity ? 'ilimitados' : maxTeamMembers} membros.
                  {maxTeamMembers !== Infinity && (
                    <> Você tem {totalMembers}/{maxTeamMembers}. <a href="/dashboard/configuracoes/billing" className="underline hover:text-amber-700">Faça upgrade</a> para adicionar mais.</>
                  )}
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
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Membros da equipe: {totalMembers}/{maxTeamMembers === Infinity ? '∞' : maxTeamMembers}</span>
                  {maxTeamMembers !== Infinity && totalMembers >= maxTeamMembers - 2 && (
                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200">
                      Limite próximo
                    </Badge>
                  )}
                </div>
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
