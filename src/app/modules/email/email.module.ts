import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerService } from 'src/infra/mailer/mailer.service';

@Module({
  imports: [],
  providers: [EmailService, MailerService],
})
export class EmailModule {}
