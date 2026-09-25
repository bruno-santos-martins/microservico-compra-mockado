import crypto from 'node:crypto';
import type { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';

export interface StockReservedEvent {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  prescriptionUrl: string;
}

export class ProcessPaymentUseCase {
  constructor(private readonly paymentGateway: PaymentGatewayPort) {}

  async execute(event: StockReservedEvent) {
    const approved = await this.paymentGateway.approve(event.totalAmount);
    const trackingCode = `CK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      ...event,
      transactionId: approved.transactionId,
      trackingCode,
      paymentId: crypto.randomUUID(),
    };
  }
}
