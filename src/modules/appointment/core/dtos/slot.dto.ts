import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { DayOfWeek } from '../enums/slot.enum';

/** Accepts "HH:MM" or "HH:MM:SS" */
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

@InputType()
export class CreateSlotDto {
  @Field()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:MM or HH:MM:SS' })
  startTime: string;

  @Field()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:MM or HH:MM:SS' })
  endTime: string;

  @Field(() => DayOfWeek)
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;
}

@InputType()
export class UpdateSlotDto {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:MM or HH:MM:SS' })
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:MM or HH:MM:SS' })
  endTime?: string;

  @Field(() => DayOfWeek, { nullable: true })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;
}
