import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true
    }
  },
  indices: [
    {
      name: 'IDX_USER_EMAIL',
      columns: ['email']
    },
    {
      name: 'IDX_USER_CREATED_AT',
      columns: ['createdAt']
    }
  ]
});

