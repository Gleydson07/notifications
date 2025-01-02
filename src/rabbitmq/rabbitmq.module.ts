import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { RabbitmqService } from "./rabbitmq.service";
import { RabbitmqController } from "./rabbitmq.controller";
import { EmailService } from "src/email/email.service";
import { MailerService } from "src/mailer/mailer.service";

@Module({
  controllers: [RabbitmqController],
  providers: [RabbitmqService, EmailService, MailerService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
