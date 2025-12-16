"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDepartment, updateDepartment } from "@/app/dashboard/departments/actions";

interface Department {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  organization_id: string;
  created_at: string;
}

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  department: Department | null;
  departments: Department[];
}

export function DepartmentDialog({
  open,
  onClose,
  department,
  departments,
}: DepartmentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!department;

  // Reset form when dialog opens/closes or department changes
  useEffect(() => {
    if (open) {
      if (department) {
        setName(department.name);
        setDescription(department.description || "");
        setParentId(department.parent_id);
      } else {
        setName("");
        setDescription("");
        setParentId(null);
      }
      setError(null);
    }
  }, [open, department]);

  // Filter out current department and its children from parent options
  const getAvailableParents = () => {
    if (!department) return departments;

    const childIds = new Set<string>();
    const findChildren = (parentId: string) => {
      departments.forEach((d) => {
        if (d.parent_id === parentId) {
          childIds.add(d.id);
          findChildren(d.id);
        }
      });
    };

    childIds.add(department.id);
    findChildren(department.id);

    return departments.filter((d) => !childIds.has(d.id));
  };

  const availableParents = getAvailableParents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nome e obrigatorio");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input = {
        name: name.trim(),
        description: description.trim() || undefined,
        parent_id: parentId,
      };

      const result = isEditing
        ? await updateDepartment(department.id, input)
        : await createDepartment(input);

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch {
      setError("Erro ao salvar departamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Departamento" : "Novo Departamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Recursos Humanos"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descricao do departamento..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Departamento Pai</Label>
            <Select
              value={parentId || "none"}
              onValueChange={(value) => setParentId(value === "none" ? null : value)}
              disabled={isLoading}
            >
              <SelectTrigger id="parent">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (Departamento Raiz)</SelectItem>
                {availableParents.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-text-muted">
              Deixe vazio para criar um departamento de primeiro nivel
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-pm-terracotta hover:bg-pm-terracotta/90"
            >
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
