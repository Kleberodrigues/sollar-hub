-- Migration: 20251214000001_update_plan_types.sql
-- Description: Update plan types from Free/Pro/Enterprise to Base/Intermediario/Avancado
-- Author: Claude
-- Date: 2025-12-14

-- ============================================
-- UP Migration
-- ============================================

-- Step 1: Rename enum values
-- PostgreSQL 10+ supports ALTER TYPE ... RENAME VALUE
ALTER TYPE plan_type RENAME VALUE 'free' TO 'base';
ALTER TYPE plan_type RENAME VALUE 'pro' TO 'intermediario';
ALTER TYPE plan_type RENAME VALUE 'enterprise' TO 'avancado';

-- Step 2: Update org_has_feature function for new plan structure
-- Focused on NR-1 and psychosocial risk features
CREATE OR REPLACE FUNCTION org_has_feature(org_id UUID, feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    org_plan plan_type;
BEGIN
    org_plan := get_organization_plan(org_id);

    -- If no plan found, deny access (no more free tier)
    IF org_plan IS NULL THEN
        RETURN false;
    END IF;

    -- Feature matrix based on new plan structure
    CASE feature
        -- Base features (available to all plans)
        WHEN 'ia_riscos_psicossociais' THEN
            RETURN true;
        WHEN 'dashboards_automaticos' THEN
            RETURN true;
        WHEN 'relatorio_tecnico' THEN
            RETURN true;
        WHEN 'plano_acao_prevencao' THEN
            RETURN true;
        WHEN 'analise_clusters' THEN
            RETURN true;
        WHEN 'pdf_export' THEN
            RETURN true;
        WHEN 'csv_export' THEN
            RETURN true;

        -- Intermediario features (intermediario + avancado)
        WHEN 'analise_comparativa_ciclos' THEN
            RETURN org_plan IN ('intermediario', 'avancado');
        WHEN 'priorizacao_impacto' THEN
            RETURN org_plan IN ('intermediario', 'avancado');
        WHEN 'dashboards_comparativos' THEN
            RETURN org_plan IN ('intermediario', 'avancado');
        WHEN 'relatorio_executivo' THEN
            RETURN org_plan IN ('intermediario', 'avancado');

        -- Avancado features (only avancado)
        WHEN 'analise_sistemica' THEN
            RETURN org_plan = 'avancado';
        WHEN 'correlacao_fatores' THEN
            RETURN org_plan = 'avancado';
        WHEN 'alertas_elevados' THEN
            RETURN org_plan = 'avancado';
        WHEN 'relatorio_gestao_riscos' THEN
            RETURN org_plan = 'avancado';
        WHEN 'api_access' THEN
            RETURN org_plan = 'avancado';
        WHEN 'xlsx_export' THEN
            RETURN org_plan = 'avancado';

        -- Legacy features mapping (for backwards compatibility)
        WHEN 'unlimited_assessments' THEN
            RETURN true; -- All plans have unlimited now
        WHEN 'custom_branding' THEN
            RETURN org_plan IN ('intermediario', 'avancado');
        WHEN 'priority_support' THEN
            RETURN org_plan IN ('intermediario', 'avancado');

        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Add helper function to check employee count limits
CREATE OR REPLACE FUNCTION get_plan_employee_limits(p_plan plan_type)
RETURNS TABLE(min_employees INT, max_employees INT) AS $$
BEGIN
    CASE p_plan
        WHEN 'base' THEN
            RETURN QUERY SELECT 50, 120;
        WHEN 'intermediario' THEN
            RETURN QUERY SELECT 121, 250;
        WHEN 'avancado' THEN
            RETURN QUERY SELECT 251, 400;
        ELSE
            RETURN QUERY SELECT 0, 0;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Add function to validate organization can use plan based on employee count
CREATE OR REPLACE FUNCTION validate_plan_for_employee_count(
    p_plan plan_type,
    p_employee_count INT
) RETURNS BOOLEAN AS $$
DECLARE
    limits RECORD;
BEGIN
    SELECT * INTO limits FROM get_plan_employee_limits(p_plan);
    RETURN p_employee_count >= limits.min_employees AND p_employee_count <= limits.max_employees;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 5: Update comments
COMMENT ON FUNCTION org_has_feature IS 'Checks if organization has access to a feature based on plan (Base/Intermediario/Avancado)';
COMMENT ON FUNCTION get_plan_employee_limits IS 'Returns min and max employee limits for each plan';
COMMENT ON FUNCTION validate_plan_for_employee_count IS 'Validates if employee count is within plan limits';

-- ============================================
-- DOWN Migration (for reference)
-- ============================================
-- ALTER TYPE plan_type RENAME VALUE 'base' TO 'free';
-- ALTER TYPE plan_type RENAME VALUE 'intermediario' TO 'pro';
-- ALTER TYPE plan_type RENAME VALUE 'avancado' TO 'enterprise';
-- DROP FUNCTION IF EXISTS validate_plan_for_employee_count;
-- DROP FUNCTION IF EXISTS get_plan_employee_limits;
