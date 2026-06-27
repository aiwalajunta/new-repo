import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.NEXTAUTH_SECRET ?? "aditya-textile-nextauth-secret-2024-fallback";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // NextAuth v5 (Auth.js) uses __Secure-authjs.session-token in production
    // and authjs.session-token in development
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token")?.value ??
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("next-auth.session-token")?.value ??
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Decode JWT payload without verification (role check only, server verifies on API calls)
    try {
      const payload = JSON.parse(
        Buffer.from(sessionToken.split(".")[1], "base64url").toString()
      );
      const role = payload?.role as string | undefined;
      if (role !== "owner" && role !== "staff") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
