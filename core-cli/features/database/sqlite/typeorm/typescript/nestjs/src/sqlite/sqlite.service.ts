import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../typeorm/entities/user.entity";

@Injectable()
export class SqliteService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>
  ) {}

  getUsers() {
    return this.usersRepo.find();
  }
}
