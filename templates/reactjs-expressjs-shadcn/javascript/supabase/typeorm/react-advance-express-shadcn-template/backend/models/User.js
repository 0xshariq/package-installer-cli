import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', length: 50 })
  name;

  @Column({ type: 'varchar', length: 100, unique: true })
  email;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt;
}
