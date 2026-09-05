import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    const res = await updateSession(request);
    const debug = res as NextResponse;
    debug.headers.set(
      "x-dbg-url",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "FALTANDO",
    );
    debug.headers.set(
      "x-dbg-anon",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "ok" : "FALTANDO",
    );
    debug.headers.set(
      "x-dbg-svc",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "FALTANDO",
    );
    debug.headers.set(
      "x-dbg-stripe",
      process.env.STRIPE_SECRET_KEY ? "ok" : "FALTANDO",
    );
    return debug;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack =
      err instanceof Error && err.stack
        ? err.stack.split("\n").slice(0, 8).join("\n")
        : "";
    return new NextResponse(`MIDDLEWARE ERROR:\n${msg}\n${stack}`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};