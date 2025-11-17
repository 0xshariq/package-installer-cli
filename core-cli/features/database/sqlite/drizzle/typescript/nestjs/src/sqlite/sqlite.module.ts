import { Module } from "@nestjs/common";
import { SqliteService } from "./sqlite.service";
import { SqliteController } from "./sqlite.controller";

@Module({
  controllers: [SqliteController],
  providers: [SqliteService]
})
export class SqliteModule {}
