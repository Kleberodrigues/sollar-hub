/**
 * Seed Test Users for E2E Testing
 *
 * Este script cria usuários de teste no Supabase para testes E2E.
 * Executar antes de rodar testes E2E autenticados.
 *
 * Uso:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Requer:
 *   - SUPABASE_SERVICE_ROLE_KEY configurada no .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL configurada no .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env.local file
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test users configuration (matching actual schema)
const TEST_USERS = [
  {
    email: "test@sollar.com.br",
    password: "TestPassword123!",
    role: "member" as const,
    name: "Test User",
  },
  {
    email: "admin@sollar.com.br",
    password: "AdminPassword123!",
    role: "admin" as const,
    name: "Test Admin",
  },
  {
    email: "manager@sollar.com.br",
    password: "ManagerPassword123!",
    role: "manager" as const,
    name: "Test Manager",
  },
];

// Test organization (matching actual schema)
const TEST_ORG = {
  name: "Test Organization",
  size: "medium",
  industry: "technology",
};

async function createTestOrganization() {
  console.log("Creating test organization...");

  // Check if org exists by name
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", TEST_ORG.name)
    .single();

  if (existingOrg) {
    console.log("   Organization already exists:", existingOrg.id);
    return existingOrg.id;
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      name: TEST_ORG.name,
      size: TEST_ORG.size,
      industry: TEST_ORG.industry,
    })
    .select()
    .single();

  if (error) {
    console.error("   Failed to create organization:", error.message);
    throw error;
  }

  console.log("   Organization created:", org.id);
  return org.id;
}

async function createTestUser(
  orgId: string,
  email: string,
  password: string,
  role: "admin" | "manager" | "member" | "viewer",
  name: string
) {
  console.log(`Creating user: ${email}...`);

  // Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  if (existingUser) {
    console.log(`   User already exists: ${existingUser.id}`);

    // Ensure user profile exists
    await ensureUserProfile(existingUser.id, orgId, role, name);
    return existingUser.id;
  }

  // Create user with Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name,
      },
    });

  if (authError) {
    console.error(`   Failed to create auth user:`, authError.message);
    throw authError;
  }

  const userId = authData.user.id;
  console.log(`   Auth user created: ${userId}`);

  // Create user profile
  await ensureUserProfile(userId, orgId, role, name);

  return userId;
}

async function ensureUserProfile(
  userId: string,
  orgId: string,
  role: "admin" | "manager" | "member" | "viewer",
  name: string
) {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    console.log(`   Profile already exists`);
    // Update role and org if needed
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        organization_id: orgId,
        role,
      })
      .eq("id", userId);

    if (updateError) {
      console.error(`   Failed to update profile:`, updateError.message);
    } else {
      console.log(`   Profile updated with role: ${role}`);
    }
    return;
  }

  // Create user profile
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: userId,
    full_name: name,
    role,
    organization_id: orgId,
  });

  if (profileError) {
    console.error(`   Failed to create profile:`, profileError.message);
    // Don't throw - profile might already exist via trigger
  } else {
    console.log(`   Profile created with role: ${role}`);
  }
}

async function main() {
  console.log("\nSeeding test users for E2E testing...\n");

  try {
    // Create test organization
    const orgId = await createTestOrganization();

    // Create test users
    for (const user of TEST_USERS) {
      await createTestUser(orgId, user.email, user.password, user.role, user.name);
    }

    console.log("\nTest users seeded successfully!\n");
    console.log("You can now run E2E tests with authentication.");
    console.log("\nTest credentials:");
    console.log("-".repeat(60));
    for (const user of TEST_USERS) {
      console.log(`${user.role.padEnd(10)} ${user.email} / ${user.password}`);
    }
    console.log("-".repeat(60));
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  }
}

main();
