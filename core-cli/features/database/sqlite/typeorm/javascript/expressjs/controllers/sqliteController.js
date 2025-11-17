import { AppDataSource } from "../utils/data-source";

export async function getUsers(req, res) {
  const db = await AppDataSource.initialize();
  const repo = db.getRepository("User");

  const data = await repo.find();
  res.json(data);
}
