type ExchangeTypes = 'direct' | 'fanout' | 'topic' | 'headers';

export interface IExchange {
  name: string;
  type: ExchangeTypes;
  durable: boolean;
  routingKey?: Record<string, string>;
  queues: Array<{
    name: string;
    routingKey: string;
    durable: boolean;
  }>;
}
