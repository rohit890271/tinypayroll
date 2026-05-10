type AppRedirectInput = {
  isAuthenticated: boolean;
  hasBusiness: boolean;
  pathname: string;
};

export function getAppRedirect({ isAuthenticated, hasBusiness, pathname }: AppRedirectInput): string | null {
  const isProtectedRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname.startsWith("/onboarding/");

  if (isProtectedRoute && !isAuthenticated) {
    return "/login";
  }

  if ((pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && isAuthenticated && !hasBusiness) {
    return "/onboarding/business";
  }

  return null;
}