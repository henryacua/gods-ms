import { Args, Int, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { SlotService } from '../../core/services/slot.service';
import { Slot } from '../../core/entities/slot.entity';
import { CreateSlotDto, UpdateSlotDto } from '../../core/dtos/slot.dto';
import { AuthGQLGuard } from 'src/core/guards/auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { STAFF_ROLES, isSuperAdmin } from 'src/core/constants/auth.constants';
import { GqlContext } from 'src/core/interfaces/gql-context.interface';
import { AuthErrors } from 'src/core/errors/auth.errors';

@Resolver(() => Slot)
export class SlotResolver {
  constructor(private readonly slotService: SlotService) {}

  @Roles(...STAFF_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => [Slot])
  async getAllSlots(@Context() ctx: GqlContext): Promise<Slot[]> {
    const { user } = ctx.req;
    if (isSuperAdmin(user.roles)) {
      return this.slotService.getAll();
    }
    return this.slotService.getAllByStaffId(user.sub);
  }

  @Roles(...STAFF_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Slot)
  async createSlot(
    @Args('createSlotData') createSlotData: CreateSlotDto,
    @Context() ctx: GqlContext,
  ): Promise<Slot> {
    const { user } = ctx.req;
    return this.slotService.create(user.sub, createSlotData);
  }

  @Roles(...STAFF_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Slot)
  async updateSlot(
    @Args('updateSlotData') updateSlotData: UpdateSlotDto,
    @Context() ctx: GqlContext,
  ): Promise<Slot> {
    const { user } = ctx.req;
    if (!isSuperAdmin(user.roles)) {
      const slot = await this.slotService.getById(updateSlotData.id);
      if (slot.staffId !== user.sub) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
    }
    return this.slotService.update(updateSlotData);
  }

  @Roles(...STAFF_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Boolean)
  async deleteSlot(
    @Args('deleteSlotId', { type: () => Int }) deleteSlotId: number,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const { user } = ctx.req;
    if (!isSuperAdmin(user.roles)) {
      const slot = await this.slotService.getById(deleteSlotId);
      if (slot.staffId !== user.sub) {
        throw new ForbiddenException(AuthErrors.FORBIDDEN);
      }
    }
    return this.slotService.delete(deleteSlotId);
  }
}
