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

const SEED_ACCOUNTS: UserAccount[] = [
  { email: "alexandra.reyes@meridiancapital.com", password: "stoa-demo", organizationName: "Meridian Capital Partners", role: "Broker" },
  { email: "daniel.osei@northgateadvisors.com", password: "stoa-demo", organizationName: "Northgate M&A Advisors", role: "Broker" },
  { email: "priya.narayan@atlas-assurance.com", password: "stoa-demo", organizationName: "Atlas Assurance Group", role: "Carrier" },
  { email: "marcus.lindqvist@beaconhillre.com", password: "stoa-demo", organizationName: "Beacon Hill Specialty Re", role: "Carrier" },
  { email: "morgan.chen@stoa.com", password: "stoa-demo", organizationName: "Stoa Platform Team", role: "Admin" },
];

class AccountDirectory {
  private accounts: Map<string, UserAccount> = new Map();

  constructor() {
    for (const account of SEED_ACCOUNTS) {
      this.accounts.set(account.email.toLowerCase(), account);
    }
  }

  find(email: string): UserAccount | undefined {
    return this.accounts.get(email.toLowerCase());
  }

  register(account: UserAccount): void {
    this.accounts.set(account.email.toLowerCase(), account);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __stoaAccountDirectory: AccountDirectory | undefined;
}

export function getAccountDirectory(): AccountDirectory {
  if (!global.__stoaAccountDirectory) {
    global.__stoaAccountDirectory = new AccountDirectory();
  }
  return global.__stoaAccountDirectory;
}

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
