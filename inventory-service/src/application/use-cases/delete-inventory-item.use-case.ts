import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_PORT,
  type InventoryRepositoryPort,
} from '../../domain/ports/inventory-repository.port';

@Injectable()
export class DeleteInventoryItemUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.inventoryRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Product ${id} was not found in inventory`);
    }
  }
}
