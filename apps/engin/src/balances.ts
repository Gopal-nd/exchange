type Wallet = { available: number; locked: number };

export class Balances {
  private users = new Map<string, Record<string, Wallet>>();// userId :{'INR':{available:100000,locked:0},'TATA':{available:1000,locked:0}}

  /** Demo: every new user gets starting funds */
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

  /** Move locked → spent (gone), credit other asset to available */
  spendLocked(userId: string, fromAsset: string, amount: number) {
    const w = this.get(userId)[fromAsset];
    w.locked -= amount;
  }

  credit(userId: string, asset: string, amount: number) {
    this.get(userId)[asset].available += amount;
  }
}
