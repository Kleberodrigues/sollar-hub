"use server";

import { createClient } from "@/lib/supabase/server";

export interface AssessmentAnalytics {
  totalParticipants: number;
  totalQuestions: number;
  completionRate: number;
  responsesByCategory: CategoryScore[];
  lastResponseDate: string | null;
}

export interface CategoryScore {
  category: string;
  averageScore: number;
  questionCount: number;
  responseCount: number;
  riskLevel: "low" | "medium" | "high";
}

export interface QuestionDistribution {
  questionId: string;
  questionText: string;
  questionType: string;
  responses: {
    value: string;
    count: number;
    percentage: number;
  }[];
}

export interface DepartmentAnalytics {
  department: string;
  participantCount: number;
  averageScore: number;
  completionRate: number;
}

/**
 * Get overall analytics for an assessment
 */
export async function getAssessmentAnalytics(
  assessmentId: string
): Promise<AssessmentAnalytics | null> {
  const supabase = await createClient();

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
            type
          )
        )
      `
      )
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error("Error fetching assessment:", assessmentError);
      return null;
    }

    // Get all responses for this assessment
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select(
        `
        id,
        anonymous_id,
        value,
        created_at,
        question_id,
        questions (
          id,
          category,
          type
        )
      `
      )
      .eq("assessment_id", assessmentId);

    if (responsesError) {
      console.error("Error fetching responses:", responsesError);
      return null;
    }

    // Calculate metrics
    const uniqueParticipants = new Set(
      responses?.map((r) => r.anonymous_id) || []
    ).size;
    const totalQuestions =
      assessment.questionnaires?.questions?.length || 0;
    const totalResponses = responses?.length || 0;
    const completionRate =
      totalQuestions > 0
        ? (totalResponses / (uniqueParticipants * totalQuestions)) * 100
        : 0;

    // Get last response date
    const lastResponseDate = responses?.length
      ? responses.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )[0].created_at
      : null;

    // Calculate scores by category
    const categoryScores = calculateCategoryScores(responses || []);

    return {
      totalParticipants: uniqueParticipants,
      totalQuestions,
      completionRate: Math.round(completionRate * 100) / 100,
      responsesByCategory: categoryScores,
      lastResponseDate,
    };
  } catch (error) {
    console.error("Error in getAssessmentAnalytics:", error);
    return null;
  }
}

/**
 * Calculate average scores by NR-1 category
 */
function calculateCategoryScores(responses: any[]): CategoryScore[] {
  const categories = [
    "demands",
    "control",
    "support",
    "relationships",
    "role",
    "change",
  ];
  const categoryData: Record<
    string,
    { scores: number[]; questionIds: Set<string> }
  > = {};

  // Initialize categories
  categories.forEach((cat) => {
    categoryData[cat] = { scores: [], questionIds: new Set() };
  });

  // Process responses
  responses.forEach((response) => {
    const category = response.questions?.category;
    const questionType = response.questions?.type;

    if (category && categoryData[category]) {
      categoryData[category].questionIds.add(response.question_id);

      // Convert likert scale responses to numbers (1-5)
      if (questionType === "likert_scale") {
        const numericValue = parseFloat(response.value);
        if (!isNaN(numericValue)) {
          categoryData[category].scores.push(numericValue);
        }
      }
    }
  });

  // Calculate averages and risk levels
  return categories.map((category) => {
    const data = categoryData[category];
    const averageScore =
      data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : 0;

    // Determine risk level based on average score (1-5 scale)
    // Lower scores = higher risk in NR-1 context
    let riskLevel: "low" | "medium" | "high" = "low";
    if (averageScore < 2.5) {
      riskLevel = "high";
    } else if (averageScore < 3.5) {
      riskLevel = "medium";
    }

    return {
      category,
      averageScore: Math.round(averageScore * 100) / 100,
      questionCount: data.questionIds.size,
      responseCount: data.scores.length,
      riskLevel,
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
      .select("id, text, type")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      console.error("Error fetching question:", questionError);
      return null;
    }

    // Get all responses for this question
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select("value")
      .eq("assessment_id", assessmentId)
      .eq("question_id", questionId);

    if (responsesError) {
      console.error("Error fetching responses:", responsesError);
      return null;
    }

    // Count occurrences of each value
    const valueCounts: Record<string, number> = {};
    responses?.forEach((r) => {
      valueCounts[r.value] = (valueCounts[r.value] || 0) + 1;
    });

    const totalResponses = responses?.length || 0;

    // Format for chart
    const distribution = Object.entries(valueCounts).map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / totalResponses) * 100 * 100) / 100,
    }));

    return {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type,
      responses: distribution,
    };
  } catch (error) {
    console.error("Error in getQuestionDistribution:", error);
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
      .single();

    if (assessmentError || !assessment) {
      console.error("Error fetching assessment:", assessmentError);
      return [];
    }

    const questions = assessment.questionnaires?.questions || [];
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
  } catch (error) {
    console.error("Error in getAllQuestionsDistribution:", error);
    return [];
  }
}

/**
 * Get analytics by department (if available)
 */
export async function getDepartmentAnalytics(
  assessmentId: string
): Promise<DepartmentAnalytics[]> {
  const supabase = await createClient();

  try {
    // Get assessment with target departments
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("id, target_departments")
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error("Error fetching assessment:", assessmentError);
      return [];
    }

    // For now, return empty array as we don't have department tracking in responses
    // This would require adding department_id to responses table or user profiles
    // TODO: Implement department tracking in future phase

    return [];
  } catch (error) {
    console.error("Error in getDepartmentAnalytics:", error);
    return [];
  }
}

/**
 * Get category name in Portuguese
 */
export function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    demands: "Demandas",
    control: "Controle",
    support: "Apoio",
    relationships: "Relacionamentos",
    role: "Papel",
    change: "Mudança",
  };
  return categoryNames[category] || category;
}

/**
 * Get risk level label in Portuguese
 */
export function getRiskLevelLabel(level: "low" | "medium" | "high"): string {
  const labels = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
  };
  return labels[level];
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(
  level: "low" | "medium" | "high"
): string {
  const colors = {
    low: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    high: "text-red-600 bg-red-50",
  };
  return colors[level];
}
