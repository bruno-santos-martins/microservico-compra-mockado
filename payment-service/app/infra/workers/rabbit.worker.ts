import crypto from 'node:crypto';
import type { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { ProcessPaymentUseCase } from '../../application/use_cases/process-payment.use-case';
import { TrackingSimulatorUseCase } from '../../application/use_cases/tracking-simulator.use-case';
import { RabbitMQProducer } from '../messaging/rabbitmq.producer';
import { RabbitMQConsumer } from '../messaging/rabbitmq.consumer';

class FakePaymentGateway implements PaymentGatewayPort {
  async approve(_totalAmount: number): Promise<{ transactionId: string }> {
    return { transactionId: `txn_${crypto.randomUUID()}` };
  }
}

export class RabbitWorker {
  async start(): Promise<void> {
    const producer = new RabbitMQProducer();
    const processPayment = new ProcessPaymentUseCase(new FakePaymentGateway());
    const simulator = new TrackingSimulatorUseCase(producer);
    const consumer = new RabbitMQConsumer(processPayment, simulator);
    await consumer.start();
  }
}
