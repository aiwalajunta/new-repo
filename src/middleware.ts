import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET ?? "aditya-textile-nextauth-secret-2024-fallback";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request, secret: SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = token.role as string | undefined;
    if (role !== "owner" && role !== "staff") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
