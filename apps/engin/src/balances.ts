type Wallet = { available: number; locked: number };

export class Balances {
  private users = new Map<string, Record<string, Wallet>>();

  private ensure(userId: string) {
    if (!this.users.has(userId)) this.users.set(userId, {});
  }

  private wallet(userId: string, asset: string): Wallet {
    this.ensure(userId);
    const u = this.users.get(userId)!;
    if (!u[asset]) {
      // demo starting funds
      u[asset] = { available: asset === "INR" ? 100_000 : 1_000, locked: 0 };
    }
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
    this.wallet(userId, asset).available += amount;
  }

  toJSON() {
    return Array.from(this.users.entries());
  }

  load(entries: [string, Record<string, Wallet>][]) {
    this.users = new Map(entries);
  }
}
