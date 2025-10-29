import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("mydb", "root", "password123", {
  host: "localhost",
  dialect: "mysql",
});

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL");

    await sequelize.sync();
    await User.create({ name: "Sharique", email: "sharique@example.com" });
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await sequelize.close();
  }
})();
