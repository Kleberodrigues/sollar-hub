"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Users,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { DepartmentDialog } from "./DepartmentDialog";
import { deleteDepartment, seedDepartments } from "@/app/dashboard/departments/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Department {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  organization_id: string;
  created_at: string;
  member_count?: number;
}

interface DepartmentsPageContentProps {
  departments: Department[];
  organizationName: string;
}

export function DepartmentsPageContent({
  departments,
  organizationName,
}: DepartmentsPageContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedDepartments = async () => {
    setIsSeeding(true);
    const result = await seedDepartments();

    if (result.error) {
      toast({
        title: "Erro ao criar departamentos",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Departamentos criados!",
        description: `${result.created} departamentos de exemplo foram adicionados.`,
      });
    }

    setIsSeeding(false);
  };

  // Build tree structure
  const rootDepartments = departments.filter((d) => !d.parent_id);
  const childDepartments = departments.filter((d) => d.parent_id);

  const getDepartmentChildren = (parentId: string) =>
    childDepartments.filter((d) => d.parent_id === parentId);

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    const result = await deleteDepartment(deletingId);

    if (result.error) {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Departamento excluído",
        description: "O departamento foi removido com sucesso.",
      });
    }

    setIsDeleting(false);
    setDeletingId(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDepartment(null);
  };

  return (
    <div className="p-6 pb-12 space-y-6 flex-1 bg-white/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Departamentos</h1>
          <p className="text-text-muted mt-1">
            Gerencie os departamentos de {organizationName}
          </p>
        </div>
        <div className="flex gap-2">
          {departments.length < 5 && (
            <Button
              variant="outline"
              onClick={handleSeedDepartments}
              disabled={isSeeding}
              className="border-pm-olive text-pm-olive hover:bg-pm-olive/10"
            >
              {isSeeding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Criar Exemplos
            </Button>
          )}
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-pm-terracotta hover:bg-pm-terracotta/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Departamento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pm-terracotta/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-pm-terracotta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-heading">
                  {departments.length}
                </p>
                <p className="text-sm text-text-muted">Total de Departamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pm-olive/10 rounded-xl flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-pm-olive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-heading">
                  {rootDepartments.length}
                </p>
                <p className="text-sm text-text-muted">Departamentos Raiz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-heading">
                  {departments.reduce((sum, d) => sum + (d.member_count || 0), 0)}
                </p>
                <p className="text-sm text-text-muted">Membros Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department List */}
      {departments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-heading mb-2">
              Nenhum departamento cadastrado
            </h3>
            <p className="text-text-muted mb-4">
              Comece criando o primeiro departamento da sua organização ou use os exemplos
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleSeedDepartments}
                disabled={isSeeding}
                className="border-pm-olive text-pm-olive hover:bg-pm-olive/10"
              >
                {isSeeding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Criar 10 Departamentos de Exemplo
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-pm-terracotta hover:bg-pm-terracotta/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Manualmente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estrutura Organizacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rootDepartments.map((dept) => (
              <DepartmentItem
                key={dept.id}
                department={dept}
                childDepartments={getDepartmentChildren(dept.id)}
                allDepartments={departments}
                onEdit={handleEdit}
                onDelete={(id) => setDeletingId(id)}
                level={0}
              />
            ))}

            {/* Orphan departments (have parent_id but parent doesn't exist) */}
            {childDepartments
              .filter((d) => !departments.find((p) => p.id === d.parent_id))
              .map((dept) => (
                <DepartmentItem
                  key={dept.id}
                  department={dept}
                  childDepartments={getDepartmentChildren(dept.id)}
                  allDepartments={departments}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeletingId(id)}
                  level={0}
                />
              ))}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <DepartmentDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        department={editingDepartment}
        departments={departments}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Departamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os membros do departamento
              serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface DepartmentItemProps {
  department: Department;
  childDepartments: Department[];
  allDepartments: Department[];
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
  level: number;
}

function DepartmentItem({
  department,
  childDepartments,
  allDepartments,
  onEdit,
  onDelete,
  level,
}: DepartmentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = childDepartments.length > 0;

  const getChildren = (parentId: string) =>
    allDepartments.filter((d) => d.parent_id === parentId);

  return (
    <div className={level > 0 ? "ml-6 border-l-2 border-border-light pl-4" : ""}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-sage group">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="w-10 h-10 bg-pm-terracotta/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-pm-terracotta" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-text-heading truncate">
              {department.name}
            </h3>
            {department.member_count !== undefined && department.member_count > 0 && (
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {department.member_count}
              </Badge>
            )}
          </div>
          {department.description && (
            <p className="text-sm text-text-muted truncate">
              {department.description}
            </p>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(department)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(department.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {childDepartments.map((child) => (
            <DepartmentItem
              key={child.id}
              department={child}
              childDepartments={getChildren(child.id)}
              allDepartments={allDepartments}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
