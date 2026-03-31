import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './core/entities/slot.entity';
import { Appointment } from './core/entities/appointment.entity';
import { User } from '../user/core/entities/user.entity';
import { SlotService } from './core/services/slot.service';
import { SlotResolver } from './infrastructure/resolvers/slot.resolver';
import { SlotRepository } from './infrastructure/repositories/slot.repository';
import { AppointmentService } from './core/services/appointment.service';
import { AppointmentResolver } from './infrastructure/resolvers/appointment.resolver';
import { AppointmentRepository } from './infrastructure/repositories/appointment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Appointment, User])],
  providers: [
    SlotService,
    SlotResolver,
    { provide: 'ISlotRepository', useClass: SlotRepository },
    AppointmentService,
    AppointmentResolver,
    { provide: 'IAppointmentRepository', useClass: AppointmentRepository },
  ],
})
export class AppointmentModule {}
