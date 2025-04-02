import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EmailService } from 'src/app/modules/email/email.service';
import { exchangeList, exRecoveryPassword, exUser } from './config/channels';
import { IExchange } from './dto/exchange.dto';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly url: string;
  private isChannelActive = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.url = this.configService.get<string>('RABBITMQ_URL');
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
      for (const ex of exchangeList) {
        await this.connectExchange(ex);

        if (!this.isChannelActive) {
          this.isChannelActive = true;
        }

        for (const queue of ex.queues) {
          await this.channel.assertQueue(queue.name, {
            durable: queue.durable,
          });
          await this.channel.bindQueue(queue.name, ex.name, queue.routingKey);

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
                  this.channel.nack(message, false, false);
                }
              }
            },
            {
              noAck: false,
              consumerTag: `consumer-${queue.name}`,
            },
          );
        }

        console.table(ex.queues);
      }
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

  private async connectExchange(exchange: IExchange) {
    try {
      await this.channel.assertExchange(exchange.name, exchange.type, {
        durable: exchange.durable,
      });

      console.info(`Conexão com Exchange "${exchange.name}" estabelecida.`);
    } catch (error) {
      console.error(
        `Erro ao estabelecer conexão com a exchange "${exchange.name}": ${error.message}`,
      );
    }
  }

  private async processMessage(queueName: string, message: any) {
    const queues = exchangeList.flatMap((exchange) => exchange.queues);
    console.log(queues);

    if (queueName === exRecoveryPassword.queues[0].name) {
      this.emailService.sendEmailToRecoveryPassword(message.content);
      console.log(queueName, message);
    } else if (queueName === exRecoveryPassword.queues[1].name) {
      console.log(queueName, message);
    } else if (queueName === exUser.queues[0].name) {
      console.log(queueName, message);
    } else if (queueName === exUser.queues[1].name) {
      console.log(queueName, message);
    }
  }
}
