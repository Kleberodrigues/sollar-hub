"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SeedClimatePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    questionsCount: number;
    responsesInserted: number;
    assessmentId: string;
  } | null>(null);

  // Fetch user's organization on mount
  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single() as { data: { organization_id: string | null } | null };

        if (profile?.organization_id) {
          setOrganizationId(profile.organization_id);

          // Get organization name
          const { data: org } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", profile.organization_id)
            .single() as { data: { name: string } | null };

          if (org) {
            setOrganizationName(org.name);
          }
        }
      }
    };

    fetchOrganization();
  }, []);

  const runSeed = async () => {
    setStatus("loading");
    setLogs(["Iniciando seed..."]);

    try {
      const response = await fetch("/api/seed/climate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: 30,
          secret: "psicomapa-seed-2025",
          organizationId: organizationId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setLogs(data.logs || []);
        setSummary(data.summary);
      } else {
        setStatus("error");
        setLogs([data.error || "Erro desconhecido"]);
      }
    } catch (err) {
      setStatus("error");
      setLogs([`Erro: ${err}`]);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-text-heading mb-4">
          Seed Pesquisa de Clima
        </h1>
        <p className="text-text-secondary mb-8">
          Esta página gera 30 respostas de teste para a Pesquisa de Clima
          Organizacional.
        </p>

        {organizationId ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800">
              <strong>Organização:</strong> {organizationName || organizationId}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Os dados de teste serão criados para esta organização.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800">
              Faça login para gerar dados para sua organização.
            </p>
          </div>
        )}

        <button
          onClick={runSeed}
          disabled={status === "loading" || !organizationId}
          className="px-6 py-3 bg-pm-terracotta text-white rounded-xl font-medium hover:bg-pm-terracotta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === "loading" ? "Gerando respostas..." : "Gerar Respostas de Teste"}
        </button>

        {logs.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-xl border border-border-light">
            <h2 className="font-semibold text-text-heading mb-3">Logs:</h2>
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, i) => (
                <div key={i} className="text-text-secondary">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "success" && summary && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <h2 className="font-semibold text-green-800 mb-2">Sucesso!</h2>
            <ul className="text-green-700 text-sm space-y-1">
              <li>Perguntas: {summary.questionsCount}</li>
              <li>Respostas inseridas: {summary.responsesInserted}</li>
              <li>Assessment ID: {summary.assessmentId}</li>
            </ul>
            <a
              href="/dashboard/climate"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver Dashboard de Clima
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h2 className="font-semibold text-red-800">Erro</h2>
            <p className="text-red-700 text-sm">Verifique os logs acima.</p>
          </div>
        )}
      </div>
    </div>
  );
}
