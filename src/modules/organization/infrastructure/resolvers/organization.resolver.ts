import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Organization } from '../../core/entities/oganization.entity';
import { OrganizationService } from '../../core/services/organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../../core/dtos/organization.dto';
import { AuthGQLGuard } from 'src/core/guards/auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Role } from 'src/modules/user/core/enums/user.enum';
import { MANAGER_ROLES, isSuperAdmin } from 'src/core/constants/auth.constants';
import { GqlContext } from 'src/core/interfaces/gql-context.interface';
import { AuthErrors } from 'src/core/errors/auth.errors';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly organizationService: OrganizationService) {}

  @Roles(...MANAGER_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => [Organization])
  async getAllOrganizations(
    @Context() ctx: GqlContext,
  ): Promise<Organization[]> {
    const { user } = ctx.req;
    if (isSuperAdmin(user.roles)) {
      return this.organizationService.getAllOrganizations();
    }
    if (user.organizationId) {
      const org = await this.organizationService.getOrganizationById(
        user.organizationId,
      );
      return [org];
    }
    return [];
  }

  @Roles(...MANAGER_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => Organization)
  async getOrganizationById(
    @Args('id') id: number,
    @Context() ctx: GqlContext,
  ): Promise<Organization> {
    const { user } = ctx.req;
    if (!isSuperAdmin(user.roles) && user.organizationId !== id) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return this.organizationService.getOrganizationById(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Organization)
  async createOrganization(
    @Args('createOrganizationData')
    createOrganizationData: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationService.createOrganization(createOrganizationData);
  }

  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Organization)
  async updateOrganization(
    @Args('updateOrganizationData')
    updateOrganizationData: UpdateOrganizationDto,
    @Context() ctx: GqlContext,
  ): Promise<Organization> {
    const { user } = ctx.req;
    if (
      !isSuperAdmin(user.roles) &&
      user.organizationId !== updateOrganizationData.id
    ) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return this.organizationService.updateOrganization(updateOrganizationData);
  }

  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Boolean)
  deleteOrganization(@Args('id') id: number): Promise<boolean> {
    return this.organizationService.deleteOrganization(id);
  }
}
