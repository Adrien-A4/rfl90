import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.replace(/^www\./, "");

  if (hostname === "admin.rff.giize.com" || hostname === "admin.rffgiize.com") {
    return NextResponse.rewrite(new URL("/admin", request.url));
  }

  if (
    hostname === "status.rff.giize.com" ||
    hostname === "status.rffgiize.com"
  ) {
    return NextResponse.rewrite(new URL("/status", request.url));
  }

  if (
    hostname === "fantasy.rff.giize.com" ||
    hostname === "fantasy.rffgiize.com"
  ) {
    return NextResponse.rewrite(new URL("/fantasy", request.url));
  }
  if (
    hostname === "leaderboard.rff.giize.com" ||
    hostname === "leaderboard.rffgiize.com"
  ) {
    return NextResponse.rewrite(new URL("/leaderboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
