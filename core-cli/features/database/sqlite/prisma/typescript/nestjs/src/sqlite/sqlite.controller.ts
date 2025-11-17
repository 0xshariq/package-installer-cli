import { Controller, Get } from "@nestjs/common";
import { SqliteService } from "./sqlite.service";

@Controller("sqlite")
export class SqliteController {
  constructor(private sqlite: SqliteService) {}

  @Get()
  getAll() {
    return this.sqlite.getUsers();
  }
}
