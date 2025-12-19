"use server";

import { createClient } from "@/lib/supabase/server";
import { dispatchRiskThresholdExceeded } from "@/app/dashboard/assessments/actions";
import {
  meetsThreshold,
  getSuppressionStatus,
} from "@/lib/constants/anonymity-thresholds";
import { CATEGORY_LABELS } from "@/types";

export interface AssessmentAnalytics {
  totalParticipants: number;
  totalQuestions: number;
  completionRate: number;
  responsesByCategory: CategoryScore[];
  lastResponseDate: string | null;
  /** Indica se os dados estao suprimidos por anonimato */
  isSuppressed: boolean;
  /** Informacoes de supressao quando aplicavel */
  suppressionInfo?: {
    currentCount: number;
    minimumRequired: number;
    remaining: number;
  };
}

export interface CategoryScore {
  category: string;
  averageScore: number;
  questionCount: number;
  responseCount: number;
  riskLevel: "low" | "medium" | "high";
  /** Indica se esta categoria esta suprimida por anonimato */
  isSuppressed: boolean;
}

export interface QuestionDistribution {
  questionId: string;
  questionText: string;
  questionType: string;
  /** Categoria da pergunta (anchors, suggestions, etc.) */
  questionCategory: string;
  responses: {
    value: string;
    count: number;
    percentage: number;
  }[];
  /** Indica se esta pergunta esta suprimida por anonimato */
  isSuppressed: boolean;
  /** Total de respostas para esta pergunta */
  totalResponses: number;
}

export interface DepartmentAnalytics {
  id: string;
  name: string;
  participantCount: number;
  responseCount: number;
  averageScore: number;
  riskLevel: "low" | "medium" | "high";
  /** Total de funcionarios no departamento */
  employeeCount: number;
  /** Indica se este departamento esta suprimido por anonimato */
  isSuppressed: boolean;
}

/**
 * Get overall analytics for an assessment
 */
