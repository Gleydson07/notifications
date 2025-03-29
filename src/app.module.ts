import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
