import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Organization {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'name', nullable: false })
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'logo', nullable: true })
  logo: string;

  @Field({ nullable: true })
  @Column({ name: 'url', nullable: true })
  url: string;

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
