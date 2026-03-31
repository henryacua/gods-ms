import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
  IsStrongPassword,
  IsEnum,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Role } from '../enums/user.enum';
import { strongPasswordMessage } from '../utils/user.utils';

@InputType()
export class TokenDto {
  @Field()
  @IsString()
  token: string;

  @Field()
  @IsDate()
  expiresAt: Date;
}

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  surname: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword({}, { message: strongPasswordMessage })
  password: string;

  @Field()
  @IsPhoneNumber()
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  photo?: string;

  @Field()
  @IsDate()
  birthday: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  storeId?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  terms?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  notification?: boolean;

  @Field(() => [Role], { nullable: true })
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];
}

@InputType()
export class UpdateUserDto {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  surname?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsStrongPassword({}, { message: strongPasswordMessage })
  @IsOptional()
  password?: string;

  @Field({ nullable: true })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  photo?: string;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  birthday?: Date;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  storeId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  organizationId?: number | null;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  terms?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  notification?: boolean;

  @Field(() => [Role], { nullable: true })
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];

  @Field(() => TokenDto, { nullable: true })
  @IsOptional()
  resetPasswordToken?: TokenDto | null;
}

@InputType()
export class AuthCreateUserDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  surname: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword({}, { message: strongPasswordMessage })
  password: string;

  @Field()
  @IsPhoneNumber()
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  photo?: string;

  @Field()
  @IsDate()
  birthday: Date;

  @Field(() => [Role])
  @IsEnum(Role, { each: true })
  roles: Role[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  storeId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  terms?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  notification?: boolean;
}

@InputType()
export class UserLoginDto {
  @IsEmail()
  @Field()
  email: string;

  @IsString()
  @Field()
  password: string;
}

export class DeleteUserDto {
  id: number;
  deletedAt: Date;
}

@InputType()
export class ResetPasswordDto {
  @Field(() => Int)
  @IsNumber()
  userId: number;

  @Field()
  @IsString()
  token: string;

  @Field()
  @IsStrongPassword({}, { message: strongPasswordMessage })
  newPassword: string;
}

// ------------------------------------------------------------------------------------------------
// Responses

@ObjectType()
export class UserLoginResponse {
  @Field()
  token: string;
}

@ObjectType()
export class ResetPasswordResponse {
  @Field()
  token: string;

  @Field()
  expiresAt: Date;
}
