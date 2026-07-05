import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE_NAME, type Session } from "./session";

export function getServerSession(): Session | null {
  const cookieValue = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!cookieValue) return null;
  return decodeSession(cookieValue);
}
