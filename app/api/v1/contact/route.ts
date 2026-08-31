import { NextRequest, NextResponse } from "next/server";
import {
  CONTACT_INBOX,
  deliverSubmission,
  validateSubmission,
  type ContactSubmission,
} from "@/lib/contact";

interface ContactRequestBody extends Partial<ContactSubmission> {
  /** Honeypot. Real users never see this field, so anything in it is a bot. */
  website?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ContactRequestBody;

  try {
    body = (await request.json()) as ContactRequestBody;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Silently accept honeypot hits: telling a bot it was caught just invites a retry.
  if (body.website) {
    return NextResponse.json({ message: "Thanks — we'll be in touch shortly." });
  }

  const validation = validateSubmission(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const delivery = await deliverSubmission(validation.value);

  if (!delivery.ok) {
    // Surface the real state rather than a false success, so the page can offer
    // the direct mailto fallback instead of swallowing the enquiry.
    const status = delivery.error === "not_configured" ? 503 : 502;
    return NextResponse.json(
      {
        error: `We couldn't send that just now. Please email us directly at ${CONTACT_INBOX}.`,
        fallbackEmail: CONTACT_INBOX,
      },
      { status },
    );
  }

  return NextResponse.json({ message: "Thanks — we'll be in touch shortly." });
}
