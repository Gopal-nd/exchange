type Wallet = { available: number; locked: number };

export class Balances {
  private users = new Map<string, Record<string, Wallet>>();

  private ensure(userId: string) {
    if (!this.users.has(userId)) this.users.set(userId, {});
  }

  /** New registered user starts at zero — use on-ramp to fund */
  initUser(userId: string) {
    this.users.set(userId, {
      INR: { available: 0, locked: 0 },
      TATA: { available: 0, locked: 0 },
      ICICI: { available: 0, locked: 0 },
    });
  }

  private wallet(userId: string, asset: string): Wallet {
    this.ensure(userId);
    const u = this.users.get(userId)!;
    if (!u[asset]) u[asset] = { available: 0, locked: 0 };
    return u[asset];
  }

  get(userId: string) {
    this.ensure(userId);
    this.wallet(userId, "INR");
    this.wallet(userId, "TATA");
    this.wallet(userId, "ICICI");
    return this.users.get(userId)!;
  }

  lock(userId: string, asset: string, amount: number) {
    const w = this.wallet(userId, asset);
    if (w.available < amount) throw new Error(`insufficient ${asset}`);
    w.available -= amount;
    w.locked += amount;
  }

  unlock(userId: string, asset: string, amount: number) {
    const w = this.wallet(userId, asset);
    const n = Math.min(amount, w.locked);
    w.locked -= n;
    w.available += n;
  }

  spendLocked(userId: string, fromAsset: string, amount: number) {
    this.wallet(userId, fromAsset).locked -= amount;
  }

  credit(userId: string, asset: string, amount: number) {
    if (amount <= 0) throw new Error("amount must be > 0");
    this.wallet(userId, asset).available += amount;
  }

  /** Off-ramp: withdraw from available */
  debit(userId: string, asset: string, amount: number) {
    if (amount <= 0) throw new Error("amount must be > 0");
    const w = this.wallet(userId, asset);
    if (w.available < amount) throw new Error(`insufficient ${asset}`);
    w.available -= amount;
  }

  toJSON() {
    return Array.from(this.users.entries());
  }

  load(entries: [string, Record<string, Wallet>][]) {
    this.users = new Map(entries ?? []);
  }
}
