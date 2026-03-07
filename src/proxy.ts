import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth and webhook routes without session check
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks")
  ) {
    return NextResponse.next();
  }

  // Protected API routes — check for better-auth session cookie
  if (
    pathname.startsWith("/api/billing") ||
    pathname.startsWith("/api/usage")
  ) {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
