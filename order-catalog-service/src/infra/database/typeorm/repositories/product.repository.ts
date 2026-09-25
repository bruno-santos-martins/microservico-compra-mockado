import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import type { ProductRepositoryPort } from '../../../../domain/ports/product-repository.port';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>
  ) {}

  async create(input: Omit<ProductEntity, 'id' | 'createdAt'>): Promise<ProductEntity> {
    const entity = this.productRepo.create(input);
    return this.productRepo.save(entity);
  }

  async list(page: number, limit: number, search?: string): Promise<{ items: ProductEntity[]; total: number }> {
    const where = search ? { name: ILike(`%${search}%`) } : undefined;
    const [items, total] = await this.productRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async findByIds(ids: string[]): Promise<ProductEntity[]> {
    if (!ids.length) return [];
    return this.productRepo.find({ where: { id: In(ids) } });
  }
}
