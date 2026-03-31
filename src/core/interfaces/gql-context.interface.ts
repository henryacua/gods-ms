import { Role } from '../../modules/user/core/enums/user.enum';

export interface AuthPayload {
  email: string;
  sub: number;
  roles: Role[];
  storeId: number | null;
  organizationId: number | null;
}

export interface GqlContext {
  req: {
    user: AuthPayload;
  };
}
