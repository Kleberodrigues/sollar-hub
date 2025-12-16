/**
 * Import Actions for Analytics Dashboard
 *
 * Server actions para importação de dados de respostas
 * Requer plano Pro ou superior
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getServerPlanFeatures } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';

// ============================================
// Types
// ============================================

export interface ImportRow {
  anonymous_id: string;
  question_id: string;
  response_text: string;
  value?: string;
  created_at?: string;
}

export interface ImportResult {
  success: boolean;
  message?: string;
  error?: string;
  importedCount?: number;
  skippedCount?: number;
  upgradeRequired?: boolean;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  questionIds: string[];
}

// ============================================
// Validation
// ============================================

/**
 * Valida se o usuário pode importar dados
 */
export async function checkImportPermission(): Promise<ImportResult | null> {
  const planFeatures = await getServerPlanFeatures();

  if (!planFeatures.canImport()) {
    return {
      success: false,
      error: 'Importação de dados requer plano Pro ou superior.',
      upgradeRequired: true,
    };
  }

  return null;
}

/**
 * Obtém lista de question_ids válidos para um assessment
 */
export async function getAssessmentQuestionIds(assessmentId: string): Promise<ImportValidationResult> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      valid: false,
      errors: ['Usuário não autenticado'],
      warnings: [],
      questionIds: [],
    };
  }

  // Buscar assessment e verificar permissão
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error: assessmentError } = await (supabase
    .from('assessments')
    .select(`
      id,
      organization_id,
      questionnaires (
        questions (
          id,
          text,
          category
        )
      )
    `)
    .eq('id', assessmentId)
    .single() as any);

  if (assessmentError || !assessment) {
    return {
      valid: false,
      errors: ['Assessment não encontrado'],
      warnings: [],
      questionIds: [],
    };
  }

  // Verificar se usuário pertence à organização
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single() as any);

  if (profile?.organization_id !== assessment.organization_id) {
    return {
      valid: false,
      errors: ['Você não tem permissão para importar dados neste assessment'],
      warnings: [],
      questionIds: [],
    };
  }

  // Extrair question_ids
  const questions = assessment.questionnaires?.questions || [];
  const questionIds = questions.map((q: { id: string }) => q.id);

  if (questionIds.length === 0) {
    return {
      valid: false,
      errors: ['Assessment não possui perguntas'],
      warnings: [],
      questionIds: [],
    };
  }

  return {
    valid: true,
    errors: [],
    warnings: [],
    questionIds,
  };
}

// ============================================
// Import
// ============================================

/**
 * Importa respostas para um assessment
 */
export async function importResponses(
  assessmentId: string,
  data: ImportRow[]
): Promise<ImportResult> {
  // Verificar permissão de plano
  const permissionError = await checkImportPermission();
  if (permissionError) return permissionError;

  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Validar assessment e permissões
  const validation = await getAssessmentQuestionIds(assessmentId);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(', '),
    };
  }

  // Filtrar apenas linhas com question_id válido
  const validRows = data.filter((row) => validation.questionIds.includes(row.question_id));
  const skippedCount = data.length - validRows.length;

  if (validRows.length === 0) {
    return {
      success: false,
      error: 'Nenhuma linha válida para importar. Verifique se os question_ids estão corretos.',
    };
  }

  try {
    // Preparar dados para inserção
    const responsesToInsert = validRows.map((row) => ({
      assessment_id: assessmentId,
      question_id: row.question_id,
      anonymous_id: row.anonymous_id,
      response_text: row.response_text,
      value: row.value || null,
      created_at: row.created_at || new Date().toISOString(),
    }));

    // Inserir em batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('responses')
      .insert(responsesToInsert);

    if (error) {
      console.error('[Import] Database error:', error);
      return {
        success: false,
        error: `Erro ao salvar respostas: ${error.message}`,
      };
    }

    // Revalidar página de analytics
    revalidatePath(`/dashboard/analytics`);

    return {
      success: true,
      message: `${validRows.length} respostas importadas com sucesso!`,
      importedCount: validRows.length,
      skippedCount,
    };
  } catch (error) {
    console.error('[Import] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao importar',
    };
  }
}

// ============================================
// Template
// ============================================

/**
 * Gera template CSV para download
 */
export async function generateImportTemplate(assessmentId: string): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    // Buscar perguntas do assessment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment } = await (supabase
      .from('assessments')
      .select(`
        title,
        questionnaires (
          questions (
            id,
            text,
            category
          )
        )
      `)
      .eq('id', assessmentId)
      .single() as any);

    if (!assessment) {
      return {
        success: false,
        error: 'Assessment não encontrado',
      };
    }

    const questions = assessment.questionnaires?.questions || [];

    // Gerar CSV template
    const { generateCSVTemplate } = await import('@/lib/imports/csv-parser');
    const csvContent = generateCSVTemplate(questions);

    return {
      success: true,
      data: csvContent,
      filename: `template-import-${assessment.title.replace(/\s+/g, '-').toLowerCase()}.csv`,
    };
  } catch (error) {
    console.error('[Template] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar template',
    };
  }
}
