export type UserRole = "Broker" | "Carrier" | "Admin";

export interface Session {
  email: string;
  organizationName: string;
  role: UserRole;
}

export interface UserAccount extends Session {
  password: string;
}

export const SESSION_COOKIE_NAME = "stoa_session";

export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSession(value: string): Session | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Session;
    const validRoles: UserRole[] = ["Broker", "Carrier", "Admin"];
    if (!parsed.email || !parsed.organizationName || !validRoles.includes(parsed.role)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function roleHomePath(role: UserRole): string {
  if (role === "Broker") return "/deals";
  if (role === "Carrier") return "/marketplace";
  return "/choose-role";
}
