import { Inject, Injectable } from '@nestjs/common';
import { IEmailPort } from '../interfaces';
import { EmailDto } from '../dtos/email.dto';

@Injectable()
export class EmailService {
  constructor(
    @Inject('IEmailPort')
    private readonly emailPort: IEmailPort,
  ) {}

  async sendEmail(emailData: EmailDto): Promise<boolean> {
    return await this.emailPort.sendEmail(emailData);
  }
}
