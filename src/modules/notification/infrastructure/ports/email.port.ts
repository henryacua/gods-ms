import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailErrors } from '../../core/error/email.errors';
import { IEmailPort } from '../../core/interfaces';
import { EmailDto } from '../../core/dtos/email.dto';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  getBodyHTML,
  RESET_PASSWORD_SUBJECT,
} from '../../core/utils/email.utils';

@Injectable()
export class EmailPort implements IEmailPort {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(emailData: EmailDto): Promise<boolean> {
    try {
      const { email, resetToken, userId } = emailData;
      const resetLink = `${process.env.APP_ROUTE}/auth/recovery/password?token=${resetToken}&userId=${userId}`;

      const res: SMTPTransport.SentMessageInfo =
        await this.transporter.sendMail({
          to: email,
          subject: RESET_PASSWORD_SUBJECT,
          html: getBodyHTML(resetLink),
        });

      Logger.log(`Email sent: ${res.response}`);
      return true;
    } catch (error) {
      if (error instanceof Error) Logger.error(error.message);
      throw new NotFoundException(EmailErrors.COULD_NOT_SEND_EMAIL);
    }
  }
}
