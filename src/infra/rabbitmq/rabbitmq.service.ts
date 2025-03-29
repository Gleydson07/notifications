import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EmailService } from 'src/app/modules/email/email.service';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly url: string;
  private readonly exchangeName: string;
  private readonly exchangeType: string;
  private queues: { name: string; routingKey: string; durable: boolean }[];
  private isChannelActive = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.url = this.configService.get<string>('RABBITMQ_URL');
    this.exchangeName = this.configService.get<string>(
      'RABBITMQ_EXCHANGE_NAME',
    );
    this.exchangeType = this.configService.get<string>(
      'RABBITMQ_EXCHANGE_TYPE',
    );

    this.queues = [
      {
        name: this.configService.get<string>('RABBITMQ_QUEUE_AUTH_EMAIL'),
        routingKey: this.configService.get<string>(
          'RABBITMQ_QUEUE_AUTH_EMAIL_KEY',
        ),
        durable: true,
      },
      {
        name: this.configService.get<string>('RABBITMQ_QUEUE_AUTH_SMS'),
        routingKey: this.configService.get<string>(
          'RABBITMQ_QUEUE_AUTH_SMS_KEY',
        ),
        durable: true,
      },
    ];
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    this.isChannelActive = false;

    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();

    console.log('Conexão com RabbitMQ encerrada.');
  }

  async connectWithRetry(
    retryInterval = 5000,
    maxRetries = 5,
    attempt = 0,
  ): Promise<void> {
    try {
      if (attempt) {
        console.log(`Reconectando com RabbitMQ (${attempt}/${maxRetries})...`);
      }

      this.connection = await amqp.connect(this.url);

      this.connection.on('error', (err) => {
        console.error('Erro na conexão do RabbitMQ:', err.message);
        this.reconnect(retryInterval);
      });

      this.connection.on('close', () => {
        console.warn('Conexão com RabbitMQ fechada.');
        this.reconnect(retryInterval);
      });

      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
        durable: true,
      });
      this.isChannelActive = true;

      for (const queue of this.queues) {
        await this.channel.assertQueue(queue.name, { durable: true });
        await this.channel.bindQueue(
          queue.name,
          this.exchangeName,
          queue.routingKey,
        );

        this.channel.consume(
          queue.name,
          (message) => {
            if (message) {
              if (!this.isChannelActive) {
                console.warn(
                  'Mensagem recebida, mas o canal foi encerrado. Ignorando...',
                );
                return;
              }

              const content = JSON.parse(message.content.toString());

              try {
                this.processMessage(queue.name, content);
                this.channel.ack(message);
              } catch (error) {
                console.error(
                  'Erro ao processar mensagem. Enviando NACK.',
                  error.message,
                );
                this.channel.nack(message, false, true);
              }
            }
          },
          {
            noAck: false,
            consumerTag: `consumer-${queue.name}`,
          },
        );
      }
      console.table(this.queues);
    } catch (error) {
      console.error(`Erro ao conectar ao RabbitMQ: ${error.message}`);

      if (attempt < maxRetries) {
        console.log(`Tentando reconectar em ${retryInterval / 1000}s...`);
        setTimeout(
          () => this.connectWithRetry(retryInterval, maxRetries, attempt + 1),
          retryInterval,
        );
      } else {
        console.error(
          'Número máximo de tentativas de reconexão atingido. Abortando...',
        );
      }
    }
  }

  private async reconnect(retryInterval: number) {
    this.isChannelActive = false;

    if (this.channel) await this.channel.close().catch(() => null);
    if (this.connection) await this.connection.close().catch(() => null);

    setTimeout(() => this.connectWithRetry(retryInterval), retryInterval);
  }

  private async processMessage(queueName: string, message: any) {
    if (
      queueName === this.configService.get<string>('RABBITMQ_QUEUE_AUTH_EMAIL')
    ) {
      this.emailService.sendEmailToRecoveryPassword(message);
    } else if (
      queueName === this.configService.get<string>('RABBITMQ_QUEUE_AUTH_SMS')
    ) {
      console.log(queueName, message);
    }
  }
}
