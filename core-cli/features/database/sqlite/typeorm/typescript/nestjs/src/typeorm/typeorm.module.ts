import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: process.env.DATABASE_URL,
      entities: [User],
      synchronize: true
    }),
    TypeOrmModule.forFeature([User])
  ],
  exports: [TypeOrmModule]
})
export class TypeORMDatabaseModule {}
