export const BASE_URL = "wss://ws.backpack.exchange/";

export interface Ticker {
  firstPrice: string;
  high: string;
  lastPrice: string;
  low: string;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
  symbol: string;
  trades: string;
  volume: string;
}

type CallbackEntry<T = any> = {
  id: string;
  callback: (data: T) => void;
};

export class SignalingManager {
  private ws: WebSocket;
  private bufferedMessages: any[] = [];
  private id = 1;
  private initialized = false;
  private addedTypes: string[] = []

  private static instance: SignalingManager | null = null;

  private callbacks: Record<string, CallbackEntry[]> = {};

  private constructor(url: string = BASE_URL) {
    this.ws = new WebSocket(url);
    this.init();
  }

  public static getInstance(): SignalingManager {
    if (!SignalingManager.instance) {
      SignalingManager.instance = new SignalingManager();
    }
    return SignalingManager.instance;
  }

  private init() {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach(msg =>
        this.ws.send(JSON.stringify(msg))
      );
      this.bufferedMessages = [];
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const type = message?.data?.e;
      if (!type || !this.callbacks[type]) return;
      // console.log(message)

      this.callbacks[type].forEach(({ callback }) => {
        if (type === "ticker") {
          const ticker: Partial<Ticker> = {
            lastPrice: message.data.c,
            high: message.data.h,
            low: message.data.l,
            volume: message.data.v,
            quoteVolume: message.data.V,
            symbol: message.data.s,
          };
          callback(ticker);
        }
         if (type === "trade") {
          // console.log(message?.data?.p)
          callback(message?.data);
        }

        if (type === "depth") {
          callback({
            bids: message.data.b,
            asks: message.data.a,
          });
        }
      });
    };
  }
  // {"method":"SUBSCRIBE","params":["trade.SOL_USDC"],"id":1}

  sendMessage(msg: any) {
    const payload = { ...msg, id: this.id++ };

    if (!this.initialized) {
      this.bufferedMessages.push(payload);
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }

  registerCallback(type: string, callback: Function, id: string) {
    this.callbacks[type] ||= [];
    this.addedTypes.push(type)
    // @ts-ignore
    this.callbacks[type].push({ id, callback });
    console.log(this.callbacks)
  }

  deRegisterCallback(type: string, id: string) {
    const index = this.addedTypes.indexOf(type);
    if (index !== -1) {
      this.addedTypes.splice(index, 1);
    }
    if (!this.callbacks[type]) return;
    this.callbacks[type] = this.callbacks[type].filter(cb => cb.id !== id);
  }
}
