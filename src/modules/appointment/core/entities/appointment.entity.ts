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
import { AppointmentStatus } from '../enums/appointment.enum';
import { User } from 'src/modules/user/core/entities/user.entity';
import { Store } from 'src/modules/store/core/entities/store.entity';

@ObjectType()
@Entity('appointment')
export class Appointment {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Field(() => Int)
  @Column({ name: 'staff_id', type: 'int' })
  staffId: number;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Field(() => Int)
  @Column({ name: 'store_id', type: 'int' })
  storeId: number;

  @Field(() => Store)
  @ManyToOne(() => Store, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  /** PostgreSQL DATE — stored as "YYYY-MM-DD" */
  @Field(() => String)
  @Column({ name: 'date', type: 'date' })
  date: string;

  /** PostgreSQL TIME — stored as "HH:MM:SS" */
  @Field(() => String)
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  /** PostgreSQL TIME — stored as "HH:MM:SS" */
  @Field(() => String)
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Field(() => AppointmentStatus)
  @Column({
    name: 'status',
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
