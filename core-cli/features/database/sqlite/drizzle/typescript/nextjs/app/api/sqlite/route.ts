import { db } from "@/lib/sqlite";
import { users } from "@/lib/schema";

export async function GET() {
  const data = db.select().from(users).all();
  return Response.json(data);
}
