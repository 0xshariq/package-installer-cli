import { prisma } from "../utils/prisma";

export const getUsers = async (req, res) => {
  const data = await prisma.user.findMany();
  res.json(data);
};
