import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_PORT,
  type InventoryItem,
  type InventoryRepositoryPort,
} from '../../domain/ports/inventory-repository.port';

export interface UpdateInventoryItemCommand {
  id: string;
  stockQuantity: number;
}

@Injectable()
export class UpdateInventoryItemUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort
  ) {}

  async execute(command: UpdateInventoryItemCommand): Promise<InventoryItem> {
    const updated = await this.inventoryRepository.update({
      id: command.id,
      stockQuantity: command.stockQuantity,
    });

    if (!updated) {
      throw new NotFoundException(`Product ${command.id} was not found in inventory`);
    }

    return updated;
  }
}
