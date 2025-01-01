import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitmqService } from "./rabbitmq.service";
import { RabbitmqController } from "./rabbitmq.controller";

@Module({
  imports: [
    ClientsModule.registerAsync([{
      name: 'RabbitMQ',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        name: configService.get<string>('APP_NAME'),
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')],
        },
      }),
    }]),
  ],
  controllers: [RabbitmqController],
  providers: [RabbitmqService],
  exports: [RabbitmqService, ClientsModule],
})
export class RabbitmqModule {}
