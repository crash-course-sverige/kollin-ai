import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes and their required roles
const protectedRoutes = [
  {
    path: "/dashboard",
    roles: ["user", "admin"],
  },
  {
    path: "/admin",
    roles: ["admin"],
  },
  {
    path: "/settings",
    roles: ["user", "admin"],
  },
];

// Define public routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/error", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Get the user's session token
  const token = await getToken({ req: request });
  
  // If no token and trying to access a protected route, redirect to login
  if (!token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Check if the route requires specific roles
  const protectedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));
  
  if (protectedRoute) {
    const userRole = token.role as string || "user";
    
    // If user doesn't have the required role, redirect to unauthorized page
    if (!protectedRoute.roles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 