import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("mydb", "postgres", "password123", {
  host: "localhost",
  dialect: "postgres",
});

const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    await sequelize.sync();
    await Product.create({ name: "Laptop", price: 50000 });
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await sequelize.close();
  }
})();
