import { NextRequest, NextResponse } from "next/server";
import { decodeSession, roleHomePath, SESSION_COOKIE_NAME } from "@/lib/session";

const BROKER_PREFIX = "/deals";
const CARRIER_PREFIX = "/marketplace";
const CHOOSE_ROLE_PATH = "/choose-role";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = cookieValue ? decodeSession(cookieValue) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admins can freely browse both the broker and carrier portals; they pick
  // which one to enter from /choose-role rather than being locked to one.
  if (session.role === "Admin") {
    return NextResponse.next();
  }

  if (pathname.startsWith(CHOOSE_ROLE_PATH)) {
    return NextResponse.redirect(new URL(roleHomePath(session.role), request.url));
  }

  const requiresBroker = pathname.startsWith(BROKER_PREFIX);
  const requiresCarrier = pathname.startsWith(CARRIER_PREFIX);

  if ((requiresBroker && session.role !== "Broker") || (requiresCarrier && session.role !== "Carrier")) {
    return NextResponse.redirect(new URL(roleHomePath(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/deals/:path*", "/marketplace/:path*", "/choose-role"],
};
