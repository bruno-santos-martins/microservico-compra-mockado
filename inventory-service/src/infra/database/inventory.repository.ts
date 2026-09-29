import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type {
  CreateInventoryItemInput,
  InventoryItem,
  InventoryRepositoryPort,
  ReserveItemInput,
  UpdateInventoryItemInput,
} from '../../domain/ports/inventory-repository.port';
import { ProductInventoryEntity } from './product-inventory.entity';

@Injectable()
export class InventoryRepository implements InventoryRepositoryPort {
  constructor(
    @InjectRepository(ProductInventoryEntity)
    private readonly inventoryRepo: Repository<ProductInventoryEntity>,
    private readonly dataSource: DataSource
  ) {}

  async reserveAtomic(items: ReserveItemInput[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const product = await manager.findOne(ProductInventoryEntity, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        product.stockQuantity -= item.quantity;
        await manager.save(product);
      }
    });
  }

  async create(input: CreateInventoryItemInput): Promise<InventoryItem> {
    const created = this.inventoryRepo.create(input);
    const saved = await this.inventoryRepo.save(created);
    return { id: saved.id, stockQuantity: saved.stockQuantity };
  }

  async findAll(): Promise<InventoryItem[]> {
    const items = await this.inventoryRepo.find({ order: { id: 'ASC' } });
    return items.map((item) => ({ id: item.id, stockQuantity: item.stockQuantity }));
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const item = await this.inventoryRepo.findOne({ where: { id } });
    if (!item) {
      return null;
    }

    return { id: item.id, stockQuantity: item.stockQuantity };
  }

  async update(input: UpdateInventoryItemInput): Promise<InventoryItem | null> {
    const existing = await this.inventoryRepo.findOne({ where: { id: input.id } });
    if (!existing) {
      return null;
    }

    existing.stockQuantity = input.stockQuantity;
    const updated = await this.inventoryRepo.save(existing);
    return { id: updated.id, stockQuantity: updated.stockQuantity };
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.inventoryRepo.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
