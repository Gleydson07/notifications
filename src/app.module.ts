import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './infra/rabbitmq/rabbitmq.module';
import { EmailModule } from './app/modules/email/email.module';
import { SmsModule } from './app/modules/sms/sms.module';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './infra/auth/auth.module';

const env = dotenv.config();
dotenvExpand.expand(env);

export const prefix = 'ms-notifications/api/v1';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [() => env.parsed],
    }),
    AuthModule,
    RabbitmqModule,
    EmailModule,
    SmsModule,
    RouterModule.register([
      {
        path: `${prefix}/system/rabbitmq`,
        module: RabbitmqModule,
      },
    ]),
  ],
})
export class AppModule {}
