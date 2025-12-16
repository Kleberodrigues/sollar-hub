-- ============================================================================
-- Migration 010: Enable Row Level Security on all tables
-- Created: 2024-12-02
-- Purpose: Enable RLS for multi-tenant data isolation
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (security best practice)
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.departments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.department_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires FORCE ROW LEVEL SECURITY;
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.responses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores FORCE ROW LEVEL SECURITY;

-- Add comments documenting RLS enablement
COMMENT ON TABLE public.organizations IS
  'Organizations table - RLS enabled for multi-tenant isolation';

COMMENT ON TABLE public.user_profiles IS
  'User profiles table - RLS enabled for org-scoped access';

COMMENT ON TABLE public.departments IS
  'Departments table - RLS enabled for org-scoped access';

COMMENT ON TABLE public.department_members IS
  'Department members table - RLS enabled for org-scoped access';

COMMENT ON TABLE public.questionnaires IS
  'Questionnaires table - RLS enabled for org-scoped access';

COMMENT ON TABLE public.questions IS
  'Questions table - RLS enabled through questionnaire ownership';

COMMENT ON TABLE public.assessments IS
  'Assessments table - RLS enabled for org-scoped access';

COMMENT ON TABLE public.responses IS
  'Responses table - RLS enabled with anonymous access for submissions';

COMMENT ON TABLE public.risk_scores IS
  'Risk scores table - RLS enabled for org-scoped access';
