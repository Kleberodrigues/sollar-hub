'use client';

/**
 * Assessment Form Component
 * Formulário simples para criação/edição rápida de assessments
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface AssessmentData {
  id?: string;
  title: string;
  questionnaire_id: string;
  department_id?: string | null;
  start_date?: string;
  end_date?: string;
  status?: string;
}

interface AssessmentFormProps {
  organizationId: string;
  questionnaires: Array<{ id: string; title: string }>;
  departments: Array<{ id: string; name: string }>;
  assessment?: AssessmentData;
}

export function AssessmentForm({
  organizationId,
  questionnaires,
  departments,
  assessment,
}: AssessmentFormProps) {
  const router = useRouter();
  const isEditing = !!assessment?.id;
  const supabase = createClient();

  const [formData, setFormData] = useState<AssessmentData>({
    title: assessment?.title || '',
    questionnaire_id: assessment?.questionnaire_id || '',
    department_id: assessment?.department_id || null,
    start_date: assessment?.start_date || new Date().toISOString().split('T')[0],
    end_date: assessment?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default: +30 days
    status: assessment?.status || 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof AssessmentData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validação
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.questionnaire_id) {
        throw new Error('Selecione um questionário');
      }

      const payload = {
        title: formData.title.trim(),
        questionnaire_id: formData.questionnaire_id,
        department_id: formData.department_id || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        organization_id: organizationId,
      };

      if (isEditing && assessment?.id) {
        // Atualizar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('assessments')
          .update(payload)
          .eq('id', assessment.id);

        if (updateError) throw updateError;
      } else {
        // Criar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('assessments')
          .insert(payload);

        if (insertError) throw insertError;
      }

      router.push('/dashboard/assessments');
      router.refresh();
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Ex: Avaliação NR-1 - Janeiro 2025"
              disabled={loading}
            />
          </div>

          {/* Questionário */}
          <div className="space-y-2">
            <Label htmlFor="questionnaire">Questionário *</Label>
            <select
              id="questionnaire"
              value={formData.questionnaire_id}
              onChange={e => handleChange('questionnaire_id', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione um questionário</option>
              {questionnaires.map(q => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          {/* Departamento */}
          <div className="space-y-2">
            <Label htmlFor="department">Departamento (opcional)</Label>
            <select
              id="department"
              value={formData.department_id || ''}
              onChange={e => handleChange('department_id', e.target.value || null)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toda a organização</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={e => handleChange('end_date', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Link href="/dashboard/assessments">
              <Button type="button" variant="outline" disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Criar Avaliação'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
