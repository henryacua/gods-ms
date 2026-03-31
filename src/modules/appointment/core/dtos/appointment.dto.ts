import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, Matches } from 'class-validator';

import { DayOfWeek } from '../enums/slot.enum';

@InputType()
export class BookAppointmentDto {
  @Field(() => Int)
  @IsInt()
  staffId: number;

  @Field(() => Int)
  @IsInt()
  storeId: number;

  /** "YYYY-MM-DD" */
  @Field()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  /** "HH:MM:SS" */
  @Field()
  @IsString()
  startTime: string;

  /** "HH:MM:SS" */
  @Field()
  @IsString()
  endTime: string;
}

@InputType()
export class UpdateAppointmentDto {
  @Field(() => Int)
  @IsInt()
  id: number;

  /** "YYYY-MM-DD" */
  @Field()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  /** "HH:MM:SS" */
  @Field()
  @IsString()
  startTime: string;

  /** "HH:MM:SS" */
  @Field()
  @IsString()
  endTime: string;
}

@ObjectType()
export class TimeIntervalType {
  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  available: boolean;
}

@ObjectType()
export class StaffMemberType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  surname: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => [DayOfWeek])
  slotDays: DayOfWeek[];
}

@ObjectType()
export class AvailabilityUpdateType {
  @Field(() => Int)
  staffId: number;

  @Field()
  date: string;

  @Field(() => [TimeIntervalType])
  intervals: TimeIntervalType[];
}
