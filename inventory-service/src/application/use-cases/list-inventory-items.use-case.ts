import { Inject, Injectable } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_PORT,
  type InventoryItem,
  type InventoryRepositoryPort,
} from '../../domain/ports/inventory-repository.port';

@Injectable()
export class ListInventoryItemsUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort
  ) {}

  async execute(): Promise<InventoryItem[]> {
    return this.inventoryRepository.findAll();
  }
}
