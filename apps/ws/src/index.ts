import { createClient } from "redis";

const clients = new Set<{ send: (data: string) => void }>();

const sub = createClient();
await sub.connect();

const server = Bun.serve({
  port: 3002,
  fetch(req, server) {
    if (server.upgrade(req)) return undefined;
    return new Response("connect via ws");
  },
  websocket: {
    open(ws) {
      clients.add(ws);
      ws.send(JSON.stringify({ type: "connected" }));
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {},
  },
});

await sub.subscribe("ws", (msg) => {
  for (const ws of clients) ws.send(msg);
});

console.log(`ws on :${server.port}`);