export async function getAssessmentAnalytics(
  assessmentId: string
): Promise<AssessmentAnalytics | null> {
  const supabase = await createClient();

  console.log('[Analytics] Starting getAssessmentAnalytics for:', assessmentId);

  try {
    // Get assessment with questionnaire
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select(
        `
        id,
        questionnaire_id,
        questionnaires (
          id,
          questions (
            id,
            category,
            type,
            risk_inverted
          )
        )
      `
      )
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return null;
    }

    // Get all responses for this assessment (paginated to handle large datasets)
    const PAGE_SIZE = 1000;
    let allResponses: ResponseWithQuestion[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: responsePage, error: responsesError } = await supabase
        .from("responses")
        .select(
          `
          id,
          anonymous_id,
          response_text,
          created_at,
          question_id,
          questions (
            id,
            category,
            type,
            risk_inverted
          )
        `
        )
        .eq("assessment_id", assessmentId)
        .range(offset, offset + PAGE_SIZE - 1) as unknown as { data: ResponseWithQuestion[] | null; error: unknown };

      if (responsesError) {
        console.error('[Analytics] Response fetch error:', {
          assessmentId,
          code: (responsesError as { code?: string }).code,
          message: (responsesError as { message?: string }).message,
          offset
        });
        return null;
      }

      // Log para diagnóstico de respostas
      console.log('[Analytics] Responses fetched:', {
        assessmentId,
        pageSize: PAGE_SIZE,
        offset,
        count: responsePage?.length || 0
      });

      if (responsePage && responsePage.length > 0) {
        allResponses = [...allResponses, ...responsePage];
        hasMore = responsePage.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }

    const responses = allResponses;

    // Calculate metrics
    const uniqueParticipants = new Set(
      responses?.map((r: ResponseWithQuestion) => r.anonymous_id) || []
    ).size;
    const assessmentData = assessment as unknown as AssessmentWithQuestions;
    const totalQuestions = assessmentData.questionnaires?.[0]?.questions?.length || 0;
    const totalResponses = responses?.length || 0;
    const completionRate =
      totalQuestions > 0
        ? (totalResponses / (uniqueParticipants * totalQuestions)) * 100
        : 0;

    // Get last response date
    const lastResponseDate = responses?.length
      ? responses.sort(
          (a: ResponseWithQuestion, b: ResponseWithQuestion) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        )[0].created_at || null
      : null;

    // Calculate scores by category
    const categoryScores = calculateCategoryScores(responses || []);

    // Check anonymity threshold - suppress all data if below minimum participants
    const suppressionStatus = getSuppressionStatus(uniqueParticipants, 'ASSESSMENT_MINIMUM');

    const result: AssessmentAnalytics = {
      totalParticipants: uniqueParticipants,
      totalQuestions,
      completionRate: Math.round(completionRate * 100) / 100,
      responsesByCategory: suppressionStatus.isSuppressed
        ? categoryScores.map(cat => ({ ...cat, isSuppressed: true, averageScore: 0, riskLevel: 'low' as const }))
        : categoryScores,
      lastResponseDate,
      isSuppressed: suppressionStatus.isSuppressed,
      suppressionInfo: suppressionStatus.isSuppressed
        ? {
            currentCount: suppressionStatus.currentCount,
            minimumRequired: suppressionStatus.minimumRequired,
            remaining: suppressionStatus.remaining,
          }
        : undefined,
    };

    console.log('[Analytics] Final result for assessment:', {
      assessmentId,
      totalParticipants: uniqueParticipants,
      totalQuestions,
      totalResponses: responses?.length || 0,
      completionRate: result.completionRate,
      isSuppressed: result.isSuppressed,
    });

    return result;
  } catch (error) {
    console.error('[Analytics] Unexpected error in getAssessmentAnalytics:', {
      assessmentId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Type definitions for Supabase query results
 * These help avoid excessive use of 'any' in type assertions
 */
interface QuestionData {
  id?: string;
  category?: string;
  type?: string;
  risk_inverted?: boolean;
}

interface ResponseWithQuestion {
  id?: string;
  question_id: string;
  response_text: string;
  anonymous_id?: string;
  created_at?: string;
  // Supabase can return either array or object depending on relationship type
  questions?: QuestionData[] | QuestionData | null;
}

interface QuestionResult {
  id: string;
  text?: string;
  type?: string;
  category?: string;
}

interface ResponseTextResult {
  response_text: string;
}

interface AssessmentWithQuestions {
  id: string;
  organization_id?: string;
  title?: string;
  questionnaire_id?: string;
  questionnaires?: {
    id: string;
    questions?: { id: string; category?: string; type?: string; risk_inverted?: boolean }[];
  }[];
}

/**
 * Calculate average scores by Sollar category with risk inversion logic
 *
 * IMPORTANTE: Cada questão tem um flag `risk_inverted`:
 * - risk_inverted = true: Score alto = Risco alto (ex: "Sinto-me sobrecarregado")
 * - risk_inverted = false: Score alto = Risco baixo (ex: "Sinto-me satisfeito")
 *
 * Para calcular corretamente, normalizamos CADA score individualmente:
 * - Se risk_inverted = true: mantém o score (1-5)
 * - Se risk_inverted = false: inverte o score (6 - score), então 5 vira 1 e 1 vira 5
 *
 * Depois da normalização, SEMPRE: score alto = risco alto
 */
function calculateCategoryScores(responses: ResponseWithQuestion[]): CategoryScore[] {
  // Sollar 8-block structure
  const categories = [
    "demands_and_pace",
    "autonomy_clarity_change",
    "leadership_recognition",
    "relationships_communication",
    "work_life_health",
    "violence_harassment",
    "anchors",
    "suggestions",
  ];

  const categoryData: Record<
    string,
    { normalizedScores: number[]; questionIds: Set<string> }
  > = {};

  // Initialize categories
  categories.forEach((cat) => {
    categoryData[cat] = { normalizedScores: [], questionIds: new Set() };
  });

  // Process responses - normalize each score based on its question's risk_inverted flag
  responses.forEach((response) => {
    // Handle both array and object formats from Supabase join
    const questionData = Array.isArray(response.questions)
      ? response.questions[0]
      : response.questions;
    const category = questionData?.category;
    const questionType = questionData?.type;
    const riskInverted = questionData?.risk_inverted ?? true;

    if (category && categoryData[category]) {
      categoryData[category].questionIds.add(response.question_id);

      // Convert likert scale responses to normalized scores
      if (questionType === "likert_scale") {
        const numericValue = parseFloat(response.response_text);
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
          // Normalize score: after normalization, higher score = higher risk
          // risk_inverted = true: keep as is (high score already means high risk)
          // risk_inverted = false: invert (6 - score), so 5 becomes 1 and 1 becomes 5
          const normalizedScore = riskInverted ? numericValue : (6 - numericValue);
          categoryData[category].normalizedScores.push(normalizedScore);
        }
      }
    }
  });

  // Calculate averages and risk levels
  return categories.map((category) => {
    const data = categoryData[category];
    const responseCount = data.normalizedScores.length;

    // Check category-level anonymity threshold
    const isCategorySuppressed = !meetsThreshold(responseCount, 'CATEGORY_MINIMUM');

    const averageScore = isCategorySuppressed
      ? 0
      : responseCount > 0
        ? data.normalizedScores.reduce((a, b) => a + b, 0) / responseCount
        : 0;

    // Determine risk level based on normalized average score
    // After normalization, ALL scores follow: higher = higher risk
    let riskLevel: "low" | "medium" | "high" = "low";

    // Only calculate risk level if not suppressed
    if (!isCategorySuppressed && responseCount > 0) {
      // Unified thresholds after normalization
      if (averageScore >= 3.5) {
        riskLevel = "high";
      } else if (averageScore >= 2.5) {
        riskLevel = "medium";
      }
    }

    return {
      category,
      averageScore: Math.round(averageScore * 100) / 100,
      questionCount: data.questionIds.size,
      responseCount,
      riskLevel,
      isSuppressed: isCategorySuppressed,
    };
  });
}

/**
 * Get response distribution for a specific question (for charts)
 */
export async function getQuestionDistribution(
  assessmentId: string,
  questionId: string
): Promise<QuestionDistribution | null> {
  const supabase = await createClient();

  try {
    // Get question details
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, text, type, category")
      .eq("id", questionId)
      .single() as unknown as { data: QuestionResult | null; error: unknown };

    if (questionError || !question) {
      return null;
    }

    // Get all responses for this question (paginated)
    const PAGE_SIZE = 1000;
    let offset = 0;
    let hasMore = true;
    const valueCounts: Record<string, number> = {};
    let totalResponses = 0;

    while (hasMore) {
      const { data: responsePage, error: responsesError } = await supabase
        .from("responses")
        .select("response_text")
        .eq("assessment_id", assessmentId)
        .eq("question_id", questionId)
        .range(offset, offset + PAGE_SIZE - 1) as unknown as { data: ResponseTextResult[] | null; error: unknown };

      if (responsesError) {
        return null;
      }

      if (responsePage && responsePage.length > 0) {
        // Count occurrences of each value (filter out null/empty/skipped responses)
        responsePage.forEach((r: ResponseTextResult) => {
          if (r.response_text && r.response_text.trim() !== '') {
            valueCounts[r.response_text] = (valueCounts[r.response_text] || 0) + 1;
            totalResponses++;
          }
        });

        hasMore = responsePage.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }

    // Check question-level anonymity threshold
    const isQuestionSuppressed = !meetsThreshold(totalResponses, 'QUESTION_MINIMUM');

    // Format for chart (suppress data if below threshold)
    const distribution = isQuestionSuppressed
      ? []
      : Object.entries(valueCounts).map(([value, count]) => ({
          value,
          count,
          percentage: Math.round((count / totalResponses) * 100 * 100) / 100,
        }));

    return {
      questionId: question.id,
      questionText: question.text || '',
      questionType: question.type || 'text',
      questionCategory: question.category || '',
      responses: distribution,
      isSuppressed: isQuestionSuppressed,
      totalResponses,
    };
  } catch {
    return null;
  }
}

/**
 * Get all questions with their response distributions
 */
export async function getAllQuestionsDistribution(
  assessmentId: string
): Promise<QuestionDistribution[]> {
  const supabase = await createClient();

  try {
    // Get assessment with all questions
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select(
        `
        id,
        questionnaires (
          questions (
            id
          )
        )
      `
      )
      .eq("id", assessmentId)
      .single() as unknown as { data: AssessmentWithQuestions | null; error: unknown };

    if (assessmentError || !assessment) {
      return [];
    }

    const assessmentData = assessment as unknown as AssessmentWithQuestions;
    const questions = assessmentData.questionnaires?.[0]?.questions || [];
    const distributions: QuestionDistribution[] = [];

    // Get distribution for each question
    for (const question of questions) {
      const distribution = await getQuestionDistribution(
        assessmentId,
        question.id
      );
      if (distribution) {
        distributions.push(distribution);
      }
    }

    return distributions;
  } catch {
    return [];
  }
}

/**
 * Get analytics by department (if available)
 * Departments with fewer than DEPARTMENT_MINIMUM employees are suppressed for anonymity
 */
export async function getDepartmentAnalytics(
  assessmentId: string
): Promise<DepartmentAnalytics[]> {
  const supabase = await createClient();

  try {
    // Get assessment with organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment, error: assessmentError } = await (supabase
      .from("assessments")
      .select("id, organization_id, target_departments")
      .eq("id", assessmentId)
      .single() as any);

    if (assessmentError || !assessment) {
      return [];
    }

    // Get all departments for this organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: departments, error: deptError } = await (supabase
      .from("departments")
      .select("id, name")
      .eq("organization_id", assessment.organization_id) as any);

    if (deptError || !departments || departments.length === 0) {
      return [];
    }

    // Get employee counts per department
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberCounts } = await (supabase
      .from("department_members")
      .select("department_id") as any);

    const employeeCountMap = new Map<string, number>();
    if (memberCounts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const m of memberCounts as any[]) {
        const current = employeeCountMap.get(m.department_id) || 0;
        employeeCountMap.set(m.department_id, current + 1);
      }
    }

    // Get responses with user_id to link to departments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: responses } = await (supabase
      .from("responses")
      .select(`
        id,
        user_id,
        response_text,
        anonymous_id,
        questions (
          type,
          risk_inverted
        )
      `)
      .eq("assessment_id", assessmentId) as any);

    // Get user-to-department mapping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userDeptMappings } = await (supabase
      .from("department_members")
      .select("user_id, department_id") as any);

    const userToDept = new Map<string, string>();
    if (userDeptMappings) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const mapping of userDeptMappings as any[]) {
        userToDept.set(mapping.user_id, mapping.department_id);
      }
    }

    // Aggregate responses by department
    const deptData = new Map<string, {
      scores: number[];
      participants: Set<string>;
      responseCount: number;
    }>();

    // Initialize department data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const dept of departments as any[]) {
      deptData.set(dept.id, {
        scores: [],
        participants: new Set(),
        responseCount: 0,
      });
    }

    // Process responses
    if (responses) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const response of responses as any[]) {
        const userId = response.user_id;
        if (!userId) continue; // Skip anonymous responses without user_id

        const deptId = userToDept.get(userId);
        if (!deptId || !deptData.has(deptId)) continue;

        const data = deptData.get(deptId)!;
        data.participants.add(response.anonymous_id || userId);
        data.responseCount++;

        // Parse numeric response for score calculation
        const question = Array.isArray(response.questions)
          ? response.questions[0]
          : response.questions;

        if (question?.type === 'likert_scale' && response.response_text) {
          const numericValue = parseFloat(response.response_text);
          if (!isNaN(numericValue)) {
            data.scores.push(numericValue);
          }
        }
      }
    }

    // Build department analytics with anonymity protection
    const result: DepartmentAnalytics[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const dept of departments as any[]) {
      const employeeCount = employeeCountMap.get(dept.id) || 0;
      const data = deptData.get(dept.id)!;

      // Check anonymity threshold - suppress departments with too few employees
      const isSuppressed = !meetsThreshold(employeeCount, 'DEPARTMENT_MINIMUM');

      const averageScore = isSuppressed || data.scores.length === 0
        ? 0
        : data.scores.reduce((a, b) => a + b, 0) / data.scores.length;

      // Determine risk level
      let riskLevel: "low" | "medium" | "high" = "low";
      if (!isSuppressed && data.scores.length > 0) {
        if (averageScore >= 3.5) {
          riskLevel = "high";
        } else if (averageScore >= 2.5) {
          riskLevel = "medium";
        }
      }

      result.push({
        id: dept.id,
        name: dept.name,
        participantCount: isSuppressed ? 0 : data.participants.size,
        responseCount: isSuppressed ? 0 : data.responseCount,
        averageScore: isSuppressed ? 0 : Math.round(averageScore * 100) / 100,
        riskLevel,
        employeeCount,
        isSuppressed,
      });
    }

    // Sort by participant count (non-suppressed first, then by count)
    return result.sort((a, b) => {
      if (a.isSuppressed !== b.isSuppressed) {
        return a.isSuppressed ? 1 : -1;
      }
      return b.participantCount - a.participantCount;
    });
  } catch (error) {
    console.error('[Analytics] Error in getDepartmentAnalytics:', error);
    return [];
  }
}

