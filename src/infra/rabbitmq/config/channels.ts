import { IExchange } from '../dto/exchange.dto';

export const exRecoveryPassword: IExchange = {
  name: 'ex_auth_recovery_password',
  type: 'direct',
  durable: true,
  routingKey: {
    email: 'email',
    sms: 'sms',
  },
  queues: [
    {
      name: 'queue_auth_recovery_password_email',
      routingKey: 'email',
      durable: true,
    },
    {
      name: 'queue_auth_recovery_password_sms',
      routingKey: 'sms',
      durable: true,
    },
  ],
};

export const exUser: IExchange = {
  name: 'ex_auth_user',
  type: 'topic',
  durable: true,
  routingKey: {
    created: 'user.created',
    removed: 'user.removed',
  },
  queues: [
    {
      name: 'queue_auth_user_created',
      routingKey: 'user.created',
      durable: true,
    },
    {
      name: 'queue_auth_user_removed',
      routingKey: 'user.removed',
      durable: true,
    },
  ],
};

export const exchangeList: IExchange[] = [exRecoveryPassword, exUser];
