import { AppDataSource } from "../utils/data-source";
import { User } from "../utils/entity/User";

export const getUsers = async (req, res) => {
  const db = await AppDataSource.initialize();
  const repo = db.getRepository(User);

  const data = await repo.find();
  res.json(data);
};
