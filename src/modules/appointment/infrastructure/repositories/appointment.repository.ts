import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { Appointment } from '../../core/entities/appointment.entity';
import { Store } from 'src/modules/store/core/entities/store.entity';
import { AppointmentStatus } from '../../core/enums/appointment.enum';
import {
  BookAppointmentDto,
  StaffMemberType,
  TimeIntervalType,
  UpdateAppointmentDto,
} from '../../core/dtos/appointment.dto';
import { IAppointmentRepository } from '../../core/interfaces/appointment.repository';
import { AppointmentErrors } from '../../core/errors/appointment.errors';
import {
  APPOINTMENT_INTERVAL_MINUTES,
  JS_DAY_TO_ENUM,
} from '../../core/constants/appointment.constants';
import { ISlotRepository } from '../../core/interfaces/slot.repository';
import { User } from 'src/modules/user/core/entities/user.entity';
import { Role } from 'src/modules/user/core/enums/user.enum';
import { ADMIN_ROLES, hasAnyRole } from 'src/core/constants/auth.constants';
import { addMinutes, normalizeTime } from '../../core/utils/appointment.utils';

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly apptRepo: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject('ISlotRepository')
    private readonly slotRepository: ISlotRepository,
  ) {}

  async getStaffWithSlots(storeId: number): Promise<StaffMemberType[]> {
    const users = await this.userRepo.find({ where: { storeId } });

    // Solo usuarios con rol Staff (o SuperAdmin) pueden aparecer como agenda
    const staffUsers = users.filter(
      (u) =>
        u.roles.includes(Role.STAFF) || u.roles.includes(Role.SUPER_ADMIN),
    );

    const results = await Promise.all(
      staffUsers.map(async (user) => {
        const slots = await this.slotRepository.getAllByStaffId(user.id);
        const uniqueDays = [...new Set(slots.map((s) => s.dayOfWeek))];
        return {
          id: user.id,
          name: user.name,
          surname: user.surname,
          photo: user.photo ?? undefined,
          slotDays: uniqueDays,
        };
      }),
    );

    // Solo mostrar personal que tiene al menos un slot configurado
    return results.filter((s) => s.slotDays.length > 0);
  }

  async getAvailableIntervals(
    staffId: number,
    date: string,
    excludeAppointmentId?: number,
  ): Promise<TimeIntervalType[]> {
    const jsDay = new Date(date + 'T00:00:00').getDay();
    const dayOfWeek = JS_DAY_TO_ENUM[jsDay];

    const slots = await this.slotRepository.getByStaffAndDay(
      staffId,
      dayOfWeek,
    );

    if (!slots.length) return [];

    const intervals: TimeIntervalType[] = [];

    for (const slot of slots) {
      let current = normalizeTime(slot.startTime);
      const slotEnd = normalizeTime(slot.endTime);

      while (current < slotEnd) {
        const next = addMinutes(current, APPOINTMENT_INTERVAL_MINUTES);
        if (next > slotEnd) break;

        const conflict = await this.apptRepo.findOne({
          where: {
            staffId,
            date,
            startTime: current,
            status: In([AppointmentStatus.PENDING, AppointmentStatus.DONE]),
            ...(excludeAppointmentId ? { id: Not(excludeAppointmentId) } : {}),
          },
        });

        intervals.push({
          startTime: current,
          endTime: next,
          available: !conflict,
        });

        current = next;
      }
    }

    return intervals;
  }

  async bookAppointment(
    userId: number,
    storeId: number,
    dto: BookAppointmentDto,
  ): Promise<Appointment> {
    return this.entityManager.transaction(async trx => {
      const store = await trx.findOne(Store, {
        where: { id: storeId },
        loadEagerRelations: false,
      });
      const limit = store?.maxPendingAppointments ?? 1;

      const pendingCount = await trx.count(Appointment, {
        where: { userId, storeId, status: AppointmentStatus.PENDING },
      });
      if (pendingCount >= limit) {
        throw new BadRequestException(AppointmentErrors.PENDING_LIMIT_REACHED);
      }

      const conflict = await trx.findOne(Appointment, {
        where: {
          staffId: dto.staffId,
          date: dto.date,
          startTime: normalizeTime(dto.startTime),
          status: In([AppointmentStatus.PENDING, AppointmentStatus.DONE]),
        },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });

      if (conflict) {
        throw new BadRequestException(AppointmentErrors.SLOT_TAKEN);
      }

      const appt = trx.create(Appointment, {
        userId,
        staffId: dto.staffId,
        storeId,
        date: dto.date,
        startTime: normalizeTime(dto.startTime),
        endTime: normalizeTime(dto.endTime),
        status: AppointmentStatus.PENDING,
      });

      return trx.save(Appointment, appt);
    });
  }

  async cancelAppointment(id: number): Promise<boolean> {
    try {
      const appt = await this.apptRepo.findOneBy({ id });
      if (!appt) {
        throw new NotFoundException(AppointmentErrors.APPOINTMENT_NOT_FOUND);
      }

      appt.status = AppointmentStatus.CANCELLED;
      await this.apptRepo.save(appt);
      return true;
    } catch (error) {
      if (error instanceof Error) Logger.error(error.message);
      throw error;
    }
  }

  async markAsDone(id: number): Promise<Appointment> {
    const appt = await this.apptRepo.findOneBy({ id });
    if (!appt) {
      throw new NotFoundException(AppointmentErrors.APPOINTMENT_NOT_FOUND);
    }

    appt.status = AppointmentStatus.DONE;
    return this.apptRepo.save(appt);
  }

  async getMyAppointments(userId: number): Promise<Appointment[]> {
    return this.apptRepo.find({
      where: { userId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async getStaffAppointments(staffId: number): Promise<Appointment[]> {
    return this.apptRepo.find({
      where: { staffId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async updateAppointment(
    id: number,
    userId: number,
    roles: Role[],
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.entityManager.transaction(async trx => {
      const appt = await trx.findOne(Appointment, {
        where: { id },
        loadEagerRelations: false,
      });
      if (!appt) {
        throw new NotFoundException(AppointmentErrors.APPOINTMENT_NOT_FOUND);
      }

      if (hasAnyRole(roles, ADMIN_ROLES)) {
        // admins can edit any appointment
      } else if (roles.includes(Role.STAFF)) {
        if (appt.staffId !== userId) {
          throw new ForbiddenException(AppointmentErrors.CANNOT_EDIT);
        }
      } else {
        if (appt.userId !== userId) {
          throw new ForbiddenException(AppointmentErrors.CANNOT_EDIT);
        }
      }

      const conflict = await trx.findOne(Appointment, {
        where: {
          staffId: appt.staffId,
          date: dto.date,
          startTime: normalizeTime(dto.startTime),
          status: In([AppointmentStatus.PENDING, AppointmentStatus.DONE]),
          id: Not(dto.id),
        },
        loadEagerRelations: false,
      });
      if (conflict) {
        throw new BadRequestException(AppointmentErrors.SLOT_TAKEN);
      }

      appt.date = dto.date;
      appt.startTime = normalizeTime(dto.startTime);
      appt.endTime = normalizeTime(dto.endTime);

      return trx.save(Appointment, appt);
    });
  }
}
