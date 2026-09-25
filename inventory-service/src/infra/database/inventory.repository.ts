import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { InventoryRepositoryPort, ReserveItemInput } from '../../domain/ports/inventory-repository.port';
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
}
