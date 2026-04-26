import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";

  if (accept.includes("text/markdown") && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/api/home-md", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
