import { Injectable } from "@nestjs/common";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { users } from "./schema";

@Injectable()
export class SqliteService {
  private db = drizzle(
    new Database(process.env.DATABASE_URL!.replace("file:", ""))
  );

  getUsers() {
    return this.db.select().from(users).all();
  }
}
