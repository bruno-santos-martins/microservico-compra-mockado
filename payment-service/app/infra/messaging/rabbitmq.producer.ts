import amqp, { Channel, Connection } from 'amqplib';

export class RabbitMQProducer {
  private connection?: Connection;
  private channel?: Channel;

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    this.connection = await amqp.connect(process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672');
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async publish(queue: string, payload: unknown): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
  }
}
