import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true
    },
    name: {
      type: "text"
    }
  }
});
