import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { StoreService } from 'src/modules/store/core/services/store.service';
import { User } from '../../core/entities/user.entity';
import {
  AuthCreateUserDto,
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserLoginDto,
  UserLoginResponse,
} from '../../core/dtos/user.dto';
import { AuthGQLGuard } from 'src/core/guards/auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Role } from '../../core/enums/user.enum';
import { AuthErrors } from 'src/core/errors/auth.errors';
import { GqlContext } from 'src/core/interfaces/gql-context.interface';
import {
  ADMIN_ROLES,
  MANAGER_ROLES,
  isAdmin,
  isManager,
  isSuperAdmin,
} from 'src/core/constants/auth.constants';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly storeService: StoreService,
  ) {}

  /**
   * SUPER_ADMIN → all users
   * MANAGER     → all users in their organization
   * ADMIN       → all users in their store
   */
  @Roles(...ADMIN_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => [User])
  async getAllUsers(@Context() ctx: GqlContext): Promise<User[]> {
    const { user } = ctx.req;
    if (isSuperAdmin(user.roles)) {
      return this.userService.getAllUsers();
    }
    if (isManager(user.roles) && user.organizationId) {
      return this.userService.getAllUsersByOrganizationId(user.organizationId);
    }
    if (user.storeId) {
      return this.userService.getAllUsersByStoreId(user.storeId);
    }
    return [];
  }

  /**
   * MANAGER+ → any user
   * ADMIN     → users in their store or themselves
   * STAFF/USER→ only themselves
   */
  @UseGuards(AuthGQLGuard)
  @Query(() => User)
  async getUserByEmail(
    @Args('email') email: string,
    @Context() ctx: GqlContext,
  ): Promise<User> {
    const { user } = ctx.req;
    if (isManager(user.roles)) {
      return this.userService.getUserByEmail(email);
    }
    if (isAdmin(user.roles)) {
      const target = await this.userService.getUserByEmail(email);
      if (target.storeId !== user.storeId && user.sub !== target.id) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return target;
    }
    if (user.email !== email) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return this.userService.getUserByEmail(email);
  }

  @Query(() => UserLoginResponse)
  async login(
    @Args('loginData') loginData: UserLoginDto,
  ): Promise<UserLoginResponse> {
    return this.userService.login(loginData);
  }

  @UseGuards(AuthGQLGuard)
  @Query(() => UserLoginResponse)
  async refreshToken(@Context() ctx: GqlContext): Promise<UserLoginResponse> {
    return this.userService.refreshToken(ctx.req.user.sub);
  }

  @UseGuards(AuthGQLGuard)
  @Mutation(() => UserLoginResponse)
  async selectOrganization(
    @Args('orgId', { type: () => Int }) orgId: number,
    @Context() ctx: GqlContext,
  ): Promise<UserLoginResponse> {
    if (!isSuperAdmin(ctx.req.user.roles)) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    const stores = await this.storeService.getAllByOrganizationId(orgId);
    const firstStoreId = stores[0]?.id ?? null;
    return this.userService.selectOrganization(ctx.req.user.sub, orgId, firstStoreId);
  }

  @UseGuards(AuthGQLGuard)
  @Mutation(() => UserLoginResponse)
  async selectStore(
    @Args('storeId', { type: () => Int }) storeId: number,
    @Context() ctx: GqlContext,
  ): Promise<UserLoginResponse> {
    const { user } = ctx.req;
    if (!isSuperAdmin(user.roles) && !isManager(user.roles)) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return this.userService.selectStore(user.sub, storeId);
  }

  /**
   * SUPER_ADMIN → any user
   * MANAGER     → Admin-and-below within their organization; cannot assign SuperAdmin
   * ADMIN       → Staff/User within their store (or themselves); cannot assign Manager+
   * STAFF/USER  → only themselves; cannot change roles
   */
  @UseGuards(AuthGQLGuard)
  @Mutation(() => User)
  async updateUser(
    @Args('userData') userData: UpdateUserDto,
    @Context() ctx: GqlContext,
  ): Promise<User> {
    const { user } = ctx.req;

    if (isSuperAdmin(user.roles)) {
      return this.userService.updateUser(userData);
    }

    if (isManager(user.roles)) {
      const target = await this.userService.getUserById(userData.id);
      // Manager cannot edit SuperAdmins or other Managers
      if (
        target.roles.some(r => [Role.SUPER_ADMIN, Role.MANAGER].includes(r))
      ) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      // Target must be in Manager's organization
      await this.assertTargetInOrganization(target, user.organizationId);
      // Manager cannot assign SuperAdmin role
      if (userData.roles?.includes(Role.SUPER_ADMIN)) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return this.userService.updateUser(userData);
    }

    if (user.roles.includes(Role.ADMIN)) {
      // Admin can always edit their own profile
      if (user.sub === userData.id) {
        // But cannot escalate their own roles to Manager or SuperAdmin
        if (
          userData.roles?.some(r =>
            [Role.SUPER_ADMIN, Role.MANAGER].includes(r),
          )
        ) {
          throw new ForbiddenException(AuthErrors.FORBIDDEN);
        }
        return this.userService.updateUser(userData);
      }
      const target = await this.userService.getUserById(userData.id);
      // Admin cannot edit Admins or higher
      if (
        target.roles.some(r =>
          [Role.SUPER_ADMIN, Role.MANAGER, Role.ADMIN].includes(r),
        )
      ) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      // Target must be in Admin's store
      if (target.storeId !== user.storeId) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      // Admin can only assign Staff/User roles
      if (userData.roles?.some(r => ![Role.STAFF, Role.USER].includes(r))) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return this.userService.updateUser(userData);
    }

    // Staff/User: only themselves, cannot change roles
    if (user.sub !== userData.id) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    if (userData.roles) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return this.userService.updateUser(userData);
  }

  /**
   * SUPER_ADMIN → any user
   * MANAGER     → Admin-and-below within their organization
   * ADMIN       → Staff/User within their store
   */
  @Roles(...ADMIN_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args('userId', { type: () => Int }) userId: number,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const { user } = ctx.req;

    if (isSuperAdmin(user.roles)) {
      return this.userService.deleteUser(userId);
    }

    const target = await this.userService.getUserById(userId);

    if (isManager(user.roles)) {
      // Manager cannot delete SuperAdmins or other Managers
      if (
        target.roles.some(r => [Role.SUPER_ADMIN, Role.MANAGER].includes(r))
      ) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      await this.assertTargetInOrganization(target, user.organizationId);
      return this.userService.deleteUser(userId);
    }

    if (user.roles.includes(Role.ADMIN)) {
      // Admin cannot delete Admins or higher
      if (
        target.roles.some(r =>
          [Role.SUPER_ADMIN, Role.MANAGER, Role.ADMIN].includes(r),
        )
      ) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      // Target must be in Admin's store
      if (target.storeId !== user.storeId) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return this.userService.deleteUser(userId);
    }

    throw new ForbiddenException(AuthErrors.FORBIDDEN);
  }

  @Mutation(() => User)
  async addNewUser(@Args('userData') userData: CreateUserDto): Promise<User> {
    return this.userService.addNewUser(userData);
  }

  /**
   * SUPER_ADMIN → cualquier rol, cualquier tienda/org
   * MANAGER     → puede asignar [MANAGER, ADMIN, STAFF, USER]; inyecta organizationId
   * ADMIN       → puede asignar [ADMIN, STAFF, USER]; inyecta storeId
   */
  @UseGuards(AuthGQLGuard)
  @Mutation(() => User)
  async createUser(
    @Args('userData') userData: AuthCreateUserDto,
    @Context() ctx: GqlContext,
  ): Promise<User> {
    const { user } = ctx.req;

    if (isSuperAdmin(user.roles)) {
      return this.userService.createUser(userData);
    }

    if (isManager(user.roles) && !isSuperAdmin(user.roles)) {
      const allowed = [Role.MANAGER, Role.ADMIN, Role.STAFF, Role.USER];
      if (!userData.roles.every(r => allowed.includes(r))) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return this.userService.createUser({
        ...userData,
        organizationId: user.organizationId ?? undefined,
        storeId: undefined,
      });
    }

    if (user.roles.includes(Role.ADMIN) && !isManager(user.roles)) {
      const allowed = [Role.ADMIN, Role.STAFF, Role.USER];
      if (!userData.roles.every(r => allowed.includes(r))) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return this.userService.createUser({
        ...userData,
        storeId: user.storeId ?? undefined,
        organizationId: undefined,
      });
    }

    throw new ForbiddenException(AuthErrors.FORBIDDEN);
  }

  @Mutation(() => Boolean)
  async sendEmailResetPassword(@Args('email') email: string): Promise<boolean> {
    return this.userService.sendEmailResetPassword(email);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('resetPasswordData') resetPasswordData: ResetPasswordDto,
  ): Promise<boolean> {
    return this.userService.resetPassword(resetPasswordData);
  }

  /**
   * Validates that the target user belongs to the given organization,
   * either directly (organizationId) or via their assigned store.
   */
  private async assertTargetInOrganization(
    target: User,
    organizationId: number | null,
  ): Promise<void> {
    if (!organizationId) throw new ForbiddenException(AuthErrors.FORBIDDEN);
    if (target.storeId) {
      const store = await this.storeService.getById(target.storeId);
      if (store.organizationId !== organizationId) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
    } else if (target.organizationId !== organizationId) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
  }
}
