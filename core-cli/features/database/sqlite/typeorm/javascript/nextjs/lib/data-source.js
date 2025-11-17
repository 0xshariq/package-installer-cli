import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DATABASE_URL,
  synchronize: true,
  entities: [User]
});

export default { AppDataSource };
