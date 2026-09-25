import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp from 'amqplib';
import { ORDER_REPOSITORY_PORT, type OrderRepositoryPort } from '../../domain/ports/order-repository.port';
import { TrackingGateway } from '../gateways/tracking.gateway';
import { RedisCacheService } from '../cache/redis-cache.service';
import type { TrackingCheckpoint } from '../../domain/entities/tracking-checkpoint';

@Injectable()
export class TrackingConsumer implements OnModuleInit {
  private readonly logger = new Logger(TrackingConsumer.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: OrderRepositoryPort,
    private readonly gateway: TrackingGateway,
    private readonly cache: RedisCacheService
  ) {}

  private getConnectionCandidates(): string[] {
    const primary = process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672';
    const candidates = [primary];

    if (primary.includes('@rabbitmq:')) {
      candidates.push(primary.replace('@rabbitmq:', '@localhost:'));
      candidates.push(primary.replace('@rabbitmq:', '@127.0.0.1:'));
    }

    return [...new Set(candidates)];
  }

  private async connectWithRetry() {
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

  async onModuleInit(): Promise<void> {
    const connection = await this.connectWithRetry();
    const channel = await connection.createChannel();
    const queue = 'tracking.updates';
    await channel.assertQueue(queue, { durable: true });

    await channel.consume(queue, async (message) => {
      if (!message) return;

      try {
        const payload = JSON.parse(message.content.toString()) as TrackingCheckpoint;
        await this.orderRepository.saveCheckpoint(payload);
        await this.cache.set(`tracking:${payload.trackingCode}`, JSON.stringify([payload]), 60);
        this.gateway.emitTrackingUpdate(payload);
        channel.ack(message);
      } catch (error) {
        this.logger.error(`Failed to process tracking update: ${(error as Error).message}`);
        channel.nack(message, false, false);
      }
    });

    this.logger.log('Tracking consumer is listening on tracking.updates');
  }
}
