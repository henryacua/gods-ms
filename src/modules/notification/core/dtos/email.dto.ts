import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNumber, IsString, Length } from 'class-validator';

@InputType()
export class EmailDto {
  @Field()
  @IsNumber()
  userId: number;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(6, 6)
  resetToken?: string;
}
