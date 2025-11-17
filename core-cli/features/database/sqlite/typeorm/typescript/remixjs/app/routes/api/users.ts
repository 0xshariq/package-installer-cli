import type { LoaderFunction } from "@remix-run/node";
import { AppDataSource } from "~/utils/data-source";
import { User } from "~/utils/entity/User";

export const loader: LoaderFunction = async () => {
  const db = await AppDataSource.initialize();
  const repo = db.getRepository(User);

  const data = await repo.find();
  return Response.json(data);
};
