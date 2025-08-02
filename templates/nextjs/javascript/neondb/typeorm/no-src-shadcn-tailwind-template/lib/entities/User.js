import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ unique: true })
  email;

  @Column({ nullable: true })
  name;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}
