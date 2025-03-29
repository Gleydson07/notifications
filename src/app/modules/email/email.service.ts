import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailDto } from 'src/infra/mailer/dto/send-mail.dto';
import { MailerService } from 'src/infra/mailer/mailer.service';
import { templateRecoveryPassword } from 'src/infra/mailer/templates/recovery-password';
import { templateFormatter } from 'src/infra/mailer/utils/replacer';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendEmailToRecoveryPassword(message: any) {
    try {
      const userSender = this.configService.get<string>('MAIL_DEFAULT_SENDER');
      const mailProps: SendMailDto = {
        from: `"${message.companyName}" <${userSender}>`,
        recipients: message?.recipients,
        subject: 'Recuperação de senha',
        text: '/nOlá!/n Siga as orientações abaixo para recuperar sua senha:',
        html: message
          ? templateFormatter(templateRecoveryPassword, message)
          : templateRecoveryPassword,
      };

      this.mailerService.sendMail(mailProps);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Falha ao solicitar email de recuperação de senha!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
