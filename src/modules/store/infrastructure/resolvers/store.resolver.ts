import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';

import { StoreService } from '../../core/services/store.service';
import { Store } from '../../core/entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from '../../core/dtos/store.dto';
import { AuthGQLGuard } from 'src/core/guards/auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import {
  ADMIN_ROLES,
  MANAGER_ROLES,
  WORKFORCE_ROLES,
  isManager,
  isSuperAdmin,
} from 'src/core/constants/auth.constants';
import { GqlContext } from 'src/core/interfaces/gql-context.interface';
import { AuthErrors } from 'src/core/errors/auth.errors';
import { Role } from 'src/modules/user/core/enums/user.enum';

@Resolver(() => Store)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  /**
   * SUPER_ADMIN → all stores
   * MANAGER     → stores in their organization
   * ADMIN/STAFF → only their own store
   */
  @Roles(...WORKFORCE_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => [Store])
  async getAllStores(@Context() ctx: GqlContext): Promise<Store[]> {
    const { user } = ctx.req;
    if (isSuperAdmin(user.roles)) {
      if (user.organizationId) {
        return this.storeService.getAllByOrganizationId(user.organizationId);
      }
      return this.storeService.getAll();
    }
    if (isManager(user.roles) && user.organizationId) {
      return this.storeService.getAllByOrganizationId(user.organizationId);
    }
    if (user.storeId) {
      const store = await this.storeService.getById(user.storeId);
      return [store];
    }
    return [];
  }

  /**
   * SUPER_ADMIN → any store
   * MANAGER     → validates store belongs to their organization
   * ADMIN/STAFF → only their own store
   */
  @Roles(...WORKFORCE_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => Store)
  async getStoreById(
    @Args('id') id: number,
    @Context() ctx: GqlContext,
  ): Promise<Store> {
    const { user } = ctx.req;
    const store = await this.storeService.getById(id);
    if (isSuperAdmin(user.roles)) {
      return store;
    }
    if (isManager(user.roles)) {
      if (store.organizationId !== user.organizationId) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return store;
    }
    if (user.storeId !== id) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return store;
  }

  /**
   * SUPER_ADMIN → any organizationId
   * MANAGER     → auto-injects organizationId from token
   */
  @Roles(...MANAGER_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Store)
  async createStore(
    @Args('createStoreData')
    createStoreData: CreateStoreDto,
    @Context() ctx: GqlContext,
  ): Promise<Store> {
    const { user } = ctx.req;
    if (!isSuperAdmin(user.roles)) {
      if (!user.organizationId) throw new ForbiddenException(AuthErrors.FORBIDDEN);
      return this.storeService.create({
        ...createStoreData,
        organizationId: user.organizationId,
      });
    }
    return this.storeService.create(createStoreData);
  }

  /**
   * SUPER_ADMIN → any store
   * MANAGER     → stores in their organization
   * ADMIN       → only their own store
   */
  @Roles(...ADMIN_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Store)
  async updateStore(
    @Args('updateStoreData')
    updateStoreData: UpdateStoreDto,
    @Context() ctx: GqlContext,
  ): Promise<Store> {
    const { user } = ctx.req;
    if (isSuperAdmin(user.roles)) {
      return this.storeService.update(updateStoreData);
    }
    if (isManager(user.roles)) {
      const store = await this.storeService.getById(updateStoreData.id);
      if (store.organizationId !== user.organizationId) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      return this.storeService.update(updateStoreData);
    }
    if (user.roles.includes(Role.ADMIN)) {
      // Admin solo puede editar su propia tienda
      if (!user.storeId || user.storeId !== updateStoreData.id) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
      // Admin no puede modificar la organización a la que pertenece la tienda
      const { organizationId: _removed, ...safeData } = updateStoreData;
      return this.storeService.update(safeData);
    }
    // Ningún rol válido llegó hasta aquí — denegar por defecto
    throw new ForbiddenException(AuthErrors.FORBIDDEN);
  }

  /**
   * SUPER_ADMIN → any store
   * MANAGER     → validates store belongs to their organization
   */
  @Roles(...MANAGER_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Boolean)
  async deleteStore(
    @Args('id') id: number,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const { user } = ctx.req;
    if (!isSuperAdmin(user.roles)) {
      const store = await this.storeService.getById(id);
      if (store.organizationId !== user.organizationId) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
    }
    return this.storeService.delete(id);
  }
}
