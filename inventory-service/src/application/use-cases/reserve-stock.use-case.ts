import { Inject, Injectable, Logger } from '@nestjs/common';
import { INVENTORY_REPOSITORY_PORT, type InventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';

export interface CheckoutRequestedEvent {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  prescriptionUrl: string;
  totalAmount: number;
}

@Injectable()
export class ReserveStockUseCase {
  private readonly logger = new Logger(ReserveStockUseCase.name);

  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort
  ) {}

  async execute(event: CheckoutRequestedEvent): Promise<CheckoutRequestedEvent> {
    await this.inventoryRepository.reserveAtomic(
      event.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    );

    this.logger.log(`Stock reserved for order ${event.orderId}`);
    return event;
  }
}
