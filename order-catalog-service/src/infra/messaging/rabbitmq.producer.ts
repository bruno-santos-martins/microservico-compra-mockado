import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';
import type { MessageBusPort } from '../../domain/ports/message-bus.port';

@Injectable()
export class RabbitMQProducer implements MessageBusPort, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQProducer.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  private getConnectionCandidates(): string[] {
    const primary = process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672';
    const candidates = [primary];

    if (primary.includes('@rabbitmq:')) {
      candidates.push(primary.replace('@rabbitmq:', '@localhost:'));
      candidates.push(primary.replace('@rabbitmq:', '@127.0.0.1:'));
    }

    return [...new Set(candidates)];
  }

  private async connectWithRetry(): Promise<ChannelModel> {
    const candidates = this.getConnectionCandidates();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 12; attempt += 1) {
      for (const url of candidates) {
        try {
          this.logger.log(`Connecting to RabbitMQ (${url}) [attempt ${attempt}/12]`);
          return await amqp.connect(url);
        } catch (error) {
          lastError = error as Error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw lastError ?? new Error('Failed to connect to RabbitMQ');
  }

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;

    this.connection = await this.connectWithRetry();
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async publish(queue: string, payload: unknown): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
    this.logger.log(`Published message to queue ${queue}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
