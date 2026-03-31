import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateStoreDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  address: string;

  @Field()
  @IsString()
  city: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => Int)
  @IsNumber()
  organizationId: number;
}

@InputType()
export class UpdateStoreDto {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPendingAppointments?: number;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  deletedAt: Date;
}
