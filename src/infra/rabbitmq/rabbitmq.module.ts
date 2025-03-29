import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';
import { EmailService } from 'src/app/modules/email/email.service';
import { MailerService } from 'src/infra/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [RabbitmqController],
  providers: [RabbitmqService, EmailService, MailerService, JwtService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
