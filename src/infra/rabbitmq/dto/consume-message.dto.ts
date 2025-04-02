export class IConsumeMessage {
  exchange: string;
  routingKey: string;
  message: Buffer;
}
