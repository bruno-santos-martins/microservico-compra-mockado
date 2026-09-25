import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY_PORT, type ProductRepositoryPort } from '../../domain/ports/product-repository.port';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(page: number, limit: number, search?: string) {
    return this.productRepository.list(page, limit, search);
  }
}
