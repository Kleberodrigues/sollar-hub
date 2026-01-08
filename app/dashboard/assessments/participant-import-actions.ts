/* eslint-disable no-console */
/**
 * Participant Import Actions for Assessments
 *
 * Server actions for importing participants for automated email dispatch
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { dispatchEvent } from '@/lib/events/dispatcher';

// ============================================
// Types
// ============================================

export interface ParticipantRow {
  email: string;
  name: string;
  department?: string;
  role?: string; // cargo
}

export interface ImportResult {
  success: boolean;
  message?: string;
  error?: string;
  importedCount?: number;
  skippedCount?: number;
  duplicateCount?: number;
}

export interface Participant {
  id: string;
  email: string;
  name: string;
  department: string | null;
  role: string | null;
  status: 'pending' | 'sent' | 'responded' | 'bounced' | 'opted_out';
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

// ============================================
// Validation
// ============================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateParticipantRow(row: ParticipantRow, rowIndex: number): string[] {
  const errors: string[] = [];

  if (!row.email || typeof row.email !== 'string') {
    errors.push(`Linha ${rowIndex + 1}: Email é obrigatório`);
  } else if (!validateEmail(row.email.trim())) {
    errors.push(`Linha ${rowIndex + 1}: Email inválido "${row.email}"`);
  }

  if (!row.name || typeof row.name !== 'string' || row.name.trim().length < 2) {
    errors.push(`Linha ${rowIndex + 1}: Nome é obrigatório (mínimo 2 caracteres)`);
  }

  return errors;
}

// ============================================
// Import Actions
// ============================================

/**
 * Import participants for an assessment
 */
export async function importParticipants(
  assessmentId: string,
  data: ParticipantRow[]
): Promise<ImportResult> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar perfil e verificar permissão
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single() as any);

  if (!profile || !['admin', 'responsavel_empresa'].includes(profile.role)) {
    return {
      success: false,
      error: 'Você não tem permissão para importar participantes',
    };
  }

  // Verificar se assessment existe e pertence à organização
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error: assessmentError } = await (supabase
    .from('assessments')
    .select('id, title, organization_id')
    .eq('id', assessmentId)
    .eq('organization_id', profile.organization_id)
    .single() as any);

  if (assessmentError || !assessment) {
    return {
      success: false,
      error: 'Assessment não encontrado',
    };
  }

  // Validar dados
  const allErrors: string[] = [];
  const validRows: ParticipantRow[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const errors = validateParticipantRow(row, i);

    if (errors.length === 0) {
      validRows.push({
        email: row.email.trim().toLowerCase(),
        name: row.name.trim(),
        department: row.department?.trim() || undefined,
        role: row.role?.trim() || undefined,
      });
    } else {
      allErrors.push(...errors);
    }
  }

  if (validRows.length === 0) {
    return {
      success: false,
      error: allErrors.length > 0
        ? allErrors.slice(0, 5).join('; ')
        : 'Nenhum participante válido para importar',
    };
  }

  try {
    // Preparar dados para inserção
    const participantsToInsert = validRows.map((row) => ({
      assessment_id: assessmentId,
      organization_id: profile.organization_id,
      email: row.email,
      name: row.name,
      department: row.department,
      role: row.role,
      status: 'pending',
    }));

    // Inserir com upsert para evitar duplicados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase as any)
      .from('assessment_participants')
      .upsert(participantsToInsert, {
        onConflict: 'assessment_id,email',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('[ParticipantImport] Database error:', error);
      return {
        success: false,
        error: `Erro ao salvar participantes: ${error.message}`,
      };
    }

    const importedCount = inserted?.length || validRows.length;
    const skippedCount = data.length - validRows.length;

    // Dispatch event for n8n to send emails
    try {
      // Get user profile for event payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userProfile } = await (supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single() as any);

      // Get organization name for email template
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: organization } = await (supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single() as any);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.sollarsaude.com.br';
      const publicUrl = `${baseUrl}/assess/${assessmentId}`;

      await dispatchEvent({
        organizationId: profile.organization_id,
        eventType: 'participants.imported',
        data: {
          assessment_id: assessmentId,
          assessment_title: assessment.title,
          organization_id: profile.organization_id,
          organization_name: organization?.name || 'sua empresa',
          participants: (inserted || []).map((p: { id: string; email: string; name: string; department?: string; role?: string }) => ({
            id: p.id,
            email: p.email,
            name: p.name,
            department: p.department,
            role: p.role,
          })),
          total_count: importedCount,
          public_url: publicUrl,
          imported_by: {
            id: user.id,
            name: userProfile?.full_name || user.email || 'Admin',
            email: user.email || '',
          },
        },
        metadata: {
          triggered_by: user.id,
          source: 'participant_import',
        },
      });

      console.log(`[ParticipantImport] Event dispatched for ${importedCount} participants`);
    } catch (eventError) {
      console.error('[ParticipantImport] Event dispatch error:', eventError);
      // Don't fail the import if event dispatch fails
    }

    // Revalidar página
    revalidatePath(`/dashboard/assessments/${assessmentId}`);

    return {
      success: true,
      message: `${importedCount} participante(s) importado(s) com sucesso!`,
      importedCount,
      skippedCount,
    };
  } catch (error) {
    console.error('[ParticipantImport] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao importar',
    };
  }
}

/**
 * Get participants for an assessment
 */
export async function getParticipants(assessmentId: string): Promise<{
  success: boolean;
  participants?: Participant[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('assessment_participants')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false }) as any);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, participants: data || [] };
}

/**
 * Generate CSV template for participant import
 */
export async function generateParticipantTemplate(): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  // Usar ponto-e-vírgula como separador para Excel em português
  const csvContent = `email;nome;departamento;cargo
joao.silva@empresa.com;João Silva;TI;Não Liderança
maria.santos@empresa.com;Maria Santos;RH;Não Liderança
pedro.oliveira@empresa.com;Pedro Oliveira;Financeiro;Liderança
`;

  return {
    success: true,
    data: csvContent,
    filename: 'template-participantes.csv',
  };
}

/**
 * Delete a participant
 */
export async function deleteParticipant(participantId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('assessment_participants')
    .delete()
    .eq('id', participantId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(
  participantId: string,
  status: 'pending' | 'sent' | 'responded' | 'bounced' | 'opted_out'
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  const updateData: Record<string, unknown> = { status };

  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString();
  } else if (status === 'responded') {
    updateData.responded_at = new Date().toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('assessment_participants')
    .update(updateData)
    .eq('id', participantId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
