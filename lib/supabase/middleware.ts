import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rotas públicas que não exigem autenticação
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/responder",
    "/privacidade",
    "/_next",
    "/favicon.ico",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Se usuário está autenticado E tentando acessar login/register
  // → Redirecionar para dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Se usuário NÃO está autenticado E tentando acessar rota protegida
  // → Redirecionar para login
  if (!user && !isPublicRoute && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Se usuário está autenticado, verificar role-based access
  if (user && pathname.startsWith("/dashboard")) {
    // Rotas que exigem role responsavel_empresa (admin da empresa cliente)
    const responsavelRoutes = ["/dashboard/users", "/dashboard/settings"];

    if (responsavelRoutes.some((route) => pathname.startsWith(route))) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from("user_profiles")
        .select("role, is_super_admin")
        .eq("id", user.id)
        .single();

      // Se não é responsavel_empresa nem super_admin, redirecionar para dashboard home
      if (profile?.role !== "responsavel_empresa" && !profile?.is_super_admin) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  // Rotas do Super Admin (/admin/*) - apenas super_admin pode acessar
  if (user && pathname.startsWith("/admin")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("user_profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    // Se não é super_admin, redirecionar para dashboard home
    if (!profile?.is_super_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Se usuário NÃO está autenticado E tentando acessar rota /admin
  // → Redirecionar para login
  if (!user && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
