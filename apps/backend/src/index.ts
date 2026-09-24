import { Elysia } from "elysia";
import { createClient } from "redis";
import { z } from "zod";
import { connectDb, loginUser, registerUser } from "./db";
import { AuthSchema, CancelOrderSchema, OrderSchema, RampSchema } from "./types";

const redis = createClient();
await redis.connect();
console.log("redis connected");
await connectDb();

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
  .get("/markets", async () => toEngine("GET_MARKETS", {}))
  .post(
    "/auth/register",
    async ({ body, set }) => {
      try {
        const res = await registerUser(body.userId, body.password);
        await toEngine("INIT_USER", { userId: body.userId });
        return res;
      } catch (e) {
        set.status = 400;
        return { error: String(e instanceof Error ? e.message : e) };
      }
    },
    { body: AuthSchema }
  )
  .post(
    "/auth/login",
    async ({ body, set }) => {
      try {
        return await loginUser(body.userId, body.password);
      } catch (e) {
        set.status = 401;
        return { error: String(e instanceof Error ? e.message : e) };
      }
    },
    { body: AuthSchema }
  )
  .post("/deposit", async ({ body }) => toEngine("ON_RAMP", body), { body: RampSchema })
  .post("/withdraw", async ({ body }) => toEngine("OFF_RAMP", body), { body: RampSchema })
  .get("/depth", async ({ query }) => toEngine("GET_DEPTH", query), {
    query: z.object({ symbol: z.string() }),
  })
  .get("/trades", async ({ query }) => toEngine("GET_TRADES", query), {
    query: z.object({ symbol: z.string() }),
  })
  .get("/orders/open", async ({ query }) => toEngine("GET_OPEN_ORDERS", query), {
    query: z.object({ userId: z.string() }),
  })
  .get("/orders/fills", async ({ query }) => toEngine("GET_MY_FILLS", query), {
    query: z.object({ userId: z.string() }),
  })
  .get("/balance", async ({ query }) => toEngine("GET_BALANCE", query), {
    query: z.object({ userId: z.string() }),
  })
  .post("/order", async ({ body }) => toEngine("CREATE_ORDER", body), { body: OrderSchema })
  .delete("/order", async ({ body }) => toEngine("CANCEL_ORDER", body), {
    body: CancelOrderSchema,
  })
  .listen(3000);

console.log(`API on :${app.server?.port}`);
