/* eslint-disable no-console */
/**
 * Auth Callback Route
 *
 * Handles email confirmation and OAuth callbacks from Supabase.
 * Exchanges the auth code for a session and redirects to dashboard.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Get the code and type from URL params
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Handle errors from Supabase
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("[Auth Callback] Error:", error, errorDescription);
    // Redirect to login with error message
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    );

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[Auth Callback] Exchange error:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Log the successful authentication
    console.log("[Auth Callback] Successfully authenticated user, type:", type);

    // Redirect to the intended destination
    // Use 303 See Other to ensure the browser uses GET for the redirect
    return NextResponse.redirect(`${origin}${next}`, {
      status: 303,
    });
  }

  // If no code, redirect to login
  console.warn("[Auth Callback] No code provided, redirecting to login");
  return NextResponse.redirect(`${origin}/login`);
}
