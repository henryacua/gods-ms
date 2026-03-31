import { registerEnumType } from '@nestjs/graphql';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
}

registerEnumType(AppointmentStatus, { name: 'AppointmentStatus' });