// Utility functions moved to ./utils.ts to avoid "Server Actions must be async" error
// Import them from there: import { getCategoryName, getRiskLevelLabel, getRiskLevelColor } from './utils'

// Category names imported from @/types/index.ts (CATEGORY_LABELS)

// Risk threshold for triggering alerts
const RISK_THRESHOLD = 3.5;
const CRITICAL_THRESHOLD = 4.0;

/**
 * Check risk thresholds and dispatch alerts if exceeded
 * Called after analytics are calculated or when specifically needed
 */
export async function checkAndAlertRiskThresholds(
  assessmentId: string
): Promise<{ alertsSent: number; categories: string[] }> {
  const supabase = await createClient();

  try {
    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("id, organization_id, title")
      .eq("id", assessmentId)
      .single() as unknown as { data: { id: string; organization_id: string; title: string } | null; error: unknown };

    if (assessmentError || !assessment) {
      return { alertsSent: 0, categories: [] };
    }

    // Get analytics
    const analytics = await getAssessmentAnalytics(assessmentId);
    if (!analytics) {
      return { alertsSent: 0, categories: [] };
    }

    let alertsSent = 0;
    const alertedCategories: string[] = [];

    // Check each category for risk threshold
    for (const categoryScore of analytics.responsesByCategory) {
      if (categoryScore.riskLevel === "high" && categoryScore.averageScore >= RISK_THRESHOLD) {
        const riskLevel: 'high' | 'critical' = categoryScore.averageScore >= CRITICAL_THRESHOLD ? "critical" : "high";

        // Dispatch risk alert
        await dispatchRiskThresholdExceeded({
          organizationId: assessment.organization_id,
          assessmentId: assessment.id,
          assessmentTitle: assessment.title,
          category: categoryScore.category,
          categoryName: CATEGORY_LABELS[categoryScore.category as keyof typeof CATEGORY_LABELS] || categoryScore.category,
          currentScore: categoryScore.averageScore,
          threshold: RISK_THRESHOLD,
          riskLevel,
        });

        alertsSent++;
        alertedCategories.push(categoryScore.category);
      }
    }

    return { alertsSent, categories: alertedCategories };
  } catch (error) {
    console.error("[Analytics] Error checking risk thresholds:", error);
    return { alertsSent: 0, categories: [] };
  }
}
