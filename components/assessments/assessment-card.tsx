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
} from "lucide-react";
import Link from "next/link";
import { CopyLinkButton } from "./copy-link-button";

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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-sollar-green-dark" />
              <h3 className="text-lg font-semibold text-text-heading">
                {assessment.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isExpired
                    ? "bg-gray-100 text-gray-700"
                    : isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {isExpired ? "Encerrado" : isActive ? "Ativo" : "Rascunho"}
              </span>
            </div>

            <p className="text-text-secondary mb-4">
              Questionário: {assessment.questionnaires?.title || "N/A"}
            </p>

            <div className="flex items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{responseCount} respostas</span>
              </div>

              {assessment.department_id && (
                <div className="flex items-center gap-1">
                  <span>Depto: {assessment.departments?.name || "N/A"}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(assessment.start_date).toLocaleDateString("pt-BR")}
                  {" - "}
                  {assessment.end_date
                    ? new Date(assessment.end_date).toLocaleDateString("pt-BR")
                    : "Sem data fim"}
                </span>
              </div>
            </div>

            {/* Link público */}
            {isActive && !isExpired && (
              <div className="mt-4 p-3 bg-sollar-green-light rounded-lg">
                <p className="text-xs text-text-muted mb-1">Link Público:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-text-primary bg-white px-2 py-1 rounded border border-border-light truncate">
                    {publicUrl}
                  </code>
                  <CopyLinkButton url={publicUrl} />
                  <Link
                    href={`/assess/${assessment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Abrir
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/dashboard/assessments/${assessment.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                Ver
              </Button>
            </Link>

            {canManage && (
              <Link href={`/dashboard/assessments/${assessment.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
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
