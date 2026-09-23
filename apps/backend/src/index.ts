import { Elysia } from "elysia";
import { createClient } from "redis";
import { CancelOrderSchema, OrderSchema } from "./types";

const redis = createClient();
await redis.connect();
console.log("redis connected");

async function toEngine(type: string, data: unknown) {
  const clientId = crypto.randomUUID();
  const waiter = redis.duplicate();
  await waiter.connect();

  try {
    const wait = waiter.brPop(`response:${clientId}`, 5);
    await redis.lPush("order", JSON.stringify({ clientId, type, data }));
    const res = await wait;
    if (!res) throw new Error("engine timeout");
    return JSON.parse(res.element);
  } finally {
    await waiter.quit();
  }
}

const app = new Elysia()
  .onBeforeHandle(({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "GET,POST,DELETE,OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
  })
  .options("/*", () => "")
  .get("/health", () => "ok")
  .get("/depth", async () => toEngine("GET_DEPTH", {}))
  .post("/order", async ({ body }) => toEngine("CREATE_ORDER", body), {
    body: OrderSchema,
  })
  .delete("/order", async ({ body }) => toEngine("CANCEL_ORDER", body), {
    body: CancelOrderSchema,
  })
  .listen(3000);

console.log(`API on :${app.server?.port}`);
