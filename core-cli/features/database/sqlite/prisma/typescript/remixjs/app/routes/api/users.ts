import type { LoaderFunction } from "@remix-run/node";
import { prisma } from "~/utils/prisma";

export const loader: LoaderFunction = async () => {
  const data = await prisma.user.findMany();
  return Response.json(data);
};
