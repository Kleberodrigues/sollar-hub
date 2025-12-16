"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole, deactivateUser } from "@/app/dashboard/users/actions";
import type { UserProfile, UserRole } from "@/types";
import { useRouter } from "next/navigation";

interface UserListProps {
  users: (UserProfile & { organizations?: { name: string } })[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  member: "Membro",
  viewer: "Visualizador",
};

export function UserList({ users }: UserListProps) {
  const router = useRouter();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setLoadingUserId(userId);
    setError(null);

    try {
      const result = await updateUserRole(userId, newRole);

      if ('error' in result && result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar role";
      setError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Tem certeza que deseja desativar este usuário?")) {
      return;
    }

    setLoadingUserId(userId);
    setError(null);

    try {
      const result = await deactivateUser(userId);

      if ('error' in result && result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao desativar usuário";
      setError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-risk-high-bg border border-risk-high-border rounded-md">
          <p className="text-sm text-risk-high">{error}</p>
        </div>
      )}

      <div className="rounded-md border border-border-default">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-muted">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "Sem nome"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {/* Email não está no user_profiles, precisaria vir do auth */}
                    -
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || "member"}
                      onValueChange={(value: UserRole) =>
                        handleRoleChange(user.id, value)
                      }
                      disabled={loadingUserId === user.id}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          {ROLE_LABELS.admin}
                        </SelectItem>
                        <SelectItem value="manager">
                          {ROLE_LABELS.manager}
                        </SelectItem>
                        <SelectItem value="member">
                          {ROLE_LABELS.member}
                        </SelectItem>
                        <SelectItem value="viewer">
                          {ROLE_LABELS.viewer}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="bg-risk-low text-white">
                      Ativo
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDate(user.created_at || "")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(user.id)}
                      disabled={loadingUserId === user.id}
                    >
                      Desativar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
