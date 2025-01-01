import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class RabbitmqService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const RABBITMQ_URL = this.configService.get<string>("RABBITMQ_URL");
    const EXCHANGE_NAME = this.configService.get<string>("RABBITMQ_EXCHANGE_NAME");
    const EXCHANGE_TYPE = this.configService.get<string>("RABBITMQ_EXCHANGE_TYPE");

    console.log(RABBITMQ_URL)
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

    const queues = [
      {
        name: this.configService.get<string>("RABBITMQ_QUEUE_AUTH_EMAIL"),
        routingKey: this.configService.get<string>("RABBITMQ_QUEUE_AUTH_EMAIL_KEY"),
        durable: this.configService.get<string>("RABBITMQ_QUEUE_AUTH_EMAIL_DURABLE")
      },
      {
        name: this.configService.get<string>("RABBITMQ_QUEUE_AUTH_SMS"),
        routingKey: this.configService.get<string>("RABBITMQ_QUEUE_AUTH_SMS_KEY"),
        durable: this.configService.get<string>("RABBITMQ_QUEUE_AUTH_SMS_DURABLE")
      },
    ];

    for (const queue of queues) {
      await channel.assertQueue(queue.name, { durable: true });
      await channel.bindQueue(queue.name, EXCHANGE_NAME, queue.routingKey);
    }

    console.table(queues);
    await channel.close();
    await connection.close();
  }
}
