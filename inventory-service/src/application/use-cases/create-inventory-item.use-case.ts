import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_PORT,
  type InventoryItem,
  type InventoryRepositoryPort,
} from '../../domain/ports/inventory-repository.port';

export interface CreateInventoryItemCommand {
  id: string;
  stockQuantity: number;
}

@Injectable()
export class CreateInventoryItemUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly inventoryRepository: InventoryRepositoryPort
  ) {}

  async execute(command: CreateInventoryItemCommand): Promise<InventoryItem> {
    const existing = await this.inventoryRepository.findById(command.id);
    if (existing) {
      throw new ConflictException(`Product ${command.id} already exists in inventory`);
    }

    return this.inventoryRepository.create({
      id: command.id,
      stockQuantity: command.stockQuantity,
    });
  }
}
