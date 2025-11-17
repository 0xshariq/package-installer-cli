import { AppDataSource } from "@/lib/data-source";
import { User } from "@/lib/entity/User";

export async function GET() {
  const db = await AppDataSource.initialize();
  const repo = db.getRepository(User);

  const data = await repo.find();
  return Response.json(data);
}
