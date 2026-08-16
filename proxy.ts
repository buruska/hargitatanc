import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(ro|en)(?=\/|$)/);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", match?.[1] ?? "hu");

  if (!match) return NextResponse.next({ request: { headers: requestHeaders } });

  const url = request.nextUrl.clone();
  url.pathname = request.nextUrl.pathname.replace(/^\/(ro|en)(?=\/|$)/, "") || "/";
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
