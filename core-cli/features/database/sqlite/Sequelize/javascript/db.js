import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DATABASE_URL
});

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING }
});

export default { sequelize, User };
