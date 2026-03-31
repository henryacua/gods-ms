import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './core/services/user.service';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UsersController } from './infrastructure/controllers/user.controller';
import { User } from './core/entities/user.entity';
import { Module } from '@nestjs/common';
import { UserResolver } from './infrastructure/resolvers/user.resolver';
import { EmailService } from '../notification/core/services/email.service';
import { EmailPort } from '../notification/infrastructure/ports/email.port';
import { StoreModule } from '../store/store.module';

const services = [UserService, UserResolver, EmailService];

const interfaces = [
  { provide: 'IUserRepository', useClass: UserRepository },
  { provide: 'IEmailPort', useClass: EmailPort },
];

@Module({
  imports: [TypeOrmModule.forFeature([User]), StoreModule],
  controllers: [UsersController],
  providers: [...services, ...interfaces],
  exports: [UserService],
})
export class UserModule {}
