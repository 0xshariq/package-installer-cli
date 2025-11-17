import type { LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/sqlite";
import { users } from "~/utils/schema";

export const loader: LoaderFunction = async () => {
  const data = db.select().from(users).all();
  return Response.json(data);
};
