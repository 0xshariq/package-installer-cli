import { Module } from "@nestjs/common";
import { TypeORMDatabaseModule } from "../typeorm/typeorm.module";
import { SqliteService } from "./sqlite.service";
import { SqliteController } from "./sqlite.controller";

@Module({
  imports: [TypeORMDatabaseModule],
  providers: [SqliteService],
  controllers: [SqliteController]
})
export class SqliteModule {}
