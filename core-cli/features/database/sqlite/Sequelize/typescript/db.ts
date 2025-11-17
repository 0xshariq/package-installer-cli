import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DATABASE_URL
});

export const User = sequelize.define("User", {
  name: { type: DataTypes.STRING }
});
