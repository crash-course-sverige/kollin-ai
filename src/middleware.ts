import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Since authentication is removed, the middleware now just handles basic routing
export async function middleware(request: NextRequest) {
  // No authentication checks needed anymore
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