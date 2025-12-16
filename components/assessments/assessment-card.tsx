"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Calendar,
  Users,
  ExternalLink,
  Edit,
  Eye,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { CopyLinkButton } from "./copy-link-button";
import { cn } from "@/lib/utils";

interface AssessmentCardProps {
  assessment: {
    id: string;
    title: string;
    status: string;
    start_date: string;
    end_date: string | null;
    department_id: string | null;
    questionnaires?: {
      title: string;
    } | null;
    departments?: {
      name: string;
    } | null;
    responses?: Array<{ count: number }>;
  };
  canManage: boolean;
}

export function AssessmentCard({ assessment, canManage }: AssessmentCardProps) {
  const responseCount = assessment.responses?.[0]?.count || 0;
  const isActive = assessment.status === "active";
  const today = new Date().toISOString().split("T")[0];
  const isExpired = assessment.end_date && assessment.end_date < today;

  // Get base URL client-side
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/assess/${assessment.id}`
      : `/assess/${assessment.id}`;

  const statusConfig = {
    expired: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      label: "Encerrado",
    },
    active: {
      bg: "bg-pm-green-light/50",
      text: "text-pm-green-dark",
      border: "border-pm-green-dark/20",
      label: "Ativo",
    },
    draft: {
      bg: "bg-pm-olive-light/30",
      text: "text-pm-olive",
      border: "border-pm-olive/20",
      label: "Rascunho",
    },
  };

  const status = isExpired ? "expired" : isActive ? "active" : "draft";
  const config = statusConfig[status];

  return (
    <Card className={cn(
      "group transition-all duration-300 hover:shadow-lg border-l-4",
      isActive && !isExpired ? "border-l-pm-terracotta" : "border-l-gray-300"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                isActive && !isExpired ? "bg-pm-terracotta/10" : "bg-gray-100"
              )}>
                <ClipboardList className={cn(
                  "w-5 h-5",
                  isActive && !isExpired ? "text-pm-terracotta" : "text-gray-500"
                )} />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-text-heading">
                  {assessment.title}
                </h3>
                <p className="text-sm text-text-muted">
                  {assessment.questionnaires?.title || "Questionário não definido"}
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 text-xs font-medium rounded-full",
                config.bg,
                config.text
              )}>
                {config.label}
              </span>
            </div>

            {/* Métricas */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-4">
              <div className="flex items-center gap-2 bg-bg-sage px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-pm-olive" />
                <span className="font-medium text-text-primary">{responseCount}</span>
                <span>respostas</span>
              </div>

              {assessment.department_id && assessment.departments?.name && (
                <div className="flex items-center gap-2 bg-bg-sage px-3 py-1.5 rounded-lg">
                  <Building2 className="w-4 h-4 text-pm-olive" />
                  <span>{assessment.departments.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-bg-sage px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-pm-olive" />
                <span>
                  {new Date(assessment.start_date).toLocaleDateString("pt-BR")}
                  {assessment.end_date && (
                    <> → {new Date(assessment.end_date).toLocaleDateString("pt-BR")}</>
                  )}
                </span>
              </div>
            </div>

            {/* Link público */}
            {isActive && !isExpired && (
              <div className="p-4 bg-gradient-to-r from-pm-green-light/30 to-bg-sage rounded-xl border border-pm-green-dark/10">
                <p className="text-xs font-medium text-text-muted mb-2">Link Público para Coleta:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-text-primary bg-white px-3 py-2 rounded-lg border border-border-light truncate font-mono">
                    {publicUrl}
                  </code>
                  <CopyLinkButton url={publicUrl} />
                  <Link
                    href={`/assess/${assessment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 hover:bg-pm-terracotta hover:text-white hover:border-pm-terracotta">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 ml-4">
            <Link href={`/dashboard/assessments/${assessment.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 hover:bg-pm-olive hover:text-white hover:border-pm-olive"
              >
                <Eye className="w-4 h-4" />
                Ver Detalhes
              </Button>
            </Link>

            {canManage && (
              <Link href={`/dashboard/assessments/${assessment.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 hover:bg-pm-terracotta hover:text-white hover:border-pm-terracotta"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
