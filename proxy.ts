import { NextResponse } from "next/server";

export function proxy(req: Request) {
  const host = req.headers.get("host");

  if (host === "admin.rff.giize.com") {
    return NextResponse.rewrite(new URL("/admin", req.url));
  }

  if (host === "status.rff.giize.com") {
    return NextResponse.rewrite(new URL("/status", req.url));
  }

  if (host === "fantasy.rff.giize.com") {
    return NextResponse.rewrite(new URL("/fantasy", req.url));
  }

  return NextResponse.next();
}
