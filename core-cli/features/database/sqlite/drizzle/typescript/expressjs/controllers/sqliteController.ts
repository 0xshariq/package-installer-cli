import { db } from "../utils/sqlite";
import { users } from "../utils/schema";

export const getUsers = (req, res) => {
  const data = db.select().from(users).all();
  res.json(data);
};
