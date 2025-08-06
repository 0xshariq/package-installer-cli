import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  name;

  @Column({ unique: true })
  email;
}
