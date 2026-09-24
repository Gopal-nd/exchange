type Wallet = { available: number; locked: number };

export class Balances {
  private users = new Map<string, Record<string, Wallet>>();

  private ensure(userId: string) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        INR: { available: 100_000, locked: 0 },
        TATA: { available: 1_000, locked: 0 },
      });
    }
  }

  get(userId: string) {
    this.ensure(userId);
    return this.users.get(userId)!;
  }

  lock(userId: string, asset: string, amount: number) {
    const w = this.get(userId)[asset];
    if (!w || w.available < amount) throw new Error(`insufficient ${asset}`);
    w.available -= amount;
    w.locked += amount;
  }

  unlock(userId: string, asset: string, amount: number) {
    const w = this.get(userId)[asset];
    const n = Math.min(amount, w.locked);
    w.locked -= n;
    w.available += n;
  }

  spendLocked(userId: string, fromAsset: string, amount: number) {
    const w = this.get(userId)[fromAsset];
    w.locked -= amount;
  }

  credit(userId: string, asset: string, amount: number) {
    this.get(userId)[asset].available += amount;
  }

  toJSON() {
    return Array.from(this.users.entries());
  }

  load(entries: [string, Record<string, Wallet>][]) {
    this.users = new Map(entries);
  }
}
