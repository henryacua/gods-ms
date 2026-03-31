import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../enums/user.enum';
import * as bcrypt from 'bcrypt';
import { ResetPasswordResponse } from '../dtos/user.dto';
import { Store } from 'src/modules/store/core/entities/store.entity';
import { Organization } from 'src/modules/organization/core/entities/oganization.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'name', nullable: false })
  name: string;

  @Field()
  @Column({ name: 'surname', nullable: false })
  surname: string;

  @Field()
  @Column({ unique: true, nullable: false })
  email: string;

  @Exclude()
  @Column({ name: 'password', nullable: false })
  password: string;

  @Field()
  @Column({ name: 'phone', nullable: false })
  phone: string;

  @Field({ nullable: true })
  @Column({ name: 'photo', nullable: true })
  photo: string;

  @Field()
  @Column({
    name: 'birthday',
    type: 'date',
    nullable: false,
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => (value ? new Date(value) : null),
    },
  })
  birthday: Date;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'store_id', type: 'int', nullable: true })
  storeId: number | null;

  @Field(() => Store, { nullable: true })
  @ManyToOne(() => Store, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'store_id' })
  store: Store | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'organization_id', type: 'int', nullable: true })
  organizationId: number | null;

  @Field(() => Organization, { nullable: true })
  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization | null;

  @Field({ nullable: false })
  @Column({ name: 'terms', nullable: false, default: false })
  terms: boolean;

  @Field({ nullable: true })
  @Column({ name: 'notification', nullable: true, default: false })
  notification: boolean;

  @Field(() => [Role])
  @Column({
    name: 'roles',
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.USER],
  })
  roles: Role[];

  @Field(() => ResetPasswordResponse, { nullable: true })
  @Column({ name: 'reset_password_token', type: 'jsonb', nullable: true })
  resetPasswordToken: ResetPasswordResponse | null;

  @Field({ nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
