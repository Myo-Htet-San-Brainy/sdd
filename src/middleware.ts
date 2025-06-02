import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Check if the current path starts with '/Main' (case-sensitive)
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/main");

  // For protected routes: redirect to sign-in if no token
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", "/main");
    return NextResponse.redirect(signInUrl);
  }

  // For public routes: redirect to /main if authenticated
  if (!isProtectedRoute && token) {
    return NextResponse.redirect(new URL("/main", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except root, API routes, and static files
    "/((?!api|_next|public|.*\\.\\w+$|$).*)",
  ],
};
