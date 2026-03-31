import {
  BookAppointmentDto,
  StaffMemberType,
  TimeIntervalType,
  UpdateAppointmentDto,
} from '../dtos/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { Role } from 'src/modules/user/core/enums/user.enum';

export interface IAppointmentRepository {
  getStaffWithSlots(storeId: number): Promise<StaffMemberType[]>;
  getAvailableIntervals(
    staffId: number,
    date: string,
    excludeAppointmentId?: number,
  ): Promise<TimeIntervalType[]>;
  bookAppointment(
    userId: number,
    storeId: number,
    dto: BookAppointmentDto,
  ): Promise<Appointment>;
  cancelAppointment(id: number, userId: number): Promise<boolean>;
  markAsDone(id: number): Promise<Appointment>;
  getMyAppointments(userId: number): Promise<Appointment[]>;
  getStaffAppointments(staffId: number): Promise<Appointment[]>;
  updateAppointment(
    id: number,
    userId: number,
    roles: Role[],
    dto: UpdateAppointmentDto,
  ): Promise<Appointment>;
}
