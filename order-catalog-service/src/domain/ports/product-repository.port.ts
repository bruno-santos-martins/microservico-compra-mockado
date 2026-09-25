import type { Product } from '../entities/product';

export const PRODUCT_REPOSITORY_PORT = Symbol('PRODUCT_REPOSITORY_PORT');

export interface ProductRepositoryPort {
  create(input: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  list(page: number, limit: number, search?: string): Promise<{ items: Product[]; total: number }>;
  findByIds(ids: string[]): Promise<Product[]>;
}
