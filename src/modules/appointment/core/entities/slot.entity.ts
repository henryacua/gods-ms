import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { DayOfWeek } from '../enums/slot.enum';
import { User } from 'src/modules/user/core/entities/user.entity';

@ObjectType()
@Entity('slot')
export class Slot {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ name: 'staff_id', type: 'int' })
  staffId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  /** PostgreSQL TIME — TypeORM returns "HH:MM:SS" */
  @Field(() => String)
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  /** PostgreSQL TIME — TypeORM returns "HH:MM:SS" */
  @Field(() => String)
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Field(() => DayOfWeek)
  @Column({ name: 'day_of_week', type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
