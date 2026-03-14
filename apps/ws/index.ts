import { WebSocketServer } from "ws";
import { UserManager } from "./src/UserManager";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});

