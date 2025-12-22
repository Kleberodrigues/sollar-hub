-- ============================================================================
-- Migration: 20251222000001_add_role_enum_values.sql
-- Description: Add new enum values to user_role type
-- Note: This must run in a separate transaction before data migration
-- ============================================================================

-- Add 'responsavel_empresa' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'responsavel_empresa';

-- Add 'membro' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'membro';

SELECT 'New enum values added: responsavel_empresa, membro' AS status;
