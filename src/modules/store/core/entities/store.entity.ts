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
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Organization } from 'src/modules/organization/core/entities/oganization.entity';

@ObjectType()
@Entity()
export class Store {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'name' })
  name: string;

  @Field()
  @Column({ name: 'address' })
  address: string;

  @Field()
  @Column({ name: 'city' })
  city: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'phone', type: 'varchar', nullable: true })
  phone: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'country', type: 'varchar', nullable: true })
  country: string | null;

  @Field(() => Int)
  @Column({ name: 'organization_id', type: 'int' })
  organizationId: number;

  @Field(() => Organization)
  @ManyToOne(() => Organization, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Field(() => Int)
  @Column({ name: 'max_pending_appointments', type: 'int', default: 1 })
  maxPendingAppointments: number;

  @Field({ nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
