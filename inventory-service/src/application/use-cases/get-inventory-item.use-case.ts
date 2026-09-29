import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_PORT,
  type InventoryItem,
  type InventoryRepositoryPort,
} from '../../domain/ports/inventory-repository.port';

@Injectable()
export class GetInventoryItemUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort
  ) {}

  async execute(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Product ${id} was not found in inventory`);
    }

    return item;
  }
}
