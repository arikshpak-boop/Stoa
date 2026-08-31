import { redis, isRedisConfigured } from "./redis";
import type { UserAccount } from "./session";

const SEED_ACCOUNTS: UserAccount[] = [
  { email: "alexandra.reyes@meridiancapital.com", password: "stoa-demo", organizationName: "Meridian Capital Partners", role: "Broker" },
  { email: "daniel.osei@northgateadvisors.com", password: "stoa-demo", organizationName: "Northgate M&A Advisors", role: "Broker" },
  { email: "priya.narayan@euclidtransactional.com", password: "stoa-demo", organizationName: "Euclid Transactional", role: "Carrier" },
  { email: "marcus.lindqvist@bhspecialty.com", password: "stoa-demo", organizationName: "Berkshire Hathaway (BHSI)", role: "Carrier" },
  { email: "morgan.chen@stoa.com", password: "stoa-demo", organizationName: "Stoa Platform Team", role: "Admin" },
];

interface AccountDirectory {
  find(email: string): Promise<UserAccount | undefined>;
  register(account: UserAccount): Promise<void>;
}

/** In-memory fallback for local dev with no Redis env vars configured. */
class InMemoryAccountDirectory implements AccountDirectory {
  private accounts: Map<string, UserAccount> = new Map();

  constructor() {
    for (const account of SEED_ACCOUNTS) {
      this.accounts.set(account.email.toLowerCase(), account);
    }
  }

  async find(email: string): Promise<UserAccount | undefined> {
    return this.accounts.get(email.toLowerCase());
  }

  async register(account: UserAccount): Promise<void> {
    this.accounts.set(account.email.toLowerCase(), account);
  }
}

const ACCOUNTS_HASH_KEY = "stoa:accounts";

/**
 * Persists signed-up accounts to Redis so a broker/carrier who signs up can
 * still log back in later, regardless of which serverless instance handles
 * that later request. Seed accounts are inserted once via HSETNX so this is
 * safe to call from every cold start without clobbering later changes.
 */
class RedisAccountDirectory implements AccountDirectory {
  private seeded = false;

  private async ensureSeeded(): Promise<void> {
    if (this.seeded || !redis) return;
    for (const account of SEED_ACCOUNTS) {
      await redis.hsetnx(ACCOUNTS_HASH_KEY, account.email.toLowerCase(), account);
    }
    this.seeded = true;
  }

  async find(email: string): Promise<UserAccount | undefined> {
    await this.ensureSeeded();
    const account = await redis!.hget<UserAccount>(ACCOUNTS_HASH_KEY, email.toLowerCase());
    return account ?? undefined;
  }

  async register(account: UserAccount): Promise<void> {
    await this.ensureSeeded();
    await redis!.hset(ACCOUNTS_HASH_KEY, { [account.email.toLowerCase()]: account });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __stoaAccountDirectory: AccountDirectory | undefined;
}

export function getAccountDirectory(): AccountDirectory {
  if (!global.__stoaAccountDirectory) {
    global.__stoaAccountDirectory = isRedisConfigured ? new RedisAccountDirectory() : new InMemoryAccountDirectory();
  }
  return global.__stoaAccountDirectory;
}
