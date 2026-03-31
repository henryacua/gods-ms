import { EmailDto } from '../dtos/email.dto';

export interface IEmailPort {
  sendEmail(emailData: EmailDto): Promise<boolean>;
}
