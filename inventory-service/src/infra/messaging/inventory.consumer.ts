import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp from 'amqplib';
import { ReserveStockUseCase, type CheckoutRequestedEvent } from '../../application/use-cases/reserve-stock.use-case';

@Injectable()
export class InventoryConsumer implements OnModuleInit {
  private readonly logger = new Logger(InventoryConsumer.name);

  constructor(private readonly reserveStockUseCase: ReserveStockUseCase) {}

  async onModuleInit(): Promise<void> {
    const connection = await amqp.connect(process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    await channel.assertQueue('checkout.requested', { durable: true });
    await channel.assertQueue('stock.reserved', { durable: true });

    await channel.consume('checkout.requested', async (message) => {
      if (!message) return;

      try {
        const event = JSON.parse(message.content.toString()) as CheckoutRequestedEvent;
        const reserved = await this.reserveStockUseCase.execute(event);

        channel.sendToQueue(
          'stock.reserved',
          Buffer.from(
            JSON.stringify({
              orderId: reserved.orderId,
              customerName: reserved.customerName,
              customerEmail: reserved.customerEmail,
              totalAmount: reserved.totalAmount,
              prescriptionUrl: reserved.prescriptionUrl,
            })
          ),
          { persistent: true }
        );

        channel.ack(message);
      } catch (error) {
        this.logger.error(`Failed to reserve stock: ${(error as Error).message}`);
        channel.nack(message, false, false);
      }
    });

    this.logger.log('Listening to checkout.requested queue');
  }
}
