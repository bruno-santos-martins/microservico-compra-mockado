import amqp from 'amqplib';
import { ProcessPaymentUseCase, type StockReservedEvent } from '../../application/use_cases/process-payment.use-case';
import { TrackingSimulatorUseCase } from '../../application/use_cases/tracking-simulator.use-case';

export class RabbitMQConsumer {
  constructor(
    private readonly processPayment: ProcessPaymentUseCase,
    private readonly simulator: TrackingSimulatorUseCase
  ) {}

  async start(): Promise<void> {
    const connection = await amqp.connect(process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672');
    const channel = await connection.createChannel();

    await channel.assertQueue('stock.reserved', { durable: true });

    await channel.consume('stock.reserved', async (message) => {
      if (!message) return;

      try {
        const event = JSON.parse(message.content.toString()) as StockReservedEvent;
        const paid = await this.processPayment.execute(event);
        await this.simulator.execute({
          orderId: paid.orderId,
          trackingCode: paid.trackingCode,
        });
        channel.ack(message);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('payment consumer error', error);
        channel.nack(message, false, false);
      }
    });
  }
}
