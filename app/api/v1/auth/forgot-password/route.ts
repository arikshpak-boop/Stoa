import { NextRequest, NextResponse } from "next/server";

interface ForgotPasswordRequestBody {
  email: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  const body = (await request.json()) as Partial<ForgotPasswordRequestBody>;

  if (!body.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Intentionally returns the same confirmation regardless of whether the
  // email is registered, so the response can't be used to enumerate accounts.
  return NextResponse.json({ message: "Reset password was sent to your email address" });
}
