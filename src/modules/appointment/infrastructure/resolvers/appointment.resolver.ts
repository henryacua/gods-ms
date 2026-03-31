import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/entities/appointment.entity';
import {
  BookAppointmentDto,
  StaffMemberType,
  TimeIntervalType,
  UpdateAppointmentDto,
} from '../../core/dtos/appointment.dto';
import { AuthGQLGuard } from 'src/core/guards/auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { STAFF_ROLES, isAdmin } from 'src/core/constants/auth.constants';
import { GqlContext } from 'src/core/interfaces/gql-context.interface';
import { Role } from 'src/modules/user/core/enums/user.enum';
import { AuthErrors } from 'src/core/errors/auth.errors';

@Resolver(() => Appointment)
export class AppointmentResolver {
  constructor(private readonly appointmentService: AppointmentService) {}

  // ─── Queries ────────────────────────────────────────────────────────────────

  @UseGuards(AuthGQLGuard)
  @Query(() => [StaffMemberType])
  async getStaffWithSlots(
    @Args('storeId', { type: () => Int }) storeId: number,
  ): Promise<StaffMemberType[]> {
    return this.appointmentService.getStaffWithSlots(storeId);
  }

  @UseGuards(AuthGQLGuard)
  @Query(() => [TimeIntervalType])
  async getAvailableIntervals(
    @Args('staffId', { type: () => Int }) staffId: number,
    @Args('date') date: string,
    @Args('excludeAppointmentId', { type: () => Int, nullable: true })
    excludeAppointmentId?: number,
  ): Promise<TimeIntervalType[]> {
    return this.appointmentService.getAvailableIntervals(
      staffId,
      date,
      excludeAppointmentId,
    );
  }

  @Roles(Role.USER)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => [Appointment])
  async getMyAppointments(@Context() ctx: GqlContext): Promise<Appointment[]> {
    return this.appointmentService.getMyAppointments(ctx.req.user.sub);
  }

  @Roles(...STAFF_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Query(() => [Appointment])
  async getStaffAppointments(
    @Context() ctx: GqlContext,
  ): Promise<Appointment[]> {
    return this.appointmentService.getStaffAppointments(ctx.req.user.sub);
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  @Roles(Role.USER)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Appointment)
  async bookAppointment(
    @Args('bookingData') bookingData: BookAppointmentDto,
    @Context() ctx: GqlContext,
  ): Promise<Appointment> {
    const { user } = ctx.req;
    if (user.storeId === null) {
      throw new BadRequestException('No tienes una tienda asignada');
    }
    return this.appointmentService.bookAppointment(
      user.sub,
      user.storeId,
      bookingData,
    );
  }

  @UseGuards(AuthGQLGuard)
  @Mutation(() => Boolean)
  async cancelAppointment(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const { user } = ctx.req;
    const appointments = await this.appointmentService.getMyAppointments(
      user.sub,
    );
    const isOwner = appointments.some(a => a.id === id);
    const canManage = isAdmin(user.roles) || user.roles.includes(Role.STAFF);
    if (!isOwner && !canManage) {
      throw new ForbiddenException(AuthErrors.FORBIDDEN);
    }
    return this.appointmentService.cancelAppointment(id, user.sub);
  }

  @Roles(...STAFF_ROLES)
  @UseGuards(AuthGQLGuard, RolesGuard)
  @Mutation(() => Appointment)
  async markAppointmentDone(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Appointment> {
    return this.appointmentService.markAsDone(id);
  }

  @UseGuards(AuthGQLGuard)
  @Mutation(() => Appointment)
  async updateAppointment(
    @Args('dto') dto: UpdateAppointmentDto,
    @Context() ctx: GqlContext,
  ): Promise<Appointment> {
    const { user } = ctx.req;
    return await this.appointmentService.updateAppointment(
      dto.id,
      user.sub,
      user.roles,
      dto,
    );
  }
}
