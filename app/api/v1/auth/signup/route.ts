import { NextRequest, NextResponse } from "next/server";
import { encodeSession, getAccountDirectory, SESSION_COOKIE_NAME, type Session, type UserRole } from "@/lib/session";

interface SignupRequestBody {
  organizationName: string;
  email: string;
  password: string;
  role: string;
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function isValidRole(value: string): value is UserRole {
  return value === "Broker" || value === "Carrier";
}

export async function POST(request: NextRequest): Promise<NextResponse<{ session: Session } | { error: string }>> {
  const body = (await request.json()) as Partial<SignupRequestBody>;

  if (!body.organizationName || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Organization, email, password, and role are all required." }, { status: 400 });
  }

  if (!isValidRole(body.role)) {
    return NextResponse.json({ error: `Unsupported role: ${body.role}` }, { status: 400 });
  }

  const directory = getAccountDirectory();

  if (directory.find(body.email)) {
    return NextResponse.json({ error: "An account with that email already exists. Try signing in instead." }, { status: 409 });
  }

  directory.register({
    email: body.email,
    password: body.password,
    organizationName: body.organizationName,
    role: body.role,
  });

  const session: Session = { email: body.email, organizationName: body.organizationName, role: body.role };
  const response = NextResponse.json({ session }, { status: 201 });

  response.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
