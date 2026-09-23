import { Elysia } from "elysia";
import {createClient} from 'redis'
import { CancelOrderSchema, OrderSchema } from "./types";

const redis = createClient()
redis.connect().then(()=> console.log('redis connected')).catch((err)=> console.error('redis connection error', err))

async function toEngine(type:string, data:unknown){
  const clientId = crypto.randomUUID()

  // send request to engine
  await redis.lPush('order',JSON.stringify({clientId,type,data}))

  // receive response from engine
  const res = await redis.brPop(`response:${clientId}`, 5);

  if (!res) throw new Error("engine timeout");  // if no response, throw an error in case of timeout

  return JSON.parse(res.element);
}
const app = new Elysia()

app.get('/depth', async () => toEngine("GET_DEPTH", {}));

app.post('/order', async ({ body }) => toEngine("CREATE_ORDER", body), {
  body: OrderSchema,
})

app.delete('/order', async ({ body }) => toEngine("CANCEL_ORDER", body), {
  body: CancelOrderSchema,
})

app.get('/health', () => "ok");

app.listen(3000)
console.log(`API on :${app.server?.port}`)
