'use client';

/**
 * Assessment Wizard Component
 *
 * Wizard de 5 passos para criação de assessments NR-1
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stepper, MobileStepper, Step } from '@/components/ui/stepper';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { dispatchAssessmentActivated } from '@/app/dashboard/assessments/actions';

// Steps components (será implementado)
import { BasicInfoStep } from './wizard-steps/basic-info-step';
import { AudienceStep } from './wizard-steps/audience-step';
import { QuestionsStep } from './wizard-steps/questions-step';
import { ConfigurationsStep } from './wizard-steps/configurations-step';
import { ReviewStep } from './wizard-steps/review-step';

const WIZARD_STEPS: Step[] = [
  { id: 1, title: 'Informações Básicas', description: 'Título e tipo' },
  { id: 2, title: 'Público-Alvo', description: 'Departamentos' },
  { id: 3, title: 'Questões', description: 'Selecionar perguntas' },
  { id: 4, title: 'Configurações', description: 'Datas e lembretes' },
  { id: 5, title: 'Revisão', description: 'Conferir e ativar' },
];

export interface WizardData {
  // Step 1: Basic Info
  title: string;
  description: string;
  type: 'nr1' | 'pulse' | 'custom';
  isAnonymous: boolean;

  // Step 2: Audience
  departmentIds: string[];
  allOrganization: boolean;

  // Step 3: Questions
  questionnaireId: string;
  selectedQuestionIds: string[];

  // Step 4: Configurations
  startDate: string;
  endDate: string;
  reminderFrequency: 'daily' | 'weekly' | 'none';

  // Meta
  organizationId: string;
  status: 'draft' | 'active';
}

interface QuestionItem {
  id: string;
  text: string;
  type: string;
  category: string;
}

interface AssessmentWizardProps {
  organizationId: string;
  questionnaires: Array<{ id: string; title: string; questions?: QuestionItem[] }>;
  departments: Array<{ id: string; name: string }>;
}

export function AssessmentWizard({
  organizationId,
  questionnaires,
  departments,
}: AssessmentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const [wizardData, setWizardData] = useState<WizardData>({
    // Step 1
    title: '',
    description: '',
    type: 'nr1',
    isAnonymous: true,

    // Step 2
    departmentIds: [],
    allOrganization: false,

    // Step 3
    questionnaireId: '',
    selectedQuestionIds: [],

    // Step 4
    startDate: today,
    endDate: '',
    reminderFrequency: 'none',

    // Meta
    organizationId,
    status: 'draft',
  });

  // Atualizar dados do wizard
  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
    setError(null);
  };

  // Validar step atual
  const validateCurrentStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case 1:
        if (!wizardData.title.trim()) {
          setError('Digite um título para o assessment');
          return false;
        }
        break;

      case 2:
        if (!wizardData.allOrganization && wizardData.departmentIds.length === 0) {
          setError('Selecione pelo menos um departamento ou marque "Toda organização"');
          return false;
        }
        break;

      case 3:
        if (!wizardData.questionnaireId) {
          setError('Selecione um questionário');
          return false;
        }
        if (wizardData.selectedQuestionIds.length === 0) {
          setError('Selecione pelo menos uma questão');
          return false;
        }
        break;

      case 4:
        if (!wizardData.startDate) {
          setError('Defina a data de início');
          return false;
        }
        if (wizardData.endDate && wizardData.endDate < wizardData.startDate) {
          setError('Data de término deve ser posterior à data de início');
          return false;
        }
        break;

      default:
        break;
    }

    return true;
  };

  // Navegar para próximo step
  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navegar para step anterior
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Salvar como rascunho
  const handleSaveDraft = async () => {
    if (!wizardData.title.trim()) {
      setError('Digite um título antes de salvar o rascunho');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const assessmentData = {
        organization_id: organizationId,
        title: wizardData.title,
        description: wizardData.description || null,
        questionnaire_id: wizardData.questionnaireId || null,
        department_id: wizardData.allOrganization
          ? null
          : wizardData.departmentIds[0] || null,
        start_date: wizardData.startDate,
        end_date: wizardData.endDate || null,
        status: 'draft' as const,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/dashboard/assessments/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar rascunho';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Ativar assessment
  const handleActivate = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const assessmentData = {
        organization_id: organizationId,
        title: wizardData.title,
        description: wizardData.description || null,
        questionnaire_id: wizardData.questionnaireId,
        department_id: wizardData.allOrganization
          ? null
          : wizardData.departmentIds[0] || null,
        start_date: wizardData.startDate,
        end_date: wizardData.endDate || null,
        status: 'active' as const,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Disparar webhook diagnostic.activated para n8n
      await dispatchAssessmentActivated({
        organizationId,
        assessmentId: data.id,
        title: wizardData.title,
        departmentIds: wizardData.departmentIds,
        allOrganization: wizardData.allOrganization,
        startDate: wizardData.startDate,
        endDate: wizardData.endDate,
      });

      router.push(`/dashboard/assessments/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao ativar assessment';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Render do step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 2:
        return (
          <AudienceStep
            data={wizardData}
            departments={departments}
            onUpdate={updateWizardData}
          />
        );
      case 3:
        return (
          <QuestionsStep
            data={wizardData}
            questionnaires={questionnaires}
            onUpdate={updateWizardData}
          />
        );
      case 4:
        return (
          <ConfigurationsStep
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={wizardData}
            questionnaires={questionnaires}
            departments={departments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com voltar */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/assessments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-heading">
            Novo Assessment
          </h1>
          <p className="text-text-secondary mt-1">
            Configure seu assessment em 5 passos simples
          </p>
        </div>
      </div>

      {/* Stepper - Desktop */}
      <div className="hidden md:block">
        <Stepper
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          allowSkip={false}
        />
      </div>

      {/* Stepper - Mobile */}
      <div className="block md:hidden">
        <MobileStepper steps={WIZARD_STEPS} currentStep={currentStep} />
      </div>

      {/* Error display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step content */}
      <Card>
        <CardContent className="py-6">{renderCurrentStep()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {/* Salvar Rascunho */}
          {currentStep < 5 && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
          )}

          {/* Próximo ou Ativar */}
          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={loading}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleActivate} disabled={loading}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {loading ? 'Ativando...' : 'Ativar Assessment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
