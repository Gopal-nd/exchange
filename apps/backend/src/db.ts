import { MongoClient, type Collection, type Db } from "mongodb";

const URI = process.env.MONGO_URL ?? "mongodb://localhost:27017";
const DB_NAME = "Exchange";

export type UserDoc = {
  userId: string;
  password: string;
  createdAt: Date;
};

let client: MongoClient;
let db: Db;
let users: Collection<UserDoc>;

export async function connectDb() {
  client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  users = db.collection<UserDoc>("users");
  await users.createIndex({ userId: 1 }, { unique: true });
  console.log(`mongo connected → ${DB_NAME}`);
}

export async function registerUser(userId: string, password: string) {
  if (!userId || !password) throw new Error("userId and password required");
  const existing = await users.findOne({ userId });
  if (existing) throw new Error("user already exists");
  await users.insertOne({ userId, password, createdAt: new Date() });
  return { userId };
}

export async function loginUser(userId: string, password: string) {
  const saved = await users.findOne({ userId });
  if (!saved || saved.password !== password) throw new Error("invalid credentials");
  return { userId };
}
