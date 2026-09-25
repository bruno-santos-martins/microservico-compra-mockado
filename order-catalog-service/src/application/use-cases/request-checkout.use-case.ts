import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { RequestCheckoutInput } from '../dto';
import { ORDER_REPOSITORY_PORT, type OrderRepositoryPort } from '../../domain/ports/order-repository.port';
import { MESSAGE_BUS_PORT, type MessageBusPort } from '../../domain/ports/message-bus.port';

@Injectable()
export class RequestCheckoutUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: OrderRepositoryPort,
    @Inject(MESSAGE_BUS_PORT)
    private readonly messageBus: MessageBusPort
  ) {}

  private isTrustedPrescriptionUrl(url: string): boolean {
    const publicEndpoint =
      process.env.AWS_PUBLIC_ENDPOINT ?? process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
    const bucket = process.env.S3_BUCKET_PRESCRIPTIONS ?? 'click-prescriptions';
    const normalizedEndpoint = publicEndpoint.replace(/\/$/, '');
    return url.startsWith(`${normalizedEndpoint}/${bucket}/prescriptions/`);
  }

  async execute(input: RequestCheckoutInput) {
    if (!this.isTrustedPrescriptionUrl(input.prescriptionUrl)) {
      throw new BadRequestException(
        'prescriptionUrl invalida. Faca upload da receita antes de enviar o pedido.'
      );
    }

    const trackingCode = `CK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = await this.orderRepository.create({
      trackingCode,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      items: input.items,
      prescriptionUrl: input.prescriptionUrl,
      totalAmount: input.totalAmount,
    });

    await this.messageBus.publish('checkout.requested', {
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      prescriptionUrl: order.prescriptionUrl,
      totalAmount: order.totalAmount,
      correlationId: uuidv4(),
    });

    return { orderId: order.id, trackingCode: order.trackingCode };
  }
}
