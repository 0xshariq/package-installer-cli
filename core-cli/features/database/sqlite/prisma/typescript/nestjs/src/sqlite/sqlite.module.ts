\import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SqliteService } from "./sqlite.service";
import { SqliteController } from "./sqlite.controller";

@Module({
  imports: [PrismaModule],
  controllers: [SqliteController],
  providers: [SqliteService]
})
export class SqliteModule {}
