import { NextRequest, NextResponse } from "next/server";
import { encodeSession, getAccountDirectory, SESSION_COOKIE_NAME, type Session } from "@/lib/session";

interface LoginRequestBody {
  email: string;
  password: string;
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest): Promise<NextResponse<{ session: Session } | { error: string }>> {
  const body = (await request.json()) as Partial<LoginRequestBody>;

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const account = getAccountDirectory().find(body.email);

  if (!account || account.password !== body.password) {
    return NextResponse.json({ error: "We couldn't find an account with those credentials." }, { status: 401 });
  }

  const session: Session = { email: account.email, organizationName: account.organizationName, role: account.role };
  const response = NextResponse.json({ session });

  response.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
