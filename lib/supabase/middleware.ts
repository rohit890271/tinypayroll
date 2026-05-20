import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options as CookieOptions);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/onboarding");

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const { data: business } = await supabase
      .from("businesses")
      .select("subscription_status")
      .eq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (business && business.subscription_status !== "active" && business.subscription_status !== "trialing") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/pricing";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}