import { Module } from '@nestjs/common';

import { EmailService } from './core/services/email.service';
import { EmailPort } from './infrastructure/ports/email.port';

const services = [EmailService];

const interfaces = [{ provide: 'IEmailPort', useClass: EmailPort }];

@Module({
  imports: [],
  controllers: [],
  providers: [...services, ...interfaces],
  exports: [...services, ...interfaces],
})
export class NotificationModule {}
