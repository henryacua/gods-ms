import { Inject, Injectable } from '@nestjs/common';
import { IAppointmentRepository } from '../interfaces/appointment.repository';
import { Appointment } from '../entities/appointment.entity';
import {
  BookAppointmentDto,
  StaffMemberType,
  TimeIntervalType,
  UpdateAppointmentDto,
} from '../dtos/appointment.dto';
import { Role } from 'src/modules/user/core/enums/user.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  getStaffWithSlots(storeId: number): Promise<StaffMemberType[]> {
    return this.appointmentRepository.getStaffWithSlots(storeId);
  }

  getAvailableIntervals(
    staffId: number,
    date: string,
    excludeAppointmentId?: number,
  ): Promise<TimeIntervalType[]> {
    return this.appointmentRepository.getAvailableIntervals(
      staffId,
      date,
      excludeAppointmentId,
    );
  }

  bookAppointment(
    userId: number,
    storeId: number,
    dto: BookAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentRepository.bookAppointment(userId, storeId, dto);
  }

  cancelAppointment(id: number, userId: number): Promise<boolean> {
    return this.appointmentRepository.cancelAppointment(id, userId);
  }

  markAsDone(id: number): Promise<Appointment> {
    return this.appointmentRepository.markAsDone(id);
  }

  getMyAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepository.getMyAppointments(userId);
  }

  getStaffAppointments(staffId: number): Promise<Appointment[]> {
    return this.appointmentRepository.getStaffAppointments(staffId);
  }

  updateAppointment(
    id: number,
    userId: number,
    roles: Role[],
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentRepository.updateAppointment(id, userId, roles, dto);
  }
}
