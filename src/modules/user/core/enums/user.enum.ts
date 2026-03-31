import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'The roles of the user',
});
